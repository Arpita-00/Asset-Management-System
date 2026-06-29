import React from 'react'
import irLogo from '../../assets/images/indian_railways.png'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('[AMS ErrorBoundary]', error, info)
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null })
    window.location.reload()
  }

  render() {
    if (!this.state.hasError) return this.props.children

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
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                   style={{ background: 'rgba(185,28,28,0.15)', border: '1px solid rgba(185,28,28,0.3)' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                  <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                </svg>
              </div>

              <h1 className="text-lg font-bold text-white mb-2">Application Error</h1>
              <p className="text-sm mb-1" style={{ color: 'rgba(160,178,200,0.85)' }}>
                An unexpected error has occurred in the Indian Railways Asset Management System.
              </p>
              <p className="text-xs mb-5" style={{ color: 'rgba(120,140,165,0.7)' }}>
                Error Reference: AMS-ERR-{Date.now().toString(36).toUpperCase()}
              </p>

              {process.env.NODE_ENV !== 'production' && this.state.error && (
                <pre className="text-xs text-left p-3 rounded-md mb-4 overflow-auto max-h-32"
                     style={{ background: 'rgba(0,0,0,0.3)', color: '#f87171', border: '1px solid rgba(185,28,28,0.2)' }}>
                  {this.state.error.message}
                </pre>
              )}

              <div className="flex gap-3">
                <button onClick={this.handleReload}
                  className="flex-1 py-2.5 rounded-md text-sm font-semibold text-white transition-all"
                  style={{ background: 'linear-gradient(135deg, #8B0000, #A52A2A)', border: '1px solid rgba(139,0,0,0.5)' }}>
                  Reload Application
                </button>
                <button onClick={() => { window.location.href = '/dashboard' }}
                  className="flex-1 py-2.5 rounded-md text-sm font-semibold transition-all"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(200,215,235,0.9)' }}>
                  Go to Dashboard
                </button>
              </div>
            </div>
          </div>

          <p className="text-xs mt-5" style={{ color: 'rgba(80,100,125,0.5)' }}>
            Indian Railways AMS &copy; {new Date().getFullYear()} | If this persists, contact system support.
          </p>
        </div>
      </div>
    )
  }
}
