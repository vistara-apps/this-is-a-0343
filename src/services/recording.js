// Recording service for audio/video capture
export class RecordingService {
  constructor() {
    this.mediaRecorder = null
    this.recordedChunks = []
    this.stream = null
    this.isRecording = false
    this.recordingType = 'audio' // 'audio' or 'video'
  }

  // Check if recording is supported
  isSupported() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder)
  }

  // Request permissions for recording
  async requestPermissions(type = 'audio') {
    try {
      const constraints = {
        audio: true,
        video: type === 'video'
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      
      // Stop the stream immediately after checking permissions
      stream.getTracks().forEach(track => track.stop())
      
      return { granted: true, error: null }
    } catch (error) {
      console.error('Permission denied:', error)
      return { granted: false, error: error.message }
    }
  }

  // Start recording
  async startRecording(type = 'audio', options = {}) {
    try {
      if (this.isRecording) {
        throw new Error('Recording already in progress')
      }

      if (!this.isSupported()) {
        throw new Error('Recording not supported in this browser')
      }

      const constraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      }

      if (type === 'video') {
        constraints.video = {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        }
      }

      // Get media stream
      this.stream = await navigator.mediaDevices.getUserMedia(constraints)
      this.recordedChunks = []
      this.recordingType = type

      // Create MediaRecorder
      const mimeType = this.getSupportedMimeType(type)
      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType,
        audioBitsPerSecond: 128000,
        videoBitsPerSecond: type === 'video' ? 2500000 : undefined
      })

      // Handle data available
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.recordedChunks.push(event.data)
        }
      }

      // Handle recording stop
      this.mediaRecorder.onstop = () => {
        this.isRecording = false
        if (this.stream) {
          this.stream.getTracks().forEach(track => track.stop())
          this.stream = null
        }
      }

      // Start recording
      this.mediaRecorder.start(1000) // Collect data every second
      this.isRecording = true

      return { 
        success: true, 
        error: null,
        recordingId: Date.now().toString()
      }
    } catch (error) {
      console.error('Failed to start recording:', error)
      return { success: false, error: error.message }
    }
  }

  // Stop recording
  async stopRecording() {
    try {
      if (!this.isRecording || !this.mediaRecorder) {
        throw new Error('No recording in progress')
      }

      return new Promise((resolve) => {
        this.mediaRecorder.onstop = () => {
          this.isRecording = false
          
          // Create blob from recorded chunks
          const mimeType = this.getSupportedMimeType(this.recordingType)
          const blob = new Blob(this.recordedChunks, { type: mimeType })
          
          // Create file object
          const fileName = `recording_${Date.now()}.${this.getFileExtension(mimeType)}`
          const file = new File([blob], fileName, { type: mimeType })
          
          // Clean up
          if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop())
            this.stream = null
          }
          
          resolve({
            success: true,
            file,
            blob,
            duration: this.getRecordingDuration(),
            size: blob.size,
            type: this.recordingType
          })
        }

        this.mediaRecorder.stop()
      })
    } catch (error) {
      console.error('Failed to stop recording:', error)
      return { success: false, error: error.message }
    }
  }

  // Pause recording
  pauseRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.pause()
      return { success: true }
    }
    return { success: false, error: 'No active recording to pause' }
  }

  // Resume recording
  resumeRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state === 'paused') {
      this.mediaRecorder.resume()
      return { success: true }
    }
    return { success: false, error: 'No paused recording to resume' }
  }

  // Get supported MIME type
  getSupportedMimeType(type) {
    const types = type === 'video' 
      ? ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm', 'video/mp4']
      : ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4']

    for (const mimeType of types) {
      if (MediaRecorder.isTypeSupported(mimeType)) {
        return mimeType
      }
    }

    return type === 'video' ? 'video/webm' : 'audio/webm'
  }

  // Get file extension from MIME type
  getFileExtension(mimeType) {
    const extensions = {
      'video/webm': 'webm',
      'video/mp4': 'mp4',
      'audio/webm': 'webm',
      'audio/ogg': 'ogg',
      'audio/mp4': 'm4a'
    }
    
    return extensions[mimeType.split(';')[0]] || 'webm'
  }

  // Get recording duration (approximate)
  getRecordingDuration() {
    // This is a simple approximation - in a real app you'd track time more precisely
    return this.recordedChunks.length * 1000 // milliseconds
  }

  // Get current recording state
  getRecordingState() {
    return {
      isRecording: this.isRecording,
      state: this.mediaRecorder?.state || 'inactive',
      type: this.recordingType,
      chunksCount: this.recordedChunks.length
    }
  }

  // Clean up resources
  cleanup() {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop()
    }
    
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop())
      this.stream = null
    }
    
    this.recordedChunks = []
    this.isRecording = false
    this.mediaRecorder = null
  }
}

// Location service for getting user's current location
export const locationService = {
  // Get current position
  async getCurrentPosition() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'))
        return
      }

      const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000 // Cache for 1 minute
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          })
        },
        (error) => {
          reject(new Error(`Location error: ${error.message}`))
        },
        options
      )
    })
  },

  // Get address from coordinates (reverse geocoding)
  async getAddressFromCoords(latitude, longitude) {
    try {
      // Using a free geocoding service (in production, use a proper service)
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
      )
      
      if (!response.ok) {
        throw new Error('Failed to get address')
      }
      
      const data = await response.json()
      return {
        address: data.display_name || `${latitude}, ${longitude}`,
        city: data.city || data.locality,
        state: data.principalSubdivision,
        country: data.countryName
      }
    } catch (error) {
      console.error('Geocoding error:', error)
      return {
        address: `${latitude}, ${longitude}`,
        city: 'Unknown',
        state: 'Unknown',
        country: 'Unknown'
      }
    }
  },

  // Watch position for continuous tracking
  watchPosition(callback, errorCallback) {
    if (!navigator.geolocation) {
      errorCallback(new Error('Geolocation is not supported'))
      return null
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 30000
    }

    return navigator.geolocation.watchPosition(
      (position) => {
        callback({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        })
      },
      errorCallback,
      options
    )
  },

  // Stop watching position
  clearWatch(watchId) {
    if (watchId && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchId)
    }
  }
}

// Emergency alert service
export const alertService = {
  // Send emergency alert to trusted contacts
  async sendEmergencyAlert(contacts, location, message = 'Emergency alert from KnowYourRights Card') {
    try {
      const alertData = {
        timestamp: new Date().toISOString(),
        location: location,
        message: message,
        userAgent: navigator.userAgent,
        url: window.location.href
      }

      // In a real app, this would send through your backend
      // For demo purposes, we'll simulate the alert
      const results = await Promise.allSettled(
        contacts.map(contact => this.sendAlert(contact, alertData))
      )

      const successful = results.filter(r => r.status === 'fulfilled').length
      const failed = results.filter(r => r.status === 'rejected').length

      return {
        success: true,
        sent: successful,
        failed: failed,
        total: contacts.length
      }
    } catch (error) {
      console.error('Failed to send emergency alerts:', error)
      return { success: false, error: error.message }
    }
  },

  // Send individual alert (demo implementation)
  async sendAlert(contact, alertData) {
    // This would integrate with SMS/email services in production
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`Alert sent to ${contact.name} (${contact.phone || contact.email})`, alertData)
        resolve({ success: true, contact })
      }, 1000)
    })
  }
}
