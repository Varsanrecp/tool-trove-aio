
import React, { useState } from 'react';
import { CategoryGrid } from '@/components/CategoryGrid';
import { SearchBar } from '@/components/SearchBar';

const Home = () => {
  const [searchValue, setSearchValue] = useState('');

  return (
    <main className="container py-6">
      <div className="space-y-8">
        <SearchBar 
          value={searchValue}
          onChange={setSearchValue}
        />
        <CategoryGrid />
      </div>
    </main>
  );
};

export default Home;

