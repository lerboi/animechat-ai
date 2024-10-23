"use client";
import { useState, useEffect } from "react";
import { useNav } from "@/lib/NavContext";

export default function Help() {
  const { isOpen } = useNav();
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const contentClasses = `transition-all duration-300 ${
    isMobile
      ? 'ml-0 w-full'
      : isOpen
        ? 'md:ml-64 md:w-[calc(100%-256px)]'
        : 'md:ml-16 md:w-[calc(100%-64px)]'
  }`;

  return (
    <div className={contentClasses}>
      <h1>Help Page</h1>
      {/* Add your Help page content here */}
    </div>
  );
}