import React, { createContext, useContext, useReducer } from 'react'

const AppContext = createContext()

const initialState = {
  user: {
    userId: null,
    email: null,
    state: null,
    preferredLanguage: 'english',
    trustedContacts: [],
    subscriptionStatus: 'free'
  },
  currentInteraction: null,
  isRecording: false,
  showModal: false,
  modalContent: null
}

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_STATE':
      return {
        ...state,
        user: { ...state.user, state: action.payload }
      }
    case 'SET_LANGUAGE':
      return {
        ...state,
        user: { ...state.user, preferredLanguage: action.payload }
      }
    case 'START_RECORDING':
      return {
        ...state,
        isRecording: true,
        currentInteraction: {
          interactionId: Date.now(),
          timestamp: new Date().toISOString(),
          location: 'Current Location', // Would use geolocation API
          recordingUrl: null,
          notes: '',
          incidentSummary: null
        }
      }
    case 'STOP_RECORDING':
      return {
        ...state,
        isRecording: false
      }
    case 'SHOW_MODAL':
      return {
        ...state,
        showModal: true,
        modalContent: action.payload
      }
    case 'HIDE_MODAL':
      return {
        ...state,
        showModal: false,
        modalContent: null
      }
    case 'UPGRADE_SUBSCRIPTION':
      return {
        ...state,
        user: { ...state.user, subscriptionStatus: 'pro' }
      }
    default:
      return state
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState)
  
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}