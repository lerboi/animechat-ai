import localFont from "next/font/local";
import "./globals.css";
import SessionWrapper from "@/lib/SessionWrapper";

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

export const metadata = {
  title: "anione.ai",
  description: "Talk to your favourite anime characters",
};

export default function RootLayout({ children }) {
  return (
    <SessionWrapper>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black`}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-pink-100/10 via-transparent to-transparent h-[70%] mx-auto">
            {children}
          </div>
        </body>
      </html>
    </SessionWrapper>

  );
}
