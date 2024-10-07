"use client"
import { useSession } from "next-auth/react";
import { MdKeyboardDoubleArrowRight } from "react-icons/md";
import { MdKeyboardDoubleArrowLeft } from "react-icons/md";
import { AiOutlineHome } from "react-icons/ai";
import { AiFillHome } from "react-icons/ai";
import { HiOutlineChatBubbleLeftRight } from "react-icons/hi2";
import { HiChatBubbleLeftRight } from "react-icons/hi2";
import Link from "next/link";
import LoginPopup from "./LoginPopup";
import { useState } from "react";

export default function Navbar({isOpen, setIsOpen, navItem, setNavItem, navLinks}) {
    const {data: session, status} = useSession()
    const [showLoginPopup, setShowLoginPopup] = useState(false);

    return (
        <nav className={`fixed flex flex-col justify-between text-md top-0 left-0 h-full bg-[#1f1e1e] max-w-64 ${isOpen ? 'w-[60%] p-5' : 'w-16'} transition-all`}>
            
            <div className={`${isOpen? "" : "mt-10 m-1" }`}>
                <button className="text-[#e7e7e7] text-3xl p-2" onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? (
                        <MdKeyboardDoubleArrowLeft className="absolute right-5 top-5"/>
                    ) : (
                        <MdKeyboardDoubleArrowRight className="absolute right-5 top-5"/>
                    )}
                </button> 
                {isOpen && (
                    <div>
                        <h1 className="text-2xl py-4 text-white font-bold">Animechat.ai</h1>
                    </div>
                )}
                <div className="mt-4 w-full">
                    {navLinks && navLinks.map(link => (
                        <div key={link} onClick={() => setNavItem(link)} 
                            className={`text-slate-200 items-center gap-3 hover:cursor-pointer mt-4 flex p-4 rounded-xl hover:bg-slate-400 hover:bg-opacity-30 hover:text-white 
                                ${navItem === link ? 'bg-slate-400 bg-opacity-30' : ''}
                                ${!isOpen ? 'justify-center' : ''}`}>
                            {link === 'Home' ? 
                                isOpen ? 
                                    navItem === 'Home' ? <AiFillHome size={24} /> : <AiOutlineHome size={24} />
                                : 
                                    <AiOutlineHome size={24} className={`transition-all duration-300 ${navItem === 'Home' ? 'text-white' : ''}`} />
                                
                                : link === 'Chats' ? (
                                isOpen ? 
                                    navItem === 'Chats' ? <HiChatBubbleLeftRight size={24} /> : <HiOutlineChatBubbleLeftRight size={24} />
                                : 
                                    <HiOutlineChatBubbleLeftRight size={24} className={`transition-all duration-300 ${navItem === 'Chats' ? 'text-white' : ''}`} />
                                
                            ) : null}
                            {isOpen && link}
                        </div>
                    ))}
                </div>
            </div>
            
            <div className="relative items-end z-[999]">
                <LoginPopup isOpen={isOpen}/>
            </div>
        </nav>
  )
}