import React from 'react'

export default function InfoCard({ title, items, icon: Icon, variant = 'default' }) {
  const variantStyles = {
    default: 'bg-surface border-gray-200',
    success: 'bg-green-50 border-green-200',
    warning: 'bg-amber-50 border-amber-200'
  }
  
  const iconStyles = {
    default: 'text-primary',
    success: 'text-green-600',
    warning: 'text-amber-600'
  }
  
  return (
    <div className={`card border-2 ${variantStyles[variant]}`}>
      <div className="flex items-center space-x-3 mb-4">
        <Icon className={`w-6 h-6 ${iconStyles[variant]}`} />
        <h3 className="text-heading">{title}</h3>
      </div>
      
      <ul className="space-y-3">
        {items.map((item, index) => (
          <li key={index} className="flex items-start space-x-3">
            <div className={`w-2 h-2 rounded-full mt-2.5 flex-shrink-0 ${
              variant === 'success' ? 'bg-green-500' :
              variant === 'warning' ? 'bg-amber-500' : 'bg-primary'
            }`}></div>
            <span className="text-body">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}