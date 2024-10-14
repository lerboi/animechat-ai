import React, { useState, useEffect } from 'react'
import { User, Users } from 'lucide-react'
import { useSession } from 'next-auth/react'

export default function ChatList({ onSelectChat }) {
  const [selectedChat, setSelectedChat] = useState(null)
  const [characters, setCharacters] = useState([])
  const [error, setError] = useState(null)
  const { data: session } = useSession()

  useEffect(() => {
    async function fetchCharacters() {
      if (!session) return; // Don't fetch if not logged in

      try {
        const response = await fetch("/api/getChatsAPI")
        if (!response.ok) {
          throw new Error("Failed to fetch characters")
        }
        const data = await response.json()
        if (data.message === "No characters found") {
          setCharacters([])
        } else {
          setCharacters(data)
        }
      } catch (error) {
        console.error("Error fetching characters:", error)
        setError("Failed to load characters")
      }
    }

    async function fetchLastMessages() {
      if (!session) return;

      try {
        const response = await fetch("/api/fetchLastMessageAPI", {
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          }
        })
        if (!response.ok) {
          throw new Error("Failed to fetch last messages")
        }
        const data = await response.json()
        setCharacters(prevCharacters => 
          prevCharacters.map(char => {
            const lastMessageObj = data.find(msg => msg.id === char.id)
            return lastMessageObj ? { ...char, lastMessage: lastMessageObj.lastMessage } : char
          })
        )
      } catch (error) {
        console.error("Error fetching last messages:", error)
      }
    }

    async function runTasks(){
      await fetchCharacters()
      await fetchLastMessages()
    }

    runTasks()
  }, [session])

  function handleSelectChat(character) {
    setSelectedChat(character.id)
    onSelectChat(character)
  }

  if (!session) {
    return <div className="p-4 text-center text-white">Please log in to view your chats.</div>
  }

  return (
    <div className="bg-[#212121] text-[#e7e7e7] w-full md:w-1/4 h-[100vh] flex flex-col overflow-hidden bg-opacity-60">
      <div className="p-4 font-semibold text-lg border-b border-gray-700">Characters</div>

      <div className="flex-1 overflow-y-auto">
        {error ? (
          <div className="p-4 text-red-500">{error}</div>
        ) : characters.length > 0 ? (
          characters.map((character) => (
            <div
              key={character.id}
              onClick={() => handleSelectChat(character)}
              className={`flex items-center p-3 cursor-pointer hover:bg-[#2c2c2c] transition-colors ${
                selectedChat === character.id ? 'bg-[#2c2c2c]' : ''
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-[#3a3a3a] flex items-center justify-center text-lg font-semibold mr-3">
                {character.character.picture ? (
                  <img src={character.character.picture} alt={character.character.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <User size={24} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <h3 className="text-sm font-semibold truncate">{character.character.name}</h3>
                  <span className="text-xs text-gray-400">
                    {new Date(character.updatedAt).toLocaleDateString()}
                  </span>
                </div>
                {character.lastMessage ? 
                  <p className="text-xs text-gray-400 truncate">{character?.chatHistory?.length > 0 ? character.chatHistory[character.chatHistory.length - 1] : null}</p>
                  :
                  <p className='opacity-50 text-sm'></p>
                }
              </div>
            </div>
          ))
        ) : (
          <div className="p-4 text-center">No characters added yet. Explore and add some!</div>
        )}
      </div>
    </div>
  )
}