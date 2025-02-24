import React from 'react';
import { Search } from 'lucide-react';

interface HeaderProps {
  onSearch: (query: string) => void;
}

export function Header({ onSearch }: HeaderProps) {
  return (
    <header className="w-full">
      {/* Banner */}
      <div 
        className="w-full h-64 sm:h-80 bg-cover bg-center relative"
        style={{
          backgroundImage: 'url("https://iili.io/2ZecvyX.jpg")'
        }}
      >
        
          <div className="p-4 sm:p-6 text-white">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2"></h1>
            <p className="text-base sm:text-lg md:text-xl opacity-90"></p>
          </div>
        </div>
      
      
      {/* Search Bar */}
      <div className="px-3 sm:px-4 py-3 sm:py-4 bg-white shadow-lg">
        <div className="relative max-w-2xl mx-auto">
          <input
            type="text"
            placeholder="O que você procura hoje?"
            className="w-full pl-10 sm:pl-12 pr-4 py-2 sm:py-3 text-sm rounded-xl border-2 border-purple-200 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
            onChange={(e) => onSearch(e.target.value)}
          />
          <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-purple-400 w-4 h-4 sm:w-5 sm:h-5" />
        </div>
      </div>
    </header>
  );
}