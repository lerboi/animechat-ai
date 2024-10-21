"use client"
import { useState, useEffect } from "react";
import { BsChatDots } from "react-icons/bs";
import { useSession } from "next-auth/react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function CharacterCard({ character }) {
  const [isHovered, setIsHovered] = useState(false);
  const [typedDescription, setTypedDescription] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    if (isHovered) {
      let i = 0;
      const typingInterval = setInterval(() => {
        setTypedDescription(character.description.slice(0, i));
        i++;
        if (i > character.description.length) {
          clearInterval(typingInterval);
        }
      }, 20);

      return () => clearInterval(typingInterval);
    } else {
      setTypedDescription('');
    }
  }, [isHovered, character.description]);

  async function addToChat(character) {
    if (!session) {
      alert("Please log in");
      return;
    }
    setIsDialogOpen(true);
  }

  async function confirmAddToChat() {
    try {
      const response = await fetch("/api/addCharacterToChatAPI", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ characterId: character.id }),
      });

      if (!response.ok) {
        throw new Error("Failed to add character to chat");
      }

      const data = await response.json();
      console.log("Character added to chat:", data);
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error adding character to chat:", error);
      alert("Failed to add character to chat. Please try again.");
    }
  }

  return (
    <>
      <div 
        className={`relative w-64 h-96 sm:scale-85 md:scale-100 lg:scale-100 rounded-lg overflow-hidden shadow-lg m-2 transition-all duration-300 ${
          isHovered ? 'ring-2 ring-white cursor-pointer' : ''
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Image 
          src={`/${character.picture}`} 
          alt={character.name} 
          layout="fill"
          objectFit="cover"
          loading="lazy"
        />
        <div 
          className={`absolute inset-0 bg-black transition-opacity duration-300 ${
            isHovered ? 'opacity-70' : 'opacity-0'
          }`}
        ></div>
        <div 
          className={`absolute inset-x-0 bottom-0 p-4 transition-all duration-300 ${
            isHovered ? 'h-full flex flex-col justify-between' : 'h-1/2 bg-gradient-to-t from-black to-transparent'
          }`}
        >
          <div className="flex-grow">
            <h3 className="text-white text-xl font-bold mb-2">{character.name}</h3>
            <span className="text-gray-300 text-xs block mb-2">{character.engagementMetric} views</span>
            {isHovered ? (
              <p className="text-white text-sm mb-2 overflow-hidden">{typedDescription}</p>
            ) : (
              <p className="text-white text-sm mb-2 line-clamp-2">{character.description}</p>
            )}
          </div>
          {isHovered && (
            <button onClick={() => addToChat(character)} className="bg-white text-black py-2 px-4 rounded-full flex items-center justify-center mt-2">
              <BsChatDots className="mr-2" />
              Chat
            </button>
          )}
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add to Chat</DialogTitle>
            <DialogDescription>
              Add this character to chat?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Back</Button>
            <Button onClick={confirmAddToChat}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}