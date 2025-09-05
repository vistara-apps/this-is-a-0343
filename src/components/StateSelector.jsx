import React, { useState } from 'react'
import { ChevronDown, MapPin } from 'lucide-react'
import { useApp } from '../context/AppContext'

const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
  'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
  'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
  'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
  'Wisconsin', 'Wyoming'
]

export default function StateSelector({ onStateSelected }) {
  const { state, dispatch } = useApp()
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  
  const filteredStates = US_STATES.filter(stateName =>
    stateName.toLowerCase().includes(searchTerm.toLowerCase())
  )
  
  const handleStateSelect = (selectedState) => {
    dispatch({ type: 'SET_STATE', payload: selectedState })
    setIsOpen(false)
    onStateSelected()
  }
  
  return (
    <div className="space-y-4">
      <div className="card">
        <div className="flex items-center space-x-3 mb-4">
          <MapPin className="w-6 h-6 text-primary" />
          <div>
            <h3 className="text-heading">Select Your State</h3>
            <p className="text-caption">Get location-specific legal information</p>
          </div>
        </div>
        
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-primary transition-colors"
          >
            <span className={state.user.state ? 'text-text' : 'text-secondaryText'}>
              {state.user.state || 'Choose your state...'}
            </span>
            <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {isOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-surface border border-gray-200 rounded-lg shadow-card z-50 max-h-64 overflow-hidden">
              <div className="p-3 border-b border-gray-200">
                <input
                  type="text"
                  placeholder="Search states..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-primary"
                />
              </div>
              <div className="max-h-48 overflow-y-auto">
                {filteredStates.map((stateName) => (
                  <button
                    key={stateName}
                    onClick={() => handleStateSelect(stateName)}
                    className="w-full text-left p-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                  >
                    {stateName}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {state.user.state && (
        <div className="card bg-accent/10 border border-accent/20">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-accent rounded-full"></div>
            <p className="text-sm text-accent">
              Legal information for <strong>{state.user.state}</strong> is ready
            </p>
          </div>
        </div>
      )}
    </div>
  )
}