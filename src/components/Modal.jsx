import React, { useEffect } from 'react'
import { X } from 'lucide-react'
import { useApp } from '../context/AppContext'

export default function Modal() {
  const { state, dispatch } = useApp()
  
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        dispatch({ type: 'HIDE_MODAL' })
      }
    }
    
    if (state.showModal) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [state.showModal, dispatch])
  
  if (!state.showModal) return null
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-surface rounded-xl shadow-card max-w-md w-full animate-fade-in">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-heading">{state.modalContent?.title}</h3>
          <button
            onClick={() => dispatch({ type: 'HIDE_MODAL' })}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6">
          <p className="text-body mb-6">{state.modalContent?.content}</p>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => dispatch({ type: 'HIDE_MODAL' })}
              className="btn-secondary"
            >
              Close
            </button>
            
            {state.modalContent?.type === 'upgrade' && (
              <button
                onClick={() => {
                  dispatch({ type: 'UPGRADE_SUBSCRIPTION' })
                  dispatch({ type: 'HIDE_MODAL' })
                }}
                className="btn-primary"
              >
                Upgrade Now
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}