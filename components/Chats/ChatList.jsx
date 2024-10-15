import React, { useState, useEffect } from 'react'
import { User, Users, Check } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { LuPencilLine } from "react-icons/lu";

export default function ChatList({ onSelectChat }) {
  const [selectedChat, setSelectedChat] = useState(null)
  const [characters, setCharacters] = useState([])
  const [error, setError] = useState(null)
  const { data: session } = useSession()
  const [isEditing, setIsEditing] = useState(false)
  const [selectedChats, setSelectedChats] = useState([])

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

  function toggleChatSelection(characterId, event) {
    event.stopPropagation()
    setSelectedChats(prevSelected => 
      prevSelected.includes(characterId)
        ? prevSelected.filter(id => id !== characterId)
        : [...prevSelected, characterId]
    )
  }

  async function deleteSelectedChats() {
    if (selectedChats.length === 0) return;

    const confirmDelete = window.confirm("Are you sure you want to delete these chats?");
    if (!confirmDelete) return;

    try {
      const response = await fetch("/api/deleteChatsAPI", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ chatIds: selectedChats })
      });

      if (!response.ok) {
        throw new Error("Failed to delete chats");
      }

      // Remove deleted chats from the state
      setCharacters(prevCharacters => 
        prevCharacters.filter(char => !selectedChats.includes(char.id))
      );
      setSelectedChats([]);
      setIsEditing(false);
    } catch (error) {
      console.error("Error deleting chats:", error);
      setError("Failed to delete chats");
    }
  }

  if (!session) {
    return <div className="p-4 text-center text-white">Please log in to view your chats.</div>
  }

  return (
    <div className="bg-[#212121] text-[#e7e7e7] w-full md:w-1/4 h-[100vh] flex flex-col overflow-hidden bg-opacity-60">
      <div className="p-4 font-semibold text-lg border-b border-gray-700 flex justify-between items-center">
        <span>Characters</span>
        <button onClick={() => setIsEditing(!isEditing)} className="flex items-center text-slate-300 text-sm hover:bg-[#2c2c2c] p-1 rounded">
          <LuPencilLine className="mr-1" />
          {isEditing ? "Cancel" : "Edit"}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {error ? (
          <div className="p-4 text-red-500">{error}</div>
        ) : characters.length > 0 ? (
          characters.map((character) => (
            <div
              key={character.id}
              onClick={() => isEditing ? toggleChatSelection(character.id, event) : handleSelectChat(character)}
              className={`flex items-center p-3 cursor-pointer hover:bg-[#2c2c2c] transition-colors ${
                selectedChat === character.id ? 'bg-[#2c2c2c]' : ''
              }`}
            >
              {isEditing && (
                <div 
                  className={`w-5 h-5 mr-3 rounded border border-primary flex items-center justify-center transition-colors ${
                    selectedChats.includes(character.id) ? 'bg-red-500' : 'bg-background'
                  }`}
                  onClick={(e) => toggleChatSelection(character.id, e)}
                >
                  {selectedChats.includes(character.id) && <Check size={14} className="text-primary-foreground" />}
                </div>
              )}
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

      {isEditing && (
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={deleteSelectedChats}
            disabled={selectedChats.length === 0}
            className={`w-full py-2 px-4 rounded transition-colors ${
              selectedChats.length > 0
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-gray-500 text-gray-300 cursor-not-allowed'
            }`}
          >
            Delete Selected
          </button>
        </div>
      )}
    </div>
  )
}