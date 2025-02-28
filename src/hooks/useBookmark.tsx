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
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [collections, setCollections] = useState<BookmarkCollection[]>([]);
  const [userVotes, setUserVotes] = useState<UserVotes>({});
  const [toolVotes, setToolVotes] = useState<ToolVotes>({});
  const { isSignedIn } = useUser();

  useEffect(() => {
    const stored = localStorage.getItem('bookmarks');
    const storedCollections = localStorage.getItem('bookmark-collections');
    const storedVotes = localStorage.getItem('user-votes');
    const storedToolVotes = localStorage.getItem('tool-votes');
    
    if (stored) {
      setBookmarks(JSON.parse(stored));
    }
    if (storedCollections) {
      setCollections(JSON.parse(storedCollections));
    }
    if (storedVotes) {
      setUserVotes(JSON.parse(storedVotes));
    }
    if (storedToolVotes) {
      setToolVotes(JSON.parse(storedToolVotes));
    }
  }, []);

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

    setBookmarks((prev) => {
      const newBookmarks = prev.includes(tool.id)
        ? prev.filter((id) => id !== tool.id)
        : [...prev, tool.id];
      
      localStorage.setItem('bookmarks', JSON.stringify(newBookmarks));
      
      toast(
        prev.includes(tool.id) ? "Removed from bookmarks" : "Added to bookmarks",
        {
          description: tool.name,
        }
      );
      
      return newBookmarks;
    });
  };

  const hasVoted = (toolId: string) => {
    return userVotes.hasOwnProperty(toolId);
  };

  const getUserVote = (toolId: string) => {
    return userVotes[toolId] || null;
  };

  const getToolVotes = (toolId: string) => {
    return toolVotes[toolId] || { upvotes: 0, downvotes: 0 };
  };

  const voteTool = (toolId: string, voteType: 'up' | 'down') => {
    if (hasVoted(toolId)) {
      toast.error("You have already voted for this tool");
      return false;
    }

    setUserVotes(prev => {
      const newVotes = { ...prev, [toolId]: voteType };
      localStorage.setItem('user-votes', JSON.stringify(newVotes));
      return newVotes;
    });

    setToolVotes(prev => {
      const currentVotes = prev[toolId] || { upvotes: 0, downvotes: 0 };
      const newVotes = {
        ...currentVotes,
        [voteType === 'up' ? 'upvotes' : 'downvotes']: 
          voteType === 'up' ? currentVotes.upvotes + 1 : currentVotes.downvotes + 1
      };
      const newToolVotes = { ...prev, [toolId]: newVotes };
      localStorage.setItem('tool-votes', JSON.stringify(newToolVotes));
      return newToolVotes;
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

  const isBookmarked = (id: string) => bookmarks.includes(id);

  return {
    bookmarks,
    collections,
    toggleBookmark,
    isBookmarked,
    createCollection,
    addToCollection,
    voteTool,
    hasVoted,
    getUserVote,
    getToolVotes
  };
};
