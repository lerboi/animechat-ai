import React, { useState, useEffect } from 'react'
import { User, Users } from 'lucide-react'

export default function ChatList({ onSelectChat }) {
  const [selectedChat, setSelectedChat] = useState(null)
  const [characters, setCharacters] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchCharacters() {
      try {
        const response = await fetch("/api/getChatsAPI")
        if (!response.ok) {
          setError("No characters found")
        }
        else{
          const data = await response.json()
        setCharacters(data)
        }
      } catch (error) {
        console.error("Error fetching characters:", error)
      }
    }

    fetchCharacters()
  }, [])

  function handleSelectChat(character) {
    setSelectedChat(character.id)
    onSelectChat(character)
  }

  return (
    <div className="bg-[#212121] text-[#e7e7e7] w-full md:w-1/4 h-[100vh] flex flex-col overflow-hidden bg-opacity-60">
      {/* Top Chat label Section */}
      <div className="p-4 font-semibold text-lg border-b border-gray-700">Characters</div>

      {/* Chat List Section */}
      <div className="flex-1 overflow-y-auto">
        {characters.length > 0 ? characters.map((character) => (
          <div
            key={character.id}
            onClick={() => handleSelectChat(character)}
            className={`flex items-center p-3 cursor-pointer hover:bg-[#2c2c2c] transition-colors ${
              selectedChat === character.id ? 'bg-[#2c2c2c]' : ''
            }`}
          >
            <div className="w-12 h-12 rounded-full bg-[#3a3a3a] flex items-center justify-center text-lg font-semibold mr-3">
              {character.avatar ? (
                <img src={character.avatar} alt={character.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                <User size={24} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline">
                <h3 className="text-sm font-semibold truncate">{character.name}</h3>
              </div>
            </div>
          </div>
        )) : <p>Add characters</p>}
      </div>
    </div>
  )
}