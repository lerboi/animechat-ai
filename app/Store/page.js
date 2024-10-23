"use client";
import { useState, useEffect } from "react";
import { useNav } from "@/lib/NavContext";
import StorePage from "@/components/Store/StorePage";

export default function Store() {
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
      <StorePage />
    </div>
  );
}