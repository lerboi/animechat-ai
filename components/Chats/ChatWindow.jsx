"use client"
import { useState, useRef, useEffect } from 'react'
import { Send, Paperclip, Mic } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { BsThreeDotsVertical } from "react-icons/bs";
import { RxCross2 } from "react-icons/rx";

const mockMessages = [
  { id: 1, sender: 'Alice', content: 'hey', timestamp: '9:30 PM', isUser: false },
  { id: 2, sender: 'You', content: 'what are you doing?', timestamp: '9:31 PM', isUser: true },
]

export default function ChatWindow({ selectedChat, onMessageSent }) {
  const [messages, setMessages] = useState(mockMessages)
  const [newMessage, setNewMessage] = useState('')
  const messagesEndRef = useRef(null)
  const { data: session } = useSession()
  const [showPopup, setShowPopup] = useState(false);
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [lastActive, setLastActive] = useState(new Date());
  const [status, setStatus] = useState('online');

  const togglePopup = () => setShowPopup(!showPopup);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }
  
  useEffect(() => {
    async function fetchChatHistory() {
      if (selectedChat && session) {
        try {
          const response = await fetch(`/api/fetchChatHistoryAPI?characterId=${selectedChat.characterId}&userId=${session.user.id}`);
          if (!response.ok) {
            throw new Error('Failed to fetch chat history');
          }
          const data = await response.json();
          const formattedMessages = data.chatHistory.map((message, index) => {
            const [sender, ...contentParts] = message.split(':', 2); // Split at the first colon only
            const content = contentParts.join(':').trim();
            return {
              id: index,
              sender: sender === 'User' ? 'You' : sender,
              content: content.replace(/^"|"$/g, ''), // Remove surrounding quotes
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              isUser: sender === 'User'
            };
          });
          setMessages(formattedMessages);
          if (formattedMessages.length > 0) {
            const lastMessage = formattedMessages[formattedMessages.length - 1];
            setLastActive(new Date(lastMessage.timestamp));
          }
        } catch (error) {
          console.error('Error fetching chat history:', error);
        }
      }
    }

    fetchChatHistory();
  }, [selectedChat, session])

  useEffect(scrollToBottom, [messages, isTyping])

  useEffect(() => {
    const timer = setInterval(() => {
      if (new Date() - lastActive > 60000) { // 1 minute
        setStatus(`last seen at ${lastActive.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
      } else {
        setStatus('online');
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(timer);
  }, [lastActive]);

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
      setLastActive(new Date());
      setStatus('online');

      // Update chat history with user message
      await addChatHistory(userMessage)

      // Notify parent component about the new message
      onMessageSent(userMessage);

      // Show typing indicator
      setIsTyping(true);

      // Get AI response
      const aiResponse = await getAiResponse([...messages, userMessage])
      
      if (aiResponse) {
        // Remove typing indicator
        setIsTyping(false);

        // Add AI message to the state
        const aiMessage = {
          id: messages.length + 2,
          sender: selectedChat.character.name,
          content: aiResponse,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isUser: false 
        }
        
        setMessages(prevMessages => [...prevMessages, aiMessage])
        setLastActive(new Date());

        // Update chat history with AI message
        await addChatHistory(aiMessage)

        // Notify parent component about the new message
        onMessageSent(aiMessage);
      }
    }
  }

  async function addChatHistory(message) {
    try {
      const response = await fetch("/api/addChatHistoryAPI", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          characterId: selectedChat.characterId,
          message
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
          characterId: selectedChat.characterId,
          userId: session.user.id
        })
      })
      if (response.ok){
        const reply = await response.json()
        console.log("AI response: " + reply.results[0].text)
        return reply.results[0].text
      } 
      else {
        const reply = await response.json()
        console.log("AI response not successful, Error: \n", reply.error)
        return null
      }
    } catch (error) {
      console.error("Error getting AI response:", error)
      return null
    }
  }

  async function resetChat(){
    try {
      const response = await fetch("/api/resetChatAPI", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          characterId: selectedChat.characterId,
          userId: session.user.id
        })
      });

      if (!response.ok) {
        throw new Error("Failed to reset chat");
      }

      // Clear the messages in the UI
      setMessages([]);
      setShowResetConfirmation(false);

      // Delete the genkey
      await deleteGenkey();
    } catch (error) {
      console.error("Error resetting chat:", error);
    }
  }

  async function deleteGenkey() {
    try {
      const response = await fetch("/api/deleteGenkeyAPI", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          characterId: selectedChat.characterId,
          userId: session.user.id
        })
      });

      if (!response.ok) {
        throw new Error("Failed to delete genkey");
      }
    } catch (error) {
      console.error("Error deleting genkey:", error);
    }
  }

  function formatMessageContent(content) {
    // Use a regular expression to find text wrapped in *
    const formattedContent = content.split('*').map((part, index) => {
      // If the index is odd, it means it's wrapped in * and should be italicized
      if (index % 2 === 1) {
        return <span key={index} className="italic text-slate-400">{part}</span>;
      }
      // Return the plain text part
      return part;
    });
  
    return <>{formattedContent}</>; // Return as a fragment
  }

  if (!selectedChat) 
    return (
    <p className="text-[#e7e7e7] p-4">Select a chat to start messaging, or add more chats</p>
  )

  return (
    <>
    <div className="w-full md:w-3/4 h-screen flex flex-col bg-[#17212b] bg-opacity-40 text-[#e7e7e7]">

      {/* Name Section */}
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-[#3a3a3a] flex items-center justify-center text-lg font-semibold mr-3">
            {<img className="w-10 h-10 rounded-full object-cover" src={selectedChat.character.picture}/> || selectedChat.name[0]}
          </div>
          <div>
            <h2 className="font-semibold">{selectedChat.character.name}</h2>
            <p className="text-sm text-gray-400">{status}</p>
          </div>
        </div>
        <div className="relative">
          <button
            onClick={togglePopup}
            className="p-2 rounded-full hover:bg-gray-700 transition-colors duration-200"
          >
            <BsThreeDotsVertical size={20} />
          </button>
          {showPopup && (
            <div className="absolute right-0 mt-2 w-48 bg-[#242f3d] rounded-md shadow-lg z-20">
              <div className="py-1">
                <button onClick={() => setShowResetConfirmation(true)} className="flex items-center w-full px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 hover:rounded">
                  <RxCross2 className="mr-2" />
                  Reset Chat
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chat Section */}
      <div 
        className="flex-1 overflow-y-auto h-full p-4 relative bg-cover bg-center bg-no-repeat scrollbar-hide"
        style={{
          backgroundImage: `url(${selectedChat.character.picture})`,
          backgroundPositionY: "50%",
        }}
      >
        <div className="relative z-10">
          {messages.map((message) => (
            <div key={message.id} className={`mb-4 flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] rounded-lg p-3 ${message.isUser ? 'bg-[#2b5278]' : 'bg-[#182533]'}`}>
                {!message.isUser && <p className="text-sm font-semibold mb-1">{message.sender}</p>}
                <p>{formatMessageContent(message.content)}</p>
                <p className="text-xs text-gray-400 mt-1">{message.timestamp}</p>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="mb-4 flex justify-start">
              <div className="max-w-[70%] rounded-lg p-3 bg-[#182533]">
                <div className="typing-indicator">
                  <span className="dot"></span>
                  <span className="dot"></span>
                  <span className="dot"></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
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

    {/* Reset Confirmation Popup */}
    {showResetConfirmation && (
      <div className="fixed z-[20] inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-[#242f3d] p-6 rounded-lg">
          <p className="text-white mb-4">Are you sure you want to Reset the chat? This action cannot be undone.</p>
          <div className="flex justify-end">
            <button
              onClick={() => {resetChat(); setShowPopup(false)}}
              className="bg-red-500 text-white px-4 py-2 rounded mr-2 hover:bg-red-600"
            >
              Yes, I want to delete this chat
            </button>
            <button
              onClick={() => {setShowResetConfirmation(false); setShowPopup(false);}}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  )
}