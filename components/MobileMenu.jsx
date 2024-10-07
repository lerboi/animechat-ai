"use client"
import { useState } from "react/cjs/react.production.min";

const MobileMenu = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <button className="fixed top-4 left-4 text-[#e7e7e7]" onClick={() => setMenuOpen(!menuOpen)}>
        {menuOpen ? 'Close' : 'Menu'}
      </button>
      {menuOpen && (
        <div className="fixed top-0 left-0 w-2/3 h-full bg-[#1f1e1e] z-50">
          <ul className="p-4">
            <li className="mb-4 text-[#e7e7e7]">Chats</li>
          </ul>
        </div>
      )}
    </>
  );
};

export default MobileMenu;
