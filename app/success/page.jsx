'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'

export default function SuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const sessionId = searchParams.get('session_id')
    if (sessionId) {
      // You can use this sessionId to verify the payment status if needed
      console.log('Payment successful for session:', sessionId)
    }
    
    // Redirect to the payments page after a short delay
    const redirectTimer = setTimeout(() => {
      router.push('/')
    }, 2000)

    return () => clearTimeout(redirectTimer)
  }, [router, searchParams])

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center text-slate-100">
        <h1 className="text-3xl font-bold mb-4">Payment Successful!</h1>
        <p>Redirecting you to the payments page...</p>
      </div>
    </div>
  )
}