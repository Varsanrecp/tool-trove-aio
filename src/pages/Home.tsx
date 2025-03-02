
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CategoryGrid } from '../components/CategoryGrid';
import { SearchBar } from '../components/SearchBar';
import { tools } from '../lib/tools';
import { ToolCard } from '../components/ToolCard';
import { Button } from '../components/ui/button';
import { ArrowRight } from 'lucide-react';

const Home = () => {
  const [searchValue, setSearchValue] = useState('');
  const navigate = useNavigate();
  
  // Get 3 featured tools
  const popularTools = tools.filter(tool => tool.featured).slice(0, 3);

  return (
    <main className="container py-6">
      <div className="space-y-12">
        <SearchBar 
          value={searchValue}
          onChange={setSearchValue}
        />
        <CategoryGrid />
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-white">Popular Tools</h2>
            <Button 
              onClick={() => navigate('/tools')}
              variant="secondary"
              className="group"
            >
              See All Tools
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {popularTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Home;
