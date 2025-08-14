"use client"

import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight, Download, Maximize2, Pause, Play, Share2, X } from "lucide-react";
import { Card } from "./ui/card";

export function TitleIssuingGallery({ images, eventTitle }) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
  
    const handleImageClick = (index) => {
      setCurrentImageIndex(index);
      setIsModalOpen(true);
    };
  
    const handleNext = () => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    };
  
    const handlePrev = () => {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    };
  
    const handleClose = () => {
      setIsModalOpen(false);
    };
  
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Event Gallery</h2>
          <p className="text-muted-foreground mb-6">
            Browse through {images.length} images from this title issuing event
          </p>
          <Button 
            onClick={() => handleImageClick(0)}
            className="bg-primary hover:bg-primary/90 text-white rounded-full px-8 py-3 mb-8"
          >
            <Play className="w-5 h-5 mr-2" />
            Start Slideshow
          </Button>
        </div>
  
        {/* Pinterest-style Masonry Grid */}
        <MasonryGrid images={images} onImageClick={handleImageClick} />
  
        {/* Slideshow Modal */}
        <SlideshowModal
          images={images}
          currentIndex={currentImageIndex}
          isOpen={isModalOpen}
          onClose={handleClose}
          onNext={handleNext}
          onPrev={handlePrev}
          onImageClick={setCurrentImageIndex}
        />
      </div>
    );
  }

// Helper function to create image src from base64
export function createImageSrc(base64Data, mimeType) {
    if (!base64Data || !mimeType) return null;
    if (base64Data.startsWith('data:')) return base64Data;
    return `data:${mimeType};base64,${base64Data}`;
  }

// Pinterest-style Masonry Grid Component
export function MasonryGrid({ images, onImageClick }) {
    return (
      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
        {images.map((image, index) => {
          const imageSrc = createImageSrc(image.base64Data, image.mimeType);
          return (
            <Card
              key={image.id} 
              className="break-inside-avoid rounded-3xl overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group"
              onClick={() => onImageClick(index)}
            >
              <div className="relative overflow-hidden">
                <img 
                  src={imageSrc} 
                  alt={image.alt || `Title issuing image ${index + 1}`}
                  className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                  <Maximize2 className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                {image.caption && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                    <p className="text-white text-sm font-medium">{image.caption}</p>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    );
  }

// Slideshow Modal Component
export function SlideshowModal({ images, currentIndex, isOpen, onClose, onNext, onPrev }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);
  
    // Auto-advance slideshow
    useEffect(() => {
      if (!isPlaying || !isOpen) return;
      
      const interval = setInterval(() => {
        onNext();
      }, 3000);
  
      return () => clearInterval(interval);
    }, [isPlaying, isOpen, onNext]);
  
    // Handle keyboard navigation
    useEffect(() => {
      if (!isOpen) return;
  
      const handleKeyPress = (e) => {
        switch (e.key) {
          case 'ArrowLeft':
            onPrev();
            break;
          case 'ArrowRight':
            onNext();
            break;
          case 'Escape':
            onClose();
            break;
          case ' ':
            e.preventDefault();
            setIsPlaying(!isPlaying);
            break;
        }
      };
  
      document.addEventListener('keydown', handleKeyPress);
      return () => document.removeEventListener('keydown', handleKeyPress);
    }, [isOpen, isPlaying, onNext, onPrev, onClose]);
  
    // Handle touch events for swipe
    const minSwipeDistance = 50;
  
    const onTouchStart = (e) => {
      setTouchEnd(null);
      setTouchStart(e.targetTouches[0].clientX);
    };
  
    const onTouchMove = (e) => {
      setTouchEnd(e.targetTouches[0].clientX);
    };
  
    const onTouchEnd = () => {
      if (!touchStart || !touchEnd) return;
      
      const distance = touchStart - touchEnd;
      const isLeftSwipe = distance > minSwipeDistance;
      const isRightSwipe = distance < -minSwipeDistance;
  
      if (isLeftSwipe) {
        onNext();
      } else if (isRightSwipe) {
        onPrev();
      }
    };
  
    if (!isOpen || !images || images.length === 0) return null;
  
    const currentImage = images[currentIndex];
    const imageSrc = createImageSrc(currentImage.base64Data, currentImage.mimeType);
  
    return (
      <div className="fixed inset-0 !mt-0 bg-black bg-opacity-95 z-50 flex items-center justify-center">
        {/* Header Controls */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setIsPlaying(!isPlaying)}
              className="text-white hover:bg-white/20 rounded-full"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </Button>
            <span className="text-white text-sm">
              {currentIndex + 1} of {images.length}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="icon"
              className="text-white hover:bg-white/20 rounded-full"
            >
              <Share2 className="w-5 h-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              className="text-white hover:bg-white/20 rounded-full"
            >
              <Download className="w-5 h-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-full"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
  
        {/* Navigation Buttons */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onPrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 rounded-full w-12 h-12"
        >
          <ChevronLeft className="w-6 h-6" />
        </Button>
  
        <Button
          variant="ghost"
          size="icon"
          onClick={onNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 rounded-full w-12 h-12"
        >
          <ChevronRight className="w-6 h-6" />
        </Button>
  
        {/* Image Container */}
        <div 
          className="relative max-w-4xl max-h-[80vh] mx-4"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <img 
            src={imageSrc}
            alt={currentImage.alt || `Image ${currentIndex + 1}`}
            className="w-full h-auto object-contain rounded-2xl"
          />
          
          {/* Image Caption */}
          {currentImage.caption && (
            <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-sm rounded-2xl p-4">
              <p className="text-white text-center">{currentImage.caption}</p>
            </div>
          )}
        </div>
  
        {/* Thumbnail Strip */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 max-w-md overflow-x-auto">
          {images.map((img, index) => (
            <button
              key={img.id}
              onClick={() => onImageClick(index)}
              className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                index === currentIndex ? 'border-white' : 'border-transparent opacity-60'
              }`}
            >
              <img 
                src={createImageSrc(img.base64Data, img.mimeType)}
                alt={img.alt || `Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>
    );
  }
  