"use client"
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Navbar from "@/components/Nav/Navbar";
import ChatList from "@/components/Chats/ChatList";
import ChatWindow from "@/components/Chats/ChatWindow";
import PersonalCharacters from "@/components/Home/PersonalCharacters";
import Explore from "@/components/Home/Explore";
import DisclaimerPopup from "@/components/Home/DisclaimerPopup";
import StorePage from "@/components/Store/StorePage";

export default function Home() {
  const { data: session, status } = useSession()
  const [selectedChat, setSelectedChat] = useState(null)
  const [navItem, setNavItem] = useState("Home")
  const [isOpen, setIsOpen] = useState(false);
  const [characters, setCharacters] = useState([]);
  const [isMobile, setIsMobile] = useState(true);

  const navLinks = ["Home", "Chats", "Store", "Help"]

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768); // 768px is the 'md' breakpoint in Tailwind
      if (window.innerWidth >= 768) {
        setIsOpen(false); // Ensure navbar is collapsed by default on larger screens
      }
    };

    handleResize(); // Check on initial render
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchCharacters();
  }, [session]);

  async function fetchCharacters() {
    if (!session) return;

    try {
      const response = await fetch("/api/getChatsAPI");
      if (!response.ok) {
        throw new Error("Failed to fetch characters");
      }
      const data = await response.json();
      setCharacters(data);
    } catch (error) {
      console.error("Error fetching characters:", error);
    }
  }

  const handleMessageSent = (newMessage) => {
    setCharacters(prevCharacters =>
      prevCharacters?.map(char =>
        char.id === selectedChat.id
          ? { ...char, lastMessage: newMessage.content }
          : char
      )
    );
  };

  const contentClasses = `transition-all duration-300 ${isMobile
    ? 'ml-0 w-full'
    : isOpen
      ? 'md:ml-64 md:w-[calc(100%-256px)]'
      : 'md:ml-16 md:w-[calc(100%-64px)]'
    }`;

  return (
    <>
      <DisclaimerPopup />
      <Navbar isOpen={isOpen} setIsOpen={setIsOpen} navItem={navItem} setNavItem={setNavItem} navLinks={navLinks} />
      <div className={contentClasses}>
        {navItem === "Home" && (
          <>
            <div className="mb-10">
              <PersonalCharacters isOpen={isOpen} />
            </div>
            <div>
              <Explore />
              {session ? <h1 className="text-white">Logged in</h1> : <h1 className="text-white">Not logged in</h1>}
            </div>
          </>
        )}
        {navItem === "Chats" && (
          <div className="flex right-0">
            <ChatList
              chats={characters}
              onSelectChat={setSelectedChat}
            />
            <ChatWindow
              selectedChat={selectedChat}
              onMessageSent={handleMessageSent}
            />
          </div>
        )}
        {navItem === "Store" && <StorePage />}
        {navItem === "Help" && <h1>Help</h1>}
      </div>
    </>
  );
}