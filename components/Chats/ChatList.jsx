import { useState } from 'react'
import { User, Users, Hash, Volume2 } from 'lucide-react'

const mockChats = [
  { id: 1, name: "Anime Fans Club", lastMessage: "Naruto: I'm going to be the Hokage!", time: "9:36 PM", unread: 7, isGroup: true, avatar: "AF" },
  { id: 2, name: "Sarah Connor", lastMessage: "The future's not set. There's no fate but what we make for ourselves.", time: "9:40 PM", unread: 5 },
  { id: 3, name: "Sci-Fi Book Club", lastMessage: "Alice: Just finished 'Dune', it's amazing!", time: "8:18 PM", unread: 27, isGroup: true, avatar: "SF" }
]

export default function ChatList({ onSelectChat }) {
  const [selectedChat, setSelectedChat] = useState(null)

  function handleSelectChat(chat) {
    setSelectedChat(chat.id)
    onSelectChat(chat)
  }

  return (
    <div className="bg-[#212121] text-[#e7e7e7] w-full md:w-1/4 h-[100vh] flex flex-col overflow-hidden bg-opacity-60">

      {/* Top Chat label Section */}
      <div className="p-4 font-semibold text-lg border-b border-gray-700">Chats</div>

      {/* Chat List Section */}
      <div className="flex-1 overflow-y-auto">
        {mockChats.map((chat) => (
          <div
            key={chat.id}
            onClick={() => handleSelectChat(chat)}
            className={`flex items-center p-3 cursor-pointer hover:bg-[#2c2c2c] transition-colors ${
              selectedChat === chat.id ? 'bg-[#2c2c2c]' : ''
            }`}
          >
            <div className="w-12 h-12 rounded-full bg-[#3a3a3a] flex items-center justify-center text-lg font-semibold mr-3">
              {chat.avatar ? (
                chat.avatar
              ) : chat.isGroup ? (
                <Users size={24} />
              ) : (
                <User size={24} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline">
                <h3 className="text-sm font-semibold truncate">{chat.name}</h3>
                <span className="text-xs text-gray-400 ml-2 whitespace-nowrap">{chat.time}</span>
              </div>
              <p className="text-sm text-gray-400 truncate">
                {chat.isGroup && (
                  <span className="inline-block mr-1">
                    {chat.lastMessage.split(':')[0]}:
                  </span>
                )}
                {chat.lastMessage.split(':').slice(1).join(':')}
              </p>
            </div>
            {chat.unread > 0 && (
              <div className="ml-2 bg-[#8774e1] rounded-full w-5 h-5 flex items-center justify-center text-xs">
                {chat.unread}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}