
import React from 'react';
import { CategoryGrid } from '@/components/CategoryGrid';
import { SearchBar } from '@/components/SearchBar';

const Home = () => {
  return (
    <main className="container py-6">
      <div className="space-y-8">
        <SearchBar />
        <CategoryGrid />
      </div>
    </main>
  );
};

export default Home;
