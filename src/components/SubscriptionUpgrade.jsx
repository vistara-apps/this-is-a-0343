import React from 'react'
import { ArrowLeft, Check, Crown } from 'lucide-react'

const features = [
  'Extended recording storage (up to 4 hours)',
  'Case history and interaction logs',
  'Advanced legal script generation',
  'Priority customer support',
  'Offline access to rights information',
  'Multi-language support expansion'
]

export default function SubscriptionUpgrade({ onBack }) {
  const handleUpgrade = () => {
    // In a real app, this would integrate with Stripe
    alert('Redirecting to secure payment... (Demo)')
  }
  
  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center space-x-3">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-secondaryText hover:text-text transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
      </div>
      
      <div className="card bg-gradient-to-br from-primary to-purple-600 text-white">
        <div className="flex items-center space-x-3 mb-4">
          <Crown className="w-8 h-8 text-yellow-400" />
          <div>
            <h2 className="text-2xl font-bold">KnowYourRights Pro</h2>
            <p className="text-blue-100">Advanced legal protection features</p>
          </div>
        </div>
        
        <div className="flex items-baseline space-x-2">
          <span className="text-3xl font-bold">$4.99</span>
          <span className="text-blue-200">per month</span>
        </div>
      </div>
      
      <div className="card">
        <h3 className="text-heading mb-4">Pro Features</h3>
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start space-x-3">
              <Check className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
              <span className="text-body">{feature}</span>
            </li>
          ))}
        </ul>
      </div>
      
      <button
        onClick={handleUpgrade}
        className="w-full btn-primary py-4 text-lg"
      >
        Upgrade to Pro - $4.99/month
      </button>
      
      <div className="text-center">
        <p className="text-caption">
          Cancel anytime • 7-day free trial • Secure payment with Stripe
        </p>
      </div>
    </div>
  )
}