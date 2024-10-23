"use client";
import { useState, useEffect } from "react";
import { useNav } from "@/lib/NavContext";
import ChatList from "@/components/Chats/ChatList";
import ChatWindow from "@/components/Chats/ChatWindow";

export default function ChatsPage() {
  const { isOpen } = useNav();
  const [selectedChat, setSelectedChat] = useState(null);
  const [showChatWindow, setShowChatWindow] = useState(false);
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
    if (isMobile) {
      setShowChatWindow(true);
    }
  };

  const handleBackClick = () => {
    setShowChatWindow(false);
  };

  const contentClasses = `transition-all duration-300 ${
    isMobile
      ? 'ml-0 w-full'
      : isOpen
        ? 'md:ml-64 md:w-[calc(100%-256px)]'
        : 'md:ml-16 md:w-[calc(100%-64px)]'
  }`;

  return (
    <div className={contentClasses}>
      <div className="flex right-0">
        {(!isMobile || !showChatWindow) && (
          <ChatList
            chats={[]}
            onSelectChat={handleSelectChat}
            isMobile={isMobile}
          />
        )}
        {(!isMobile || showChatWindow) && (
          <ChatWindow
            selectedChat={selectedChat}
            onMessageSent={(newMessage) => {}}
            onBackClick={handleBackClick}
            isMobile={isMobile}
          />
        )}
      </div>
    </div>
  );
}