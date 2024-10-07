"use client"
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Card from "@/components/Card";
import ChatList from "@/components/ChatList";
import ChatWindow from "@/components/ChatWindow";

export default function Home() {
  const [selectedChat, setSelectedChat] = useState(null)
  const [navItem, setNavItem] = useState("Home")
  const [isOpen, setIsOpen] = useState(false);
  const navLinks = ["Home", "Chats"]
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
          <div className="">
            {cards && cards.map(card => {
              <Card card={card} />
            })}
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
            <ChatList chats={chats} onSelectChat={setSelectedChat} />
            <ChatWindow selectedChat={selectedChat} />
          </div>
        </div>
      </>

    );
  }
}