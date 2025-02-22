
import { useState, useEffect } from 'react';
import { Tool } from '@/lib/tools';
import { toast } from 'sonner';

interface BookmarkCollection {
  id: string;
  name: string;
  tools: string[];
}

export const useBookmark = () => {
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [collections, setCollections] = useState<BookmarkCollection[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('bookmarks');
    const storedCollections = localStorage.getItem('bookmark-collections');
    if (stored) {
      setBookmarks(JSON.parse(stored));
    }
    if (storedCollections) {
      setCollections(JSON.parse(storedCollections));
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
    addToCollection
  };
};
