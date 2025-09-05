import React from 'react'

export default function QuickActionBtn({ variant, icon: Icon, label, onClick, disabled = false }) {
  const variantStyles = {
    record: 'bg-red-500 hover:bg-red-600 text-white',
    alert: 'bg-accent hover:bg-accent/90 text-white'
  }
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${variantStyles[variant]} p-4 rounded-lg font-medium shadow-card transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      <div className="flex flex-col items-center space-y-2">
        <Icon className="w-8 h-8" />
        <span className="text-sm font-medium">{label}</span>
      </div>
    </button>
  )
}