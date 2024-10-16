import React from 'react'
import { Check } from 'lucide-react'
import { Button } from "@/components/ui/button"

export function PricingCard({ name, price, period, altPrice, benefits, isSelected, onSelect, buttonText = "Get Started" }) {
  return (
    <div
      className={`bg-gray-800 bg-opacity-50 rounded-lg p-8 transition-all duration-300 ease-in-out
        ${
          isSelected
            ? 'ring-2 ring-white shadow-lg shadow-white/20 transform scale-105 z-10'
            : 'hover:ring-1 hover:ring-white/50 hover:shadow-md hover:shadow-white/10 hover:transform hover:scale-102'
        }`}
      onClick={onSelect}
    >
      <h2 className="text-2xl font-bold text-white mb-4">{name}</h2>
      <p className="text-4xl font-bold text-white mb-2">{price}<span className="text-lg font-normal">{period}</span></p>
      {altPrice && <p className="text-sm text-gray-400 mb-6">or {altPrice}</p>}
      <ul className="space-y-3 mb-8">
        {benefits.map((benefit) => (
          <li key={benefit} className="flex items-center text-white">
            <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
            <span>{benefit}</span>
          </li>
        ))}
      </ul>
      <Button className="w-full bg-white text-black hover:bg-gray-200">
        {buttonText}
      </Button>
    </div>
  )
}