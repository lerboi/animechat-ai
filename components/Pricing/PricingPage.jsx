import React from 'react'
import { PricingCard } from './PricingCard'
const tiers = [
  {
    name: 'Free',
    price: '$0',
    benefits: ['Basic features', 'Limited storage', 'Email support'],
  },
  {
    name: 'Premium',
    price: '$9.99',
    benefits: ['Advanced features', 'Increased storage', 'Priority support'],
  },
  {
    name: 'Premium+',
    price: '$19.99',
    benefits: ['All features', 'Unlimited storage', '24/7 dedicated support'],
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