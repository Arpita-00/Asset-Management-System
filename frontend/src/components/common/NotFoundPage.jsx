import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import irLogo from '../../assets/images/indian_railways.png'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4"
         style={{ background: 'linear-gradient(160deg, #0A1628 0%, #0D2044 55%, #0A1628 100%)' }}>

      {/* Gov header */}
      <div className="fixed top-0 left-0 right-0 px-6 py-2 flex items-center justify-between z-10"
           style={{ background: 'rgba(139,0,0,0.9)', borderBottom: '1px solid rgba(184,134,11,0.4)' }}>
        <span className="text-xs text-white/80 font-medium tracking-wide">Government of India</span>
        <span className="text-xs text-white/80 font-medium tracking-wide">Ministry of Railways</span>
      </div>
      <div className="fixed top-9 left-0 right-0 h-0.5 z-10"
           style={{ background: 'linear-gradient(90deg, transparent, #B8860B, transparent)' }} />

      <div className="text-center max-w-md animate-fade-in">
        <div className="flex justify-center mb-6">
          <img src={irLogo} alt="Indian Railways" className="w-20 h-20 object-contain rounded-full shadow-md" />
        </div>

        <div className="rounded-xl overflow-hidden"
             style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', backdropFilter: 'blur(16px)' }}>
          <div className="h-1" style={{ background: 'linear-gradient(90deg, #8B0000, #B8860B, #8B0000)' }} />
          <div className="p-8">

            {/* 404 number */}
            <div className="mb-4">
              <p className="text-7xl font-black leading-none" style={{ color: 'rgba(139,0,0,0.35)', letterSpacing: '-0.05em' }}>404</p>
              <div className="h-0.5 w-16 mx-auto my-3" style={{ background: 'linear-gradient(90deg, transparent, #B8860B, transparent)' }} />
            </div>

            <h1 className="text-lg font-bold text-white mb-2">Page Not Found</h1>
            <p className="text-sm mb-6" style={{ color: 'rgba(160,178,200,0.85)' }}>
              The requested page does not exist in the Indian Railways Asset Management System. Please verify the URL or navigate using the menu.
            </p>

            <div className="flex gap-3">
              <Link to="/dashboard"
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-semibold text-white transition-all"
                style={{ background: 'linear-gradient(135deg, #8B0000, #A52A2A)', border: '1px solid rgba(139,0,0,0.5)' }}>
                <ArrowLeft size={14} /> Go to Dashboard
              </Link>
              <button onClick={() => window.history.back()}
                className="flex-1 py-2.5 rounded-md text-sm font-semibold transition-all"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(200,215,235,0.9)' }}>
                Go Back
              </button>
            </div>
          </div>
        </div>

        <p className="text-xs mt-5" style={{ color: 'rgba(80,100,125,0.5)' }}>
          Indian Railways AMS &copy; {new Date().getFullYear()} | Government of India
        </p>
      </div>
    </div>
  )
}
