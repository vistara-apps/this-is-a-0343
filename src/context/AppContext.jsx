import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { authService, userService, interactionService } from '../services/supabase'
import { aiService, fallbackData } from '../services/openai'
import { RecordingService, locationService, alertService } from '../services/recording'
import { paymentService, demoPayment } from '../services/stripe'

const AppContext = createContext()

const initialState = {
  // User data
  user: {
    userId: null,
    email: null,
    state: null,
    preferredLanguage: 'english',
    trustedContacts: [],
    subscriptionStatus: 'free',
    isAuthenticated: false
  },
  
  // Current interaction
  currentInteraction: null,
  interactionHistory: [],
  
  // Recording state
  isRecording: false,
  recordingType: 'audio',
  recordingService: null,
  
  // Location data
  currentLocation: null,
  locationWatchId: null,
  
  // UI state
  showModal: false,
  modalContent: null,
  loading: false,
  error: null,
  
  // Rights data
  stateRights: null,
  rightsLoading: false,
  
  // App state
  isOnline: navigator.onLine,
  permissions: {
    microphone: null,
    camera: null,
    location: null
  }
}

function appReducer(state, action) {
  switch (action.type) {
    // User actions
    case 'SET_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      }
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
    case 'SET_TRUSTED_CONTACTS':
      return {
        ...state,
        user: { ...state.user, trustedContacts: action.payload }
      }
    case 'AUTHENTICATE_USER':
      return {
        ...state,
        user: { 
          ...state.user, 
          ...action.payload,
          isAuthenticated: true 
        }
      }
    case 'LOGOUT_USER':
      return {
        ...initialState,
        recordingService: state.recordingService
      }

    // Recording actions
    case 'SET_RECORDING_SERVICE':
      return {
        ...state,
        recordingService: action.payload
      }
    case 'START_RECORDING':
      return {
        ...state,
        isRecording: true,
        recordingType: action.payload?.type || 'audio',
        currentInteraction: {
          interactionId: Date.now(),
          userId: state.user.userId,
          timestamp: new Date().toISOString(),
          location: state.currentLocation?.address || 'Unknown Location',
          coordinates: state.currentLocation ? {
            latitude: state.currentLocation.latitude,
            longitude: state.currentLocation.longitude
          } : null,
          recordingUrl: null,
          recordingType: action.payload?.type || 'audio',
          notes: '',
          incidentSummary: null,
          status: 'recording'
        }
      }
    case 'STOP_RECORDING':
      return {
        ...state,
        isRecording: false,
        currentInteraction: state.currentInteraction ? {
          ...state.currentInteraction,
          status: 'completed',
          endTime: new Date().toISOString(),
          recordingUrl: action.payload?.recordingUrl
        } : null
      }
    case 'UPDATE_INTERACTION':
      return {
        ...state,
        currentInteraction: state.currentInteraction ? {
          ...state.currentInteraction,
          ...action.payload
        } : null
      }
    case 'ADD_TO_HISTORY':
      return {
        ...state,
        interactionHistory: [action.payload, ...state.interactionHistory],
        currentInteraction: null
      }
    case 'SET_INTERACTION_HISTORY':
      return {
        ...state,
        interactionHistory: action.payload
      }

    // Location actions
    case 'SET_LOCATION':
      return {
        ...state,
        currentLocation: action.payload
      }
    case 'SET_LOCATION_WATCH':
      return {
        ...state,
        locationWatchId: action.payload
      }

    // Rights data actions
    case 'SET_RIGHTS_LOADING':
      return {
        ...state,
        rightsLoading: action.payload
      }
    case 'SET_STATE_RIGHTS':
      return {
        ...state,
        stateRights: action.payload,
        rightsLoading: false
      }

    // UI actions
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      }
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false
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

    // Subscription actions
    case 'UPGRADE_SUBSCRIPTION':
      return {
        ...state,
        user: { ...state.user, subscriptionStatus: 'pro' }
      }
    case 'SET_SUBSCRIPTION_STATUS':
      return {
        ...state,
        user: { ...state.user, subscriptionStatus: action.payload }
      }

    // Permission actions
    case 'SET_PERMISSION':
      return {
        ...state,
        permissions: {
          ...state.permissions,
          [action.payload.type]: action.payload.granted
        }
      }

    // Network status
    case 'SET_ONLINE_STATUS':
      return {
        ...state,
        isOnline: action.payload
      }

    default:
      return state
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  // Initialize recording service
  useEffect(() => {
    const recordingService = new RecordingService()
    dispatch({ type: 'SET_RECORDING_SERVICE', payload: recordingService })

    // Cleanup on unmount
    return () => {
      recordingService.cleanup()
    }
  }, [])

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => dispatch({ type: 'SET_ONLINE_STATUS', payload: true })
    const handleOffline = () => dispatch({ type: 'SET_ONLINE_STATUS', payload: false })

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      const { user } = await authService.getCurrentUser()
      if (user) {
        // Get user profile
        const { data: profile } = await userService.getProfile(user.id)
        dispatch({
          type: 'AUTHENTICATE_USER',
          payload: {
            userId: user.id,
            email: user.email,
            ...profile
          }
        })
      }
    }

    checkAuth()

    // Listen for auth changes
    const { data: { subscription } } = authService.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const { data: profile } = await userService.getProfile(session.user.id)
        dispatch({
          type: 'AUTHENTICATE_USER',
          payload: {
            userId: session.user.id,
            email: session.user.email,
            ...profile
          }
        })
      } else if (event === 'SIGNED_OUT') {
        dispatch({ type: 'LOGOUT_USER' })
      }
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  // Enhanced action creators
  const actions = {
    // Authentication actions
    async signUp(email, password, userData = {}) {
      dispatch({ type: 'SET_LOADING', payload: true })
      try {
        const { user, error } = await authService.signUp(email, password, userData)
        if (error) throw new Error(error)
        
        // Create user profile
        if (user) {
          await userService.upsertProfile(user.id, {
            email: user.email,
            ...userData
          })
        }
        
        dispatch({ type: 'SET_LOADING', payload: false })
        return { success: true, user }
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message })
        return { success: false, error: error.message }
      }
    },

    async signIn(email, password) {
      dispatch({ type: 'SET_LOADING', payload: true })
      try {
        const { user, error } = await authService.signIn(email, password)
        if (error) throw new Error(error)
        
        dispatch({ type: 'SET_LOADING', payload: false })
        return { success: true, user }
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message })
        return { success: false, error: error.message }
      }
    },

    async signOut() {
      const { error } = await authService.signOut()
      if (!error) {
        dispatch({ type: 'LOGOUT_USER' })
      }
      return { success: !error, error }
    },

    // State and rights actions
    async selectState(stateName) {
      dispatch({ type: 'SET_STATE', payload: stateName })
      dispatch({ type: 'SET_RIGHTS_LOADING', payload: true })
      
      try {
        // Try to get from database first
        const { data: dbRights } = await stateLawService.getStateLaws(stateName)
        
        if (dbRights) {
          dispatch({ type: 'SET_STATE_RIGHTS', payload: dbRights })
        } else {
          // Generate using AI if not in database
          const { data: aiRights, error } = await aiService.generateStateRights(
            stateName, 
            state.user.preferredLanguage
          )
          
          if (aiRights) {
            dispatch({ type: 'SET_STATE_RIGHTS', payload: aiRights })
          } else {
            // Fallback to default rights
            dispatch({ type: 'SET_STATE_RIGHTS', payload: fallbackData.defaultRights })
          }
        }
      } catch (error) {
        dispatch({ type: 'SET_STATE_RIGHTS', payload: fallbackData.defaultRights })
        console.error('Failed to load state rights:', error)
      }
    },

    // Recording actions
    async startRecording(type = 'audio') {
      if (!state.recordingService) {
        dispatch({ 
          type: 'SET_ERROR', 
          payload: 'Recording service not initialized' 
        })
        return { success: false }
      }

      // Check permissions first
      const { granted } = await state.recordingService.requestPermissions(type)
      if (!granted) {
        dispatch({ 
          type: 'SET_ERROR', 
          payload: 'Recording permission denied' 
        })
        return { success: false }
      }

      // Get current location
      try {
        const location = await locationService.getCurrentPosition()
        const address = await locationService.getAddressFromCoords(
          location.latitude, 
          location.longitude
        )
        dispatch({ type: 'SET_LOCATION', payload: { ...location, ...address } })
      } catch (error) {
        console.warn('Could not get location:', error)
      }

      // Start recording
      const result = await state.recordingService.startRecording(type)
      if (result.success) {
        dispatch({ type: 'START_RECORDING', payload: { type } })
      } else {
        dispatch({ type: 'SET_ERROR', payload: result.error })
      }
      
      return result
    },

    async stopRecording() {
      if (!state.recordingService || !state.isRecording) {
        return { success: false, error: 'No recording in progress' }
      }

      const result = await state.recordingService.stopRecording()
      if (result.success) {
        // Upload recording if user is authenticated
        let recordingUrl = null
        if (state.user.isAuthenticated && state.currentInteraction) {
          const { data: uploadResult } = await interactionService.uploadRecording(
            result.file,
            state.currentInteraction.interactionId
          )
          recordingUrl = uploadResult?.url
        }

        dispatch({ 
          type: 'STOP_RECORDING', 
          payload: { recordingUrl } 
        })

        // Save interaction to database
        if (state.user.isAuthenticated && state.currentInteraction) {
          const interactionData = {
            ...state.currentInteraction,
            recordingUrl,
            duration: result.duration,
            fileSize: result.size
          }
          
          const { data: savedInteraction } = await interactionService.createInteraction(interactionData)
          if (savedInteraction) {
            dispatch({ type: 'ADD_TO_HISTORY', payload: savedInteraction })
          }
        }
      }
      
      return result
    },

    // Emergency alert actions
    async sendEmergencyAlert() {
      if (!state.user.trustedContacts.length) {
        dispatch({
          type: 'SHOW_MODAL',
          payload: {
            type: 'error',
            title: 'No Trusted Contacts',
            content: 'Please add trusted contacts in your profile to send emergency alerts.'
          }
        })
        return { success: false }
      }

      try {
        const location = state.currentLocation || await locationService.getCurrentPosition()
        const result = await alertService.sendEmergencyAlert(
          state.user.trustedContacts,
          location,
          `Emergency alert from ${state.user.email || 'KnowYourRights user'}`
        )

        dispatch({
          type: 'SHOW_MODAL',
          payload: {
            type: 'success',
            title: 'Emergency Alert Sent',
            content: `Alert sent to ${result.sent} of ${result.total} contacts.`
          }
        })

        return result
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message })
        return { success: false, error: error.message }
      }
    },

    // Subscription actions
    async upgradeSubscription() {
      dispatch({ type: 'SET_LOADING', payload: true })
      
      try {
        // Use demo payment for development
        const result = await demoPayment.processUpgrade(state.user.userId)
        
        if (result.success) {
          dispatch({ type: 'UPGRADE_SUBSCRIPTION' })
          dispatch({
            type: 'SHOW_MODAL',
            payload: {
              type: 'success',
              title: 'Upgrade Successful!',
              content: 'You now have access to Pro features including recording capabilities.'
            }
          })
        }
        
        dispatch({ type: 'SET_LOADING', payload: false })
        return result
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message })
        return { success: false, error: error.message }
      }
    },

    // Utility actions
    clearError() {
      dispatch({ type: 'SET_ERROR', payload: null })
    },

    showModal(content) {
      dispatch({ type: 'SHOW_MODAL', payload: content })
    },

    hideModal() {
      dispatch({ type: 'HIDE_MODAL' })
    },

    setLanguage(language) {
      dispatch({ type: 'SET_LANGUAGE', payload: language })
    },

    updateTrustedContacts(contacts) {
      dispatch({ type: 'SET_TRUSTED_CONTACTS', payload: contacts })
      
      // Save to database if authenticated
      if (state.user.isAuthenticated) {
        userService.updateTrustedContacts(state.user.userId, contacts)
      }
    }
  }
  
  return (
    <AppContext.Provider value={{ state, dispatch, actions }}>
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
