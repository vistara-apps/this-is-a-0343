import React, { useState, useEffect } from 'react'
import { Calendar, MapPin, Clock, Download, Share2, Eye, Trash2 } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { interactionService } from '../services/supabase'
import { aiService } from '../services/openai'

export default function InteractionHistory() {
  const { state, actions } = useApp()
  const [selectedInteraction, setSelectedInteraction] = useState(null)
  const [loading, setLoading] = useState(false)

  // Load interaction history on mount
  useEffect(() => {
    if (state.user.isAuthenticated) {
      loadInteractionHistory()
    }
  }, [state.user.isAuthenticated])

  const loadInteractionHistory = async () => {
    setLoading(true)
    try {
      const { data, error } = await interactionService.getUserInteractions(state.user.userId)
      if (data) {
        actions.dispatch({ type: 'SET_INTERACTION_HISTORY', payload: data })
      }
    } catch (error) {
      console.error('Failed to load interaction history:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDuration = (milliseconds) => {
    if (!milliseconds) return 'Unknown'
    const seconds = Math.floor(milliseconds / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const handleGenerateSummary = async (interaction) => {
    if (!interaction.incidentSummary) {
      setLoading(true)
      try {
        const { data: summary } = await aiService.generateIncidentSummary(
          interaction,
          state.user.preferredLanguage
        )
        
        if (summary) {
          // Update interaction with summary
          const updatedInteraction = { ...interaction, incidentSummary: summary }
          await interactionService.updateInteraction(interaction.interactionId, {
            incidentSummary: summary
          })
          
          // Update local state
          const updatedHistory = state.interactionHistory.map(item =>
            item.interactionId === interaction.interactionId ? updatedInteraction : item
          )
          actions.dispatch({ type: 'SET_INTERACTION_HISTORY', payload: updatedHistory })
        }
      } catch (error) {
        actions.showModal({
          type: 'error',
          title: 'Summary Generation Failed',
          content: 'Unable to generate incident summary. Please try again later.'
        })
      } finally {
        setLoading(false)
      }
    }
  }

  const handleShareInteraction = (interaction) => {
    const shareData = {
      title: 'KnowYourRights Interaction Summary',
      text: interaction.incidentSummary || `Police interaction on ${formatDate(interaction.timestamp)} at ${interaction.location}`,
      url: window.location.href
    }

    if (navigator.share) {
      navigator.share(shareData)
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareData.text).then(() => {
        actions.showModal({
          type: 'success',
          title: 'Copied to Clipboard',
          content: 'Interaction summary has been copied to your clipboard.'
        })
      })
    }
  }

  const handleDeleteInteraction = async (interactionId) => {
    actions.showModal({
      type: 'confirm',
      title: 'Delete Interaction',
      content: 'Are you sure you want to delete this interaction? This action cannot be undone.',
      onConfirm: async () => {
        try {
          // In a real app, you'd call an API to delete
          const updatedHistory = state.interactionHistory.filter(
            item => item.interactionId !== interactionId
          )
          actions.dispatch({ type: 'SET_INTERACTION_HISTORY', payload: updatedHistory })
          
          actions.showModal({
            type: 'success',
            title: 'Interaction Deleted',
            content: 'The interaction has been removed from your history.'
          })
        } catch (error) {
          actions.showModal({
            type: 'error',
            title: 'Delete Failed',
            content: 'Unable to delete interaction. Please try again.'
          })
        }
      }
    })
  }

  if (!state.user.isAuthenticated) {
    return (
      <div className="card text-center py-8">
        <Calendar className="w-12 h-12 text-secondaryText mx-auto mb-4" />
        <h3 className="font-bold text-text mb-2">Sign In Required</h3>
        <p className="text-body">
          Please sign in to view your interaction history
        </p>
      </div>
    )
  }

  if (loading && state.interactionHistory.length === 0) {
    return (
      <div className="card text-center py-8">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-body">Loading your interaction history...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-heading">Interaction History</h2>
          <p className="text-body">
            Your recorded police interactions and documentation
          </p>
        </div>
        {state.user.subscriptionStatus === 'free' && (
          <div className="text-right">
            <p className="text-sm text-secondaryText">Free users: Last 3 interactions</p>
            <button
              onClick={actions.upgradeSubscription}
              className="text-sm text-primary hover:underline"
            >
              Upgrade for full history
            </button>
          </div>
        )}
      </div>

      {state.interactionHistory.length === 0 ? (
        <div className="card text-center py-8">
          <Calendar className="w-12 h-12 text-secondaryText mx-auto mb-4" />
          <h3 className="font-bold text-text mb-2">No Interactions Yet</h3>
          <p className="text-body mb-4">
            Your recorded police interactions will appear here
          </p>
          <p className="text-caption">
            Use the "Record Interaction" feature to start documenting encounters
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {state.interactionHistory
            .slice(0, state.user.subscriptionStatus === 'free' ? 3 : undefined)
            .map((interaction) => (
              <div key={interaction.interactionId} className="card">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span className="font-medium text-text">
                        {formatDate(interaction.timestamp)}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        interaction.status === 'completed' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {interaction.status}
                      </span>
                    </div>

                    <div className="space-y-1 text-sm text-secondaryText">
                      {interaction.location && (
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4" />
                          <span>{interaction.location}</span>
                        </div>
                      )}
                      
                      {interaction.duration && (
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4" />
                          <span>Duration: {formatDuration(interaction.duration)}</span>
                        </div>
                      )}

                      {interaction.recordingType && (
                        <div className="flex items-center space-x-2">
                          <span className="w-4 h-4 flex items-center justify-center">
                            {interaction.recordingType === 'video' ? '🎥' : '🎤'}
                          </span>
                          <span>{interaction.recordingType} recording</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedInteraction(
                        selectedInteraction?.interactionId === interaction.interactionId 
                          ? null 
                          : interaction
                      )}
                      className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                      title="View details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {interaction.recordingUrl && (
                      <a
                        href={interaction.recordingUrl}
                        download
                        className="p-2 text-accent hover:bg-accent/10 rounded-lg transition-colors"
                        title="Download recording"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    )}

                    <button
                      onClick={() => handleShareInteraction(interaction)}
                      className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Share interaction"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDeleteInteraction(interaction.interactionId)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete interaction"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {selectedInteraction?.interactionId === interaction.interactionId && (
                  <div className="border-t pt-4 space-y-4">
                    {interaction.notes && (
                      <div>
                        <h4 className="font-medium text-text mb-2">Notes</h4>
                        <p className="text-body">{interaction.notes}</p>
                      </div>
                    )}

                    {interaction.coordinates && (
                      <div>
                        <h4 className="font-medium text-text mb-2">Coordinates</h4>
                        <p className="text-body">
                          {interaction.coordinates.latitude}, {interaction.coordinates.longitude}
                        </p>
                      </div>
                    )}

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-text">Incident Summary</h4>
                        {!interaction.incidentSummary && (
                          <button
                            onClick={() => handleGenerateSummary(interaction)}
                            disabled={loading}
                            className="px-3 py-1 text-sm bg-primary text-white rounded-lg hover:opacity-90 disabled:opacity-50"
                          >
                            {loading ? 'Generating...' : 'Generate Summary'}
                          </button>
                        )}
                      </div>
                      
                      {interaction.incidentSummary ? (
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-body whitespace-pre-wrap">
                            {interaction.incidentSummary}
                          </p>
                        </div>
                      ) : (
                        <p className="text-secondaryText italic">
                          No summary generated yet
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
        </div>
      )}
    </div>
  )
}
