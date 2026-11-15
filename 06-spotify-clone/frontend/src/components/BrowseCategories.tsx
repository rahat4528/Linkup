'use client';

import React from 'react';
import { Category } from '../services/api';

interface BrowseCategoriesProps {
  categories: Category[];
  onSelectCategory: (category: Category) => void;
}

export const BrowseCategories: React.FC<BrowseCategoriesProps> = ({
  categories,
  onSelectCategory
}) => {
  return (
    <div className="space-y-4 select-none">
      <h2 className="text-xl font-extrabold text-white">Browse all</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {categories.map((cat) => (
          <div
            key={cat.id}
            onClick={() => onSelectCategory(cat)}
            className={`h-40 rounded-xl p-4 bg-gradient-to-br ${cat.gradient} relative overflow-hidden cursor-pointer hover:scale-[1.02] transition shadow-md`}
          >
            <span className="text-xl font-extrabold text-white leading-tight">
              {cat.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
