"use client"

import { useState, useRef, useEffect } from 'react'
import { Send, Paperclip, Mic } from 'lucide-react'
import { useSession } from 'next-auth/react'

const mockMessages = [
  { id: 1, sender: 'Alice', content: 'hey', timestamp: '9:30 PM', isUser: false },
  { id: 2, sender: 'You', content: 'what are you doing?', timestamp: '9:31 PM', isUser: true },
]

export default function ChatWindow({ selectedChat }) {
  console.log("Selected Chat ID = " + JSON.stringify(selectedChat)||"none")
  const [messages, setMessages] = useState(mockMessages)
  const [newMessage, setNewMessage] = useState('')
  const messagesEndRef = useRef(null)
  const { data: session } = useSession()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(scrollToBottom, [messages])

  async function handleSendMessage(e) {
    e.preventDefault()
    if (newMessage.trim()) {
      const userMessage = {
        id: messages.length + 1,
        sender: 'You',
        content: newMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isUser: true
      }
      
      // Add user message to the state
      setMessages(prevMessages => [...prevMessages, userMessage])
      setNewMessage('')

      // Get AI response
      const aiResponse = await getAiResponse([...messages, userMessage])
      
      if (aiResponse) {
        // Add AI message to the state
        const aiMessage = {
          id: messages.length + 2,
          sender: selectedChat.name,
          content: aiResponse,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isUser: false 
        }
        
        setMessages(prevMessages => [...prevMessages, aiMessage])

        // Update chat history
        await addChatHistory(userMessage, aiMessage)
      }
    }
  }

  async function addChatHistory(userMessage, aiMessage) {
    try {
      const response = await fetch("/api/addChatHistoryAPI", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          characterId: selectedChat.id,
          userMessage,
          aiMessage
        })
      })
      if (!response.ok) {
        throw new Error("Failed to update chat history")
      }
    } catch (error) {
      console.error("Error updating chat history:", error)
    }
  }

  async function getAiResponse(messages){
    if (!session || !session.user) {
      console.error("User not authenticated");
      return null;
    }

    try {
      const response = await fetch("/api/getAiResponseAPI", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messages: messages,
          characterId: selectedChat.character.id,
          userId: session.user.id
        })
      })
      if (response.ok){
        const reply = await response.json()
        console.log("AI response: " + reply.results[0].text)
        return reply.results[0].text
      } else {
        console.log("AI response not successful")
        return null
      }
    } catch (error) {
      console.error("Error getting AI response:", error)
      return null
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
          {<img className="w-10 h-10 rounded-full object-cover" src={selectedChat.character.picture}/> || selectedChat.name[0]}
        </div>
        <div>
          <h2 className="font-semibold">{selectedChat.character.name}</h2>
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