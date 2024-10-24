"use client";
import { useSession, signOut } from "next-auth/react";
import { MdKeyboardDoubleArrowRight, MdKeyboardDoubleArrowLeft, MdGeneratingTokens} from "react-icons/md";
import { AiOutlineHome, AiFillHome, AiOutlinePlus } from "react-icons/ai";
import { HiOutlineChatBubbleLeftRight, HiChatBubbleLeftRight } from "react-icons/hi2";
import { HiOutlineQuestionMarkCircle, HiQuestionMarkCircle } from "react-icons/hi2";
import { FiAlignLeft, FiPlusCircle } from "react-icons/fi";
import { RiImageCircleFill } from "react-icons/ri";
import { PiStorefront, PiStorefrontFill } from "react-icons/pi";
import Image from 'next/image';
import { useNav } from "@/lib/NavContext";
import LoginPopup from "./LoginPopup";
import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';

export default function Navbar() {
    const router = useRouter();
    const { isOpen, setIsOpen, navItem, setNavItem, navLinks, isMobile } = useNav();
    const { data: session, status } = useSession();
    const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);
    const [tokens, setTokens] = useState({ textTokens: 0, imageTokens: 0 });

    async function fetchTokens() {
        if (!session) return;
        
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

    useEffect(() => {
        fetchTokens();
    }, [session]);

    useEffect(() => {
        if (!session) return;

        const handleTokenUpdate = () => {
            fetchTokens();
        };

        window.addEventListener('tokenUpdate', handleTokenUpdate);

        return () => {
            window.removeEventListener('tokenUpdate', handleTokenUpdate);
        };
    }, [session, tokens]);

    function handleNavigation(link) {
        setNavItem(link);
        if (link === "Home") {
            router.push('/');
        } else {
            router.push(`/${link}`);
        }
    };

    const handleLogout = () => setShowLogoutConfirmation(true);
    const confirmLogout = () => {
        signOut();
        setShowLogoutConfirmation(false);
    };

    const Tooltip = ({ content, children }) => {
        const [isHovered, setIsHovered] = useState(false);
      
        const showTooltip = isHovered && !isMobile && !isOpen;
      
        return (
          <div 
            className='relative'
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {children}
            {showTooltip && (
              <span
                className={`absolute left-14 top-1/2 -translate-y-1/2 bg-slate-200 text-black text-sm rounded-md px-2 py-1
                  opacity-100 visible transition-opacity duration-200 z-50
                  before:absolute before:left-[-12px] before:top-1/2 before:-translate-y-1/2 
                  before:border-8 before:border-transparent before:border-r-slate-200`}
              >
                {content}
              </span>
            )}
          </div>
        );
    };

    const renderIcon = (link) => {
        switch (link) {
            case "Home":
                return navItem === "Home" ? <AiFillHome size={28} /> : <AiOutlineHome size={28} />;
            case "Chats":
                return navItem === "Chats"
                    ? <HiChatBubbleLeftRight size={28} />
                    : <HiOutlineChatBubbleLeftRight size={28} />;
            case "Store":
                return navItem === "Store"
                    ? <PiStorefrontFill size={28} />
                    : <PiStorefront size={28} />;
            case "Help":
                return navItem === "Help"
                    ? <HiQuestionMarkCircle size={28} />
                    : <HiOutlineQuestionMarkCircle size={28} />;
            default:
                return null;
        }
    };

    const TokenDisplay = ({ icon: Icon, count, label }) => (
        <div className="flex items-center justify-between rounded-lg mb-1">
            <div className="flex items-center space-x-2">
                <Icon className="text-slate-300" size={20} />
                <span className="text-slate-300 text-sm font-medium">{label}</span>
            </div>
            <div className="relative">
                <span className="text-slate-200 font-semibold">{count}</span>
                <AiOutlinePlus
                    className="absolute -top-0 -right-4 text-slate-300 cursor-pointer hover:text-white"
                    size={12}
                    onClick={() => router.push('/Store')}
                />
            </div>
        </div>
    );

    const getInitials = (name) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase();
    };

    return (
        <>
            <button
                className={`fixed top-4 left-4 text-white z-50 md:hidden ${isOpen ? "hidden" : ""}`}
                onClick={() => setIsOpen(true)}
            >
                <FiAlignLeft size={24} />
            </button>

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
                                <div className="text-white mt-4 mb-4 space-y-2">
                                    <TokenDisplay 
                                        icon={MdGeneratingTokens} 
                                        count={tokens.textTokens}
                                        label="Text"
                                    />
                                    <TokenDisplay 
                                        icon={RiImageCircleFill} 
                                        count={tokens.imageTokens}
                                        label="Image"
                                    />
                                </div>
                            )}
                            <hr className="border-t border-gray-600 my-4" />
                        </div>
                    )}
                    <div className={`w-full ${isOpen ? 'mt-6' : 'mt-14' }`}>
                        {navLinks &&
                            navLinks.map((link) => (
                                <Tooltip key={link} content={link}>
                                    <div
                                        onClick={() => handleNavigation(link)}
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
                        <Tooltip content="Profile">
                            <div
                                className={`text-slate-200 items-center gap-3 hover:cursor-pointer mt-auto mb-4 flex p-2 rounded-xl 
                                    hover:bg-slate-400 hover:bg-opacity-30 hover:text-white
                                    ${!isOpen && !isMobile ? "h-12 w-12 justify-center" : "h-auto w-auto"}
                                    ${isMobile && !isOpen ? "hidden" : ""}
                                    ${navItem === "Profile" ? "bg-slate-200 bg-opacity-20" : "" }`}
                                onClick={() => handleNavigation("Profile")}
                            >
                                {session.user.image ? (
                                    <Image
                                        src={session.user.image}
                                        alt="Profile"
                                        width={32}
                                        height={32}
                                        className="rounded-full"
                                    />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                                        {getInitials(session.user.name || session.user.email)}
                                    </div>
                                )}
                                {(isOpen || isMobile) && <span className="ml-3">Profile</span>}
                            </div>
                        </Tooltip>
                    ) : (
                        <LoginPopup isOpen={isOpen} isMobile={isMobile} />
                    )}
                </div>
            </nav>

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

            {isOpen && isMobile && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-30"
                    onClick={() => setIsOpen(false)}
                ></div>
            )}
        </>
    );
}