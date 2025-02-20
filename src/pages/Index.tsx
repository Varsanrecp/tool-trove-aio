
import { useState } from 'react';
import { SearchBar } from '@/components/SearchBar';
import { CategoryGrid } from '@/components/CategoryGrid';
import { ToolCard } from '@/components/ToolCard';
import { tools } from '@/lib/tools';

const Index = () => {
  const [search, setSearch] = useState("");
  
  const filteredTools = tools.filter((tool) =>
    tool.name.toLowerCase().includes(search.toLowerCase()) ||
    tool.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            AI Tool Collector
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Discover and collect the best AI tools for your workflow
          </p>
        </div>

        {/* Search */}
        <SearchBar value={search} onChange={setSearch} />

        {/* Categories */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Categories</h2>
          <CategoryGrid />
        </div>

        {/* Tools Grid */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Featured Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
