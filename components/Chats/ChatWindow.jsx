"use client"

import { useState, useRef, useEffect } from 'react'
import { Send, Paperclip, Mic } from 'lucide-react'

const mockMessages = [
  { id: 1, sender: 'Alice', content: 'Hey there! Hows it going?', timestamp: '9:30 PM', isUser: false },
  { id: 2, sender: 'You', content: 'Hi Alice! Im doing well, thanks for asking. How about you?', timestamp: '9:31 PM', isUser: true },
  { id: 3, sender: 'Alice', content: 'Im great! Just finished a really interesting book. Have you read anything good lately?', timestamp: '9:33 PM', isUser: false },
  { id: 4, sender: 'You', content: 'Actually, yes! I just finished "The Midnight Library" by Matt Haig. It was fantastic!', timestamp: '9:35 PM', isUser: true },
  { id: 5, sender: 'Alice', content: 'Oh, Ive heard good things about that one! What did you like about it?', timestamp: '9:36 PM', isUser: false },
  { id: 6, sender: 'You', content: 'I loved the concept of exploring different life paths. It really makes you think about the choices we make and their impact.', timestamp: '9:38 PM', isUser: true },
  { id: 7, sender: 'Alice', content: 'That sounds really thought-provoking. Ill have to add it to my reading list!', timestamp: '9:40 PM', isUser: false },
  { id: 8, sender: 'You', content: 'Definitely do! Let me know what you think when you read it.', timestamp: '9:41 PM', isUser: true },
  { id: 9, sender: 'Alice', content: 'Will do! Thanks for the recommendation.', timestamp: '9:42 PM', isUser: false },
]

export default function ChatWindow({ selectedChat }) {
  const [messages, setMessages] = useState(mockMessages)
  const [newMessage, setNewMessage] = useState('')
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(scrollToBottom, [messages])

  async function handleSendMessage(e) {
    e.preventDefault()
    //HANDLE USER MESSAGE
    if (newMessage.trim()) {
      const message = {
        id: messages.length + 1,
        sender: 'You',
        content: newMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isUser: true
      }
      setMessages([...messages, message])
      setNewMessage('')
    }
    getAiResponse(messages)
  }

  //FUNCTION TO GET AI MESSAGE
  async function getAiResponse(messages){
    const response = await fetch("/api/getAiResponse", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messages: messages
      })
    })
    if (response.ok){
      console.log("Pending")
    }
    else{
      console.log("Not pending")
    }
  }

  if (!selectedChat) 
    return (
    <p className="text-[#e7e7e7] p-4">Select a chat to start messaging, or add more chats</p>
  )

  return (
    <>
    <div className="w-full md:w-3/4 h-screen flex flex-col bg-[#17212b] bg-opacity-40 text-[#e7e7e7]">

      {/* Name Section */}
      <div className="p-4 border-b border-gray-700 flex items-center">
        <div className="w-10 h-10 rounded-full bg-[#3a3a3a] flex items-center justify-center text-lg font-semibold mr-3">
          {selectedChat.avatar || selectedChat.name[0]}
        </div>
        <div>
          <h2 className="font-semibold">{selectedChat.name}</h2>
          <p className="text-sm text-gray-400">online</p>
        </div>
      </div>

      {/* Chat Section */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message) => (
          <div key={message.id} className={`mb-4 flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[70%] rounded-lg p-3 ${message.isUser ? 'bg-[#2b5278]' : 'bg-[#182533]'}`}>
              {!message.isUser && <p className="text-sm font-semibold mb-1">{message.sender}</p>}
              <p>{message.content}</p>
              <p className="text-xs text-gray-400 mt-1">{message.timestamp}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Send User Input Section */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-700 flex items-center">
        <button type="button" className="text-gray-400 hover:text-white mr-2">
          <Paperclip size={20} />
        </button>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Write a message..."
          className="flex-1 bg-[#242f3d] text-white rounded-full py-2 px-4 focus:outline-none"
        />
        <button type="button" className="text-gray-400 hover:text-white mx-2">
          <Mic size={20} />
        </button>
        <button type="submit" className="bg-[#2b5278] text-white rounded-full p-2 hover:bg-[#3a6a9a]">
          <Send size={20} />
        </button>
      </form>

    </div>
    </>
  )
}