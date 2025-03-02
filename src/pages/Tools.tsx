
import React, { useState } from 'react';
import { SearchBar } from '../components/SearchBar';
import { CategoryFilter } from '../components/CategoryFilter';
import { ToolCard } from '../components/ToolCard';
import { tools } from '../lib/tools';

const Tools = () => {
  const [searchValue, setSearchValue] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

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
            {tools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Tools;
