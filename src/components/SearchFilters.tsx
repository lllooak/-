import React, { useState } from 'react';
import { Filter, X } from 'lucide-react';

interface SearchFiltersProps {
  onFilterChange: (filters: {
    priceRange: [number, number];
    categories: string[];
    availability: string[];
    rating: number;
    languages: string[];
  }) => void;
}

export function SearchFilters({ onFilterChange }: SearchFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState({
    priceRange: [0, 500],
    categories: [],
    availability: [],
    rating: 0,
    languages: [],
  });

  const categories = ['Musician', 'Actor', 'Comedian', 'Athlete', 'Artist', 'Influencer'];
  const availabilityOptions = ['24h', '48h', '72h', '1 week'];
  const languageOptions = ['English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese'];

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-white border rounded-lg shadow-sm hover:bg-gray-50"
      >
        <Filter className="h-5 w-5" />
        <span>Filters</span>
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 left-0 w-80 bg-white rounded-lg shadow-xl z-50 p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Filters</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price Range
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="number"
                  value={filters.priceRange[0]}
                  onChange={(e) => handleFilterChange('priceRange', [
                    parseInt(e.target.value),
                    filters.priceRange[1],
                  ])}
                  className="w-24 px-2 py-1 border rounded"
                  min="0"
                />
                <span>to</span>
                <input
                  type="number"
                  value={filters.priceRange[1]}
                  onChange={(e) => handleFilterChange('priceRange', [
                    filters.priceRange[0],
                    parseInt(e.target.value),
                  ])}
                  className="w-24 px-2 py-1 border rounded"
                  min="0"
                />
              </div>
            </div>

            {/* Categories */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categories
              </label>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((category) => (
                  <label key={category} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={filters.categories.includes(category)}
                      onChange={(e) => {
                        const newCategories = e.target.checked
                          ? [...filters.categories, category]
                          : filters.categories.filter((c) => c !== category);
                        handleFilterChange('categories', newCategories);
                      }}
                      className="rounded text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm">{category}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Availability */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Time
              </label>
              <div className="grid grid-cols-2 gap-2">
                {availabilityOptions.map((option) => (
                  <label key={option} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={filters.availability.includes(option)}
                      onChange={(e) => {
                        const newAvailability = e.target.checked
                          ? [...filters.availability, option]
                          : filters.availability.filter((a) => a !== option);
                        handleFilterChange('availability', newAvailability);
                      }}
                      className="rounded text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Languages */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Languages
              </label>
              <div className="grid grid-cols-2 gap-2">
                {languageOptions.map((language) => (
                  <label key={language} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={filters.languages.includes(language)}
                      onChange={(e) => {
                        const newLanguages = e.target.checked
                          ? [...filters.languages, language]
                          : filters.languages.filter((l) => l !== language);
                        handleFilterChange('languages', newLanguages);
                      }}
                      className="rounded text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm">{language}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Rating
              </label>
              <select
                value={filters.rating}
                onChange={(e) => handleFilterChange('rating', parseInt(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value={0}>Any rating</option>
                <option value={3}>3+ stars</option>
                <option value={4}>4+ stars</option>
                <option value={4.5}>4.5+ stars</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
