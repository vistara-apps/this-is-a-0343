import React, { useState } from 'react'
import { ArrowLeft, Shield, Mic, Video, Share2, AlertTriangle, Phone, Globe } from 'lucide-react'
import { useApp } from '../context/AppContext'
import QuickActionBtn from './QuickActionBtn'
import InfoCard from './InfoCard'
import ShareButton from './ShareButton'

export default function RightsCard({ onBackToHome }) {
  const { state, dispatch } = useApp()
  const [activeTab, setActiveTab] = useState('rights')
  
  const rightsData = {
    whatToSay: [
      "I am exercising my right to remain silent.",
      "I do not consent to any searches.",
      "I would like to speak to a lawyer.",
      "Am I free to leave?",
      "I do not consent to this interaction."
    ],
    whatNotToSay: [
      "Don't argue or become confrontational",
      "Don't run or resist physically",
      "Don't lie or provide false information",
      "Don't consent to searches",
      "Don't answer questions without a lawyer"
    ],
    yourRights: [
      "Right to remain silent (5th Amendment)",
      "Right to refuse consent to searches",
      "Right to ask if you're free to leave",
      "Right to a lawyer during questioning",
      "Right to record in public spaces"
    ]
  }
  
  const handleLanguageToggle = () => {
    const newLang = state.user.preferredLanguage === 'english' ? 'spanish' : 'english'
    dispatch({ type: 'SET_LANGUAGE', payload: newLang })
  }
  
  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToHome}
          className="flex items-center space-x-2 text-secondaryText hover:text-text transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
        
        <button
          onClick={handleLanguageToggle}
          className="flex items-center space-x-2 px-3 py-2 bg-surface rounded-lg shadow-card"
        >
          <Globe className="w-4 h-4" />
          <span className="text-sm font-medium">
            {state.user.preferredLanguage === 'english' ? 'EN' : 'ES'}
          </span>
        </button>
      </div>
      
      {/* State Info */}
      <div className="card bg-primary text-white">
        <div className="flex items-center space-x-3">
          <Shield className="w-8 h-8" />
          <div>
            <h2 className="text-xl font-bold">Your Rights in {state.user.state}</h2>
            <p className="text-blue-100">
              {state.user.preferredLanguage === 'spanish' ? 'Información legal específica del estado' : 'State-specific legal information'}
            </p>
          </div>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <QuickActionBtn
          variant="record"
          icon={Video}
          label={state.user.preferredLanguage === 'spanish' ? 'Grabar Interacción' : 'Record Interaction'}
          onClick={() => {
            if (state.user.subscriptionStatus === 'free') {
              dispatch({
                type: 'SHOW_MODAL',
                payload: {
                  type: 'upgrade',
                  title: 'Upgrade to Pro',
                  content: 'Recording features require a Pro subscription. Upgrade for $4.99/month.'
                }
              })
            } else {
              dispatch({ type: 'START_RECORDING' })
            }
          }}
        />
        
        <QuickActionBtn
          variant="alert"
          icon={Phone}
          label={state.user.preferredLanguage === 'spanish' ? 'Alertar Contactos' : 'Alert Contacts'}
          onClick={() => {
            dispatch({
              type: 'SHOW_MODAL',
              payload: {
                type: 'alert',
                title: 'Emergency Alert Sent',
                content: 'Your trusted contacts have been notified of your current location and situation.'
              }
            })
          }}
        />
      </div>
      
      {/* Recording Status */}
      {state.isRecording && (
        <div className="card bg-red-50 border-2 border-red-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="font-medium text-red-800">Recording in progress...</span>
            </div>
            <button
              onClick={() => dispatch({ type: 'STOP_RECORDING' })}
              className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium"
            >
              Stop
            </button>
          </div>
        </div>
      )}
      
      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {['rights', 'say', 'avoid'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-surface text-text shadow-sm'
                : 'text-secondaryText hover:text-text'
            }`}
          >
            {tab === 'rights' && (state.user.preferredLanguage === 'spanish' ? 'Derechos' : 'Your Rights')}
            {tab === 'say' && (state.user.preferredLanguage === 'spanish' ? 'Qué Decir' : 'What to Say')}
            {tab === 'avoid' && (state.user.preferredLanguage === 'spanish' ? 'Qué Evitar' : 'What NOT to Say')}
          </button>
        ))}
      </div>
      
      {/* Content */}
      {activeTab === 'rights' && (
        <InfoCard
          title={state.user.preferredLanguage === 'spanish' ? 'Sus Derechos Constitucionales' : 'Your Constitutional Rights'}
          items={rightsData.yourRights}
          icon={Shield}
          variant="default"
        />
      )}
      
      {activeTab === 'say' && (
        <InfoCard
          title={state.user.preferredLanguage === 'spanish' ? 'Frases Recomendadas' : 'Recommended Phrases'}
          items={rightsData.whatToSay}
          icon={Mic}
          variant="success"
        />
      )}
      
      {activeTab === 'avoid' && (
        <InfoCard
          title={state.user.preferredLanguage === 'spanish' ? 'Qué NO Hacer' : 'What NOT to Do'}
          items={rightsData.whatNotToSay}
          icon={AlertTriangle}
          variant="warning"
        />
      )}
      
      {/* Share Button */}
      <ShareButton />
      
      {/* Pro Features Teaser */}
      {state.user.subscriptionStatus === 'free' && (
        <div className="card border-2 border-primary/20 bg-primary/5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-primary">Upgrade to Pro</h3>
              <p className="text-sm text-secondaryText">
                Extended recording, case history & more
              </p>
            </div>
            <button
              onClick={() => dispatch({ type: 'UPGRADE_SUBSCRIPTION' })}
              className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium"
            >
              $4.99/mo
            </button>
          </div>
        </div>
      )}
    </div>
  )
}