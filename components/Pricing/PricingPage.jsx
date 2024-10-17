import React, { useState, useEffect } from 'react'
import { PricingCard } from './PricingCard'
import { Button } from "@/components/ui/button"
import { useSession } from 'next-auth/react'

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
  },
]

const tokenBundle = {
  name: 'Token Bundle',
  price: '5.99',
  benefits: [
    '300 Message Tokens',
    '10 Picture Tokens',
  ],
}

export default function PricingPage() {
  const [selectedTier, setSelectedTier] = React.useState('Premium')
  const [userTier, setUserTier] = useState(null)
  const { data: session } = useSession()

  useEffect(() => {
    async function fetchUserTier() {
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
            setUserTier(data.tier)
          }
        } catch (error) {
          console.error('Error fetching user tier:', error)
        }
      }
    }
    fetchUserTier()
    console.log("Current Tier: " + JSON.stringify(userTier))
  }, [session])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-7xl w-full">
        <h1 className="text-4xl font-bold text-white text-center mb-12">Subscriptions</h1>
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
                buttonText={userTier === tier.name.toUpperCase() ? "Current plan" : "Get Started"}
                isCurrentPlan={userTier === tier.name.toUpperCase()}
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
          />
        </div>
      </div>
    </div>
  )
}