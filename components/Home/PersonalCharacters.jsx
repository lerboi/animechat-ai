import React, { useState, useEffect } from 'react'
import Carousel from './Carousel'


// Text Component
const TextSection = () => (
  <div className="text-white w-[70%]">
    <h2 className="text-2xl font-semibold mb-4">Get Personal with <span className="text-yellow-200 font-bold">anione</span> favourite characters 😉</h2>
  </div>
)

// Main Component
export default function PersonalCharacters() {
  const characters = [
    { title: "Anime Girl 1", imageUrl: "/mock1.jpg" },
    { title: "Anime Boy 1", imageUrl: "/mock2.jpg" },
    { title: "Anime Girl 2", imageUrl: "/mock3.webp" },
    { title: "Anime Boy 2", imageUrl: "/mock4.jpg" },
    { title: "Anime Girl 3", imageUrl: "/mock5.webp" },
  ]

  return (
    <>
    <div className="flex flex-col w-full mt-10 lg:grid lg:grid-cols-3">
      <div className="m-10 lg:col-span-1 lg:flex lg:items-center lg:justify-center">
        <TextSection/>
      </div>
      <div className="col-span-2">
        <Carousel characters={characters}/>
      </div>
    </div>
    </>
  )
}