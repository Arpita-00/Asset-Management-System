import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Sparkles, X, Search, ArrowRight, Package, FileSpreadsheet, 
  Scan, Upload, Wrench, ShieldAlert, LayoutDashboard, Cpu, 
  TrendingUp, Activity, ShieldCheck, HelpCircle, Terminal,
  Bot, Send, Loader, MessageSquare
} from 'lucide-react'
import { demoAssets } from '../../api/mockData'
import useThemeStore from '../../store/themeStore'
import { aiApi } from '../../api/index'
import Markdown from '../../utils/markdown'

const FLOATING_SUGGESTED = [
  'Show assets under repair',
  'Which warranties expire soon?',
  'Suggest preventive maintenance',
  'Give me an asset summary'
]

export default function SmartAssistant() {
  const navigate = useNavigate()
  const { isDark } = useThemeStore()
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('chat') // 'chat' | 'search'
  
  // ─── Search tab states ───
  const [searchQuery, setSearchQuery] = useState('')
  const [pulseCount, setPulseCount] = useState(0)
  const panelRef = useRef(null)

  // ─── Chat tab states ───
  const [chatMessages, setChatMessages] = useState([
    {
      role: 'ai',
      content: 'Hello! I\'m your ECoR AI Asset Assistant.\n\nAsk me anything about maintenance requests, available categories, expiring warranties, or critical replacements.',
      timestamp: new Date()
    }
  ])
  const [chatInput, setChatInput] = useState('')
  const [isAiLoading, setIsAiLoading] = useState(false)
  const chatEndRef = useRef(null)

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (activeTab === 'chat') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [chatMessages, activeTab])

  // Floating pulse trigger every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setPulseCount(prev => prev + 1)
    }, 6000)
    return () => clearInterval(timer)
  }, [])

  // Close panel on pressing Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Focus inputs on opening panel or changing tabs
  const searchInputRef = useRef(null)
  const chatInputRef = useRef(null)
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        if (activeTab === 'search' && searchInputRef.current) {
          searchInputRef.current.focus()
        } else if (activeTab === 'chat' && chatInputRef.current) {
          chatInputRef.current.focus()
        }
      }, 150)
    }
  }, [isOpen, activeTab])

  // Click outside listener to dismiss panel
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isOpen && panelRef.current && !panelRef.current.contains(e.target) && !e.target.closest('.smart-assistant-fab')) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  // Instant Local Search Logic (Filters across multiple fields)
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []
    const query = searchQuery.toLowerCase().trim()
    return demoAssets.filter(asset => {
      return (
        (asset.name && asset.name.toLowerCase().includes(query)) ||
        (asset.assetTag && asset.assetTag.toLowerCase().includes(query)) ||
        (asset.brand && asset.brand.toLowerCase().includes(query)) ||
        (asset.model && asset.model.toLowerCase().includes(query)) ||
        (asset.departmentName && asset.departmentName.toLowerCase().includes(query)) ||
        (asset.assignedToName && asset.assignedToName.toLowerCase().includes(query)) ||
        (asset.categoryName && asset.categoryName.toLowerCase().includes(query)) ||
        (asset.status && asset.status.toLowerCase().includes(query))
      )
    }).slice(0, 15) // Limit to top 15 results for performance
  }, [searchQuery])

  // Quick Action Handler
  const handleQuickAction = (path) => {
    navigate(path)
    setIsOpen(false)
  }

  // Highlights matched text in search results
  const highlightText = (text, query) => {
    if (!text || !query) return text
    const parts = String(text).split(new RegExp(`(${query})`, 'gi'))
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === query.toLowerCase() 
            ? <mark key={i} className="bg-yellow-500/30 text-yellow-250 px-0.5 rounded">{part}</mark>
            : part
        )}
      </span>
    )
  }

  // ─── AI Chat send method ───
  const handleSendChatMessage = async (textVal) => {
    const msg = textVal || chatInput.trim()
    if (!msg || isAiLoading) return

    setChatMessages(prev => [...prev, { role: 'user', content: msg, timestamp: new Date() }])
    setChatInput('')
    setIsAiLoading(true)

    try {
      const response = await aiApi.chat(msg)
      const resData = response.data
      setChatMessages(prev => [...prev, {
        role: 'ai',
        content: resData.data?.message || resData.message || 'Sorry, I could not generate a response.',
        timestamp: new Date()
      }])
    } catch (err) {
      setChatMessages(prev => [...prev, {
        role: 'ai',
        content: 'Error communicating with AI service. Please verify your connection.',
        timestamp: new Date(),
        isError: true
      }])
    } finally {
      setIsAiLoading(false)
    }
  }

  const handleChatKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSendChatMessage()
    }
  }

  return (
    <>
      {/* ─── FLOATING ACTION BUTTON (FAB) ────────────────────────────────────── */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50 smart-assistant-fab group">
          {/* Subtle pulse ring ring animated */}
          <span 
            key={pulseCount} 
            className="absolute -inset-1.5 rounded-full bg-blue-600/25 animate-ping opacity-75 pointer-events-none" 
            style={{ animationDuration: '2s' }}
          />
          <button 
            onClick={() => setIsOpen(true)}
            className="relative w-14 h-14 rounded-full bg-gradient-to-tr from-[#7c0a0a] to-rose-600 text-white flex items-center justify-center shadow-[0_4px_20px_rgba(124,10,10,0.6)] hover:scale-110 hover:shadow-[0_4px_25px_rgba(124,10,10,0.9)] transition-all duration-300 border border-rose-500/20 active:scale-95 animate-fade-in"
            aria-label="Smart Asset Assistant"
          >
            <Sparkles className="w-6 h-6 animate-pulse text-amber-300" />
          </button>
          
          {/* Tooltip */}
          <div className="absolute right-16 top-1/2 -translate-y-1/2 bg-slate-900 border border-slate-800/80 text-white text-[11px] font-black uppercase tracking-wider py-1.5 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl pointer-events-none select-none">
            Smart Asset Assistant
          </div>
        </div>
      )}

      {/* ─── SLIDE-OUT PANEL ─────────────────────────────────────────────────── */}
      <div 
        ref={panelRef}
        className={`fixed z-50 shadow-2xl flex flex-col transition-all duration-300 ease-in-out select-none max-md:border md:border-0 md:border-l
          md:top-0 md:right-0 md:h-screen md:w-[400px] md:rounded-none
          max-md:bottom-6 max-md:right-6 max-md:h-[500px] max-md:max-h-[calc(100vh-100px)] max-md:w-[350px] max-md:max-w-[calc(100vw-48px)] max-md:rounded-xl
          ${
          isDark 
            ? 'bg-[#0B101E] border-slate-800 text-slate-105' 
            : 'bg-white border-slate-200 text-slate-800'
        } ${
          isOpen ? 'translate-x-0 pointer-events-auto opacity-100' : 'translate-x-full pointer-events-none opacity-0 md:opacity-100'
        }`}
      >
        {/* Panel Header */}
        <div className={`p-4 flex items-center justify-between border-b ${
          isDark ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-slate-50/80'
        }`}>
          <div className="flex items-center gap-2.5 text-left">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#7c0a0a] to-rose-600 flex items-center justify-center text-white flex-shrink-0">
              <Bot size={16} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 leading-none">
                <h2 className="text-xs font-black uppercase tracking-wider">
                  ECoR Assistant
                </h2>
                <span className="px-1.5 py-0.5 text-[8.5px] font-black uppercase tracking-widest text-amber-500 bg-amber-500/10 border border-amber-500/20 rounded">
                  Gemini
                </span>
              </div>
              <p className="text-[10px] font-semibold text-slate-450 leading-none mt-1">
                Railway Decision Support
              </p>
            </div>
          </div>

          <button 
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-lg hover:bg-slate-800/20 text-slate-400 hover:text-slate-200 transition-colors"
            title="Close Assistant"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab Selector */}
        <div className={`px-4 py-2 border-b flex items-center justify-between text-xs select-none ${
          isDark ? 'border-slate-800 bg-slate-900/30' : 'border-slate-200 bg-slate-50/40'
        }`}>
          <div className={`flex rounded-lg p-0.5 border ${
            isDark ? 'bg-slate-950/80 border-slate-850' : 'bg-slate-100 border-slate-200'
          }`}>
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-3 py-1.5 rounded font-bold uppercase tracking-wider transition-all text-[9px] ${
                activeTab === 'chat'
                  ? 'bg-[#7c0a0a] text-white shadow-sm'
                  : 'text-slate-550 hover:text-slate-800 dark:hover:text-slate-350'
              }`}
            >
              AI Chat
            </button>
            <button
              onClick={() => setActiveTab('search')}
              className={`px-3 py-1.5 rounded font-bold uppercase tracking-wider transition-all text-[9px] ${
                activeTab === 'search'
                  ? 'bg-[#7c0a0a] text-white shadow-sm'
                  : 'text-slate-550 hover:text-slate-800 dark:hover:text-slate-350'
              }`}
            >
              Lookup
            </button>
          </div>
          <span className="text-[9.5px] font-bold text-emerald-500 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live DB Sync
          </span>
        </div>

        {/* ─── TAB 1: Conversational AI Chat ─────────────────────────────────── */}
        {activeTab === 'chat' && (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Scrollable messages area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-left">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'ai' && (
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#7c0a0a] to-rose-600 flex items-center justify-center text-white flex-shrink-0 text-[10px] font-bold">
                      AI
                    </div>
                  )}
                  <div className={`p-3 rounded-xl max-w-[85%] text-xs shadow-sm leading-normal ${
                    msg.role === 'user'
                      ? 'bg-[#7c0a0a] text-white rounded-tr-none'
                      : isDark
                      ? 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                      : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-none'
                  }`}>
                    {msg.role === 'ai' ? (
                      <Markdown content={msg.content} />
                    ) : (
                      <p className="font-semibold">{msg.content}</p>
                    )}
                  </div>
                </div>
              ))}

              {isAiLoading && (
                <div className="flex gap-2.5 justify-start">
                  <div className="w-6 h-6 rounded-lg bg-[#7c0a0a] flex items-center justify-center text-white text-[10px] font-bold">
                    AI
                  </div>
                  <div className={`p-3 rounded-xl rounded-tl-none text-xs flex items-center gap-1.5 ${
                    isDark ? 'bg-slate-900 border border-slate-800 text-slate-400' : 'bg-slate-50 border border-slate-200 text-slate-550'
                  }`}>
                    <Loader size={11} className="animate-spin text-red-700" />
                    <span className="font-bold">Syncing RAG results...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Quick suggested prompt chips */}
            {chatMessages.length <= 2 && !isAiLoading && (
              <div className="px-4 py-2 flex flex-wrap gap-1.5 justify-start">
                {FLOATING_SUGGESTED.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendChatMessage(q)}
                    className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 border rounded-lg transition-all ${
                      isDark 
                        ? 'bg-slate-900 border-slate-800 hover:border-rose-500 text-slate-350 hover:text-white'
                        : 'bg-slate-50 border-slate-250 hover:border-[#7c0a0a] text-slate-700 hover:text-[#7c0a0a]'
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input Bar */}
            <div className={`p-3 border-t flex items-center gap-2 ${
              isDark ? 'border-slate-800 bg-slate-950/20' : 'border-slate-250 bg-slate-50/50'
            }`}>
              <input
                ref={chatInputRef}
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={handleChatKeyDown}
                placeholder="Ask AI about assets..."
                className={`flex-1 px-3 py-2 rounded-lg text-xs focus:outline-none border ${
                  isDark
                    ? 'bg-slate-950 border-slate-800 text-white focus:border-rose-500'
                    : 'bg-white border-slate-250 text-slate-900 focus:border-[#7c0a0a]'
                }`}
                maxLength={500}
                disabled={isAiLoading}
              />
              <button
                onClick={() => handleSendChatMessage()}
                disabled={!chatInput.trim() || isAiLoading}
                className="btn-primary p-2.5 rounded-lg flex-shrink-0 flex items-center justify-center disabled:opacity-50"
              >
                <Send size={12} />
              </button>
            </div>
          </div>
        )}

        {/* ─── TAB 2: Offline Quick Directory Lookup ─────────────────────────── */}
        {activeTab === 'search' && (
          <div className="flex-1 overflow-y-auto p-5 space-y-6 flex flex-col min-h-0">
            {/* Smart Search Bar */}
            <div className="space-y-2 flex-shrink-0">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block text-left">
                Quick Directory Lookup
              </label>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-450" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tags, departments, status..."
                  className={`w-full pl-9 pr-8 py-2 rounded-lg text-xs focus:outline-none transition-colors border ${
                    isDark 
                      ? 'bg-slate-950/80 border-slate-800 text-white placeholder-slate-650 focus:border-[#3b82f6]' 
                      : 'bg-slate-50/80 border-slate-250 text-slate-900 placeholder-slate-400 focus:border-[#1E3A8A] focus:bg-white'
                  }`}
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-450 hover:text-red-500 text-[10px] font-bold"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Conditional Display: Search Results vs Home State */}
            <div className="flex-1 overflow-y-auto min-h-0">
              {searchQuery.trim() ? (
                /* Search results */
                <div className="space-y-3.5 text-left">
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-450 border-b pb-1.5 border-slate-800/40">
                    <span>Search Results</span>
                    <span>{searchResults.length} Match{searchResults.length !== 1 ? 'es' : ''}</span>
                  </div>
                  
                  {searchResults.length > 0 ? (
                    <div className="space-y-2.5">
                      {searchResults.map((asset) => (
                        <div 
                          key={asset.id} 
                          onClick={() => handleQuickAction(`/assets/${asset.id}`)}
                          className={`p-3 rounded-lg border text-left flex flex-col justify-between hover:border-[#7c0a0a]/50 cursor-pointer transition-all ${
                            isDark ? 'bg-slate-950/40 border-slate-850 hover:bg-slate-900/60' : 'bg-slate-50 border-slate-200 hover:bg-white'
                          }`}
                        >
                          <div className="flex justify-between items-start gap-2">
                            <span className={`text-xs font-bold leading-tight min-w-0 break-words ${isDark ? 'text-white' : 'text-slate-800'}`}>
                              {highlightText(asset.name, searchQuery)}
                            </span>
                            <span className={`text-[8.5px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                              asset.status === 'AVAILABLE'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : asset.status === 'ASSIGNED'
                                ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            }`}>
                              {asset.status}
                            </span>
                          </div>
                          
                          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-[10px] text-slate-400 font-medium">
                            <span>Tag: <span className="font-mono">{highlightText(asset.assetTag, searchQuery)}</span></span>
                            <span>&bull;</span>
                            <span>Dept: {highlightText(asset.departmentName, searchQuery)}</span>
                          </div>
                          
                          {asset.location && (
                            <div className="text-[9.5px] text-slate-500 mt-1 font-semibold">
                              Loc: {asset.location}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center space-y-2">
                      <p className="text-xs text-slate-550 font-semibold">No assets match your query.</p>
                      <button 
                        onClick={() => handleQuickAction('/assets')} 
                        className="text-[10px] font-bold uppercase tracking-wider text-rose-500 hover:underline"
                      >
                        View Complete Inventory
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* Home Screen State */
                <div className="space-y-5">
                  {/* Welcome Info Board */}
                  <div className={`p-4 rounded-xl border border-blue-900/20 bg-blue-950/10 text-left space-y-2`}>
                    <div className="flex items-center gap-1.5 text-blue-400">
                      <Terminal size={14} />
                      <h4 className="text-[10px] font-black uppercase tracking-widest">
                        Zonal Support Portal Active
                      </h4>
                    </div>
                    <p className="text-[11px] font-semibold text-slate-300 leading-normal">
                      Welcome to the ECoR Asset Assistant. Look up assets locally or trigger operational pages instantly. Select the **AI Chat** tab to consult the Gemini RAG model.
                    </p>
                  </div>

                  {/* Quick Actions Grid */}
                  <div className="space-y-2 text-left">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Command Quick Actions
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: 'Search Assets', path: '/assets', icon: Package },
                        { label: 'Generate Report', path: '/reports', icon: FileSpreadsheet },
                        { label: 'QR Scanner', path: '/qr-scanner', icon: Scan },
                        { label: 'Upload Invoice', path: '/ocr-scanner', icon: Upload },
                        { label: 'Maintenance Log', path: '/maintenance', icon: Wrench },
                        { label: 'Dashboard Control', path: '/dashboard', icon: LayoutDashboard },
                      ].map((act, idx) => {
                        const ActIcon = act.icon
                        return (
                          <button
                            key={idx}
                            onClick={() => handleQuickAction(act.path)}
                            className={`p-2.5 rounded-lg border text-left text-[10.5px] font-bold transition-all duration-155 hover:-translate-y-0.5 hover:shadow flex items-center gap-2 ${
                              isDark 
                                ? 'bg-slate-900/60 border-slate-800/80 text-slate-200 hover:border-slate-700' 
                                : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-white hover:border-slate-350'
                            }`}
                          >
                            <ActIcon size={14} className="text-[#3b82f6] flex-shrink-0" />
                            <span className="truncate">{act.label}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Capabilities preview */}
                  <div className="space-y-2.5 text-left">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Supported Features
                    </h3>
                    <div className="space-y-2">
                      {[
                        { title: 'Natural Language Search', desc: 'Query database records using plain conversational English.' },
                        { title: 'Predictive Maintenance', desc: 'Predict equipment degradation indices using duty cycles.' },
                        { title: 'Smart Recommendations', desc: 'Automated advice on replacement timelines based on ledger cost values.' },
                        { title: 'Executive Analytics', desc: 'Generate multi-dimensional cost summaries dynamically.' },
                      ].map((feat, idx) => (
                        <div 
                          key={idx} 
                          className={`p-3 rounded-lg border text-left space-y-1 ${
                            isDark ? 'bg-slate-950/30 border-slate-850' : 'bg-slate-50/50 border-slate-200'
                          }`}
                        >
                          <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                            <span className="w-1 h-2 rounded bg-amber-500" />
                            {feat.title}
                          </h4>
                          <p className="text-[10.5px] font-medium text-slate-450 leading-relaxed pl-2.5">
                            {feat.desc}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </>
  )
}
