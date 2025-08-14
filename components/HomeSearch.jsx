"use client"

import React from 'react'
import { useState, useEffect, useRef } from "react";
import { Search, Home, Users, Mail, MapPin, DollarSign, Building, User, ChevronLeft, ChevronRight } from 'lucide-react';


const mockHomepageData = {
  id: "homepage_1",
  
  // Hero section
  heroTitle: "Winsper Lands ",
  heroSubtitle: "Investments",
  heroDescription: "Your Real & True Partner.",
  heroCta: "Search Properties",
  heroCtaLink: "/search",

  //Homepage Images
  heroImages: [
    {
      id: "hero_1",
      base64Data: "", // Would contain base64 image data in real app
      mimeType: "/202405260901img3.png",
      filename: "hero-bedroom.jpg",
      alt: "Beautiful bedroom with natural lighting",
      caption: "Comfortable living spaces",
      order: 0,
      isActive: true,
      fileSize: 245760,
      width: 1920,
      height: 1080,
      homepageId: "homepage_1",
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],

  // Property types
  propertyTypes: [
    { value: "residential", label: "Residential" },
    { value: "commercial", label: "Commercial" },
    { value: "agricultural", label: "Agricultural" }
  ],
  
  // Price ranges
  priceRanges: [
    { value: "0-50000", label: "KSh 0 - 50,000" },
    { value: "50000-100000", label: "KSh 50,000 - 100,000" },
    { value: "100000-200000", label: "KSh 100,000 - 200,000" },
    { value: "200000-500000", label: "KSh 200,000 - 500,000" },
    { value: "500000-1000000", label: "KSh 500,000 - 1,000,000" },
    { value: "1000000+", label: "KSh 1,000,000+" }
  ],
  
  // Areas/Locations
  areas: [
    { value: "westlands", label: "Westlands" },
    { value: "karen", label: "Karen" },
    { value: "kilimani", label: "Kilimani" },
    { value: "lavington", label: "Lavington" },
    { value: "kileleshwa", label: "Kileleshwa" },
    { value: "runda", label: "Runda" },
    { value: "muthaiga", label: "Muthaiga" },
    { value: "gigiri", label: "Gigiri" },
    { value: "spring-valley", label: "Spring Valley" },
    { value: "riverside", label: "Riverside" },
    { value: "parklands", label: "Parklands" },
    { value: "south-c", label: "South C" },
    { value: "south-b", label: "South B" },
    { value: "langata", label: "Langata" },
    { value: "upperhill", label: "Upperhill" }
  ],
  
  
  // Homepage sections
  sections: [
    {
      id: "section_1",
      title: "Find Community",
      content: "Discover the essential services you need when moving into your new home. From furniture stores to babysitters and insurance agents, find everything you need to settle in comfortably.",
      imageAlt: "People having a discussion in a home setting",
      order: 0,
      isActive: true,
    },
    {
      id: "section_2",
      title: "Professional Services",
      content: "Connect with trusted professionals including real estate agents, home inspectors, and contractors to help you with your property needs.",
      imageAlt: "Family reviewing documents together",
      order: 1,
      isActive: true,
    },
    {
      id: "section_3", 
      title: "Home & Living",
      content: "Everything you need to make your house a home. Furniture, appliances, home décor, and local services to create your perfect living space.",
      imageAlt: "Couple relaxing in a modern living room",
      order: 2,
      isActive: true,
    },
    {
      id: "section_4",
      title: "Family Services", 
      content: "Find childcare, education, healthcare, and family-friendly activities in your new neighborhood to help your family settle in.",
      imageAlt: "Parent and child enjoying time together",
      order: 3,
      isActive: true,
    }
  ],
  
  metaTitle: "Rootly - Find Your Perfect Rental Home",
  metaDescription: "Discover long-term rental properties and connect with your new community. Find everything you need to make your house a home.",
  
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
};

function HomeSearch() {
  
  const [searchData, setSearchData] = useState({
    price: '',
    type: '',
    room: '',
    location: '',
    community: 'Caregiver'
  });

  const handleInputChange = (field, value) => {
    setSearchData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSearch = () => {
    console.log('Search with:', searchData);
  };

  return (
    <div className="w-full absolute z-[2] bottom-[10vh] flex  px-12 justify-center">
      <div className=" grow bg-white  flex justify-center rounded-xl shadow-xl px-4 py-3 max-w-6xl mx-auto">
        <div className="flex grow gap-4 justify-between">
          {/* Price Range */}
          <div className="space-y-2">
            <label className="block text-sm font-bold hidden sm:block themecolor-blue">Price Range</label>
            <div className="relative !mt-1">
              <DollarSign className="absolute left-3 top-2.5 h-3.5 w-4 text-gray-500" />
              <select
                value={searchData.priceRange}
                onChange={(e) => handleInputChange('priceRange', e.target.value)}
                className="w-full pl-10 pr-4 py-1.5 text-sm border-[2px] text-gray-400 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent appearance-none bg-white"
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
            <label className="block text-sm font-bold hidden sm:block themecolor-blue">Property Type</label>
            <div className="relative !mt-1">
              <Building className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
              <select
                value={searchData.propertyType}
                onChange={(e) => handleInputChange('propertyType', e.target.value)}
                className="w-full pl-10 text-sm pr-4 py-1.5 border-[2px] text-gray-400 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent appearance-none bg-white"
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
            <label className="block text-sm themecolor-blue font-bold hidden sm:block ">Location</label>
            <div className="relative !mt-1">
              <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
              <select
                value={searchData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="w-full pl-10 text-sm pr-4 py-1.5 border-[2px] text-gray-400 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent appearance-none bg-white"
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
              className="w-full themebg-green mt-0.5 sm:mt-6 text-white px-3 md:px-6 py-2.5 rounded-xl hover:bg-teal-700 transition-colors flex items-center justify-center font-medium"
            >
              <Search className=" md:hidden h-4 w-4 " />
              <span className="hidden md:block leading-4 text-sm">Search</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomeSearch