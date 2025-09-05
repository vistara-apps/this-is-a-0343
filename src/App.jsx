import React, { useState, useEffect } from 'react'
import Header from './components/Header'
import StateSelector from './components/StateSelector'
import RightsCard from './components/RightsCard'
import Modal from './components/Modal'
import SubscriptionUpgrade from './components/SubscriptionUpgrade'
import { AppProvider } from './context/AppContext'

function App() {
  const [currentView, setCurrentView] = useState('home')
  
  return (
    <AppProvider>
      <div className="min-h-screen bg-bg">
        <div className="max-w-xl mx-auto px-4 w-full">
          <Header />
          
          <main className="pb-8">
            {currentView === 'home' && (
              <div className="space-y-6">
                <div className="text-center py-8">
                  <h1 className="text-display mb-4">KnowYourRights Card</h1>
                  <p className="text-body max-w-md mx-auto">
                    Empower yourself with instant legal knowledge and documentation for police interactions.
                  </p>
                </div>
                
                <StateSelector onStateSelected={() => setCurrentView('rights')} />
              </div>
            )}
            
            {currentView === 'rights' && (
              <RightsCard onBackToHome={() => setCurrentView('home')} />
            )}
            
            {currentView === 'subscription' && (
              <SubscriptionUpgrade onBack={() => setCurrentView('rights')} />
            )}
          </main>
        </div>
      </div>
    </AppProvider>
  )
}

export default App