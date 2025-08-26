import React, { useState, useEffect } from 'react';
import { SearchBar } from '../components/SearchBar';
import { CategoryFilter } from '../components/CategoryFilter';
import { ToolCard } from '../components/ToolCard';
import { supabase } from '@/integrations/supabase/client';
import { Tool } from '../lib/tools';
import { useBookmark } from '@/hooks/useBookmark';
import { useSearchParams } from 'react-router-dom';

const Tools = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') ?? '';

  const [searchValue, setSearchValue] = useState(initialSearch);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const { isBookmarked, toggleBookmark } = useBookmark();

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTools.map((tool) => (
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
    </main>
  );
};

export default Tools;
