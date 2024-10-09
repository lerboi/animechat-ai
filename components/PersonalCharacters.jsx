import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"

// Character Card Component
const CharacterCard = ({ title, imageUrl }) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div 
      className="relative w-64 h-96 rounded-lg overflow-hidden cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
      {isHovered && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center">
          <h3 className="text-white text-xl font-bold mb-4">{title}</h3>
          <Button variant="secondary">Chat</Button>
        </div>
      )}
    </div>
  )
}

// Carousel Component
const Carousel = ({ characters }) => {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % characters.length)
    }, 4000)

    return () => clearInterval(timer)
  }, [characters.length])

  return (
    <div className="relative w-full overflow-hidden">
      <div 
        className="flex transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {characters.map((character, index) => (
          <div key={index} className="flex-shrink-0 w-full">
            <CharacterCard {...character} />
          </div>
        ))}
      </div>
    </div>
  )
}

// Text Component
const TextSection = () => (
  <div className="text-white w-[70%]">
    <h2 className="text-2xl font-bold mb-4">Get Personal with your favourite characters 😉</h2>
  </div>
)

// Main Component
export default function PersonalCharacters() {
  const characters = [
    { title: "Anime Girl 1", imageUrl: "/placeholder.svg?height=384&width=256" },
    { title: "Anime Boy 1", imageUrl: "/placeholder.svg?height=384&width=256" },
    { title: "Anime Girl 2", imageUrl: "/placeholder.svg?height=384&width=256" },
    { title: "Anime Boy 2", imageUrl: "/placeholder.svg?height=384&width=256" },
    { title: "Anime Girl 3", imageUrl: "/placeholder.svg?height=384&width=256" },
  ]

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-8 md:space-y-0 md:space-x-8">
          <div className="w-full md:w-1/2">
            <TextSection />
          </div>
          <div className="w-full md:w-1/2">
            <Carousel characters={characters} />
          </div>
        </div>
      </div>
    </div>
  )
}