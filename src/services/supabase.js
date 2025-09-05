import { createClient } from '@supabase/supabase-js'

// Environment variables - these would be set in production
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseKey)

// User management functions
export const authService = {
  // Sign up new user
  async signUp(email, password, userData = {}) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      })
      
      if (error) throw error
      return { user: data.user, error: null }
    } catch (error) {
      return { user: null, error: error.message }
    }
  },

  // Sign in user
  async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) throw error
      return { user: data.user, error: null }
    } catch (error) {
      return { user: null, error: error.message }
    }
  },

  // Sign out user
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      return { error: null }
    } catch (error) {
      return { error: error.message }
    }
  },

  // Get current user
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) throw error
      return { user, error: null }
    } catch (error) {
      return { user: null, error: error.message }
    }
  },

  // Listen to auth changes
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback)
  }
}

// User profile functions
export const userService = {
  // Create or update user profile
  async upsertProfile(userId, profileData) {
    try {
      const { data, error } = await supabase
        .from('users')
        .upsert({
          user_id: userId,
          ...profileData,
          updated_at: new Date().toISOString()
        })
        .select()
        .single()
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error: error.message }
    }
  },

  // Get user profile
  async getProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', userId)
        .single()
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error: error.message }
    }
  },

  // Update trusted contacts
  async updateTrustedContacts(userId, contacts) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ trusted_contacts: contacts })
        .eq('user_id', userId)
        .select()
        .single()
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error: error.message }
    }
  }
}

// Interaction management functions
export const interactionService = {
  // Create new interaction
  async createInteraction(interactionData) {
    try {
      const { data, error } = await supabase
        .from('interactions')
        .insert({
          ...interactionData,
          created_at: new Date().toISOString()
        })
        .select()
        .single()
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error: error.message }
    }
  },

  // Update interaction
  async updateInteraction(interactionId, updates) {
    try {
      const { data, error } = await supabase
        .from('interactions')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('interaction_id', interactionId)
        .select()
        .single()
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error: error.message }
    }
  },

  // Get user interactions
  async getUserInteractions(userId, limit = 10) {
    try {
      const { data, error } = await supabase
        .from('interactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error: error.message }
    }
  },

  // Upload recording file
  async uploadRecording(file, interactionId) {
    try {
      const fileName = `recordings/${interactionId}/${Date.now()}-${file.name}`
      
      const { data, error } = await supabase.storage
        .from('recordings')
        .upload(fileName, file)
      
      if (error) throw error
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('recordings')
        .getPublicUrl(fileName)
      
      return { data: { path: fileName, url: publicUrl }, error: null }
    } catch (error) {
      return { data: null, error: error.message }
    }
  }
}

// State laws data functions
export const stateLawService = {
  // Get state-specific rights and scripts
  async getStateLaws(stateName) {
    try {
      const { data, error } = await supabase
        .from('state_laws')
        .select('*')
        .eq('state_name', stateName)
        .single()
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error: error.message }
    }
  },

  // Get all available states
  async getAllStates() {
    try {
      const { data, error } = await supabase
        .from('state_laws')
        .select('state_name')
        .order('state_name')
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error: error.message }
    }
  }
}
