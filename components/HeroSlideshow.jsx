'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Home } from 'lucide-react'

export default function HeroSlideshow({ 
  images, 
  autoSlide = true, 
  slideInterval = 5000 
}) {
  const [currentSlide, setCurrentSlide] = useState(0)

  // Auto-slide functionality
  useEffect(() => {
    if (!autoSlide || images.length <= 1) return

    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % images.length)
    }, slideInterval)

    return () => clearInterval(timer)
  }, [autoSlide, slideInterval, images.length])

  const goToSlide = (index) => {
    setCurrentSlide(index)
  }

  const goToPrevious = () => {
    setCurrentSlide(prev => (prev - 1 + images.length) % images.length)
  }

  const goToNext = () => {
    setCurrentSlide(prev => (prev + 1) % images.length)
  }

  const createImageSrc = (base64Data, mimeType) => {
    // Handle both full data URLs and base64 strings
    if (base64Data.startsWith('data:')) {
      return base64Data
    }
    return `data:${mimeType};base64,${base64Data}`
  }

  if (!images || images.length === 0) {
    // Fallback placeholder
    return (
      <div className="absolute inset-0 bg-gradient-to-r from-gray-900/60 to-gray-900/40">
        <div className="absolute inset-0 bg-cover bg-center bg-gray-300">
          <div className="w-full h-full flex items-center justify-center text-gray-600">
            <div className="bg-black/20 w-full h-full z-[2]"></div>
            <div className="text-center absolute z-[3]">
              <Home className="h-24 w-24 mx-auto mb-4 opacity-30 text-white" />
              <p className="text-lg opacity-50 text-white">No images available</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="absolute inset-0">
      {/* Background overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-gray-900/60 to-gray-900/40 z-[2]"></div>
      
      {/* Image slides */}
      <div className="relative w-full h-full overflow-hidden">
        {images.map((image, index) => (
          <div
            key={image.id || index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <Image
              src={createImageSrc(image.base64Data, image.mimeType)}
              alt={image.alt || image.caption || `Hero image ${index + 1}`}
              fill
              className="object-cover"
              priority={index === 0}
            />
          </div>
        ))}
      </div>

      {/* Navigation arrows (only show if more than 1 image) */}
      {images.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-[3] bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-colors duration-200"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-[3] bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-colors duration-200"
            aria-label="Next image"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Slide indicators (only show if more than 1 image) */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-[3] flex space-x-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                index === currentSlide 
                  ? 'bg-white' 
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}