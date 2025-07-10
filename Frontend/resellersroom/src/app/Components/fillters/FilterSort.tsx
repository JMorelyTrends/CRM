import React, { useState } from 'react';
import { ArrowUpNarrowWide, Funnel, ChevronDown } from 'lucide-react';

interface FilterOption {
  label: string;
  value: string;
}

interface SortOption {
  label: string;
  value: string;
}

interface FilterSortProps {
  title: string;
  count?: number;
  filterOptions: FilterOption[];
  sortOptions: SortOption[];
  onFilterChange: (filters: string[]) => void;
  onSortChange: (sort: string) => void;
  brandOptions?: string[];
  onBrandChange?: (brand: string) => void;
  showBrandDropdown?: boolean;
}

const FilterSort: React.FC<FilterSortProps> = ({
  title,
  count,
  filterOptions,
  sortOptions,
  onFilterChange,
  onSortChange,
  brandOptions,
  onBrandChange,
  showBrandDropdown,
}) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [selectedSort, setSelectedSort] = useState<string>('');
  const [selectedBrand, setSelectedBrand] = useState<string>("");

  const handleFilterToggle = (value: string) => {
    const newFilters = selectedFilters.includes(value)
      ? selectedFilters.filter(f => f !== value)
      : [...selectedFilters, value];
    setSelectedFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleSortSelect = (value: string) => {
    setSelectedSort(value);
    onSortChange(value);
    setIsSortOpen(false);
  };

  return (
    <div className="w-full h-[12vh] mt-[3vh] flex flex-col justify-between items-start text-black">
      <div className="w-[40vw] h-full flex ml-13 flex-col justify-around items-start">
        <div className="flex mb-4 w-full h-[40%] items-center">
          <div className="text-3xl font-bold">{title}</div>
          {count !== undefined && (
            <div className="text-[10px] font-extralight flex items-end ml-2">
              <div className="bg-gray-100 px-2 py-1 rounded-full">({count})</div>
            </div>
          )}
        </div>

        <div className="flex justify-start gap-4 w-full h-[60%] items-center">
          {/* Sort Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setIsSortOpen(!isSortOpen);
                setIsFilterOpen(false);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ArrowUpNarrowWide size={16} />
              <span className="text-sm font-medium">Sort by</span>
              <ChevronDown size={16} className={`transition-transform ${isSortOpen ? 'rotate-180' : ''}`} />
            </button>
            {isSortOpen && (
              <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[200px] py-1">
                {sortOptions.map((option) => (
                  <div
                    key={option.value}
                    onClick={() => handleSortSelect(option.value)}
                    className={`px-4 py-2 cursor-pointer hover:bg-gray-50 flex items-center justify-between ${
                      selectedSort === option.value ? 'bg-gray-50' : ''
                    }`}
                  >
                    <span className="text-sm">{option.label}</span>
                    {selectedSort === option.value && (
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setIsFilterOpen(!isFilterOpen);
                setIsSortOpen(false);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Funnel size={16} />
              <span className="text-sm font-medium">Filter</span>
              <ChevronDown size={16} className={`transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
            </button>
            {isFilterOpen && (
              <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[200px] py-1">
                {filterOptions.map((option) => (
                  <div
                    key={option.value}
                    className="px-4 py-2 hover:bg-gray-50 cursor-pointer"
                  >
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={selectedFilters.includes(option.value)}
                          onChange={() => handleFilterToggle(option.value)}
                          className="sr-only"
                        />
                        <div className={`w-5 h-5 border-2 rounded flex items-center justify-center ${
                          selectedFilters.includes(option.value)
                            ? 'bg-blue-600 border-blue-600'
                            : 'border-gray-300'
                        }`}>
                          {selectedFilters.includes(option.value) && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </div>
                      <span className="text-sm">{option.label}</span>
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Brand Dropdown */}
          {showBrandDropdown && (
            <div className="relative">
              <select
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium min-w-[120px]"
                value={selectedBrand}
                onChange={e => {
                  setSelectedBrand(e.target.value);
                  if (onBrandChange) onBrandChange(e.target.value);
                }}
              >
                <option value="">All Brands</option>
                {brandOptions && brandOptions.map((brand, idx) => (
                  <option key={idx} value={brand}>{brand}</option>
                ))}
              </select>
            </div>
          )}

          {/* Active Filters Display
          {selectedFilters.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedFilters.map((filter) => (
                <div
                  key={filter}
                  className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs flex items-center gap-2"
                >
                  {filterOptions.find(f => f.value === filter)?.label}
                  <button
                    onClick={() => handleFilterToggle(filter)}
                    className="hover:text-blue-900 transition-colors"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )} */}
        </div>
      </div>
    </div>
  );
};

export default FilterSort; 