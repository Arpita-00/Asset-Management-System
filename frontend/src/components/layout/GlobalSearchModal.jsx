import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Search, X, Database, Users, Wrench, Building2, 
  ArrowRight, ShieldAlert, Sparkles 
} from 'lucide-react'
import { demoAssets, demoEmployees, demoMaintenance } from '../../api/mockData'
import useThemeStore from '../../store/themeStore'

export default function GlobalSearchModal() {
  const navigate = useNavigate()
  const { isDark } = useThemeStore()
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      const saved = localStorage.getItem('recentSearches')
      return saved ? JSON.parse(saved) : ['Siemens', 'Trimble', 'AST-2026-000001']
    } catch {
      return ['Siemens', 'Trimble', 'AST-2026-000001']
    }
  })

  const modalRef = useRef(null)
  const inputRef = useRef(null)

  // Listen for Ctrl+K (or Cmd+K) to toggle search
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setIsOpen(prev => !prev)
      }
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }
    window.addEventListener('keydown', handleGlobalKeyDown)
    return () => window.removeEventListener('keydown', handleGlobalKeyDown)
  }, [])

  // Auto-focus search input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    } else {
      setQuery('')
    }
  }, [isOpen])

  // Click outside listener
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (isOpen && modalRef.current && !modalRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [isOpen])

  // Save query to recent searches
  const saveRecent = (searchTerm) => {
    if (!searchTerm.trim()) return
    const updated = [searchTerm.trim(), ...recentSearches.filter(s => s !== searchTerm.trim())].slice(0, 5)
    setRecentSearches(updated)
    localStorage.setItem('recentSearches', JSON.stringify(updated))
  }

  // Handle result selection
  const handleSelectResult = (path, name) => {
    saveRecent(name)
    navigate(path)
    setIsOpen(false)
  }

  // Real-time categorized query filter
  const results = useMemo(() => {
    if (!query.trim()) return { assets: [], staff: [], tickets: [] }
    const q = query.toLowerCase().trim()

    const assets = demoAssets.filter(a => 
      a.name?.toLowerCase().includes(q) ||
      a.assetTag?.toLowerCase().includes(q) ||
      a.brand?.toLowerCase().includes(q) ||
      a.categoryName?.toLowerCase().includes(q)
    ).slice(0, 5)

    const staff = demoEmployees.filter(e => 
      e.firstName?.toLowerCase().includes(q) ||
      e.lastName?.toLowerCase().includes(q) ||
      e.employeeCode?.toLowerCase().includes(q) ||
      e.designation?.toLowerCase().includes(q)
    ).slice(0, 4)

    const tickets = demoMaintenance.filter(m => 
      m.assetName?.toLowerCase().includes(q) ||
      m.maintenanceType?.toLowerCase().includes(q) ||
      m.technician?.toLowerCase().includes(q)
    ).slice(0, 4)

    return { assets, staff, tickets }
  }, [query])

  const hasResults = results.assets.length > 0 || results.staff.length > 0 || results.tickets.length > 0

  // Highlights matched query text
  const highlightMatch = (text, q) => {
    if (!text || !q) return text
    const parts = String(text).split(new RegExp(`(${q})`, 'gi'))
    return (
      <span>
        {parts.map((p, idx) => 
          p.toLowerCase() === q.toLowerCase() 
            ? <mark key={idx} className="bg-amber-500/25 text-amber-200 px-0.5 rounded font-bold">{p}</mark>
            : p
        )}
      </span>
    )
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-55 flex items-start justify-center pt-24 px-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in select-none">
      <div 
        ref={modalRef}
        className={`w-full max-w-lg rounded-2xl border shadow-2xl flex flex-col overflow-hidden transition-all duration-150 ${
          isDark 
            ? 'bg-[#0B101E] border-slate-800 text-slate-100' 
            : 'bg-white border-slate-250 text-slate-900'
        }`}
      >
        {/* Search Input Bar */}
        <div className={`p-4 border-b relative flex items-center gap-3 ${
          isDark ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-slate-50'
        }`}>
          <Search size={16} className="text-slate-450" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search assets, tag codes, employees, tickets..."
            className={`w-full bg-transparent text-xs focus:outline-none placeholder-slate-500 text-left ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          />
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 rounded border border-slate-800 bg-slate-950/80 text-[9px] font-mono font-bold text-slate-500">
            ESC
          </kbd>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1 rounded hover:bg-slate-800/10 text-slate-500 hover:text-slate-350 transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Search Results Area */}
        <div className="flex-1 overflow-y-auto max-h-[350px] p-4 space-y-5">
          
          {query.trim() ? (
            /* Results Available State */
            hasResults ? (
              <div className="space-y-4 text-left">
                {/* Assets Category */}
                {results.assets.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5 pl-1.5">
                      <Database size={11} className="text-blue-500" />
                      <span>Matching Fleet Assets</span>
                    </span>
                    <div className="space-y-1">
                      {results.assets.map(asset => (
                        <div
                          key={asset.id}
                          onClick={() => handleSelectResult(`/assets/${asset.id}`, asset.name)}
                          className={`p-2.5 rounded-lg text-xs font-bold text-left flex justify-between items-center cursor-pointer transition-all hover:translate-x-1 ${
                            isDark ? 'hover:bg-slate-900/60 hover:text-[#3b82f6]' : 'hover:bg-slate-100 hover:text-[#1E3A8A]'
                          }`}
                        >
                          <div className="min-w-0 pr-4">
                            <div className="text-white truncate font-bold">{highlightMatch(asset.name, query)}</div>
                            <div className="text-[10px] text-slate-500 mt-0.5 font-mono">{highlightMatch(asset.assetTag, query)} &bull; {asset.categoryName}</div>
                          </div>
                          <ArrowRight size={12} className="text-slate-655 flex-shrink-0" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Employees Category */}
                {results.staff.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5 pl-1.5">
                      <Users size={11} className="text-emerald-500" />
                      <span>Matching Personnel</span>
                    </span>
                    <div className="space-y-1">
                      {results.staff.map(emp => (
                        <div
                          key={emp.id}
                          onClick={() => handleSelectResult('/employees', `${emp.firstName} ${emp.lastName}`)}
                          className={`p-2.5 rounded-lg text-xs font-bold text-left flex justify-between items-center cursor-pointer transition-all hover:translate-x-1 ${
                            isDark ? 'hover:bg-slate-900/60 hover:text-[#3b82f6]' : 'hover:bg-slate-100 hover:text-[#1E3A8A]'
                          }`}
                        >
                          <div>
                            <div className="text-white font-bold">{highlightMatch(`${emp.firstName} ${emp.lastName}`, query)}</div>
                            <div className="text-[10px] text-slate-500 mt-0.5 font-mono">{highlightMatch(emp.employeeCode, query)} &bull; {emp.designation}</div>
                          </div>
                          <ArrowRight size={12} className="text-slate-655 flex-shrink-0" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Maintenance Log Category */}
                {results.tickets.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5 pl-1.5">
                      <Wrench size={11} className="text-amber-500" />
                      <span>Maintenance Tickets</span>
                    </span>
                    <div className="space-y-1">
                      {results.tickets.map(ticket => (
                        <div
                          key={ticket.id}
                          onClick={() => handleSelectResult('/maintenance', ticket.assetName)}
                          className={`p-2.5 rounded-lg text-xs font-bold text-left flex justify-between items-center cursor-pointer transition-all hover:translate-x-1 ${
                            isDark ? 'hover:bg-slate-900/60 hover:text-[#3b82f6]' : 'hover:bg-slate-100 hover:text-[#1E3A8A]'
                          }`}
                        >
                          <div>
                            <div className="text-white font-bold">{highlightMatch(ticket.assetName, query)}</div>
                            <div className="text-[10px] text-slate-500 mt-0.5 font-mono">{highlightMatch(ticket.maintenanceType, query)} &bull; {ticket.technician}</div>
                          </div>
                          <ArrowRight size={12} className="text-slate-655 flex-shrink-0" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            ) : (
              /* No Search Results Page */
              <div className="py-10 text-center space-y-2">
                <ShieldAlert size={26} className="mx-auto text-slate-600 animate-bounce" />
                <p className="text-xs font-bold text-white uppercase tracking-wider">No results matched your search</p>
                <p className="text-[10.5px] text-slate-500 font-semibold">Try querying another brand name, tag ID, or division desk name.</p>
              </div>
            )
          ) : (
            /* Home / Default State (Recent Queries list) */
            <div className="space-y-4 text-left">
              <div>
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 block mb-2 pl-1">
                  Recent Zonal Lookups
                </span>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((rec, i) => (
                    <button
                      key={i}
                      onClick={() => setQuery(rec)}
                      className={`px-3 py-1.5 rounded-lg border text-[10.5px] font-bold tracking-wide transition-all ${
                        isDark 
                          ? 'bg-slate-900 border-slate-800 text-slate-350 hover:bg-slate-800 hover:text-white' 
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-white hover:border-slate-350'
                      }`}
                    >
                      {rec}
                    </button>
                  ))}
                </div>
              </div>

              {/* System Tips block */}
              <div className={`p-4 rounded-xl border border-blue-900/10 bg-blue-950/10 flex items-start gap-3`}>
                <Sparkles size={14} className="text-amber-300 mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-400">
                    Search Hotline Tips
                  </h4>
                  <p className="text-[10.5px] font-semibold text-slate-400 leading-relaxed">
                    Instantly retrieve Signal Controllers, Point Machines, or CCTV assets from anywhere by pressing <kbd className="font-mono bg-slate-950/80 px-1 py-0.5 border border-slate-800 rounded text-white text-[9.5px]">Ctrl + K</kbd> to toggle the search overlay.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
