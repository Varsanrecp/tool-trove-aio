// src/pages/Tools.tsx
import React, { useState, useEffect } from 'react';
import { SearchBar } from '../components/SearchBar';
import { CategoryFilter } from '../components/CategoryFilter';
import { ToolCard } from '../components/ToolCard';
import { supabase } from '@/integrations/supabase/client';
import { Tool } from '@/lib/tools';
import { useBookmark } from '@/hooks/useBookmark';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { useUser, useAuth } from '@clerk/clerk-react';
import { createClient } from '@supabase/supabase-js';
import { toast } from 'sonner';

const Tools: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') ?? '';

  const [searchValue, setSearchValue] = useState(initialSearch);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const { isBookmarked, toggleBookmark } = useBookmark();

  const shouldReduceMotion = useReducedMotion();

  // Clerk user/token helpers
  const { isSignedIn, user } = useUser();
  const { getToken, isLoaded } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTools = async () => {
      const { data, error } = await supabase.from('tools').select('*');

      if (error) {
        console.error('Error fetching tools:', error);
      } else {
        setTools(data as Tool[]);
      }
      setLoading(false);
    };

    fetchTools();
  }, []);

  // Keep query param in sync with the search input
  useEffect(() => {
    if (searchValue && searchValue.trim().length > 0) {
      setSearchParams({ search: searchValue });
    } else {
      setSearchParams({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue]);

  const filteredTools = tools
    .filter((tool) => {
      const q = searchValue.toLowerCase();
      const matchesSearch =
        tool.name.toLowerCase().includes(q) ||
        tool.description.toLowerCase().includes(q) ||
        (tool.tags && tool.tags.some(tag => tag.toLowerCase().includes(q)));

      const matchesCategories =
        selectedCategories.length === 0 ||
        selectedCategories.includes(tool.category);

      return matchesSearch && matchesCategories;
    });

  if (loading) {
    return (
      <main className="container py-6">
        <div className="text-center">Loading tools...</div>
      </main>
    );
  }

  // --- helper: create authed supabase client that uses Clerk token (Supabase template) ---
  const getAuthedSupabaseClient = async () => {
    // make sure Clerk is loaded
    if (!isLoaded) throw new Error('Auth not loaded yet');

    // Request the Clerk token with the 'supabase' template first (this produces a Supabase-compatible JWT).
    // fallback to getToken() if the template is not available for some reason.
    const token = await getToken({ template: 'supabase' } as any).catch(() => getToken());

    if (!token) throw new Error('No auth token available (are you signed in?)');

    const url = import.meta.env.VITE_SUPABASE_URL;
    const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (!url || !anon) throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY env vars');

    // create client that attaches the Clerk-issued Supabase-compatible JWT
    return createClient(url, anon, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });
  };

  // Delete tool (authenticated)
  const deleteTool = async (toolId: string) => {
    if (!isSignedIn) {
      toast.error('Please sign in to delete tools');
      return;
    }

    if (!confirm('Are you sure you want to delete this tool? This action cannot be undone.')) {
      return;
    }

    try {
      const sb = await getAuthedSupabaseClient();
      const { error } = await sb.from('tools').delete().eq('id', toolId);
      if (error) {
        console.error('Delete error:', error);
        toast.error('Failed to delete tool.');
        return;
      }

      // remove from local state
      setTools(prev => prev.filter(t => t.id !== toolId));
      toast.success('Tool deleted.');
    } catch (err: any) {
      console.error('Delete exception:', err);
      toast.error(err?.message || 'Failed to delete tool.');
    }
  };

  // Edit -> navigate to submit/edit route (SubmitTool will load the tool)
  const handleEditNavigate = (toolId: string) => {
    navigate(`/submit/${toolId}`);
  };

  // FRAMER MOTION VARIANTS
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: (stagger = 0.06) => ({
      opacity: 1,
      transition: { staggerChildren: stagger },
    }),
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12, scale: 0.98 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.36, ease: [0.2, 0.8, 0.2, 1] } },
  };

  return (
    <main className="container py-6">
      <div className="space-y-8">
        <SearchBar
          value={searchValue}
          onChange={setSearchValue}
        />
        <div className="space-y-6">
          <div className="w-full overflow-x-auto pb-4">
            <div className="flex gap-4 min-w-min">
              <CategoryFilter
                selectedCategories={selectedCategories}
                onChange={setSelectedCategories}
              />
            </div>
          </div>

          {/* Animated grid */}
          <motion.div
            // key causes re-mount & replay when searchValue changes so animations are visible on filter
            key={searchValue + selectedCategories.join(',')}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            variants={containerVariants}
            initial={shouldReduceMotion ? 'visible' : 'hidden'}
            animate="visible"
            custom={0.06}
          >
            {filteredTools.map((tool) => (
              <motion.div
                key={tool.id}
                variants={itemVariants}
                whileHover={{ scale: shouldReduceMotion ? 1 : 1.02 }}
                layout
              >
                <ToolCard
                  tool={tool}
                  isBookmarked={isBookmarked(tool.id)}
                  toggleBookmark={() => toggleBookmark(tool)}
                  // pass edit/delete handlers (ToolCard will only show the manage option to owners)
                  onEdit={() => handleEditNavigate(tool.id)}
                  onDelete={() => deleteTool(tool.id)}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </main>
  );
};

export default Tools;
