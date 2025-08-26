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
 * - preserves local bookmark/collection behavior
 * - persists vote counts to the tools table in Supabase
 * - requires user to be signed-in (as your app already does)
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

  // Load bookmarks & collections from localStorage (existing behavior)
  useEffect(() => {
    const storedBookmarks = localStorage.getItem('bookmarks');
    if (storedBookmarks) setBookmarks(JSON.parse(storedBookmarks));
    else setBookmarks([]);

    const storedCollections = localStorage.getItem('bookmark-collections');
    if (storedCollections) setCollections(JSON.parse(storedCollections));
    else setCollections([]);
  }, []);

  // Load tool vote counts snapshot (local) and, if signed-in, user-votes are read from localStorage
  useEffect(() => {
    const storedToolVotes = localStorage.getItem('tool-votes');
    if (storedToolVotes) setToolVotes(JSON.parse(storedToolVotes));
    else setToolVotes({});

    if (isSignedIn) {
      const storedUserVotes = localStorage.getItem('user-votes');
      if (storedUserVotes) setUserVotes(JSON.parse(storedUserVotes));
      else setUserVotes({});
    } else {
      setUserVotes({});
    }
  }, [isSignedIn]);

  // On sign-in, fetch authoritative counts for tools (and optionally user votes if you store them server-side later)
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

  // --- API exported (same shape as before) ---
  const toggleBookmark = (tool: Tool) => {
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

    setBookmarks(prev => {
      const isBookmarked = prev.includes(tool.id);
      const newBookmarks = isBookmarked ? prev.filter(id => id !== tool.id) : [...prev, tool.id];
      localStorage.setItem('bookmarks', JSON.stringify(newBookmarks));
      toast(isBookmarked ? "Removed from bookmarks" : "Added to bookmarks", { description: tool.name });
      return newBookmarks;
    });
  };

  const isBookmarked = (id: string) => bookmarks.includes(id);

  const hasVoted = (toolId: string) => {
    if (!isSignedIn) return false;
    return !!userVotes[toolId];
  };

  const getUserVote = (toolId: string) => {
    if (!isSignedIn) return null;
    return userVotes[toolId] || null;
  };

  const getToolVotes = (toolId: string) => {
    return toolVotes[toolId] || { upvotes: 0, downvotes: 0 };
  };

  /**
   * toggleVote
   * - optimistic UI update: updates local state & localStorage immediately
   * - persists the new upvotes/downvotes numbers to the tools table in Supabase
   * - on failure, rolls back the optimistic update
   *
   * Behavior:
   * - If user clicks the same vote again -> remove their vote (toggle off)
   * - If user switches from up -> down, or down -> up -> counts adjust accordingly
   */
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

    // Snapshot previous states
    const prevUserVotes = { ...userVotes };
    const prevToolVotes = { ...toolVotes };

    // Compute optimistic update
    const currentVote = prevUserVotes[toolId]; // 'up' | 'down' | undefined
    const currentToolCounts = prevToolVotes[toolId] || { upvotes: 0, downvotes: 0 };
    const newToolCounts = { ...currentToolCounts };
    const newUserVotes = { ...prevUserVotes };

    // Remove existing effect
    if (currentVote === 'up') newToolCounts.upvotes = Math.max(0, newToolCounts.upvotes - 1);
    if (currentVote === 'down') newToolCounts.downvotes = Math.max(0, newToolCounts.downvotes - 1);

    // If clicking same vote -> remove vote
    if (currentVote === newVoteType) {
      delete newUserVotes[toolId];
    } else {
      newUserVotes[toolId] = newVoteType;
      if (newVoteType === 'up') newToolCounts.upvotes = (newToolCounts.upvotes || 0) + 1;
      else newToolCounts.downvotes = (newToolCounts.downvotes || 0) + 1;
    }

    // Apply optimistic state & persist to localStorage
    setUserVotes(newUserVotes);
    setToolVotes(prev => ({ ...prev, [toolId]: newToolCounts }));
    localStorage.setItem('user-votes', JSON.stringify(newUserVotes));
    localStorage.setItem('tool-votes', JSON.stringify({ ...toolVotes, [toolId]: newToolCounts }));

    // Persist to Supabase: update the tools table with the new counts
    try {
      const sb = await getAuthedSupabaseClient();

      // Update the tool row with new counts (this requires authenticated update policy)
      const { error: updateError } = await sb
        .from('tools')
        .update({
          upvotes: newToolCounts.upvotes,
          downvotes: newToolCounts.downvotes,
        })
        .eq('id', toolId);

      if (updateError) {
        throw updateError;
      }

      // After successful update, fetch authoritative counts and set them (optional but keeps in sync)
      const { data: toolRow, error: fetchError } = await baseSupabase
        .from('tools')
        .select('upvotes,downvotes')
        .eq('id', toolId)
        .single();

      if (!fetchError && toolRow) {
        setToolVotes(prev => ({ ...prev, [toolId]: { upvotes: toolRow.upvotes ?? 0, downvotes: toolRow.downvotes ?? 0 } }));
        // update local snapshot too
        const snap = { ...(JSON.parse(localStorage.getItem('tool-votes') || '{}')), [toolId]: { upvotes: toolRow.upvotes ?? 0, downvotes: toolRow.downvotes ?? 0 } };
        localStorage.setItem('tool-votes', JSON.stringify(snap));
      }

      return true;
    } catch (err: any) {
      console.error('Vote persist error:', err);
      toast.error('Could not send vote. Try again.');

      // rollback optimistic state
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
    isBookmarked: (id: string) => bookmarks.includes(id),
    createCollection,
    addToCollection,
    toggleVote,
    hasVoted,
    getUserVote,
    getToolVotes,
  };
};
