import React, { useState, useMemo, useEffect } from 'react'
import { 
  ChevronDown, ChevronUp, SlidersHorizontal, EyeOff, 
  Download, Search, Info, HelpCircle, FileSpreadsheet, Trash2 
} from 'lucide-react'
import useThemeStore from '../../store/themeStore'

export default function EnterpriseTable({
  data = [],
  columns = [],
  isLoading = false,
  emptyMessage = 'No records found',
  bulkActions = [],
  exportFilename = 'table_export',
  searchPlaceholder = 'Quick search...',
  onRowClick
}) {
  const { isDark } = useThemeStore()
  
  // ─── STATE MANAGEMENT ──────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIds, setSelectedIds] = useState([])
  const [sortKey, setSortKey] = useState('')
  const [sortOrder, setSortOrder] = useState('asc') // 'asc' | 'desc'
  const [visibleCols, setVisibleCols] = useState(() => columns.map(c => c.key))
  const [colWidths, setColWidths] = useState({})
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [showColMenu, setShowColMenu] = useState(false)
  const [filters, setFilters] = useState({}) // { columnKey: filterValue }

  // Auto-reset selection on data change
  useEffect(() => {
    setSelectedIds([])
  }, [data])

  // Reset page on search change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, filters])

  // Column resize mouse drag listener
  const handleResizeStart = (key, e) => {
    e.preventDefault()
    const startX = e.clientX
    const startWidth = colWidths[key] || 150
    
    const handleMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX
      setColWidths(prev => ({
        ...prev,
        [key]: Math.max(80, startWidth + deltaX)
      }))
    }
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
    
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  // Column visibility checklist toggler
  const toggleColVisibility = (key) => {
    setVisibleCols(prev => 
      prev.includes(key)
        ? prev.filter(k => k !== key && prev.length > 1) // prevent hiding all columns
        : [...prev, key]
    )
  }

  // Filter options auto-calculated from data values
  const filterOptions = useMemo(() => {
    const opts = {}
    columns.forEach(col => {
      if (col.filterable) {
        const uniqueVals = Array.from(new Set(data.map(item => item[col.key]).filter(Boolean)))
        opts[col.key] = uniqueVals
      }
    })
    return opts
  }, [data, columns])

  // Filter/Sort/Search processed dataset
  const processedData = useMemo(() => {
    let result = [...data]

    // 1. Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter(item => {
        return columns.some(col => {
          const val = item[col.key]
          return val && String(val).toLowerCase().includes(q)
        })
      })
    }

    // 2. Column Filters
    Object.keys(filters).forEach(key => {
      const val = filters[key]
      if (val) {
        result = result.filter(item => String(item[key]) === String(val))
      }
    })

    // 3. Sorting
    if (sortKey) {
      result.sort((a, b) => {
        let valA = a[sortKey]
        let valB = b[sortKey]
        
        if (typeof valA === 'string') valA = valA.toLowerCase()
        if (typeof valB === 'string') valB = valB.toLowerCase()

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1
        return 0
      })
    }

    return result
  }, [data, columns, searchQuery, filters, sortKey, sortOrder])

  // Pagination Slice
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return processedData.slice(startIndex, startIndex + pageSize)
  }, [processedData, currentPage, pageSize])

  const totalPages = Math.ceil(processedData.length / pageSize)

  // Selection handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(paginatedData.map(item => item.id || item.assetTag))
    } else {
      setSelectedIds([])
    }
  }

  const handleSelectRow = (id, e) => {
    e.stopPropagation()
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  // Export selected rows as CSV locally
  const exportSelectedCSV = () => {
    if (selectedIds.length === 0) return
    const selectedRows = data.filter(item => selectedIds.includes(item.id || item.assetTag))
    
    // Build CSV content
    const headers = columns.filter(c => visibleCols.includes(c.key)).map(c => c.header)
    const rows = selectedRows.map(item => {
      return columns.filter(c => visibleCols.includes(c.key)).map(c => {
        return `"${String(item[c.key] || '').replace(/"/g, '""')}"`
      }).join(',')
    })
    
    const csvContent = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.setAttribute('download', `${exportFilename}_selected.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-4 text-left select-none text-xs">
      
      {/* ─── TABLE TOP BAR CONTROL RIBBON ────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Search Input bar */}
        <div className="relative w-full sm:w-72">
          <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className={`w-full pl-9 pr-4 py-2 rounded-lg text-xs focus:outline-none transition-colors border ${
              isDark 
                ? 'bg-slate-950/80 border-slate-800 text-white focus:border-blue-500' 
                : 'bg-slate-50/85 border-slate-250 text-slate-900 focus:border-[#7c0a0a] focus:bg-white shadow-inner'
            }`}
          />
        </div>

        {/* Toggles Panel */}
        <div className="flex items-center gap-2.5 self-start sm:self-center">
          
          {/* Column filters dropdown selectors */}
          {Object.keys(filterOptions).map(colKey => {
            const col = columns.find(c => c.key === colKey)
            return (
              <select
                key={colKey}
                value={filters[colKey] || ''}
                onChange={e => setFilters(f => ({ ...f, [colKey]: e.target.value || undefined }))}
                className={`py-1.5 px-3 rounded-lg border text-xs leading-none focus:outline-none transition-colors ${
                  isDark 
                    ? 'bg-slate-900 border-slate-800 text-slate-300' 
                    : 'bg-white border-slate-250 text-slate-700 shadow-sm'
                }`}
              >
                <option value="">Filter {col.header}</option>
                {filterOptions[colKey].map(val => (
                  <option key={val} value={val}>{val}</option>
                ))}
              </select>
            )
          })}

          {/* Visibility select dropdown button */}
          <div className="relative">
            <button
              onClick={() => setShowColMenu(s => !s)}
              className={`py-1.5 px-3 rounded-lg border text-xs flex items-center gap-1.5 transition-all select-none ${
                isDark 
                  ? 'bg-slate-900 border-slate-800 text-slate-350 hover:text-white' 
                  : 'bg-white border-slate-250 text-slate-655 hover:bg-slate-50 hover:text-slate-900 shadow-sm'
              }`}
            >
              <SlidersHorizontal size={12} />
              <span>Columns</span>
            </button>
            
            {showColMenu && (
              <div 
                className={`absolute right-0 mt-1.5 w-44 rounded-lg border shadow-xl p-2.5 space-y-1.5 z-30 transition-all ${
                  isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-250 text-slate-800'
                }`}
              >
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 block mb-1 border-b pb-1 border-slate-850">
                  Toggle Columns
                </span>
                {columns.map(col => (
                  <label key={col.key} className="flex items-center gap-2 cursor-pointer text-xs font-bold text-left">
                    <input
                      type="checkbox"
                      checked={visibleCols.includes(col.key)}
                      onChange={() => toggleColVisibility(col.key)}
                      className="accent-[#7c0a0a] rounded cursor-pointer"
                    />
                    <span>{col.header}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ─── BULK ACTIONS BAR (appears overlay at the top when items are selected) ─── */}
      {selectedIds.length > 0 && (
        <div className={`p-3 rounded-lg border flex items-center justify-between gap-4 animate-fade-in ${
          isDark ? 'bg-blue-950/20 border-blue-900/40 text-blue-300' : 'bg-blue-50 border-blue-100 text-blue-800'
        }`}>
          <div className="flex items-center gap-2 font-bold select-none">
            <Info size={14} className="text-[#3b82f6]" />
            <span>{selectedIds.length} Record{selectedIds.length !== 1 ? 's' : ''} Selected</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={exportSelectedCSV}
              className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold uppercase text-[10.5px] flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <FileSpreadsheet size={12} />
              <span>Export CSV</span>
            </button>
            
            {bulkActions.map((act, i) => (
              <button
                key={i}
                onClick={() => {
                  act.action(selectedIds)
                  setSelectedIds([])
                }}
                className={`px-3 py-1.5 rounded font-bold uppercase text-[10.5px] flex items-center gap-1.5 transition-colors shadow-sm ${
                  act.variant === 'danger'
                    ? 'bg-rose-600 hover:bg-rose-500 text-white'
                    : 'bg-slate-800 hover:bg-slate-700 text-white'
                }`}
              >
                <span>{act.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ─── DATA TABLE FRAMEWORK ────────────────────────────────────────────── */}
      <div className={`border rounded-xl overflow-hidden shadow-sm select-none ${
        isDark ? 'border-slate-850 bg-slate-900/30' : 'bg-white/82 border-slate-200'
      }`}>
        <div className="hidden md:block overflow-x-auto max-h-[500px]">
          <table className="w-full border-collapse text-left text-xs font-semibold">
            
            {/* Sticky Table Header */}
            <thead>
              <tr className={`border-b text-[10px] uppercase tracking-wider select-none ${
                isDark ? 'border-slate-850 bg-slate-950/65 text-slate-450' : 'bg-slate-50 text-slate-550 border-slate-200'
              }`}>
                <th className="py-3 px-4 w-10 text-center md:sticky md:left-0 z-20" style={{ background: 'rgb(var(--bg-elevated))' }}>
                  <input
                    type="checkbox"
                    checked={paginatedData.length > 0 && paginatedData.every(item => selectedIds.includes(item.id || item.assetTag))}
                    onChange={handleSelectAll}
                    className="accent-[#7c0a0a] rounded cursor-pointer w-3.5 h-3.5"
                  />
                </th>

                {/* Data column headers */}
                {columns.filter(c => visibleCols.includes(c.key)).map((col, idx) => {
                  const isSorted = sortKey === col.key
                  const width = colWidths[col.key] || col.width || 150
                  
                  return (
                    <th 
                      key={col.key} 
                      className={`py-3 px-4 relative select-none font-black ${
                        idx === 0 ? 'md:sticky md:left-10 z-20 border-r shadow-[2px_0_5px_rgba(0,0,0,0.04)]' : ''
                      }`}
                      style={{ 
                        width,
                        background: idx === 0 ? 'rgb(var(--bg-elevated))' : undefined,
                        borderColor: isDark ? 'rgba(255,255,255,0.04)' : undefined
                      }}
                    >
                      <div className="flex items-center gap-1.5 cursor-pointer select-none" onClick={() => {
                        if (col.sortable !== false) {
                          setSortKey(col.key)
                          setSortOrder(s => s === 'asc' && sortKey === col.key ? 'desc' : 'asc')
                        }
                      }}>
                        <span>{col.header}</span>
                        {col.sortable !== false && (
                          isSorted ? (
                            sortOrder === 'asc' ? <ChevronUp size={11} className="text-[#3b82f6]" /> : <ChevronDown size={11} className="text-[#3b82f6]" />
                          ) : (
                            <ChevronDown size={11} className="opacity-20 hover:opacity-80" />
                          )
                        )}
                      </div>

                      {/* Header Drag Resize handle */}
                      <div
                        onMouseDown={(e) => handleResizeStart(col.key, e)}
                        className="absolute right-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-[#3b82f6]/40 transition-colors z-10 select-none"
                      />
                    </th>
                  )
                })}
              </tr>
            </thead>

            {/* Table Rows body */}
            <tbody className="divide-y divide-slate-800/40">
              {isLoading ? (
                /* Skeletal Loading Rows */
                Array.from({ length: pageSize }).map((_, rIdx) => (
                  <tr key={rIdx} className="animate-pulse">
                    <td className="py-4 px-4 text-center">
                      <div className="w-4 h-4 bg-slate-800 rounded mx-auto" />
                    </td>
                    {columns.filter(c => visibleCols.includes(c.key)).map((col, cIdx) => (
                      <td key={cIdx} className="py-4 px-4">
                        <div className="h-3 bg-slate-800 rounded w-3/4" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : paginatedData.length > 0 ? (
                paginatedData.map((item, rIdx) => {
                  const id = item.id || item.assetTag
                  const isSelected = selectedIds.includes(id)
                  
                  return (
                    <tr 
                      key={`${id}-${rIdx}`}
                      onClick={() => onRowClick && onRowClick(item)}
                      className={`transition-colors cursor-pointer ${
                        isSelected 
                          ? isDark ? 'bg-blue-950/10 hover:bg-blue-950/15' : 'bg-blue-50/40 hover:bg-blue-50/60'
                          : isDark ? 'hover:bg-slate-900/30' : 'hover:bg-slate-50/50'
                      }`}
                    >
                      {/* Selection cell */}
                      <td 
                        className="py-3 px-4 text-center md:sticky md:left-0 z-10" 
                        onClick={(e) => handleSelectRow(id, e)}
                        style={{ background: 'rgb(var(--bg-surface))' }}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleSelectRow(id, e)}
                          className="accent-[#7c0a0a] rounded cursor-pointer w-3.5 h-3.5"
                        />
                      </td>

                      {/* Content cells */}
                      {columns.filter(c => visibleCols.includes(c.key)).map((col, cIdx) => {
                        const cellVal = item[col.key]
                        return (
                          <td 
                            key={col.key} 
                            className={`py-3 px-4 text-slate-350 dark:text-slate-300 font-semibold truncate ${
                              cIdx === 0 ? 'md:sticky md:left-10 z-10 font-bold text-slate-900 dark:text-white border-r shadow-[2px_0_5px_rgba(0,0,0,0.03)]' : ''
                            }`}
                            style={{ 
                              background: cIdx === 0 ? 'rgb(var(--bg-surface))' : undefined,
                              maxWidth: colWidths[col.key] || col.width || 150
                            }}
                          >
                            {col.render ? col.render(item) : String(cellVal || '—')}
                          </td>
                        )
                      })}
                    </tr>
                  )
                })
              ) : (
                /* Empty Dataset state */
                <tr>
                  <td colSpan={columns.length + 1} className="py-12 text-center text-slate-500 font-bold border-slate-800">
                    <HelpCircle size={24} className="mx-auto mb-3 opacity-40 text-blue-500 animate-bounce" />
                    <span>{emptyMessage}</span>
                  </td>
                </tr>
              )}
            </tbody>

          </table>
        </div>

        {/* Mobile View Card List */}
        <div className="block md:hidden divide-y divide-slate-100 dark:divide-slate-800/40 overflow-y-auto max-h-[500px]">
          {isLoading ? (
            /* Skeletal Loading Cards */
            Array.from({ length: 5 }).map((_, rIdx) => (
              <div key={rIdx} className="p-4 space-y-3 animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="w-5 h-5 bg-slate-800 rounded" />
                  <div className="h-4 bg-slate-800 rounded w-1/3" />
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="h-3 bg-slate-800 rounded w-2/3" />
                  <div className="h-3 bg-slate-800 rounded w-1/2" />
                </div>
              </div>
            ))
          ) : paginatedData.length > 0 ? (
            paginatedData.map((item, rIdx) => {
              const id = item.id || item.assetTag
              const isSelected = selectedIds.includes(id)
              
              // Try to find if there is a status column
              const statusCol = columns.find(c => c.key === 'status')
              
              return (
                <div 
                  key={`${id}-${rIdx}`}
                  onClick={() => onRowClick && onRowClick(item)}
                  className={`p-4 space-y-3 text-left transition-colors cursor-pointer ${
                    isSelected 
                      ? isDark ? 'bg-blue-950/15' : 'bg-blue-50/40'
                      : isDark ? 'hover:bg-slate-900/20' : 'hover:bg-slate-50/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => handleSelectRow(id, e)}
                        className="accent-[#7c0a0a] rounded cursor-pointer w-3.5 h-3.5"
                        onClick={e => e.stopPropagation()}
                      />
                      <span className="font-bold text-slate-800 dark:text-white text-xs">
                        {columns[0]?.render ? columns[0].render(item) : String(item[columns[0]?.key] || '')}
                      </span>
                    </div>
                    {statusCol && (
                      <div onClick={e => e.stopPropagation()}>
                        {statusCol.render ? statusCol.render(item) : (
                          <span className="badge badge-gray">{String(item.status || '—')}</span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[11px] font-semibold text-slate-500 pt-1">
                    {columns.slice(1).filter(c => visibleCols.includes(c.key) && c.key !== 'status').map(col => (
                      <div key={col.key} className="space-y-0.5">
                        <span className="block text-[8.5px] uppercase tracking-wider text-slate-400 font-bold">{col.header}</span>
                        <span className="text-slate-800 dark:text-slate-300 font-semibold block truncate">
                          {col.render ? col.render(item) : String(item[col.key] || '—')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })
          ) : (
            <div className="py-12 text-center text-slate-500 font-bold">
              <HelpCircle size={24} className="mx-auto mb-3 opacity-40 text-blue-500 animate-bounce" />
              <span>{emptyMessage}</span>
            </div>
          )}
        </div>

        {/* ─── FOOTER PAGINATION FEED ─────────────────────────────────────────── */}
        {totalPages > 1 && (
          <div className={`px-4 py-3 border-t flex flex-col sm:flex-row items-center justify-between gap-4 ${
            isDark ? 'bg-slate-950/30 border-slate-850 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-655 shadow-inner'
          }`}>
            <span className="font-semibold text-[11px]">
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, processedData.length)} of {processedData.length} entries
            </span>
            
            <div className="flex items-center gap-1">
              <button 
                disabled={currentPage === 1} 
                onClick={() => setCurrentPage(p => p - 1)} 
                className="px-3 py-1 rounded border border-slate-800 bg-slate-900/60 disabled:opacity-40 text-[10px] font-black uppercase tracking-wider transition-colors hover:border-slate-600"
              >
                &lsaquo; Prev
              </button>
              <span className="px-3 text-xs font-mono font-bold text-white">
                {currentPage} / {totalPages}
              </span>
              <button 
                disabled={currentPage === totalPages} 
                onClick={() => setCurrentPage(p => p + 1)} 
                className="px-3 py-1 rounded border border-slate-800 bg-slate-900/60 disabled:opacity-40 text-[10px] font-black uppercase tracking-wider transition-colors hover:border-slate-600"
              >
                Next &rsaquo;
              </button>
            </div>
          </div>
        )}

      </div>

    </div>
  )
}
