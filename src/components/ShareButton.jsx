import React from 'react'
import { Share2, Download } from 'lucide-react'
import { useApp } from '../context/AppContext'

export default function ShareButton() {
  const { state, dispatch } = useApp()
  
  const generateSummary = () => {
    const summary = {
      state: state.user.state,
      timestamp: new Date().toISOString(),
      language: state.user.preferredLanguage,
      rights: 'Constitutional rights information accessed',
      interaction: state.currentInteraction || 'No active interaction'
    }
    
    const text = `KnowYourRights Summary
State: ${summary.state}
Time: ${new Date(summary.timestamp).toLocaleString()}
Language: ${summary.language}
Rights Accessed: ${summary.rights}
Interaction: ${summary.interaction !== 'No active interaction' ? 'Recording available' : 'No active interaction'}`
    
    return text
  }
  
  const handleShare = () => {
    const summaryText = generateSummary()
    
    if (navigator.share) {
      navigator.share({
        title: 'KnowYourRights Summary',
        text: summaryText
      })
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(summaryText).then(() => {
        dispatch({
          type: 'SHOW_MODAL',
          payload: {
            type: 'info',
            title: 'Summary Copied',
            content: 'The incident summary has been copied to your clipboard.'
          }
        })
      })
    }
  }
  
  const handleDownload = () => {
    const summaryText = generateSummary()
    const blob = new Blob([summaryText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `rights-summary-${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <button
        onClick={handleShare}
        className="btn-secondary flex items-center justify-center space-x-2"
      >
        <Share2 className="w-5 h-5" />
        <span>Share Summary</span>
      </button>
      
      <button
        onClick={handleDownload}
        className="btn-secondary flex items-center justify-center space-x-2"
      >
        <Download className="w-5 h-5" />
        <span>Download</span>
      </button>
    </div>
  )
}