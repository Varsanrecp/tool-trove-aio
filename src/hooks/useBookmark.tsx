
import { useState, useEffect } from 'react';
import { Tool } from '@/lib/tools';
import { toast } from 'sonner';

interface BookmarkCollection {
  id: string;
  name: string;
  tools: string[];
}

interface UserRatings {
  [toolId: string]: number;
}

export const useBookmark = () => {
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [collections, setCollections] = useState<BookmarkCollection[]>([]);
  const [userRatings, setUserRatings] = useState<UserRatings>({});

  useEffect(() => {
    const stored = localStorage.getItem('bookmarks');
    const storedCollections = localStorage.getItem('bookmark-collections');
    const storedRatings = localStorage.getItem('user-ratings');
    
    if (stored) {
      setBookmarks(JSON.parse(stored));
    }
    if (storedCollections) {
      setCollections(JSON.parse(storedCollections));
    }
    if (storedRatings) {
      setUserRatings(JSON.parse(storedRatings));
    }
  }, []);

  const toggleBookmark = (tool: Tool) => {
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

  const hasRated = (toolId: string) => {
    return userRatings.hasOwnProperty(toolId);
  };

  const getUserRating = (toolId: string) => {
    return userRatings[toolId] || 0;
  };

  const rateTool = (toolId: string, rating: number) => {
    if (hasRated(toolId)) {
      toast.error("You have already rated this tool");
      return false;
    }

    setUserRatings(prev => {
      const newRatings = { ...prev, [toolId]: rating };
      localStorage.setItem('user-ratings', JSON.stringify(newRatings));
      return newRatings;
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
    rateTool,
    hasRated,
    getUserRating
  };
};
