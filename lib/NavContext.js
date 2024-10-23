"use client";
import { createContext, useContext, useState, useEffect } from "react";

const NavContext = createContext(undefined);

export function NavProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [navItem, setNavItem] = useState("Home");
  const [isMobile, setIsMobile] = useState(true);
  const navLinks = ["Home", "Chats", "Store", "Help"];

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <NavContext.Provider value={{
      isOpen,
      setIsOpen,
      navItem,
      setNavItem,
      navLinks,
      isMobile
    }}>
      {children}
    </NavContext.Provider>
  );
}

export function useNav() {
  const context = useContext(NavContext);
  if (context === undefined) {
    throw new Error('useNav must be used within a NavProvider');
  }
  return context;
}