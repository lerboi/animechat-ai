import React, { useState, useEffect } from 'react'
import Carousel from './Carousel'


// Text Component
const TextSection = () => (
  <div className="text-white w-[100%]">
    <h1 className="text-3xl font-semibold mb-4">Get Personal with <span className="text-orange-300 font-bold">anione</span> 😉</h1>
    <p className="font-semibold">AI characters that truly feel alive</p>
  </div>
)

// Main Component
export default function PersonalCharacters({ isOpen }) {
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
        <Carousel isOpen={isOpen} characters={characters}/>
      </div>
    </div>
    </>
  )
}