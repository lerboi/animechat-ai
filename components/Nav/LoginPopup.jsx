"use client"
import { useState, useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { RiLoginBoxLine } from "react-icons/ri"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signIn, signOut } from 'next-auth/react'
import { useSession } from 'next-auth/react'
import { FaSignInAlt } from "react-icons/fa";

export default function LoginPopup({isOpen}) {
  const {data: session, status} = useSession()
  const [isOpenPopup, setIsOpenPopup] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [showEmailLogin, setShowEmailLogin] = useState(false)
  const [showRegistration, setShowRegistration] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState(null)
  const [animationOrigin, setAnimationOrigin] = useState({ x: 0, y: 0 })
  const popupRef = useRef(null)

  useEffect(() => {
    setError(null)
  }, [email, password])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        closePopup()
      }
    }

    if (isOpenPopup) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpenPopup])

  async function handleEmailLogin(e) {
    e.preventDefault()
    const response = await signIn("credentials", {
      redirect: false,
      email: email,
      password: password
    })
    if (response.success){
      window.location.href = "/"
    }
    else {
      setError('Login failed. Please check your credentials.')
    }
  }

  async function handleRegistration(e) {
    e.preventDefault()
    // Add your registration logic here
    // For example:
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    if (response.ok) {
      // Registration successful, you might want to sign in the user automatically
      await signIn("credentials", { redirect: false, email, password })
      window.location.href = "/"
    } else {
      const data = await response.json()
      setError(data.message || 'Registration failed')
    }
  }

  const openPopup = (event) => {
    const rect = event.currentTarget.getBoundingClientRect()
    setAnimationOrigin({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 })
    setIsOpenPopup(true)
    setIsClosing(false)
  }

  const closePopup = () => {
    setIsClosing(true)
    setTimeout(() => {
      setIsOpenPopup(false)
      setShowEmailLogin(false)
      setShowRegistration(false)
      setIsClosing(false)
    }, 300) // Match this with the animation duration
  }

  return (
    <div>
      {/* Login Popup Icon at Navbar */}
      {isOpen ? (
        session? 
          <Button variant="outline" className="w-full" onClick={() => signOut()}>Sign Out</Button>
          :
          <Button variant="outline" className="w-full" onClick={openPopup}>Sign In</Button>

      ) : (
        session?
        <div className="rounded-xl hover:bg-slate-400 flex justify-center hover:bg-opacity-30 hover:text-white p-4 m-1">
          <FaSignInAlt className="text-white" size={28} onClick={() => signOut()}/>
        </div>
        :
        <div className="rounded-xl hover:bg-slate-400 flex justify-center hover:bg-opacity-30 hover:text-white p-4 m-1">
          <RiLoginBoxLine className="text-white" size={28} onClick={openPopup}/>
        </div>
      )}

      {(isOpenPopup || isClosing) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div 
            ref={popupRef}
            className="bg-white rounded-lg shadow-xl max-w-md w-full relative overflow-hidden"
            style={{
              transformOrigin: `${animationOrigin.x}px ${animationOrigin.y}px`,
              animation: `${isClosing ? 'closePopup' : 'openPopup'} 0.3s ease-out forwards`
            }}
          >
            <button onClick={closePopup}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 z-10">
              <X className="h-6 w-6" />
            </button>

            <div className="flex transition-transform duration-300 ease-in-out" 
                 style={{ transform: showRegistration ? 'translateX(-200%)' : showEmailLogin ? 'translateX(-100%)' : 'translateX(0)' }}>
              {/* Main Popup Page */}
              <div className="w-full flex-shrink-0">
                <div className="p-6">
                  <div className="mb-6 flex overflow-hidden rounded">
                    <img src="/mock1.jpg" alt="Character 1" className="w-1/5 h-20 object-cover" />
                    <img src="/mock2.jpg" alt="Character 2" className="w-1/5 h-20 object-cover" />
                    <img src="/mock3.webp" alt="Character 3" className="w-1/5 h-20 object-cover" />
                    <img src="/mock4.jpg" alt="Character 4" className="w-1/5 h-20 object-cover" />
                    <img src="/mock5.webp" alt="Character 5" className="w-1/5 h-20 object-cover" />
                  </div>

                  <h2 className="text-2xl font-bold mb-2 text-center">Create an account.</h2>
                  <p className="text-gray-600 mb-6 text-center">
                    Create an account to unlock chats with any Talkie!
                  </p>

                  <div className="space-y-4">
                    <Button variant="outline" className="w-full flex items-center justify-center space-x-2" onClick={() => setShowEmailLogin(true)}>
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"
                        />
                      </svg>
                      <span>Continue with Email</span>
                    </Button>
                    <Button variant="outline" className="w-full flex items-center justify-center space-x-2" onClick={() => signIn("google")}>
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="currentColor"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      <span>Continue with Google</span>
                    </Button>
                  </div>

                  <p className="text-xs text-gray-500 mt-4 text-center">
                    By continuing, you agree to AnimeChat's Terms of Service
                  </p>
                </div>
              </div>
              {/* Login with Email Page */}
              <div className="w-full flex-shrink-0">
                <div className="p-6">
                  <h2 className="text-2xl font-bold mb-6 text-center">Login with Email</h2>

                  {/* Form Section */}
                  <form onSubmit={handleEmailLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Enter your email" required />
                    </div>
                    <div className="space-y-2">
                      <Label>Password</Label>
                      <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Enter your password" required />
                    </div>

                    {/* Error section */}
                    <div className="flex justify-center items-center">
                      {error && (
                        <p className="text-sm text-red-500">{error}</p>
                      )}
                    </div>

                    <Button type="submit" className="w-full">Login</Button>
                  </form>
                  <div className="mt-4 text-center">
                    <span 
                      className="text-sm text-slate-600 hover:text-blue-400 cursor-pointer transition-all"
                      onClick={() => (setShowRegistration(true), setError(""))}
                    >
                      Don't have an account?
                    </span>
                  </div>
                  <Button variant="link" className="mt-4 w-full" onClick={() => setShowEmailLogin(false)}>
                    Back
                  </Button>
                </div>
              </div>
              {/* Registration Page */}
              <div className="w-full flex-shrink-0">
                <div className="p-6">
                  <h2 className="text-2xl font-bold mb-6 text-center">Create an account</h2>

                  {/* Registration Form */}
                  <form onSubmit={handleRegistration} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Enter your email" required />
                    </div>
                    <div className="space-y-2">
                      <Label>Password</Label>
                      <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Enter your password" required />
                    </div>

                    {/* Error section */}
                    <div className="flex justify-center items-center">
                      {error && (
                        <p className="text-sm text-red-500">{error}</p>
                      )}
                    </div>

                    <Button type="submit" className="w-full">Register</Button>
                  </form>
                  <Button variant="link" className="mt-4 w-full" onClick={() => {
                    setShowRegistration(false)
                    setShowEmailLogin(true)
                  }}>
                    Back to Login
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <style jsx global>{`
        @keyframes openPopup {
          from {
            transform: scale(0);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        @keyframes closePopup {
          from {
            transform: scale(1);
            opacity: 1;
          }
          to {
            transform: scale(0);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}