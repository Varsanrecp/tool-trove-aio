
import { useState } from 'react';
import { SearchBar } from '@/components/SearchBar';
import { CategoryGrid } from '@/components/CategoryGrid';
import { CategoryFilter } from '@/components/CategoryFilter';
import { ToolCard } from '@/components/ToolCard';
import { tools } from '@/lib/tools';
import { GridIcon, ListIcon, SortAsc, Star, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Index = () => {
  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isGridView, setIsGridView] = useState(true);
  const [sortBy, setSortBy] = useState<"name" | "rating" | "popularity">("rating");
  
  const filteredTools = tools
    .filter((tool) => {
      const matchesSearch = 
        tool.name.toLowerCase().includes(search.toLowerCase()) ||
        tool.description.toLowerCase().includes(search.toLowerCase()) ||
        tool.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()));
      
      const matchesCategories = 
        selectedCategories.length === 0 || 
        selectedCategories.includes(tool.category);
      
      return matchesSearch && matchesCategories;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "rating":
          return b.rating - a.rating;
        case "popularity":
          return b.popularity - a.popularity;
      }
    });

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8">
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

        {/* Tools Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Featured Tools</h2>
            <div className="flex items-center gap-4">
              {/* View Toggle */}
              <div className="flex items-center gap-2 glass rounded-lg p-1">
                <button
                  onClick={() => setIsGridView(true)}
                  className={cn(
                    "p-2 rounded-md transition-colors",
                    isGridView ? "bg-primary text-primary-foreground" : "text-gray-400"
                  )}
                >
                  <GridIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setIsGridView(false)}
                  className={cn(
                    "p-2 rounded-md transition-colors",
                    !isGridView ? "bg-primary text-primary-foreground" : "text-gray-400"
                  )}
                >
                  <ListIcon className="w-5 h-5" />
                </button>
              </div>
              
              {/* Enhanced Sort Dropdown */}
              <Select
                value={sortBy}
                onValueChange={(value) => setSortBy(value as typeof sortBy)}
              >
                <SelectTrigger className="w-[180px] glass">
                  <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating" className="flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    <span>Highest Rated</span>
                  </SelectItem>
                  <SelectItem value="popularity" className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>Most Popular</span>
                  </SelectItem>
                  <SelectItem value="name" className="flex items-center gap-2">
                    <SortAsc className="w-4 h-4" />
                    <span>Alphabetical</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Category Filters */}
          <CategoryFilter
            selectedCategories={selectedCategories}
            onChange={setSelectedCategories}
          />

          {/* Tools Grid/List */}
          <div className={cn(
            isGridView
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-4"
          )}>
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
