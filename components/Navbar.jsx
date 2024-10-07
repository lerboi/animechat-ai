"use client"
import { useState } from 'react';
import { MdKeyboardDoubleArrowRight } from "react-icons/md";
import { MdKeyboardDoubleArrowLeft } from "react-icons/md";

export default function Navbar({isOpen, setIsOpen, navItem, setNavItem, navLinks}) {

  return (
    <nav className={`fixed p-7 text-xl top-0 left-0 h-full bg-[#1f1e1e] max-w-64 ${isOpen ? 'w-[60%]' : 'w-16'} transition-all`}>
        {isOpen? 
            <button className="text-[#e7e7e7] text-3xl p-2" onClick={() => setIsOpen(!isOpen)}>
                <MdKeyboardDoubleArrowLeft className="absolute right-5 top-5"/>
            </button> 
            : 
            <button className="text-[#e7e7e7] text-3xl p-2" onClick={() => setIsOpen(!isOpen)}>
                <MdKeyboardDoubleArrowRight className="absolute right-5 top-5"/>
            </button>
        }
        
        <div className="mt-4 w-full">
            {navLinks && navLinks.map(link => (
                isOpen? 
                <p key={link.label} onClick={() => setNavItem(`${link}`)} className={`text-slate-200 hover:cursor-pointer mt-4 p-4 rounded-xl hover:bg-slate-400 hover:bg-opacity-50 hover:text-white ${navItem === link ? 'bg-slate-400 bg-opacity-50' : '' }`}>{link}</p>
                :
                ""
            ))}
        </div>
    </nav>
  )
};

