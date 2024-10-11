import { useState } from "react";
import { Button } from "@/components/ui/button";


export default function CharacterCard ({ title, imageUrl, isMiddle, isOpen }) {
    const [isHovered, setIsHovered] = useState(false);
  
    return (
      <div 
        className="relative w-64 h-96 rounded-lg overflow-hidden cursor-pointer transition-all duration-300"
        onMouseEnter={() => isMiddle && setIsHovered(true)}
        onMouseLeave={() => isMiddle && setIsHovered(false)}
      >
        <img src={imageUrl} alt={title} className="w-full h-full object-cover rounded-xl" />
        {isHovered && isMiddle && !isOpen && (
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-b from-transparent to-black flex flex-col items-center justify-end pb-4 transition">
            <h3 className="text-white text-xl font-bold mb-2">{title}</h3>
            <Button variant="secondary">Add</Button>
          </div>
        )}
      </div>
    );
  };