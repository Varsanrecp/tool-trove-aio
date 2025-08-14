import { ToolCard } from '@/components/ToolCard';
import { useBookmark } from '@/hooks/useBookmark';
import { supabase } from '@/integrations/supabase/client';
import { Tool } from '@/lib/tools';
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";
import React, { useEffect, useState } from 'react';

const SavedTools = () => {
  const { bookmarks, isBookmarked, toggleBookmark } = useBookmark();
  const [allTools, setAllTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchTools = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('tools')
        .select('*');

      if (error) {
        console.error('Error fetching tools:', error);
        setAllTools([]);
      } else {
        setAllTools(data as Tool[]);
      }
      setLoading(false);
    };

    fetchTools();
  }, []);

  const savedTools = allTools.filter(tool => isBookmarked(tool.id));

  if (loading) {
    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-background text-foreground">
            <div className="text-center">Loading...</div>
        </div>
    );
  }

  return (
    <SignedIn>
      {savedTools.length === 0 ? (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-background text-foreground">
          <div className="text-center space-y-4 p-8">
            <h1 className="text-3xl font-bold">No Saved Tools</h1>
            <p className="text-muted-foreground max-w-md">
              You haven't saved any tools yet. Browse our collection and click the bookmark icon to save your favorite tools.
            </p>
            <a
              href="/"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground h-9 px-4 py-2 hover:opacity-90 transition-opacity"
            >
              Browse Tools
            </a>
          </div>
        </div>
      ) : (
        <div className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold">Saved Tools</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedTools.map((tool) => (
                <ToolCard
                  key={tool.id}
                  tool={tool}
                  isBookmarked={isBookmarked(tool.id)}
                  toggleBookmark={() => toggleBookmark(tool)}
                />
              ))}
            </div>
          </div>
        </div>
      )}
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </SignedIn>
  );
};

export default SavedTools;