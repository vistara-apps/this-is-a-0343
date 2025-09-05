import React from 'react'
import { Menu, Settings, User } from 'lucide-react'
import { useApp } from '../context/AppContext'

export default function Header() {
  const { state } = useApp()
  
  return (
    <header className="flex items-center justify-between py-4 border-b border-gray-200">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">KR</span>
        </div>
        <div>
          <h2 className="font-semibold text-text">KnowYourRights</h2>
          {state.user.state && (
            <p className="text-xs text-secondaryText">{state.user.state}</p>
          )}
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <Settings className="w-5 h-5 text-secondaryText" />
        </button>
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <User className="w-5 h-5 text-secondaryText" />
        </button>
      </div>
    </header>
  )
}