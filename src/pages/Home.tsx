
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CategoryGrid } from '../components/CategoryGrid';
import { SearchBar } from '../components/SearchBar';
import { tools } from '../lib/tools';
import { ToolCard } from '../components/ToolCard';
import { Button } from '../components/ui/button';
import { ArrowRight, Check } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { toast } from 'sonner';

const Home = () => {
  const [searchValue, setSearchValue] = useState('');
  const navigate = useNavigate();
  const { isSignedIn } = useUser();
  const popularTools = tools.filter(tool => tool.featured).slice(0, 3);

  const handleUpgradeClick = () => {
    if (!isSignedIn) {
      toast.error('Please sign in to upgrade to premium');
      return;
    }
    // Handle upgrade logic here
    toast.success('Upgrade functionality coming soon!');
  };

  return <main className="container py-6">
      <div className="space-y-16">
        {/* Recommendations Section (Empty for now) */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">Recommended Tools</h2>
          <div className="p-8 text-center text-muted-foreground border rounded-lg">Featured tools will appear here for premium users Sign-Up 
to pay for premium</div>
        </div>

        {/* Search and Categories */}
        <div className="space-y-12">
          <SearchBar value={searchValue} onChange={setSearchValue} />
          <CategoryGrid />
        </div>
        
        {/* Popular Tools */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-white">Popular Tools</h2>
            <Button onClick={() => navigate('/tools')} variant="secondary" className="group">
              See All Tools
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {popularTools.map(tool => <ToolCard key={tool.id} tool={tool} />)}
          </div>
        </div>

        {/* Pricing Section */}
        <div className="space-y-8">
          <h2 className="text-2xl font-semibold text-white text-center">Pricing Plans</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <div className="p-6 rounded-lg border bg-card hover:border-primary transition-colors">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Free Plan</h3>
                <p className="text-3xl font-bold">$0<span className="text-sm font-normal text-muted-foreground">/month</span></p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span>Access to all AI tools</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span>Basic search functionality</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span>Save favorite tools</span>
                  </li>
                </ul>
                <Button variant="outline" className="w-full">
                  Current Plan
                </Button>
              </div>
            </div>

            {/* Premium Plan */}
            <div className="p-6 rounded-lg border bg-card hover:border-primary transition-colors relative overflow-hidden">
              <div className="absolute top-3 right-3">
                <span className="px-3 py-1 text-xs font-semibold bg-primary text-primary-foreground rounded-full">
                  Popular
                </span>
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Premium Plan</h3>
                <p className="text-3xl font-bold">$7<span className="text-sm font-normal text-muted-foreground">/month</span></p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span>All Free Plan features</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span>Featured in recommendations</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span>Priority support</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span>Early access to new features</span>
                  </li>
                </ul>
                <Button className="w-full" onClick={handleUpgradeClick}>
                  Upgrade Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>;
};

export default Home;
