import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import CharacterCard from './CharacterCard';

export default function Carousel ({ characters, isOpen }) {
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
                i === 1 ? ` ${isOpen? 'z[-1]' : 'z-20' } scale-100` : `${isOpen? 'z[-1]' : 'z-10' } scale-75`
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
              <CharacterCard {...characters[index]} isMiddle={i === 1} isOpen={isOpen} />
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