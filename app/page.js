"use client"
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Navbar from "@/components/Nav/Navbar";
import ChatList from "@/components/Chats/ChatList";
import ChatWindow from "@/components/Chats/ChatWindow";
import PricingPage from "@/components/Pricing/PricingPage";
import PersonalCharacters from "@/components/Home/PersonalCharacters";
import Explore from "@/components/Home/Explore";

export default function Home() {
  const { data: session, status } = useSession()
  const [selectedChat, setSelectedChat] = useState(null)
  const [navItem, setNavItem] = useState("Home")
  const [isOpen, setIsOpen] = useState(false);
  const [characters, setCharacters] = useState([]);

  const navLinks = ["Home", "Chats", "Pricing", "Help"]
  const contentClasses = isOpen ? "ml-64 w-[calc(100%-64px)] transition-all" : "ml-16 w-[calc(100%-64px)] transition-all";

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

  if (navItem === "Home") {
    return (
      <>
        <Navbar isOpen={isOpen} setIsOpen={setIsOpen} navItem={navItem} setNavItem={setNavItem} navLinks={navLinks} />
        <div className={`${contentClasses}`}>
          <div className="mb-10">
            <PersonalCharacters isOpen={isOpen} />
          </div>
          <div>
            <Explore />
            {session ? <h1 className="text-white">Logged in</h1> : <h1 className="text-white">Not logged in</h1>}
          </div>
        </div>
      </>
    )
  }

  if (navItem === "Chats") {
    return (
      <>
        <Navbar isOpen={isOpen} setIsOpen={setIsOpen} navItem={navItem} setNavItem={setNavItem} navLinks={navLinks} />
        <div className={`${contentClasses}`}>
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
        </div>
      </>
    );
  }

  if (navItem === "Pricing") {
    return (
      <>
        <Navbar isOpen={isOpen} setIsOpen={setIsOpen} navItem={navItem} setNavItem={setNavItem} navLinks={navLinks} />
        <div className={`${contentClasses}`}>
          <PricingPage />
        </div>
      </>
    );
  }

  if (navItem === "Help") {
    return (
      <>
        <Navbar isOpen={isOpen} setIsOpen={setIsOpen} navItem={navItem} setNavItem={setNavItem} navLinks={navLinks} />
        <div className={`${contentClasses}`}>
          <h1>Help</h1>
        </div>
      </>
    );
  }
}