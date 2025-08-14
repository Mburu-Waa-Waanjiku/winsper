"use client"

import React, { useEffect, useRef, useState } from 'react'
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

function Header({ color }) {
  const [showNavButtons, setShowNavButtons] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  
  const carouselRef = useRef(null);
  const scrollContainerRef = useRef(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -200,
        behavior: 'smooth'
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 200,
        behavior: 'smooth'
      });
    }
  };

  // Check if navigation buttons are needed
  useEffect(() => {
    const checkOverflow = () => {
      if (scrollContainerRef.current) {
        const container = scrollContainerRef.current;
        const hasOverflow = container.scrollWidth > container.clientWidth;
        setShowNavButtons(hasOverflow);
        
        // Update scroll button states
        setCanScrollLeft(container.scrollLeft > 0);
        setCanScrollRight(container.scrollLeft < container.scrollWidth - container.clientWidth);
      }
    };

    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    
    return () => window.removeEventListener('resize', checkOverflow);
  }, []);

  return (
    <header className=" max-w-[100vw] z-10 relative overflow-hidden pl-6 py-2 ">
      <div className="max-w-7xl mx-auto pl-4 sm:pl-6 lg:pl-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex mr-4 items-center">
            <Image src="/Winsper-Lands-Investments.png" alt="winsper" className="hidden md:block min-w-[200px]" width={200} height={50}></Image>
            <Image src="/Winsper-Lands-Investments-Limited-logo.png" alt="winsper" className="md:hidden min-w-[50px]" width={50} height={50}></Image>
          </div>

          <nav ref={carouselRef} className="relative bg-white/20 rounded-l-full w-full max-w-[70vw] backdrop-blur-md shadow-md border-b border-gray-200/30">
            {/* Navigation Buttons */}
            {showNavButtons && (
              <>
                <button
                  onClick={scrollLeft}
                  disabled={!canScrollLeft}
                  className={`absolute text-black left-2 top-1/2 -translate-y-1/2 z-50 p-2 rounded-full transition-all duration-300 shadow-lg ${
                    canScrollLeft 
                      ? 'bg-white/95 text-gray-700 hover:bg-white hover:shadow-xl' 
                      : 'bg-gray-100/50 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <ChevronLeft className="" size={20} />
                </button>
                
                <button
                  onClick={scrollRight}
                  disabled={!canScrollRight}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 z-50 p-2 rounded-full transition-all duration-300 shadow-lg ${
                    canScrollRight 
                      ? 'bg-white/95 text-gray-700 hover:bg-white hover:shadow-xl' 
                      : 'bg-gray-100/50 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <ChevronRight className="text-black" size={20} />
                </button>
              </>
            )}
            
            {/* Scrollable Container */}
            <div 
              ref={scrollContainerRef}
              className={`overflow-x-auto scrollbar-hide py-4 relative z-10 ${
                showNavButtons ? 'px-12' : 'px-6'
              }`}
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <div className={`flex text-whitefont-[500] ${color ? color : 'text-gray-600'} gap-8 ${showNavButtons ? 'justify-start' : 'justify-center'} ${showNavButtons ? '' : 'w-full'}`}>
                <a href="/" className="pl-4 whitespace-nowrap  transition-colors">Home</a>
                <a href="/land-for-sale" className="whitespace-nowrap transition-colors">All Properties</a>
                <a href="/title-issuing" className="whitespace-nowrap  transition-colors">Title Issuing</a>
                <a href="/blogs" className="whitespace-nowrap  transition-colors">Blogs</a>
                <a href="/about-us" className="whitespace-nowrap  transition-colors">About Us</a>
                <a href="/contact-us" className="whitespace-nowrap   pr-16 transition-colors">Contact</a>
              </div>
            </div>
          </nav>

        </div>
      </div>
    </header>
  )
}

export default Header