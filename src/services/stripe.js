import { loadStripe } from '@stripe/stripe-js'

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_key')

export const paymentService = {
  // Create checkout session for Pro subscription
  async createCheckoutSession(userId, email) {
    try {
      // In a real app, this would call your backend API
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          email,
          priceId: 'price_pro_monthly', // Your Stripe price ID
          successUrl: `${window.location.origin}/subscription-success`,
          cancelUrl: `${window.location.origin}/subscription-cancelled`
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const { sessionId } = await response.json()
      
      const stripe = await stripePromise
      const { error } = await stripe.redirectToCheckout({ sessionId })
      
      if (error) {
        throw error
      }
      
      return { success: true, error: null }
    } catch (error) {
      console.error('Stripe Checkout Error:', error)
      return { success: false, error: error.message }
    }
  },

  // Handle subscription upgrade (demo version)
  async upgradeToProDemo() {
    // This is a demo implementation - in production you'd use real Stripe
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, subscriptionId: 'demo_sub_' + Date.now() })
      }, 2000)
    })
  },

  // Check subscription status
  async getSubscriptionStatus(userId) {
    try {
      // In a real app, this would call your backend API
      const response = await fetch(`/api/subscription-status/${userId}`)
      
      if (!response.ok) {
        throw new Error('Failed to get subscription status')
      }
      
      const data = await response.json()
      return { data, error: null }
    } catch (error) {
      console.error('Subscription Status Error:', error)
      return { data: null, error: error.message }
    }
  },

  // Cancel subscription
  async cancelSubscription(subscriptionId) {
    try {
      // In a real app, this would call your backend API
      const response = await fetch('/api/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subscriptionId })
      })

      if (!response.ok) {
        throw new Error('Failed to cancel subscription')
      }

      const data = await response.json()
      return { data, error: null }
    } catch (error) {
      console.error('Cancel Subscription Error:', error)
      return { data: null, error: error.message }
    }
  },

  // Update payment method
  async updatePaymentMethod(customerId) {
    try {
      const stripe = await stripePromise
      
      // Create a setup intent for updating payment method
      const response = await fetch('/api/create-setup-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ customerId })
      })

      if (!response.ok) {
        throw new Error('Failed to create setup intent')
      }

      const { clientSecret } = await response.json()
      
      const { error } = await stripe.confirmCardSetup(clientSecret)
      
      if (error) {
        throw error
      }
      
      return { success: true, error: null }
    } catch (error) {
      console.error('Update Payment Method Error:', error)
      return { success: false, error: error.message }
    }
  }
}

// Pricing configuration
export const pricingConfig = {
  free: {
    name: 'Free',
    price: 0,
    features: [
      'Basic rights information',
      'State selection',
      'Emergency contact alerts',
      'Basic incident summaries'
    ],
    limitations: [
      'No recording capabilities',
      'Limited interaction history',
      'Basic sharing features'
    ]
  },
  pro: {
    name: 'Pro',
    price: 4.99,
    priceId: 'price_pro_monthly',
    features: [
      'All Free features',
      'Audio/video recording',
      'Extended recording storage (up to 2 hours)',
      'Complete interaction history',
      'Advanced incident summaries',
      'Priority customer support',
      'Encrypted data storage'
    ]
  }
}

// Demo payment processing for development
export const demoPayment = {
  async processUpgrade(userId) {
    // Simulate payment processing
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          subscriptionId: `demo_sub_${userId}_${Date.now()}`,
          customerId: `demo_cus_${userId}`,
          status: 'active'
        })
      }, 2000)
    })
  }
}
