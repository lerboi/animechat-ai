import React, { useState, useEffect } from 'react';
import { MdOutlineExplore } from "react-icons/md";
import CharacterCard from './CharacterCard';

const categories = [
  "Recommend", "Fantasy", "Movie & TV", "Game & Anime", "Parallel world",
  "Modern", "RPG", "Novel", "Celebrities", "Vtuber", "Philosophy"
];

export default function Explore() {
  const [characters, setCharacters] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("Recommend");

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

  return (
    <div className="bg-transparent min-h-screen p-8">
      <div className="flex items-center mb-8">
        <MdOutlineExplore className="text-white text-3xl mr-4" />
        <h1 className="text-white text-2xl font-semibold">Explore</h1>
      </div>

      <div className="mb-8 overflow-x-hidden">
        <div className="flex space-x-4">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {characters.map(character => (
          <CharacterCard key={character.id} character={character} />
        ))}
      </div>
    </div>
  );
}