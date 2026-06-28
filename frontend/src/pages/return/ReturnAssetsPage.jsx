import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, RotateCcw, X, RefreshCw, User, Calendar, Tag, AlertCircle } from 'lucide-react'
import { allocationApi } from '../../api/index'
import { formatDate, getErrorMessage } from '../../utils/formatters'
import { useToast } from '../../hooks/useToast'
import { useDebounce } from '../../hooks/useDebounce'

export default function ReturnAssetsPage() {
  const qc = useQueryClient()
  const { success, error } = useToast()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [selectedAllocation, setSelectedAllocation] = useState(null)
  const [returnNotes, setReturnNotes] = useState('')
  const debouncedSearch = useDebounce(search, 400)

  // Fetch active allocations
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['allocations', { page, search: debouncedSearch, status: 'ACTIVE' }],
    queryFn: () => allocationApi.getAll({
      page,
      size: 15,
      search: debouncedSearch || undefined,
      status: 'ACTIVE',
    }).then(r => r.data.data),
    keepPreviousData: true,
  })

  // Return asset mutation
  const returnMutation = useMutation({
    mutationFn: ({ id, notes }) => allocationApi.return(id, notes),
    onSuccess: () => {
      success('Asset returned and restored to inventory successfully!')
      qc.invalidateQueries(['allocations'])
      qc.invalidateQueries(['dashboard'])
      qc.invalidateQueries(['assets'])
      setSelectedAllocation(null)
      setReturnNotes('')
    },
    onError: e => error(getErrorMessage(e)),
  })

  const handleOpenReturnModal = (allocation) => {
    setSelectedAllocation(allocation)
    setReturnNotes('')
  }

  const handleConfirmReturn = (e) => {
    e.preventDefault()
    if (!selectedAllocation) return
    returnMutation.mutate({
      id: selectedAllocation.id,
      notes: returnNotes
    })
  }

  const allocations = data?.content || []
  const totalPages = data?.totalPages || 0
  const totalEl = data?.totalElements || 0

  return (
    <div className="animate-fade-in space-y-6">
      <div className="page-header">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <div className="w-1 h-6 rounded-full" style={{ background: '#8B0000' }} />
            <h1 className="page-title">Return Assets</h1>
          </div>
          <p className="page-subtitle pl-3">Process and log returns for active asset allocations</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1" style={{ minWidth: '220px' }}>
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: 'rgb(var(--text-muted))' }} />
            <input
              type="text"
              placeholder="Search by asset name, tag, serial number or employee..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(0) }}
              className="search-input"
            />
            {search && (
              <button onClick={() => { setSearch(''); setPage(0) }}
                      className="absolute right-3 top-1/2 -translate-y-1/2">
                <X size={13} style={{ color: 'rgb(var(--text-muted))' }} />
              </button>
            )}
          </div>
          <button onClick={() => refetch()} className="btn-secondary btn-sm" title="Refresh">
            <RefreshCw size={13} className={isFetching ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Allocations Table */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b flex items-center justify-between"
             style={{ borderColor: 'rgb(var(--border-color))' }}>
          <div className="flex items-center gap-2">
            <Tag size={16} className="text-indigo-400" />
            <p className="text-sm font-semibold" style={{ color: 'rgb(var(--text-primary))' }}>
              Active Allocations
              <span className="ml-2 text-xs font-normal" style={{ color: 'rgb(var(--text-muted))' }}>
                ({totalEl} active items)
              </span>
            </p>
          </div>
          {isFetching && !isLoading && (
            <span className="text-xs text-indigo-400 animate-pulse flex items-center gap-1">
              <RefreshCw size={11} className="animate-spin" /> Fetching...
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-12 rounded-lg" />)}
          </div>
        ) : (
          <>
            <div className="hidden md:block table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Allocation ID</th>
                    <th>Asset Details</th>
                    <th>Assigned To</th>
                    <th>Allocation Date</th>
                    <th>Expected Return</th>
                    <th>Purpose</th>
                    <th className="text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {allocations.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-16">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-emerald-500/10 text-emerald-400">
                            <AlertCircle size={20} />
                          </div>
                          <div>
                            <p className="text-sm font-medium" style={{ color: 'rgb(var(--text-secondary))' }}>
                              No active allocations found
                            </p>
                            <p className="text-xs mt-0.5" style={{ color: 'rgb(var(--text-muted))' }}>
                              All assets are currently in inventory or match no query criteria.
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : allocations.map(row => (
                    <tr key={row.id}>
                      <td><span className="table-asset-tag">AL#{row.id}</span></td>
                      <td>
                        <div className="font-semibold text-sm" style={{ color: 'rgb(var(--text-primary))' }}>
                          {row.assetName || `Asset #${row.assetId}`}
                        </div>
                        <div className="text-xs font-mono" style={{ color: 'rgb(var(--text-muted))' }}>
                          Tag: {row.assetTag || '—'}
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-1.5 text-sm" style={{ color: 'rgb(var(--text-primary))' }}>
                          <User size={13} className="text-indigo-400" />
                          {row.employeeName || `Employee #${row.employeeId}`}
                        </div>
                      </td>
                      <td className="text-sm" style={{ color: 'rgb(var(--text-secondary))' }}>
                        {formatDate(row.allocatedDate) || '—'}
                      </td>
                      <td className="text-sm" style={{ color: 'rgb(var(--text-secondary))' }}>
                        {formatDate(row.expectedReturn) || '—'}
                      </td>
                      <td className="text-sm max-w-xs truncate" style={{ color: 'rgb(var(--text-muted))' }}>
                        {row.purpose || '—'}
                      </td>
                      <td className="text-center">
                        <button
                          onClick={() => handleOpenReturnModal(row)}
                          className="btn-primary btn-xs py-1 px-3 rounded-md flex items-center gap-1 mx-auto"
                          style={{ background: 'var(--ams-blue-mid)' }}
                        >
                          <RotateCcw size={12} />
                          Process Return
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View Card List */}
            <div className="block md:hidden divide-y divide-slate-100 dark:divide-slate-800/80">
              {allocations.length === 0 ? (
                <div className="text-center py-16 px-4 flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center bg-emerald-500/10 text-emerald-400">
                    <AlertCircle size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'rgb(var(--text-secondary))' }}>
                      No active allocations found
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'rgb(var(--text-muted))' }}>
                      All assets are currently in inventory or match no query criteria.
                    </p>
                  </div>
                </div>
              ) : (
                allocations.map(row => (
                  <div key={row.id} className="p-4 space-y-3 text-left">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-xs font-bold text-red-700 dark:text-red-400">AL#{row.id}</span>
                        <h4 className="text-sm font-bold mt-1" style={{ color: 'rgb(var(--text-primary))' }}>
                          {row.assetName || `Asset #${row.assetId}`}
                        </h4>
                        <p className="text-xs mt-0.5 text-slate-500 font-semibold">
                          Tag: {row.assetTag || '—'}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold text-slate-500">
                      <div className="col-span-2">
                        <span className="block text-[9px] uppercase tracking-wider text-slate-400">Assigned To</span>
                        <span className="text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                          <User size={13} className="text-indigo-400" />
                          {row.employeeName || `Employee #${row.employeeId}`}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[9px] uppercase tracking-wider text-slate-400">Allocation Date</span>
                        <span className="text-slate-700 dark:text-slate-200">{formatDate(row.allocatedDate) || '—'}</span>
                      </div>
                      <div>
                        <span className="block text-[9px] uppercase tracking-wider text-slate-400">Expected Return</span>
                        <span className="text-slate-700 dark:text-slate-200">{formatDate(row.expectedReturn) || '—'}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="block text-[9px] uppercase tracking-wider text-slate-400">Purpose</span>
                        <span className="text-slate-700 dark:text-slate-200">{row.purpose || '—'}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100/60 dark:border-slate-800/40">
                      <button
                        onClick={() => handleOpenReturnModal(row)}
                        className="btn-primary btn-sm py-1.5 px-3 flex items-center gap-1"
                        style={{ background: 'var(--ams-blue-mid)' }}
                      >
                        <RotateCcw size={12} /> Process Return
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3.5 border-t"
                   style={{ borderColor: 'rgb(var(--border-color))' }}>
                <p className="text-xs" style={{ color: 'rgb(var(--text-muted))' }}>
                  Showing {page * 15 + 1}–{Math.min((page + 1) * 15, totalEl)} of {totalEl} active items
                </p>
                <div className="flex gap-1">
                  <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="pagination-btn disabled:opacity-40">
                    &lsaquo; Prev
                  </button>
                  <button disabled={page === totalPages - 1} onClick={() => setPage(p => p + 1)} className="pagination-btn disabled:opacity-40">
                    Next &rsaquo;
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Return Notes Modal */}
      {selectedAllocation && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setSelectedAllocation(null)}>
          <div className="modal-box max-w-md">
            <div className="px-6 py-4 border-b flex items-center justify-between"
                 style={{ borderColor: 'rgb(var(--border-color))' }}>
              <h2 className="text-sm font-bold flex items-center gap-1.5" style={{ color: 'rgb(var(--text-primary))' }}>
                <RotateCcw size={16} className="text-indigo-400" />
                Return Allocation Details
              </h2>
              <button onClick={() => setSelectedAllocation(null)} className="btn-icon">
                <X size={16} style={{ color: 'rgb(var(--text-muted))' }} />
              </button>
            </div>
            <form onSubmit={handleConfirmReturn}>
              <div className="p-6 space-y-4">
                <div className="p-3.5 rounded-xl border space-y-1 text-xs bg-elevated"
                     style={{ borderColor: 'rgb(var(--border-color))' }}>
                  <p><span className="font-semibold" style={{ color: 'rgb(var(--text-secondary))' }}>Asset:</span> {selectedAllocation.assetName}</p>
                  <p><span className="font-semibold" style={{ color: 'rgb(var(--text-secondary))' }}>Custodian:</span> {selectedAllocation.employeeName}</p>
                  <p><span className="font-semibold" style={{ color: 'rgb(var(--text-secondary))' }}>Allocated On:</span> {formatDate(selectedAllocation.allocatedDate)}</p>
                </div>

                <div>
                  <label className="form-label">Return Notes / Condition Remarks</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Describe asset return condition (e.g., returned in perfect condition, power cable included)..."
                    value={returnNotes}
                    onChange={e => setReturnNotes(e.target.value)}
                    className="input resize-none"
                  />
                </div>
              </div>
              <div className="px-6 pb-6 flex justify-end gap-3">
                <button type="button" onClick={() => setSelectedAllocation(null)} className="btn-secondary btn-sm">Cancel</button>
                <button type="submit" disabled={returnMutation.isLoading} className="btn-primary btn-sm"
                        style={{ background: 'var(--ams-blue-mid)' }}>
                  {returnMutation.isLoading ? 'Processing...' : 'Confirm Return'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
