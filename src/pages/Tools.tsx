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

const Tools: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') ?? '';

  const [searchValue, setSearchValue] = useState(initialSearch);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const { isBookmarked, toggleBookmark } = useBookmark();

  const shouldReduceMotion = useReducedMotion();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTools = async () => {
      const { data, error } = await supabase
        .from('tools')
        .select('*');

      if (error) {
        console.error('Error fetching tools:', error);
      } else {
        setTools(data as Tool[]);
      }
      setLoading(false);
    };

    fetchTools();
  }, []);

  useEffect(() => {
    if (searchValue && searchValue.trim().length > 0) {
      setSearchParams({ search: searchValue });
    } else {
      setSearchParams({});
    }
  }, [searchValue, setSearchParams]);

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

  const handleEditNavigate = (toolId: string) => {
    navigate(`/submit/${toolId}`);
  };

  return (
    <main className="container py-6">
      <div className="space-y-6">
        <SearchBar value={searchValue} onChange={setSearchValue} />

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="w-full sm:w-auto">
            <CategoryFilter selectedCategories={selectedCategories} onChange={setSelectedCategories} />
          </div>
        </div>

        <motion.div
          key={searchValue + selectedCategories.join(',')}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          variants={containerVariants}
          initial={shouldReduceMotion ? 'visible' : 'hidden'}
          animate="visible"
          custom={0.06}
        >
          {filteredTools.map((tool) => (
            <motion.div key={tool.id} variants={itemVariants} whileHover={{ scale: shouldReduceMotion ? 1 : 1.02 }} layout>
              <ToolCard
                tool={tool as any}
                isBookmarked={isBookmarked(tool.id)}
                toggleBookmark={() => toggleBookmark(tool)}
                onEdit={() => handleEditNavigate(tool.id)}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </main>
  );
};

export default Tools;
