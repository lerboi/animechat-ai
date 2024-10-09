import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from 'lucide-react';

const CharacterCard = ({ title, imageUrl }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="relative w-64 h-96 rounded-lg overflow-hidden cursor-pointer transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <img src={imageUrl} alt={title} className="w-full h-full object-cover rounded-xl" />
      {isHovered && (
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-b from-transparent to-black flex flex-col items-center justify-end pb-4">
          <h3 className="text-white text-xl font-bold mb-2">{title}</h3>
          <Button variant="secondary">Add</Button>
        </div>
      )}
    </div>
  );
};

const Carousel = ({ characters }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [direction, setDirection] = useState(0);

  const moveSlide = useCallback((newDirection) => {
    if (!isTransitioning) {
      setIsTransitioning(true);
      setDirection(newDirection);
      setCurrentIndex((prevIndex) => (prevIndex + newDirection + characters.length) % characters.length);
      setTimeout(() => {
        setIsTransitioning(false);
        setDirection(0);
      }, 500);
    }
  }, [characters.length, isTransitioning]);

  const nextSlide = useCallback(() => moveSlide(1), [moveSlide]);
  const prevSlide = useCallback(() => moveSlide(-1), [moveSlide]);

  useEffect(() => {
    const timer = setInterval(nextSlide, 4000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  const displayIndices = [
    (currentIndex - 1 + characters.length) % characters.length,
    currentIndex,
    (currentIndex + 1) % characters.length
  ];

  return (
    <div className="relative w-full h-[400px] flex items-center justify-center overflow-hidden">
      <div className="relative w-full max-w-[800px] h-full flex items-center justify-between px-4">
        <button
          onClick={prevSlide}
          className="z-10 text-white absolute left-0 hover:text-gray-300 transition-colors"
          aria-label="Previous character"
        >
          <ChevronLeft size={36} />
        </button>

        <div className="relative w-full flex items-center justify-center">
          {displayIndices.map((index, i) => (
            <div
              key={index}
              className={`absolute transition-all duration-500 ease-in-out ${
                i === 1 ? 'z-20 scale-100' : 'z-10 scale-75'
              } ${
                i === 0 ? '-translate-x-full' : i === 2 ? 'translate-x-full' : ''
              }`}
              style={{
                transform: `translateX(${(i - 1) * 100}%) scale(${i === 1 ? 1 : 0.75})`,
                opacity: i === 1 ? 1 : 0.5,
                animation: direction !== 0 && ((direction > 0 && i === 2) || (direction < 0 && i === 0))
                  ? 'fadeIn 0.5s ease-in-out'
                  : 'none',
              }}
            >
              <CharacterCard {...characters[index]} />
            </div>
          ))}
        </div>

        <button
          onClick={nextSlide}
          className="z-10 text-white absolute right-0 hover:text-gray-300 transition-colors"
          aria-label="Next character"
        >
          <ChevronRight size={36} />
        </button>
      </div>
    </div>
  );
};

export default Carousel;