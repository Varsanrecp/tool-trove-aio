
import React from 'react';
import { SearchBar } from '@/components/SearchBar';
import { CategoryFilter } from '@/components/CategoryFilter';
import { ToolCard } from '@/components/ToolCard';
import { tools } from '@/lib/tools';

const Tools = () => {
  return (
    <main className="container py-6">
      <div className="space-y-8">
        <SearchBar />
        <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6">
          <CategoryFilter />
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
