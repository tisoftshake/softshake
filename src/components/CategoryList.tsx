import React from 'react';

interface Category {
  id: string;
  name: string;
  slug: string;
  color: string;
}

interface CategoryListProps {
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (slug: string | null) => void;
}

export function CategoryList({ categories, selectedCategory, onSelectCategory }: CategoryListProps) {
  return (
    <div className="flex gap-3 p-4 overflow-x-auto hide-scrollbar bg-gradient-to-r from-purple-50 to-yellow-50">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onSelectCategory(category.slug)}
          className={`px-6 py-3 rounded-xl whitespace-nowrap text-sm font-medium transition-all
            ${selectedCategory === category.slug
              ? 'bg-gradient-to-r from-purple-500 to-yellow-500 text-white shadow-lg shadow-purple-500/20'
              : 'bg-white text-gray-700 hover:bg-purple-50 border-2 border-purple-100'
            }`}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}