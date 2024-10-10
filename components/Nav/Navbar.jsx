"use client"
import { useSession, signOut } from "next-auth/react";
import { MdKeyboardDoubleArrowRight, MdKeyboardDoubleArrowLeft } from "react-icons/md";
import { AiOutlineHome, AiFillHome } from "react-icons/ai";
import { HiOutlineChatBubbleLeftRight, HiChatBubbleLeftRight } from "react-icons/hi2";
import { HiOutlineCurrencyDollar, HiMiniCurrencyDollar } from "react-icons/hi2";
import { HiOutlineQuestionMarkCircle, HiQuestionMarkCircle } from "react-icons/hi2"; 
import { SlLogout } from "react-icons/sl";

import LoginPopup from "./LoginPopup";
import { useState } from "react";

export default function Navbar({ isOpen, setIsOpen, navItem, setNavItem, navLinks }) {
    const { data: session, status } = useSession();
    const [showLoginPopup, setShowLoginPopup] = useState(false);
    const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);

    const handleLogout = () => {
        setShowLogoutConfirmation(true);
    };

    const confirmLogout = () => {
        signOut();
        setShowLogoutConfirmation(false);
    };

    return (
        <nav className={`fixed flex flex-col justify-between text-md top-0 left-0 h-full bg-[#1f1e1e] max-w-64 ${isOpen ? 'w-[60%] p-5' : 'w-16'} transition-all`}>
            <div className={`${isOpen ? "" : "mt-10 m-1"}`}>
                <button className="text-[#e7e7e7] text-3xl p-2" onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? (
                        <MdKeyboardDoubleArrowLeft className="absolute right-5 top-5" />
                    ) : (
                        <MdKeyboardDoubleArrowRight className="absolute right-5 top-5" />
                    )}
                </button>
                {isOpen && (
                    <div>
                        <h1 className="text-2xl py-4 text-white font-bold">anione.ai</h1>
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
                                    navItem === 'Home' ? <AiFillHome size={24} /> : <AiOutlineHome size={24} className={`transition-all duration-300 ${navItem === 'Home' ? 'text-white' : ''}`} />
                            : link === 'Chats' ? (
                                isOpen ? 
                                    navItem === 'Chats' ? <HiChatBubbleLeftRight size={24} /> : <HiOutlineChatBubbleLeftRight size={24} />
                                : 
                                    navItem === 'Chats' ? <HiChatBubbleLeftRight size={24} className="text-white" /> : <HiOutlineChatBubbleLeftRight size={24} className={`transition-all duration-300 ${navItem === 'Chats' ? 'text-white' : ''}`} />
                            ) : link === 'Pricing' ? (
                                isOpen ? 
                                    navItem === 'Pricing' ? <HiMiniCurrencyDollar size={24} /> : <HiOutlineCurrencyDollar size={24} />
                                : 
                                    navItem === 'Pricing' ? <HiMiniCurrencyDollar size={24} /> : <HiOutlineCurrencyDollar size={24} className={`transition-all duration-300 ${navItem === 'Pricing' ? 'text-white' : ''}`} />
                            ) : link === 'Help' ? (
                                isOpen ? 
                                    navItem === 'Help' ? <HiQuestionMarkCircle size={24} /> : <HiOutlineQuestionMarkCircle size={24} />
                                : 
                                    navItem === 'Help' ? <HiQuestionMarkCircle size={24} className="text-white" /> : <HiOutlineQuestionMarkCircle size={24} className={`transition-all duration-300 ${navItem === 'Help' ? 'text-white' : ''}`} />
                            ) : null}
                            {isOpen && link}
                        </div>
                    ))}
                </div>
            </div>

            <div className="relative items-end z-[999]">
                {session ? (
                    <div className={`text-slate-200 items-center gap-3 hover:cursor-pointer mt-4 flex p-4 rounded-xl hover:bg-slate-400 hover:bg-opacity-30 hover:text-white ${!isOpen ? 'justify-center' : ''}`} onClick={handleLogout}>
                        <SlLogout size={24} />
                        {isOpen && "Logout"}
                    </div>
                ) : (
                    <LoginPopup isOpen={isOpen} />
                )}
            </div>

            {showLogoutConfirmation && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]">
                    <div className="bg-white rounded-lg p-6 max-w-sm w-full">
                        <h2 className="text-xl font-bold mb-4">Confirm Logout</h2>
                        <p className="mb-6">Are you sure you want to sign out?</p>
                        <div className="flex justify-end space-x-4">
                            <button 
                                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                                onClick={() => setShowLogoutConfirmation(false)}
                            >
                                Cancel
                            </button>
                            <button 
                                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                                onClick={confirmLogout}
                            >
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    )
}