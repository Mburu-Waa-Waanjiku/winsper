"use client"

import { useState } from "react";
import { DollarSign, Building, MapPin, Search } from "lucide-react";

const SearchForm = ({ mockHomepageData }) => {
  const [searchData, setSearchData] = useState({
    priceRange: '',
    propertyType: '',
    location: '',
  });

  const handleInputChange = (field, value) => {
    setSearchData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSearch = () => {
    console.log('Search with:', searchData);
    // Add your search logic here
  };

  return (
    <section className="px-6 py-8 mx-8 -mt-3 sm:mx-16 overflow-hidden relative bg-gray-100 shadow-xl z-[5] mx-4 rounded-xl border-b">
      <div className="max-w-6xl mx-auto">
        <h3 className="text-2xl font-semibold text-black mb-1">
          Search the price you looking for
        </h3>
        <div className="w-full z-[2] flex justify-center">
          <div className="grow flex justify-center rounded-xl py-3 max-w-6xl mx-auto">
            <div className="flex grow gap-4 justify-between">
              {/* Price Range */}
              <div className="space-y-2">
                <div className="relative !mt-1">
                  <DollarSign className="absolute right-3 top-2.5 h-3.5 w-4 text-secondary" />
                  <select
                    value={searchData.priceRange}
                    onChange={(e) => handleInputChange('priceRange', e.target.value)}
                    className="w-full pl-4 pr-10 py-1.5 text-sm border-[2px] text-gray-400 bg-gray-200 border-gray-200 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent appearance-none"
                  >
                    <option value="">Budget</option>
                    {mockHomepageData.priceRanges.map(range => (
                      <option key={range.value} value={range.value}>{range.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Property Type */}
              <div className="space-y-2">
                <div className="relative !mt-1">
                  <Building className="absolute right-3 top-2.5 h-4 w-4 text-secondary" />
                  <select
                    value={searchData.propertyType}
                    onChange={(e) => handleInputChange('propertyType', e.target.value)}
                    className="w-full pl-4 pr-10 py-1.5 text-sm border-[2px] text-gray-400 bg-gray-200 border-gray-200 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent appearance-none"
                  >
                    <option value="">Type</option>
                    {mockHomepageData.propertyTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <div className="relative !mt-1">
                  <MapPin className="absolute right-3 top-2.5 h-4 w-4 text-secondary" />
                  <select
                    value={searchData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="w-full pl-4 pr-10 py-1.5 text-sm border-[2px] text-gray-400 bg-gray-200 border-gray-200 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent appearance-none"
                  >
                    <option value="">Location</option>
                    {mockHomepageData.areas.map(area => (
                      <option key={area.value} value={area.value}>{area.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Search Button */}
              <div className="sm:col-span-2 lg:col-span-1">
                <button
                  onClick={handleSearch}
                  className="w-full themebg-green text-white px-3 md:px-6 py-2.5 rounded-xl hover:bg-teal-700 transition-colors flex items-center justify-center font-medium"
                >
                  <Search className="md:hidden h-4 w-4" />
                  <span className="hidden md:block leading-4 text-sm">Search</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SearchForm;