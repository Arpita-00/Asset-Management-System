import React from 'react'
import irLogo from '../../assets/images/indian_railways.png'

/**
 * Full-page loading spinner — used as React.Suspense fallback.
 */
export default function PageLoader({ message = 'Loading...' }) {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center z-50"
         style={{ background: 'linear-gradient(160deg, #0A1628 0%, #0D2044 55%, #0A1628 100%)' }}>
      <div className="text-center animate-fade-in">
        {/* Spinning logo ring */}
        <div className="relative w-20 h-20 mx-auto mb-5">
          <div className="absolute inset-0 rounded-full border-4 border-transparent animate-spin"
               style={{ borderTopColor: '#8B0000', borderRightColor: 'rgba(184,134,11,0.4)', animationDuration: '1s' }} />
          <div className="absolute inset-2 rounded-full flex items-center justify-center">
            <img src={irLogo} alt="IR" className="w-full h-full object-contain rounded-full shadow-sm" />
          </div>
        </div>
        <p className="text-sm font-medium" style={{ color: 'rgba(160,178,200,0.9)' }}>{message}</p>
        <p className="text-xs mt-1" style={{ color: 'rgba(100,120,145,0.6)' }}>Indian Railways Asset Management System</p>
      </div>
    </div>
  )
}

/**
 * Inline content loading spinner (smaller, for card-level).
 */
export function InlineLoader({ message = 'Loading data...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="relative w-12 h-12 mb-3">
        <div className="absolute inset-0 rounded-full border-3 border-transparent animate-spin"
             style={{ borderTopColor: '#8B0000', borderWidth: '3px', animationDuration: '1s' }} />
        <div className="absolute inset-1.5 rounded-full flex items-center justify-center">
          <img src={irLogo} alt="IR" className="w-full h-full object-contain rounded-full shadow-sm" />
        </div>
      </div>
      <p className="text-xs" style={{ color: 'rgb(var(--text-muted))' }}>{message}</p>
    </div>
  )
}
