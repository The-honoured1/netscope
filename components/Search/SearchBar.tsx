'use client';

import React, { useState, useEffect } from 'react';
import { Search, Command, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export const SearchBar = ({ initialValue = '' }: { initialValue?: string }) => {
  const [query, setQuery] = useState(initialValue);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="relative group w-full max-w-2xl mx-auto">
      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-emerald-500 transition-colors">
        <Search size={18} />
      </div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search IP, domain, server, or tags..."
        className="w-full bg-zinc-900/50 border border-zinc-800 text-zinc-200 pl-12 pr-12 py-4 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all font-mono text-sm placeholder:text-zinc-600 shadow-2xl"
      />
      <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
        <div className="flex items-center gap-1 px-1.5 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-[10px] text-zinc-500 font-mono">
          <Command size={10} />
          <span>K</span>
        </div>
      </div>
      {query && (
        <button
          type="submit"
          className="absolute right-12 inset-y-0 flex items-center text-emerald-500 hover:text-emerald-400 transition-colors"
        >
          <ArrowRight size={18} />
        </button>
      )}
    </form>
  );
};
