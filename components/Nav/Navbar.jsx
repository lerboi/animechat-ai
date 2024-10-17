"use client";
import { useSession, signOut } from "next-auth/react";
import { MdKeyboardDoubleArrowRight, MdKeyboardDoubleArrowLeft, MdGeneratingTokens} from "react-icons/md";
import { AiOutlineHome, AiFillHome } from "react-icons/ai";
import { HiOutlineChatBubbleLeftRight, HiChatBubbleLeftRight } from "react-icons/hi2";
import { HiOutlineCurrencyDollar, HiMiniCurrencyDollar } from "react-icons/hi2";
import { HiOutlineQuestionMarkCircle, HiQuestionMarkCircle } from "react-icons/hi2";
import { SlLogout } from "react-icons/sl";
import { FiAlignLeft } from "react-icons/fi";
import { RiImageCircleFill } from "react-icons/ri";

import LoginPopup from "./LoginPopup";
import { useState, useEffect } from "react";

export default function Navbar({ isOpen, setIsOpen, navItem, setNavItem, navLinks }) {
    const { data: session, status } = useSession();
    const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);
    const [isMobile, setIsMobile] = useState(true);
    const [tokens, setTokens] = useState({ textTokens: 0, imageTokens: 0 });

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        handleResize();
        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize);
    }, []);

    //fetch tokens when session refresh
    useEffect(() => {
        if (session) {
            async function fetchTokens(){
                try {
                    const response = await fetch('/api/fetchTokensAPI', {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json"
                        }
                    });
                    if (response.ok) {
                        const data = await response.json();
                        setTokens(data);
                    }
                } catch (error) {
                    console.error('Error fetching tokens:', error);
                }
            };
            fetchTokens();
        }
    }, [session]);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768); // 768px is the 'md' breakpoint in Tailwind
        };

        handleResize(); // Check on initial render
        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const handleLogout = () => setShowLogoutConfirmation(true);
    const confirmLogout = () => {
        signOut();
        setShowLogoutConfirmation(false);
    };

    // Tooltip Component with Arrow
    const Tooltip = ({ content, children }) => (
        <div className='relative group'>
            {children}
            <span
                className={`absolute left-14 top-1/2 -translate-y-1/2 bg-slate-200 text-black text-sm rounded-md px-2 py-1
                    opacity-0 group-hover:opacity-100 group-hover:visible transition-opacity duration-200 z-50
                    before:absolute before:left-[-12px] before:top-1/2 before:-translate-y-1/2 
                    before:border-8 before:border-transparent before:border-r-slate-200 ${(!isMobile && !isOpen)? 'block' : 'hidden' }`}
            >
                {content}
            </span>
        </div>
    );

    const renderIcon = (link) => {
        switch (link) {
            case "Home":
                return navItem === "Home" ? <AiFillHome size={28} /> : <AiOutlineHome size={28} />;
            case "Chats":
                return navItem === "Chats"
                    ? <HiChatBubbleLeftRight size={28} />
                    : <HiOutlineChatBubbleLeftRight size={28} />;
            case "Pricing":
                return navItem === "Pricing"
                    ? <HiMiniCurrencyDollar size={28} />
                    : <HiOutlineCurrencyDollar size={28} />;
            case "Help":
                return navItem === "Help"
                    ? <HiQuestionMarkCircle size={28} />
                    : <HiOutlineQuestionMarkCircle size={28} />;
            default:
                return null;
        }
    };

    return (
        <>
            {/* Mobile menu icon */}
            <button
                className={`fixed top-4 left-4 text-white z-50 md:hidden ${isOpen ? "hidden" : ""}`}
                onClick={() => setIsOpen(true)}
            >
                <FiAlignLeft size={24} />
            </button>

            {/* Navbar */}
            <nav
                className={`fixed flex flex-col justify-between text-md top-0 left-0 h-full bg-[#1f1e1e]
                    ${isMobile ? (isOpen ? "w-[40%] p-5" : "w-0 p-0") : isOpen ? "w-64 p-5" : "w-16 p-2"}
                    transition-all duration-300 z-40`}
            >
                <div className={`${isOpen || !isMobile ? "" : "mt-10 m-1"}`}>
                    <button
                        className="text-[#e7e7e7] text-3xl p-2 hidden md:block"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        {isOpen ? (
                            <MdKeyboardDoubleArrowLeft className="absolute right-2 top-2" />
                        ) : (
                            <MdKeyboardDoubleArrowRight className="absolute right-2 top-2" />
                        )}
                    </button>
                    {isOpen && (
                        <div className="mb-4">
                            <h1 className="text-2xl py-4 text-white font-bold">anione.ai</h1>
                            {session && (
                                <div className="text-white mt-2 mb-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center">
                                            <MdGeneratingTokens className="mr-2" />
                                            <span>Text Tokens:</span>
                                        </div>
                                        <span>{tokens.textTokens}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <RiImageCircleFill className="mr-2" />
                                            <span>Image Tokens:</span>
                                        </div>
                                        <span>{tokens.imageTokens}</span>
                                    </div>
                                </div>
                            )}
                            <hr className="border-t border-gray-600 my-4" />
                        </div>
                    )}
                    <div className="w-full mt-14">
                        {navLinks &&
                            navLinks.map((link) => (
                                <Tooltip key={link} content={link}>
                                    <div
                                        onClick={() => setNavItem(link)}
                                        className={`text-slate-200 items-center gap-3 hover:cursor-pointer mb-6 flex p-2 rounded-xl 
                                            hover:bg-slate-400 hover:bg-opacity-30 hover:text-white 
                                            ${navItem === link ? "bg-slate-400 bg-opacity-30" : ""}
                                            ${!isOpen && !isMobile ? "justify-center" : ""}
                                            ${isMobile && !isOpen ? "hidden" : ""}`}
                                    >
                                        {renderIcon(link)}
                                        {(isOpen || isMobile) && <span className="ml-3">{link}</span>}
                                    </div>
                                </Tooltip>
                            ))}
                    </div>
                </div>

                <div className="relative items-end z-[999]">
                    {session ? (
                        <div
                            className={`text-slate-200 items-center gap-3 hover:cursor-pointer mt-auto mb-4 flex p-2 rounded-xl 
                                hover:bg-slate-400 hover:bg-opacity-30 hover:text-white
                                ${!isOpen && !isMobile ? "h-12 w-12 justify-center" : "h-auto w-auto"}
                                ${isMobile && !isOpen ? "hidden" : ""}`}
                            onClick={handleLogout}
                        >
                            <SlLogout size={24} className={`${!isOpen && !isMobile ? "m-auto" : ""}`} />
                            {(isOpen || isMobile) && <span className="ml-3">Logout</span>}
                        </div>
                    ) : (
                        <LoginPopup isOpen={isOpen} isMobile={isMobile} />
                    )}
                </div>
            </nav>

            {/* Logout confirmation modal */}
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

            {/* Overlay for mobile */}
            {isOpen && isMobile && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-30"
                    onClick={() => setIsOpen(false)}
                ></div>
            )}
        </>
    );
}
