"use client";
import localFont from "next/font/local";
import "./globals.css";
import SessionWrapper from "@/lib/SessionWrapper";
import { NavProvider } from "@/lib/NavContext";
import Navbar from "@/components/Nav/Navbar";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export default function RootLayout({ children }) {
  return (
    <SessionWrapper>
      <NavProvider>
        <html lang="en">
          <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black`}>
            <Navbar />
            <div className="absolute inset-0 bg-gradient-to-b from-pink-100/10 via-transparent to-transparent h-[70%] mx-auto">
              {children}
            </div>
          </body>
        </html>
      </NavProvider>
    </SessionWrapper>
  );
}