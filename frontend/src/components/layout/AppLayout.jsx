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
        <footer className="py-8 border-t px-6 text-xs bg-slate-50/90 dark:bg-slate-900/60 border-slate-300 dark:border-slate-800/80 transition-colors duration-150">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 text-left">
            
            {/* Zonal Branding Column */}
            <div className="md:col-span-6 space-y-2">
              <p className="text-sm font-black text-slate-800 dark:text-slate-200 tracking-wide uppercase">
                EAST COAST RAILWAY • पूर्व तट रेलवे
              </p>
              <p className="text-[11px] font-bold text-[#7c0a0a] dark:text-amber-500 uppercase tracking-widest">
                Asset Management Platform (ECoR-AMP)
              </p>
              <p className="text-[10px] text-slate-600 dark:text-slate-400 font-semibold max-w-md leading-relaxed">
                Designed & Developed for Ministry of Railways, Government of India. Real-time divisional command and monitoring dashboard.
              </p>
            </div>

            {/* Official Policies Column */}
            <div className="md:col-span-3 space-y-2.5">
              <p className="text-[10px] font-black uppercase text-slate-700 dark:text-slate-350 tracking-wider">
                Official Policies
              </p>
              <div className="flex flex-col gap-1.5 font-bold text-slate-600 dark:text-slate-300 text-[11px]">
                <a href="#privacy" className="hover:text-[#7c0a0a] dark:hover:text-amber-500 transition-colors hover:underline">Privacy Policy</a>
                <a href="#terms" className="hover:text-[#7c0a0a] dark:hover:text-amber-500 transition-colors hover:underline">Terms of Service</a>
                <a href="#security" className="hover:text-[#7c0a0a] dark:hover:text-amber-500 transition-colors hover:underline">Security Audit Policy</a>
              </div>
            </div>

            {/* Support Column */}
            <div className="md:col-span-3 space-y-2.5">
              <p className="text-[10px] font-black uppercase text-slate-700 dark:text-slate-350 tracking-wider">
                Support & Helpdesk
              </p>
              <div className="flex flex-col gap-1.5 font-bold text-slate-600 dark:text-slate-300 text-[11px]">
                <a href="#help" className="hover:text-[#7c0a0a] dark:hover:text-amber-500 transition-colors hover:underline">Help & Support Directory</a>
                <a href="#contact" className="hover:text-[#7c0a0a] dark:hover:text-amber-500 transition-colors hover:underline">Zonal Division HQ (BBS)</a>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>NOC Gateway: Online</span>
                </div>
              </div>
            </div>

          </div>

          {/* Copyright Divider Bar */}
          <div className="max-w-7xl mx-auto mt-6 pt-5 border-t border-slate-200 dark:border-slate-800/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] text-slate-500 dark:text-slate-450 font-bold select-none">
            <p>
              © {new Date().getFullYear()} Ministry of Railways. All Rights Reserved. (ECoR division HQ-BBS)
            </p>
            <p className="font-mono">
              Ver 2.0.4-secure • STQC Certified Portal
            </p>
          </div>
        </footer>
      </main>

      <SmartAssistant />
      <GlobalSearchModal />
      <SecurityHandler />
    </div>
  )
}
