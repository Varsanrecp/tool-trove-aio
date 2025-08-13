import { useState, useEffect, useCallback } from 'react';
import { Tool } from '@/lib/tools';
import { toast } from 'sonner';
import { useUser } from '@clerk/clerk-react';

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

export const useBookmark = () => {
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [collections, setCollections] = useState<BookmarkCollection[]>([]);
  const [userVotes, setUserVotes] = useState<UserVotes>({});
  const [toolVotes, setToolVotes] = useState<ToolVotes>({});
  const { isSignedIn } = useUser();

  useEffect(() => {
    if (isSignedIn) {
      const storedBookmarks = localStorage.getItem('bookmarks');
      if (storedBookmarks) {
        setBookmarks(JSON.parse(storedBookmarks));
      } else {
        setBookmarks([]);
      }

      const storedCollections = localStorage.getItem('bookmark-collections');
      if (storedCollections) {
        setCollections(JSON.parse(storedCollections));
      } else {
        setCollections([]);
      }

      const storedVotes = localStorage.getItem('user-votes');
      if (storedVotes) {
        setUserVotes(JSON.parse(storedVotes));
      } else {
        setUserVotes({});
      }
    } else {
      setBookmarks([]);
      setCollections([]);
      setUserVotes({});
    }

    const storedToolVotes = localStorage.getItem('tool-votes');
    if (storedToolVotes) {
      setToolVotes(JSON.parse(storedToolVotes));
    }
  }, [isSignedIn]);

  const toggleBookmark = useCallback((tool: Tool) => {
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

    setBookmarks(prevBookmarks => {
      const isBookmarked = prevBookmarks.includes(tool.id);
      const newBookmarks = isBookmarked
        ? prevBookmarks.filter(id => id !== tool.id)
        : [...prevBookmarks, tool.id];

      localStorage.setItem('bookmarks', JSON.stringify(newBookmarks));

      toast(
        isBookmarked ? "Removed from bookmarks" : "Added to bookmarks",
        {
          description: tool.name,
        }
      );
      
      return newBookmarks;
    });
  }, [isSignedIn]);

  const isBookmarked = (id: string) => bookmarks.includes(id);

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

  const toggleVote = useCallback((toolId: string, newVoteType: 'up' | 'down') => {
    if (!isSignedIn) {
      toast.error("Please sign in to vote", {
        description: "You need to be signed in to vote for tools.",
        action: {
          label: "Sign In",
          onClick: () => document.querySelector<HTMLButtonElement>('[data-clerk-trigger]')?.click(),
        },
      });
      return false;
    }

    setUserVotes(prevUserVotes => {
      setToolVotes(prevToolVotes => {
        const currentVote = prevUserVotes[toolId];
        const newUpvotes = (prevToolVotes[toolId]?.upvotes || 0) + (newVoteType === 'up' && currentVote !== newVoteType ? 1 : 0) - (currentVote === 'up' ? 1 : 0);
        const newDownvotes = (prevToolVotes[toolId]?.downvotes || 0) + (newVoteType === 'down' && currentVote !== newVoteType ? 1 : 0) - (currentVote === 'down' ? 1 : 0);
        
        const newToolVotes = {
          ...prevToolVotes,
          [toolId]: {
            upvotes: Math.max(0, newUpvotes),
            downvotes: Math.max(0, newDownvotes),
          },
        };
        localStorage.setItem('tool-votes', JSON.stringify(newToolVotes));
        
        return newToolVotes;
      });

      const currentVote = prevUserVotes[toolId];
      const newUserVotes = { ...prevUserVotes };
      if (currentVote === newVoteType) {
        delete newUserVotes[toolId];
      } else {
        newUserVotes[toolId] = newVoteType;
      }
      localStorage.setItem('user-votes', JSON.stringify(newUserVotes));
      
      return newUserVotes;
    });

    return true;
  }, [isSignedIn]);

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
    getToolVotes
  };
};