import React, { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import SmartAssistant from './SmartAssistant'
import GlobalSearchModal from './GlobalSearchModal'
import SecurityHandler from '../common/SecurityHandler'
import useThemeStore from '../../store/themeStore'
import trainWatermark from '../../assets/images/train_watermark.png'

/**
 * Main application layout — sidebar + top bar + page content.
 */
export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { isDark, initTheme } = useThemeStore()

  useEffect(() => {
    initTheme()
  }, [initTheme])

  return (
    <div className="min-h-screen bg-base relative overflow-hidden">
      {/* Tricolor top strip */}
      <div className="fixed top-0 left-0 right-0 h-1 z-50" style={{ background: 'var(--tricolor-gradient)' }} />
      
      {/* Background train watermark decorative overlay */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden flex items-center justify-center md:pl-[260px] pt-[96px]">
        <img 
          src={trainWatermark} 
          alt="Railway Background Watermark" 
          className={`w-[85%] md:w-[60%] max-w-3xl object-contain transition-all duration-300 ${
            isDark 
              ? 'opacity-[0.12] invert' 
              : 'opacity-[0.18]'
          }`} 
          style={{
            mixBlendMode: isDark ? 'screen' : 'multiply'
          }}
        />
      </div>

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <TopBar onMenuClick={() => setSidebarOpen(o => !o)} />
      
      <main className="page-container flex flex-col min-h-screen">
        <div className="page-content animate-fade-in flex-1">
          <Outlet />
        </div>
        
        {/* Premium Official Footer */}
        <footer className="py-6 border-t px-6 text-xs text-slate-500 dark:text-slate-400 bg-white/40 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/80">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-left">
              <p className="font-bold text-slate-700 dark:text-slate-300">Indian Railways Asset Management Portal (IR-AMP)</p>
              <p className="text-[10px] mt-0.5 opacity-75">Designed & Developed for Ministry of Railways, Government of India.</p>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center text-[11px] font-semibold text-slate-600 dark:text-slate-300">
              <a href="#privacy" className="hover:underline">Privacy Policy</a>
              <span>•</span>
              <a href="#terms" className="hover:underline">Terms of Service</a>
              <span>•</span>
              <a href="#security" className="hover:underline">Security Audit Policy</a>
              <span>•</span>
              <a href="#help" className="hover:underline">Help & Support</a>
            </div>
          </div>
          <p className="mt-4 text-center text-[10px] opacity-60">
            © {new Date().getFullYear()} Ministry of Railways. All Rights Reserved. (Ver 2.0.4-secure)
          </p>
        </footer>
      </main>

      <SmartAssistant />
      <GlobalSearchModal />
      <SecurityHandler />
    </div>
  )
}
