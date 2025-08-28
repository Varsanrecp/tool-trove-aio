// src/hooks/useBookmark.tsx
import { useState, useEffect } from 'react';
import { Tool } from '@/lib/tools';
import { toast } from 'sonner';
import { useUser, useAuth } from '@clerk/clerk-react';
import { createClient } from '@supabase/supabase-js';
import { supabase as baseSupabase } from '@/integrations/supabase/client';

interface BookmarkCollection {
  id: string;
  name: string;
  tools: string[];
}

interface UserVotes {
  [toolId: string]: 'up' | 'down';
}

interface ToolVotes {
  [toolId: string]: {
    upvotes: number;
    downvotes: number;
  };
}

/**
 * useBookmark hook
 * - Persists bookmarks in Supabase (bookmarks table).
 * - Loads authoritative bookmarks on sign-in.
 * - Uses optimistic updates for toggleBookmark, with rollback on failure.
 * - Keeps localStorage cache for faster UI and offline-ish behavior.
 */
export const useBookmark = () => {
  const { isSignedIn, user } = useUser();
  const { getToken, isLoaded } = useAuth();

  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [collections, setCollections] = useState<BookmarkCollection[]>([]);
  const [userVotes, setUserVotes] = useState<UserVotes>({});
  const [toolVotes, setToolVotes] = useState<ToolVotes>({});

  // Helper: create a temporary supabase client with Clerk JWT in Authorization header
  const getAuthedSupabaseClient = async () => {
    if (!isLoaded) throw new Error('Auth not loaded yet');
    const token = await getToken();
    if (!token) throw new Error('No auth token available (are you signed in?)');

    const url = import.meta.env.VITE_SUPABASE_URL;
    const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (!url || !anon) throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY env vars');

    return createClient(url, anon, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });
  };

  // --- Initial load from localStorage (cache)
  useEffect(() => {
    // bookmarks cache
    const storedBookmarks = localStorage.getItem('bookmarks');
    if (storedBookmarks) setBookmarks(JSON.parse(storedBookmarks));
    else setBookmarks([]);

    // bookmark collections cache
    const storedCollections = localStorage.getItem('bookmark-collections');
    if (storedCollections) setCollections(JSON.parse(storedCollections));
    else setCollections([]);

    // tool votes cache
    const storedToolVotes = localStorage.getItem('tool-votes');
    if (storedToolVotes) setToolVotes(JSON.parse(storedToolVotes));
    else setToolVotes({});

    // user votes cache only for signed-in users (existing behavior)
    if (isSignedIn) {
      const storedUserVotes = localStorage.getItem('user-votes');
      if (storedUserVotes) setUserVotes(JSON.parse(storedUserVotes));
      else setUserVotes({});
    } else {
      setUserVotes({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount

  // --- When user signs in: fetch authoritative bookmarks from DB and replace local cache
  useEffect(() => {
    let mounted = true;
    async function fetchBookmarksFromDb() {
      if (!isSignedIn || !user?.id) {
        // clear local bookmarks if signed out
        if (mounted) {
          setBookmarks([]);
          localStorage.removeItem('bookmarks');
        }
        return;
      }

      try {
        const sb = await getAuthedSupabaseClient();
        // Because RLS is set to only allow selecting own rows, selecting without filter is fine.
        // But be explicit: filter by user_id to be safe.
        const { data, error } = await sb.from('bookmarks').select('tool_id').eq('user_id', user.id);
        if (error) {
          console.error('Error fetching bookmarks from DB:', error);
          return;
        }
        const ids = (data || []).map((r: any) => r.tool_id) as string[];
        if (mounted) {
          setBookmarks(ids);
          localStorage.setItem('bookmarks', JSON.stringify(ids));
        }
      } catch (err) {
        console.error('fetchBookmarksFromDb error:', err);
      }
    }

    fetchBookmarksFromDb();

    return () => {
      mounted = false;
    };
  }, [isSignedIn, user?.id, isLoaded]);

  // --- Keep tool vote snapshot in sync (existing logic)
  useEffect(() => {
    let mounted = true;
    async function fetchCounts() {
      try {
        const { data: rows, error } = await baseSupabase.from('tools').select('id, upvotes, downvotes');
        if (!error && rows && mounted) {
          const tv: ToolVotes = {};
          (rows as any[]).forEach(r => {
            tv[r.id] = { upvotes: r.upvotes ?? 0, downvotes: r.downvotes ?? 0 };
          });
          setToolVotes(tv);
          localStorage.setItem('tool-votes', JSON.stringify(tv));
        }
      } catch (err) {
        console.error('fetchCounts error', err);
      }
    }
    fetchCounts();
    return () => { mounted = false; };
  }, [isSignedIn]);

  // --- toggleBookmark now persists to Supabase (bookmarks table) for authenticated users
  const toggleBookmark = async (tool: Tool) => {
    if (!isSignedIn) {
      toast.error("Please sign in to save tools", {
        description: "You need to be signed in to save tools to your collection.",
        action: {
          label: "Sign In",
          onClick: () => document.querySelector<HTMLButtonElement>('[data-clerk-trigger]')?.click(),
        },
      });
      return;
    }

    if (!user?.id) {
      toast.error("User not available");
      return;
    }

    // Snapshot current bookmarks for rollback
    const prevBookmarks = [...bookmarks];
    const isBookmarkedNow = prevBookmarks.includes(tool.id);
    let newBookmarks: string[];
    if (isBookmarkedNow) {
      newBookmarks = prevBookmarks.filter(id => id !== tool.id);
    } else {
      newBookmarks = [...prevBookmarks, tool.id];
    }

    // Optimistic update to UI + localStorage
    setBookmarks(newBookmarks);
    localStorage.setItem('bookmarks', JSON.stringify(newBookmarks));
    toast(isBookmarkedNow ? "Removed from bookmarks" : "Added to bookmarks", { description: tool.name });

    // Persist change to DB
    try {
      const sb = await getAuthedSupabaseClient();

      if (isBookmarkedNow) {
        // delete bookmark row
        const { error } = await sb.from('bookmarks').delete().match({ user_id: user.id, tool_id: tool.id });
        if (error) {
          // rollback
          throw error;
        }
      } else {
        // insert new bookmark
        const { error } = await sb.from('bookmarks').insert([{ user_id: user.id, tool_id: tool.id }]);
        if (error) {
          // If unique constraint violation (duplicate bookmark), treat as success
          // Supabase error object might include 'code' or 'message' - handle gracefully:
          // If duplicate, proceed; otherwise throw to rollback.
          const msg = String(error?.message || '');
          const code = String((error as any)?.code || '');
          const isDup = msg.toLowerCase().includes('duplicate') || code === '23505';
          if (!isDup) throw error;
        }
      }
    } catch (err: any) {
      console.error('Bookmark persist error:', err);
      toast.error('Could not update bookmark. Try again.');

      // rollback optimistic update
      setBookmarks(prevBookmarks);
      localStorage.setItem('bookmarks', JSON.stringify(prevBookmarks));
    }
  };

  const isBookmarked = (id: string) => bookmarks.includes(id);

  // --- vote functions (kept from your implementation) ---
  const hasVoted = (toolId: string) => {
    if (!isSignedIn) return false;
    return userVotes.hasOwnProperty(toolId);
  };

  const getUserVote = (toolId: string) => {
    if (!isSignedIn) return null;
    return userVotes[toolId] || null;
  };

  const getToolVotes = (toolId: string) => {
    return toolVotes[toolId] || { upvotes: 0, downvotes: 0 };
  };

  const toggleVote = async (toolId: string, newVoteType: 'up' | 'down') => {
    if (!isSignedIn) {
      toast.error("Please sign in to vote", {
        action: {
          label: "Sign In",
          onClick: () => document.querySelector<HTMLButtonElement>('[data-clerk-trigger]')?.click(),
        },
      });
      return false;
    }
    if (!user?.id) {
      toast.error("User not available");
      return false;
    }

    const prevUserVotes = { ...userVotes };
    const prevToolVotes = { ...toolVotes };

    const currentVote = prevUserVotes[toolId];
    const currentToolVotes = prevToolVotes[toolId] || { upvotes: 0, downvotes: 0 };
    const newVotes = { ...currentToolVotes };

    if (currentVote === 'up') newVotes.upvotes = Math.max(0, newVotes.upvotes - 1);
    if (currentVote === 'down') newVotes.downvotes = Math.max(0, newVotes.downvotes - 1);

    if (currentVote !== newVoteType) {
      if (newVoteType === 'up') newVotes.upvotes++;
      else newVotes.downvotes++;
    }

    const updatedToolVotes = { ...prevToolVotes, [toolId]: newVotes };

    const newUserVotes = { ...prevUserVotes };
    if (currentVote === newVoteType) {
      delete newUserVotes[toolId];
    } else {
      newUserVotes[toolId] = newVoteType;
    }

    setUserVotes(newUserVotes);
    setToolVotes(updatedToolVotes);
    localStorage.setItem('user-votes', JSON.stringify(newUserVotes));
    localStorage.setItem('tool-votes', JSON.stringify(updatedToolVotes));

    try {
      const sb = await getAuthedSupabaseClient();

      const { error: updateError } = await sb
        .from('tools')
        .update({
          upvotes: newVotes.upvotes,
          downvotes: newVotes.downvotes,
        })
        .eq('id', toolId);

      if (updateError) {
        throw updateError;
      }

      // fetch authoritative counts to sync
      const { data: toolRow, error: fetchError } = await baseSupabase
        .from('tools')
        .select('upvotes,downvotes')
        .eq('id', toolId)
        .single();

      if (!fetchError && toolRow) {
        setToolVotes(prev => ({ ...prev, [toolId]: { upvotes: toolRow.upvotes ?? 0, downvotes: toolRow.downvotes ?? 0 } }));
        const snap = { ...(JSON.parse(localStorage.getItem('tool-votes') || '{}')), [toolId]: { upvotes: toolRow.upvotes ?? 0, downvotes: toolRow.downvotes ?? 0 } };
        localStorage.setItem('tool-votes', JSON.stringify(snap));
      }

      return true;
    } catch (err) {
      console.error('Vote persist error:', err);
      toast.error('Could not send vote. Try again.');

      // rollback
      setUserVotes(prevUserVotes);
      setToolVotes(prevToolVotes);
      localStorage.setItem('user-votes', JSON.stringify(prevUserVotes));
      localStorage.setItem('tool-votes', JSON.stringify(prevToolVotes));
      return false;
    }
  };

  const createCollection = (name: string) => {
    setCollections((prev) => {
      const newCollections = [
        ...prev,
        { id: crypto.randomUUID(), name, tools: [] }
      ];
      localStorage.setItem('bookmark-collections', JSON.stringify(newCollections));
      return newCollections;
    });
  };

  const addToCollection = (collectionId: string, toolId: string) => {
    setCollections((prev) => {
      const newCollections = prev.map(collection => {
        if (collection.id === collectionId) {
          return {
            ...collection,
            tools: [...collection.tools, toolId]
          };
        }
        return collection;
      });
      localStorage.setItem('bookmark-collections', JSON.stringify(newCollections));
      return newCollections;
    });
  };

  return {
    bookmarks,
    collections,
    toggleBookmark,
    isBookmarked,
    createCollection,
    addToCollection,
    toggleVote,
    hasVoted,
    getUserVote,
    getToolVotes,
  };
};
