import React, { useState, useRef, useEffect } from 'react'
import { Menu, Sun, Moon, Bell, Search, ChevronDown, LogOut, Settings, User } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, useLocation } from 'react-router-dom'
import useThemeStore from '../../store/themeStore'
import useAuthStore from '../../store/authStore'
import useLanguageStore from '../../store/languageStore'
import { useTranslation } from '../../utils/translations'
import { notificationApi } from '../../api/index'
import { initials } from '../../utils/formatters'
import irLogo from '../../assets/images/indian_railways.png'

export default function TopBar({ onMenuClick }) {
  const { isDark, toggleTheme } = useThemeStore()
  const { user, logout } = useAuthStore()
  const { lang, toggleLang } = useLanguageStore()
  const t = useTranslation(lang)
  const navigate = useNavigate()
  const location = useLocation()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [showUserMenu, setShowUserMenu] = useState(false)
  const userMenuRef = useRef(null)

  // East Coast Railway Zonal Divisions
  const [currentDivision, setCurrentDivision] = useState('East Coast Railway (HQ-BBS)')

  const [fontScale, setFontScale] = useState(() => {
    const saved = localStorage.getItem('ams-font-scale')
    return saved ? parseFloat(saved) : 1.0
  })
  const [timeStr, setTimeStr] = useState('')

  useEffect(() => {
    document.documentElement.style.setProperty('--font-scale', fontScale)
    localStorage.setItem('ams-font-scale', fontScale)
  }, [fontScale])

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setTimeStr(now.toLocaleTimeString('en-US', { hour12: false })) // 24h format for official NOC clock
    }
    updateTime()
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [])

  const changeFont = (action) => {
    if (action === 'dec' && fontScale > 0.8) setFontScale(prev => parseFloat((prev - 0.1).toFixed(1)))
    if (action === 'reset') setFontScale(1.0)
    if (action === 'inc' && fontScale < 1.3) setFontScale(prev => parseFloat((prev + 0.1).toFixed(1)))
  }

  const { data: unreadData } = useQuery({
    queryKey: ['notifications', 'unread'],
    queryFn: () => notificationApi.getUnreadCount().then(r => r.data.data),
    refetchInterval: 30000,
  })
  const unreadCount = unreadData || 0

  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const pathnames = location.pathname.split('/').filter(x => x)

  return (
    <header
      className="fixed top-0 z-30 flex flex-col left-0 md:left-[260px] right-0"
      style={{
        height: 'var(--topbar-height)',
        background: 'rgb(var(--bg-surface))',
        borderBottom: '1px solid rgb(var(--border-color))',
        boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
      }}
    >
      {/* 1. Official Government Header Strip */}
      <div className="w-full flex items-center justify-between px-5 py-3 text-[10.5px] font-bold uppercase tracking-wider text-white select-none"
           style={{ background: 'var(--railway-crimson)', minHeight: '36px' }}>
        <div className="flex items-center gap-3 md:gap-5 flex-wrap">
          <span className="text-[9px] md:text-[10.5px]">भारत सरकार <span className="hidden sm:inline">• Government of India</span></span>
          <span className="hidden sm:inline text-white/40">|</span>
          <span className="text-[9px] md:text-[10.5px]">रेल मंत्रालय <span className="hidden sm:inline">• Ministry of Railways</span></span>
          <span className="hidden lg:inline text-white/40">|</span>
          <span className="hidden lg:inline">पूर्व तट रेलवे • East Coast Railway</span>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          {/* Live Digital Clock */}
          <span className="font-mono text-[9px] md:text-[10px] text-white/90 bg-black/25 px-1.5 py-0.5 rounded border border-white/5">{timeStr}</span>
          
          {/* Font Resizer */}
          <div className="hidden md:flex items-center bg-black/20 rounded overflow-hidden border border-white/5">
            <button onClick={() => changeFont('dec')} className="px-2 py-0.5 hover:bg-white/10 transition-colors" title="Decrease Text Size">A-</button>
            <button onClick={() => changeFont('reset')} className="px-2 py-0.5 hover:bg-white/10 border-x border-white/5 transition-colors" title="Normal Text Size">A</button>
            <button onClick={() => changeFont('inc')} className="px-2 py-0.5 hover:bg-white/10 transition-colors" title="Increase Text Size">A+</button>
          </div>

          {/* Bilingual Selector */}
          <button 
            onClick={toggleLang} 
            className="hidden md:block px-2 py-0.5 bg-black/20 rounded border border-white/5 hover:bg-white/10 transition-colors"
          >
            {lang === 'EN' ? 'हिन्दी' : 'English'}
          </button>
        </div>
      </div>

      {/* 2. Main Navigation Control Bar */}
      <div className="flex-1 flex items-center justify-between px-5">
        
        {/* Left: Mobile hamburger + ECoR Brand & Breadcrumbs */}
        <div className="flex items-center gap-4 flex-1">
          <button
            id="sidebar-menu-btn"
            onClick={onMenuClick}
            className="btn-icon md:hidden text-slate-500 hover:text-slate-900"
          >
            <Menu size={18} />
          </button>

          {/* Breadcrumbs */}
          <div className="hidden lg:flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest select-none">
            <span>ECoR-AMP HUB</span>
            {pathnames.length === 0 ? (
              <>
                <span className="text-slate-300">&rsaquo;</span>
                <span className="text-red-700 dark:text-red-400">DASHBOARD</span>
              </>
            ) : (
              pathnames.map((name, index) => {
                const isLast = index === pathnames.length - 1;
                return (
                  <React.Fragment key={name}>
                    <span className="text-slate-300">&rsaquo;</span>
                    <span className={isLast ? 'text-red-700 dark:text-red-400' : ''}>
                      {name.replace('-', ' ')}
                    </span>
                  </React.Fragment>
                );
              })
            )}
          </div>

          {/* Division Selector */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1 rounded">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider select-none">DIVISION:</span>
            <select
              value={currentDivision}
              onChange={(e) => setCurrentDivision(e.target.value)}
              className="bg-transparent text-[10px] font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer uppercase tracking-wide"
            >
              <option value="East Coast Railway (HQ-BBS)">Zonal HQ (BBS)</option>
              <option value="Khurda Road Division (KUR)">Khurda Road (KUR)</option>
              <option value="Sambalpur Division (SBP)">Sambalpur (SBP)</option>
              <option value="Waltair Division (WAT)">Waltair (WAT)</option>
            </select>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="hidden md:flex items-center relative max-w-xs flex-1 mx-4">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder={t("Search assets, divisions...")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-xs text-slate-700 dark:text-slate-300 placeholder-slate-500 focus:border-amber-600 focus:outline-none transition-all"
          />
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2">

          {/* Mobile Search Button */}
          <button
            id="mobile-search-btn"
            onClick={() => window.dispatchEvent(new CustomEvent('open-global-search'))}
            className="btn-icon w-8 h-8 rounded border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-500 hover:text-red-750 md:hidden"
            title="Search Portal"
          >
            <Search size={13} />
          </button>

          {/* Theme Switch */}
          <button
            id="theme-toggle"
            onClick={toggleTheme}
            className="btn-icon w-8 h-8 rounded border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-500 hover:text-red-700"
            title={isDark ? 'Day Theme' : 'Night Theme'}
          >
            {isDark ? <Sun size={13} /> : <Moon size={13} />}
          </button>

          {/* Notifications bell */}
          <button
            id="notifications-btn"
            className="btn-icon w-8 h-8 rounded border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 relative text-slate-500 hover:text-red-700"
            title="Notifications & Alerts"
            onClick={() => navigate('/notifications')}
          >
            <Bell size={13} />
            {unreadCount > 0 && (
              <span
                className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full text-white flex items-center justify-center font-bold border border-slate-50 dark:border-slate-900"
                style={{ background: 'var(--railway-crimson)', fontSize: '8px' }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Divider */}
          <div className="w-px h-6 bg-slate-200 dark:bg-slate-800" />

          {/* User drop menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              id="user-menu-btn"
              onClick={() => setShowUserMenu(v => !v)}
              className="flex items-center gap-2 p-1 rounded hover:bg-slate-50 dark:hover:bg-slate-900"
            >
              <div
                className="w-7 h-7 rounded text-[10px] font-bold text-white flex items-center justify-center flex-shrink-0"
                style={{ background: 'var(--railway-crimson)' }}
              >
                {initials(`${user?.firstName || ''} ${user?.lastName || ''}`)}
              </div>
              <ChevronDown size={12} className="text-slate-500 transition-transform" />
            </button>

            {/* Dropdown Options */}
            {showUserMenu && (
              <div
                className="absolute right-0 top-full mt-2 w-48 rounded border shadow-md overflow-hidden bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
              >
                <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
                  <p className="text-xs font-bold text-slate-800 dark:text-white leading-none">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-[9px] mt-1 text-slate-400 font-mono truncate leading-none">
                    {user?.email}
                  </p>
                </div>
                <button
                  onClick={() => { navigate('/settings'); setShowUserMenu(false) }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-900 text-left transition-colors"
                >
                  <Settings size={12} className="text-slate-400" />
                  {t("Settings")}
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 text-left transition-colors border-t border-slate-100 dark:border-slate-800"
                >
                  <LogOut size={12} />
                  {t("Logout")}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
