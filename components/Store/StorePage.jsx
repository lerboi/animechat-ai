import React, { useState, useEffect } from 'react'
import { PricingCard } from './PricingCard'
import { useSession } from 'next-auth/react'
import { loadStripe } from '@stripe/stripe-js'
import { HiOutlineCurrencyDollar, HiMiniCurrencyDollar } from "react-icons/hi2";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)

const tiers = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    benefits: [
      'Access to NSFW chats',
      'Up to 3 Chats',
      'Free One-Time 50 Message Tokens',
      'Free One-Time 3 Picture Tokens',
      'High-Quality AI Response',
      'No ads',
    ],
    stripeId: 'free_plan',
  },
  {
    name: 'Plus',
    price: '$9.99',
    period: '/month',
    altPrice: '$4.99/month, $59.88/yr',
    benefits: [
      '3000 Message Tokens/month',
      '100 Picture Tokens/month',
      'Up to 10 chats',
      'Access to pictures',
    ],
    isPopular: true,
    stripeId: 'price_1QCF5tCoZlAUNSElrMZu2AfC',
  },
  {
    name: 'Premium',
    price: '$29.99',
    period: '/month',
    altPrice: '$19.99/month, $239.88/yr',
    benefits: [
      'Unlimited Message Tokens/month',
      'Unlimited Pictures Tokens/month',
      'Unlimited chats',
      'Create your own Characters',
    ],
    stripeId: 'price_1QCF66CoZlAUNSElYNbnJzHD',
  },
]

const tokenBundle = {
  name: 'Token Bundle',
  price: '5.99',
  benefits: [
    '300 Message Tokens',
    '10 Picture Tokens',
  ],
  stripeId: 'token_bundle',
}

export default function StorePage() {
  const [selectedTier, setSelectedTier] = useState('Premium')
  const [userSubscription, setUserSubscription] = useState(null)
  const { data: session } = useSession()

  useEffect(() => {
    async function fetchUserSubscription() {
      if (session) {
        try {
          const response = await fetch('/api/getUserTierAPI', {
            method: "GET",
            headers: {
              "Content-Type" : "application/json"
            }
          })
          if (response.ok) {
            const data = await response.json()
            setUserSubscription(data)
          }
        } catch (error) {
          console.error('Error fetching user subscription:', error)
        }
      }
    }
    fetchUserSubscription()
  }, [session])

  const handleSubscribe = async (stripeId) => {
    if (!session) {
      alert('Please log in to subscribe')
      return
    }

    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: stripeId,
        }),
      })

      const { sessionId } = await response.json()
      const stripe = await stripePromise
      const { error } = await stripe.redirectToCheckout({ sessionId })

      if (error) {
        console.error('Error:', error)
        alert('An error occurred. Please try again.')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('An error occurred. Please try again.')
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-7xl w-full">
        <h1 className="text-4xl font-bold text-white text-center mb-12 mt-12">Subscriptions</h1>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-16">
          {tiers.map((tier) => (
            <div key={tier.name} className="relative">
              {tier.isPopular && (
                <div className="absolute z-[10] -top-8 left-1/2 transform -translate-x-1/2 bg-white text-black font-bold py-1 px-4 rounded-full text-sm">
                  Most popular!
                </div>
              )}
              <PricingCard
                name={tier.name}
                price={tier.price}
                period={tier.period}
                altPrice={tier.altPrice}
                benefits={tier.benefits}
                isSelected={selectedTier === tier.name}
                onSelect={() => setSelectedTier(tier.name)}
                buttonText={userSubscription && userSubscription.tier === tier.name.toUpperCase() ? "Current plan" : "Get Started"}
                isCurrentPlan={userSubscription && userSubscription.tier === tier.name.toUpperCase()}
                onSubscribe={() => handleSubscribe(tier.stripeId)}
              />
            </div>
          ))}
        </div>
        
        <h2 className="text-3xl font-bold text-white text-center mb-8">Store</h2>
        <div className="max-w-md mx-auto">
          <PricingCard
            name={tokenBundle.name}
            price={tokenBundle.price}
            benefits={tokenBundle.benefits}
            isSelected={false}
            onSelect={() => {}}
            buttonText="Buy Now"
            onSubscribe={() => handleSubscribe(tokenBundle.stripeId)}
          />
        </div>
      </div>
    </div>
  )
}