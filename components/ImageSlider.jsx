"use client"

import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Heart } from "lucide-react";

const ImageSlider = ({ images = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const mainImageRef = useRef(null);
  const thumbnailsRef = useRef(null);
  const startX = useRef(0);
  const startY = useRef(0);
  const isDragging = useRef(false);

  useEffect(() => {
    if (images.length > 0) {
      setIsLoading(false);
    }
  }, [images]);

  // Navigate to specific image
  const goToSlide = (index) => {
    if (index >= 0 && index < images.length) {
      setCurrentIndex(index);
      scrollThumbnailIntoView(index);
    }
  };

  // Navigate to next image
  const nextSlide = () => {
    const nextIndex = (currentIndex + 1) % images.length;
    goToSlide(nextIndex);
  };

  // Navigate to previous image
  const prevSlide = () => {
    const prevIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
    goToSlide(prevIndex);
  };

  // Scroll thumbnail into view
  const scrollThumbnailIntoView = (index) => {
    if (thumbnailsRef.current) {
      const thumbnail = thumbnailsRef.current.children[index];
      if (thumbnail) {
        thumbnail.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        });
      }
    }
  };

  // Touch/Mouse event handlers
  const handleStart = (clientX, clientY) => {
    startX.current = clientX;
    startY.current = clientY;
    isDragging.current = false;
  };

  const handleMove = (clientX, clientY) => {
    if (!startX.current || !startY.current) return;
    
    const deltaX = Math.abs(clientX - startX.current);
    const deltaY = Math.abs(clientY - startY.current);
    
    // Only consider it a drag if horizontal movement is greater than vertical
    if (deltaX > deltaY && deltaX > 10) {
      isDragging.current = true;
    }
  };

  const handleEnd = (clientX) => {
    if (!isDragging.current || !startX.current) return;

    const deltaX = clientX - startX.current;
    const minSwipeDistance = 50;

    if (Math.abs(deltaX) > minSwipeDistance) {
      if (deltaX > 0) {
        prevSlide();
      } else {
        nextSlide();
      }
    }

    startX.current = 0;
    startY.current = 0;
    isDragging.current = false;
  };

  // Touch event handlers
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    handleStart(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e) => {
    const touch = e.touches[0];
    handleMove(touch.clientX, touch.clientY);
  };

  const handleTouchEnd = (e) => {
    const touch = e.changedTouches[0];
    handleEnd(touch.clientX);
  };

  // Mouse event handlers
  const handleMouseDown = (e) => {
    handleStart(e.clientX, e.clientY);
  };

  const handleMouseMove = (e) => {
    if (startX.current) {
      handleMove(e.clientX, e.clientY);
    }
  };

  const handleMouseUp = (e) => {
    if (startX.current) {
      handleEnd(e.clientX);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        prevSlide();
      } else if (e.key === 'ArrowRight') {
        nextSlide();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex]);

  if (!images || images.length === 0) {
    return (
      <div className="relative rounded-3xl h-[450px] bg-muted flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-muted-foreground/20 rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-muted-foreground">No images available</p>
        </div>
      </div>
    );
  }

  const currentImage = images[currentIndex];

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative rounded-3xl overflow-hidden bg-muted group">
        <div
          ref={mainImageRef}
          className="relative min-h-[450px] h-full cursor-grab active:cursor-grabbing"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}
          
          <img
            src={`data:${currentImage.mimeType};base64,${currentImage.base64Data}`}
            alt={currentImage.alt || `Property image ${currentIndex + 1}`}
            className="w-full h-full absolute object-cover transition-opacity duration-300"
            onLoad={() => setIsLoading(false)}
            draggable={false}
          />

          {/* Image overlay with caption */}
          {currentImage.caption && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
              <p className="text-white text-sm">{currentImage.caption}</p>
            </div>
          )}

          {/* Navigation Buttons */}
          {images.length > 1 && (
            <>
              <Button
                variant="secondary"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm hover:bg-white/90 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                onClick={prevSlide}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <Button
                variant="secondary"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm hover:bg-white/90 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                onClick={nextSlide}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}

          {/* Favorite Button */}
          <Button
            variant="secondary"
            size="icon"
            className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm hover:bg-white/90"
          >
            <Heart className="h-4 w-4" />
          </Button>

          {/* Image Counter */}
          {images.length > 1 && (
            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
              {currentIndex + 1} / {images.length}
            </div>
          )}

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="absolute bottom-6 flex w-full justify-center">
              <div
                ref={thumbnailsRef}
                className="flex space-x-4 overflow-x-auto scrollbar-hide p-3"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {images.map((image, index) => (
                  <button
                    key={image.id || index}
                    className={`flex-shrink-0 relative rounded-lg  overflow-hidden transition-all duration-200 ${
                      index === currentIndex
                        ? 'ring-2 ring-primary ring-offset-2 scale-105'
                        : 'hover:scale-105 opacity-70 border-[2px] border-gray-200 hover:opacity-100'
                    }`}
                    onClick={() => goToSlide(index)}
                  >
                    <img
                      src={`data:${image.mimeType};base64,${image.base64Data}`}
                      alt={image.alt || `Thumbnail ${index + 1}`}
                      className="w-16 h-16 object-cover"
                      draggable={false}
                    />
                    {index === currentIndex && (
                      <div className="absolute inset-0 bg-primary/20" />
                    )}
                  </button>
                ))}
              </div>

              {/* Thumbnail scroll indicators */}
              {images.length > 6 && (
                <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none" />
              )}
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default ImageSlider;