import React, { useState, useEffect, useRef } from 'react';
import { MdOutlineExplore } from "react-icons/md";
import CharacterCard from './CharacterCard';

const categories = [
  "Recommend", "Fantasy", "Movie & TV", "Game & Anime", "Parallel world",
  "Modern", "RPG", "Novel", "Celebrities", "Vtuber", "Philosophy"
];

export default function Explore() {
  const [characters, setCharacters] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("Recommend");
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    async function getCharacters() {
      try {
        const response = await fetch("/api/getCharactersAPI");
        if (!response.ok) {
          throw new Error('Failed to fetch characters');
        }
        const data = await response.json();
        setCharacters(data);
      } catch (error) {
        console.error("Error fetching characters:", error);
      }
    }

    getCharacters();
  }, []);

  const handleScroll = (scrollOffset) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft += scrollOffset;
    }
  };

  return (
    <div className="bg-transparent min-h-screen p-4 sm:p-8">
      <div className="flex items-center mb-8">
        <MdOutlineExplore className="text-white text-3xl mr-4" />
        <h1 className="text-white text-2xl font-semibold">Explore</h1>
      </div>

      <div className="mb-8 overflow-x-auto hide-scrollbar">
        <div className="flex space-x-4 min-w-max">
          {categories.map((category) => (
            <button
              key={category}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                selectedCategory === category
                  ? "bg-white text-black"
                  : "bg-gray-800 bg-opacity-50 text-white"
              }`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="relative">
        <div 
          ref={scrollContainerRef}
          className="grid grid-rows-2 lg:grid-rows-1 grid-flow-col auto-cols-max scrollbar-hide overflow-x-auto overflow-y-hidden pb-4 sm:pb-6"
        >
          {characters.map(character => (
            <div key={character.id} className="">
              <CharacterCard character={character} />
            </div>
          ))}
        </div>
        <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10">
          <button 
            onClick={() => handleScroll(-200)} 
            className="bg-gray-800 bg-opacity-50 text-white rounded-full p-2 focus:outline-none"
          >
            &lt;
          </button>
        </div>
        <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10">
          <button 
            onClick={() => handleScroll(200)} 
            className="bg-gray-800 bg-opacity-50 text-white rounded-full p-2 focus:outline-none"
          >
            &gt;
          </button>
        </div>
      </div>
    </div>
  );
}