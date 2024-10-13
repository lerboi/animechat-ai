import React from 'react'
import { PricingCard } from './PricingCard'
const tiers = [
  {
    name: 'Free',
    price: '$0',
    benefits: [
      'Access to NSFW chats',
      'Up to 3 Chats',
      'Up to 20 Messages a day',
      'High-Quality AI Response',
      'Characters retain memory of chats',
      'No ads',
    ],
  },
  {
    name: 'Plus+',
    price: '$9.99',
    benefits: [
      'Up to 200 Messages a day',
      'Access to NSFW Pictures',
      'Up to 10 Pictures a day',
      'Up to 10 Chats',
      'Access to pictures',
      'Enhanced Chat memory',
    ],
  },
  {
    name: 'Premium',
    price: '$19.99',
    benefits: [
      'Unlimited Messages a day',
      'Unlimited Chats',
      'Unlimited Pictures a day',
      'Create your own Characters',
    ],
  },
]


export default function PricingPage() {
  const [selectedTier, setSelectedTier] = React.useState('Premium')

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-7xl w-full">
        <h1 className="text-4xl font-bold text-white text-center mb-12">Choose Your Plan</h1>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {tiers.map((tier) => (
            <PricingCard
              key={tier.name}
              name={tier.name}
              price={tier.price}
              benefits={tier.benefits}
              isSelected={selectedTier === tier.name}
              onSelect={() => setSelectedTier(tier.name)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}