import React, { useState, useEffect } from 'react';
import { SearchBar } from '../components/SearchBar';
import { CategoryFilter } from '../components/CategoryFilter';
import { ToolCard } from '../components/ToolCard';
import { supabase } from '@/integrations/supabase/client';
import { Tool } from '../lib/tools';
import { useBookmark } from '@/hooks/useBookmark'; // Add this import

const Tools = () => {
  const [searchValue, setSearchValue] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const { isBookmarked, toggleBookmark } = useBookmark(); // Add this line

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

  const filteredTools = tools
    .filter((tool) => {
      const matchesSearch =
        tool.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchValue.toLowerCase()) ||
        (tool.tags && tool.tags.some(tag => tag.toLowerCase().includes(searchValue.toLowerCase())));

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