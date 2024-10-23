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
      // Call the functions to add payment and subscription info
      addPaymentInfo(sessionId)
      addSubscriptionInfo(sessionId)
    }
    
    // Redirect to the payments page after a short delay
    const redirectTimer = setTimeout(() => {
      router.push('http://localhost:3000/')
    }, 2000)

    return () => clearTimeout(redirectTimer)
  }, [router, searchParams])

  async function addPaymentInfo(sessionId) {
    try {
      const response = await fetch('/api/payments/addPaymentInfo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      })
      if (!response.ok) {
        throw new Error('Failed to add payment info')
      }
    } catch (error) {
      console.error('Error adding payment info:', error)
    }
  }

  async function addSubscriptionInfo(sessionId) {
    try {
      const response = await fetch('/api/subscriptions/addSubscriptionInfo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      })
      if (!response.ok) {
        throw new Error('Failed to add subscription info')
      }
    } catch (error) {
      console.error('Error adding subscription info:', error)
    }
  }

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center text-slate-100">
        <h1 className="text-3xl font-bold mb-4">Payment Successful!</h1>
        <p>Redirecting you to the home page...</p>
      </div>
    </div>
  )
}