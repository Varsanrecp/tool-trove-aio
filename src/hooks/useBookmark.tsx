import { useState, useEffect } from 'react';
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
  const { isSignedIn } = useUser();
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [collections, setCollections] = useState<BookmarkCollection[]>([]);
  const [userVotes, setUserVotes] = useState<UserVotes>({});
  const [toolVotes, setToolVotes] = useState<ToolVotes>({});

  // Effect to load state from localStorage on mount or when sign-in status changes
  useEffect(() => {
    if (isSignedIn) {
      const storedBookmarks = localStorage.getItem('bookmarks');
      if (storedBookmarks) setBookmarks(JSON.parse(storedBookmarks));
      else setBookmarks([]);
      
      const storedCollections = localStorage.getItem('bookmark-collections');
      if (storedCollections) setCollections(JSON.parse(storedCollections));
      else setCollections([]);
      
      const storedVotes = localStorage.getItem('user-votes');
      if (storedVotes) setUserVotes(JSON.parse(storedVotes));
      else setUserVotes({});
    } else {
      setBookmarks([]);
      setCollections([]);
      setUserVotes({});
    }

    const storedToolVotes = localStorage.getItem('tool-votes');
    if (storedToolVotes) setToolVotes(JSON.parse(storedToolVotes));
  }, [isSignedIn]);

  // Function to toggle bookmark status, ensuring state and localStorage are in sync
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
  };

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

  const toggleVote = (toolId: string, newVoteType: 'up' | 'down') => {
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
        const currentToolVotes = prevToolVotes[toolId] || { upvotes: 0, downvotes: 0 };
        const newVotes = { ...currentToolVotes };

        if (currentVote === 'up') {
          newVotes.upvotes = Math.max(0, newVotes.upvotes - 1);
        } else if (currentVote === 'down') {
          newVotes.downvotes = Math.max(0, newVotes.downvotes - 1);
        }

        if (currentVote !== newVoteType) {
          if (newVoteType === 'up') {
            newVotes.upvotes++;
          } else {
            newVotes.downvotes++;
          }
        }
        
        const updatedToolVotes = { ...prevToolVotes, [toolId]: newVotes };
        localStorage.setItem('tool-votes', JSON.stringify(updatedToolVotes));
        return updatedToolVotes;
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