"use client"
import { useState } from "react";
import Navbar from "@/components/Nav/Navbar";
import Card from "@/components/Card";
import ChatList from "@/components/Chats/ChatList";
import ChatWindow from "@/components/Chats/ChatWindow";
import PricingPage from "@/components/Pricing/PricingPage";
import { PricingCard } from "@/components/Pricing/PricingCard";
import { useSession } from "next-auth/react";
import PersonalCharacters from "@/components/PersonalCharacters";

export default function Home() {
  const { data: session, status } = useSession()
  const [selectedChat, setSelectedChat] = useState(null)
  const [navItem, setNavItem] = useState("Home")
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = ["Home", "Chats", "Pricing"]
  const cards = [
    { title: 'Card 1', description: 'Description for card 1' },
    { title: 'Card 2', description: 'Description for card 2' },
  ];
  const chats = [
    { name: 'Chat 1', lastMessage: 'Hey there!' },
    { name: 'Chat 2', lastMessage: 'How are you?' },
  ];
  const contentClasses = isOpen ? "ml-64 w-[calc(100%-64px)] transition-all" : "ml-16 w-[calc(100%-64px)] transition-all";

  if (navItem === "Home") {
    return (
      <>
        <Navbar isOpen={isOpen} setIsOpen={setIsOpen} navItem={navItem} setNavItem={setNavItem} navLinks={navLinks} />
        <div className={`${contentClasses}`}>
          <PersonalCharacters />
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
            <ChatList chats={chats} onSelectChat={setSelectedChat} />
            <ChatWindow selectedChat={selectedChat} />
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
}