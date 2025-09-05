import React, { useState, useEffect } from 'react'
import Header from './components/Header'
import StateSelector from './components/StateSelector'
import RightsCard from './components/RightsCard'
import Modal from './components/Modal'
import SubscriptionUpgrade from './components/SubscriptionUpgrade'
import TrustedContacts from './components/TrustedContacts'
import InteractionHistory from './components/InteractionHistory'
import { AppProvider, useApp } from './context/AppContext'

function AppContent() {
  const { state, actions } = useApp()
  const [currentView, setCurrentView] = useState('home')
  
  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-xl mx-auto px-4 w-full">
        <Header />
        
        {/* Navigation */}
        <nav className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
          <button
            onClick={() => setCurrentView('home')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              currentView === 'home'
                ? 'bg-surface text-text shadow-sm'
                : 'text-secondaryText hover:text-text'
            }`}
          >
            Rights
          </button>
          <button
            onClick={() => setCurrentView('contacts')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              currentView === 'contacts'
                ? 'bg-surface text-text shadow-sm'
                : 'text-secondaryText hover:text-text'
            }`}
          >
            Contacts
          </button>
          <button
            onClick={() => setCurrentView('history')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              currentView === 'history'
                ? 'bg-surface text-text shadow-sm'
                : 'text-secondaryText hover:text-text'
            }`}
          >
            History
          </button>
        </nav>
        
        <main className="pb-8">
          {currentView === 'home' && (
            <div className="space-y-6">
              {!state.user.state ? (
                <>
                  <div className="text-center py-8">
                    <h1 className="text-display mb-4">KnowYourRights Card</h1>
                    <p className="text-body max-w-md mx-auto">
                      Empower yourself with instant legal knowledge and documentation for police interactions.
                    </p>
                  </div>
                  
                  <StateSelector onStateSelected={() => {}} />
                </>
              ) : (
                <RightsCard onBackToHome={() => actions.dispatch({ type: 'SET_STATE', payload: null })} />
              )}
            </div>
          )}
          
          {currentView === 'contacts' && (
            <TrustedContacts />
          )}
          
          {currentView === 'history' && (
            <InteractionHistory />
          )}
          
          {currentView === 'subscription' && (
            <SubscriptionUpgrade onBack={() => setCurrentView('home')} />
          )}
        </main>
        
        {/* Global Modal */}
        {state.showModal && (
          <Modal
            isOpen={state.showModal}
            onClose={actions.hideModal}
            title={state.modalContent?.title}
            type={state.modalContent?.type}
            onConfirm={state.modalContent?.onConfirm}
          >
            {state.modalContent?.content}
          </Modal>
        )}
        
        {/* Loading Overlay */}
        {state.loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-surface rounded-lg p-6 flex items-center space-x-3">
              <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full"></div>
              <span className="text-text">Loading...</span>
            </div>
          </div>
        )}
        
        {/* Error Toast */}
        {state.error && (
          <div className="fixed bottom-4 left-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg z-50">
            <div className="flex items-center justify-between">
              <span>{state.error}</span>
              <button
                onClick={actions.clearError}
                className="ml-4 text-white hover:text-red-200"
              >
                ×
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}

export default App
