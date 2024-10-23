"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useNav } from "@/lib/NavContext";
import PersonalCharacters from "@/components/Home/PersonalCharacters";
import Explore from "@/components/Home/Explore";
import DisclaimerPopup from "@/components/Home/DisclaimerPopup";
import StorePage from "@/components/Store/StorePage";
import Profile from "@/components/Profile/Profile";

export default function Home() {
  const { data: session, status } = useSession();
  const { navItem, isOpen } = useNav();

  const contentClasses = `transition-all duration-300 ${
    isOpen ? 'md:ml-64 md:w-[calc(100%-256px)]' : 'md:ml-16 md:w-[calc(100%-64px)]'
  }`;

  return (
    <>
      <DisclaimerPopup />
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
      </div>
    </>
  );
}