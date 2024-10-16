import React from 'react'
import { PricingCard } from './PricingCard'
import { Button } from "@/components/ui/button"

const tiers = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    benefits: [
      'Access to NSFW chats',
      'Up to 3 Chats',
      'Free 30 Message Tokens a day',
      'Free 1 Picture Token',
      'High-Quality AI Response',
      'No ads',
    ],
  },
  {
    name: 'Plus+',
    price: '$9.99',
    period: '/month',
    altPrice: '$4.99/month, $59.88/yr',
    benefits: [
      '3000 Message Tokens/month',
      '100 Picture Tokens/month',
      'Up to 10 chats',
      'Access to pictures',
    ],
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
  price: '$5.99',
  benefits: [
    '300 Message Tokens',
    '10 Picture Tokens',
  ],
}

export default function PricingPage() {
  const [selectedTier, setSelectedTier] = React.useState('Premium')

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-7xl w-full">
        <h1 className="text-4xl font-bold text-white text-center mb-12">Subscriptions</h1>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-16">
          {tiers.map((tier) => (
            <PricingCard
              key={tier.name}
              name={tier.name}
              price={tier.price}
              period={tier.period}
              altPrice={tier.altPrice}
              benefits={tier.benefits}
              isSelected={selectedTier === tier.name}
              onSelect={() => setSelectedTier(tier.name)}
            />
          ))}
        </div>
        
        <h2 className="text-3xl font-bold text-white text-center mb-8">Token Store</h2>
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