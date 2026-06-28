import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Calculator, Search, RefreshCw, Landmark } from 'lucide-react'
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar
} from 'recharts'
import { depreciationApi } from '../../api/index'
import { formatDate, formatCurrency } from '../../utils/formatters'
import { useToast } from '../../hooks/useToast'
import { useDebounce } from '../../hooks/useDebounce'
import useAuthStore from '../../store/authStore'

// Custom Tooltip for Recharts
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-slate-900 border border-slate-750 p-2 shadow rounded text-xs text-white">
      <p className="font-bold border-b border-slate-800 pb-1 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="font-mono">
          <span className="text-slate-400">{p.name}:</span> ₹{Number(p.value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      ))}
    </div>
  )
}

export default function DepreciationPage() {
  const { isAdmin } = useAuthStore()
  const qc = useQueryClient()
  const { success, error } = useToast()

  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const debouncedSearch = useDebounce(search, 400)

  // Fetch Depreciation Records
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['depreciation', { page, search: debouncedSearch }],
    queryFn: () => depreciationApi.getRecords({
      page,
      size: 20,
      search: debouncedSearch || undefined
    }).then(r => r.data.data),
    keepPreviousData: true
  })

  // Calculate All Assets Depreciation mutation
  const calculateAllMutation = useMutation({
    mutationFn: depreciationApi.calculateAll,
    onSuccess: () => {
      success('Depreciation calculated successfully for all eligible assets!')
      qc.invalidateQueries(['depreciation'])
    },
    onError: e => error(e?.response?.data?.message || 'Failed to calculate depreciation')
  })

  // Calculate single Asset Depreciation mutation
  const calculateSingleMutation = useMutation({
    mutationFn: (assetId) => depreciationApi.calculate(assetId),
    onSuccess: () => {
      success('Depreciation calculated for this asset!')
      qc.invalidateQueries(['depreciation'])
    },
    onError: e => error(e?.response?.data?.message || 'Failed to calculate')
  })

  const handleCalculateAll = () => {
    if (window.confirm('Calculate depreciation for the current year for all eligible assets?')) {
      calculateAllMutation.mutate()
    }
  }

  const handleCalculateSingle = (assetId) => {
    calculateSingleMutation.mutate(assetId)
  }

  const records = data?.content || []
  const totalPages = data?.totalPages || 0
  const totalEl = data?.totalElements || 0

  // Simulation calculations
  const [simCost, setSimCost] = useState(100000)
  const [simLife, setSimLife] = useState(5)
  const [simMethod, setSimMethod] = useState('SLM')

  const simLifeSafe = Math.max(1, simLife)
  const simRate = simMethod === 'SLM' ? (1 / simLifeSafe) : 0.20 // 20% WDV rate

  const simData = []
  let currentValue = simCost
  const annualDep = simCost * simRate

  simData.push({ year: 'Yr 0', value: simCost })
  for (let y = 1; y <= simLifeSafe; y++) {
    if (simMethod === 'SLM') {
      currentValue = Math.max(0, simCost - y * annualDep)
    } else {
      currentValue = currentValue * (1 - simRate)
    }
    simData.push({
      year: `Yr ${y}`,
      value: Math.round(currentValue)
    })
  }

  // Ledger aggregate calculations
  const ledgerByYear = records.reduce((acc, r) => {
    const yr = r.financialYear || 'Unknown'
    if (!acc[yr]) acc[yr] = { year: yr, depreciation: 0, closing: 0 }
    acc[yr].depreciation += parseFloat(r.depreciationAmt || 0)
    acc[yr].closing += parseFloat(r.closingValue || 0)
    return acc
  }, {})

  const ledgerChartData = Object.values(ledgerByYear).sort((a, b) => a.year.localeCompare(b.year))

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Depreciation Ledger</h1>
          <nav className="text-xs mt-0.5" style={{ color: 'rgb(var(--text-muted))' }}>
            Dashboard &rsaquo; <span style={{ color: 'var(--ams-blue-mid)' }}>Depreciation</span>
          </nav>
        </div>
        {isAdmin && isAdmin() && (
          <button
            onClick={handleCalculateAll}
            disabled={calculateAllMutation.isLoading}
            className="btn-primary btn-sm flex items-center gap-1.5"
          >
            <Calculator size={14} /> Calculate Year Depreciation
          </button>
        )}
      </div>

      {/* Visual Analytics & Depreciation Curve */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 text-[13px]">
        {/* Left: General Ledger Analytics */}
        <div className="card p-5 space-y-4">
          <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: 'rgb(var(--border-color))' }}>
            <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'rgb(var(--text-primary))' }}>
              Ledger Depreciation by Year
            </h3>
            <span className="text-[10px] text-slate-450 font-mono">BAR CHART</span>
          </div>
          {ledgerChartData.length > 0 ? (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ledgerChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="year" stroke="rgb(var(--text-muted))" fontSize={11} tickLine={false} />
                  <YAxis stroke="rgb(var(--text-muted))" fontSize={11} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="depreciation" fill="var(--ams-blue-mid)" radius={[4, 4, 0, 0]} name="Depreciation" />
                  <Bar dataKey="closing" fill="#10b981" radius={[4, 4, 0, 0]} name="Remaining Value" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-56 flex items-center justify-center text-slate-500 text-xs">
              No ledger data to visualize
            </div>
          )}
        </div>

        {/* Right: Depreciation Curve Simulator */}
        <div className="card p-5 space-y-4">
          <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: 'rgb(var(--border-color))' }}>
            <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'rgb(var(--text-primary))' }}>
              <Landmark size={14} style={{ color: 'var(--ams-blue-mid)' }} />
              Depreciation Curve Simulator
            </h3>
            <div className="flex gap-2">
              <select
                value={simMethod}
                onChange={e => setSimMethod(e.target.value)}
                className="input py-0.5 px-2 text-xs"
                style={{ width: 'auto' }}
              >
                <option value="SLM">Straight Line</option>
                <option value="WDV">Written Down</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-xs">
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Cost (₹)</label>
              <input
                type="number"
                value={simCost}
                onChange={e => setSimCost(Number(e.target.value))}
                className="input py-1 px-2 text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Useful Life (Yrs)</label>
              <input
                type="number"
                value={simLife}
                onChange={e => setSimLife(Number(e.target.value))}
                className="input py-1 px-2 text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Rate (%)</label>
              <input
                type="text"
                disabled
                value={`${(simRate * 100).toFixed(0)}%`}
                className="input py-1 px-2 text-xs opacity-60 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={simData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="year" stroke="rgb(var(--text-muted))" fontSize={11} tickLine={false} />
                <YAxis stroke="rgb(var(--text-muted))" fontSize={11} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="value" stroke="var(--ams-blue-mid)" strokeWidth={2} name="Book Value" dot={{ r: 3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="card p-4 mb-5">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1" style={{ minWidth: '220px' }}>
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: 'rgb(var(--text-muted))' }} />
            <input
              type="text"
              placeholder="Search by asset name or financial year..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(0) }}
              className="search-input"
            />
          </div>
          <button onClick={() => refetch()} className="btn-secondary btn-sm">
            <RefreshCw size={13} className={isFetching ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Table Card */}
      <div className="card overflow-hidden">
        <div className="px-5 py-3.5 border-b flex items-center justify-between"
             style={{ borderColor: 'rgb(var(--border-color))' }}>
          <p className="text-sm font-semibold" style={{ color: 'rgb(var(--text-primary))' }}>
            Depreciation Entries
            <span className="ml-2 text-xs font-normal" style={{ color: 'rgb(var(--text-muted))' }}>({totalEl})</span>
          </p>
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
                    <th>Asset ID</th>
                    <th>Asset Name</th>
                    <th>Financial Year</th>
                    <th>Opening Value</th>
                    <th>Depreciation Rate</th>
                    <th>Depreciation Amt</th>
                    <th>Closing Value</th>
                    <th>Method</th>
                    <th>Calculated Date</th>
                    {isAdmin && isAdmin() && <th className="text-center">Action</th>}
                  </tr>
                </thead>
                <tbody>
                  {records.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="text-center py-12" style={{ color: 'rgb(var(--text-muted))' }}>
                        No depreciation records found.
                      </td>
                    </tr>
                  ) : records.map(row => (
                    <tr key={row.id}>
                      <td><span className="table-asset-tag">#{row.assetId}</span></td>
                      <td>
                        <div className="font-medium text-sm" style={{ color: 'rgb(var(--text-primary))' }}>
                          {row.assetName || `Asset #${row.assetId}`}
                        </div>
                      </td>
                      <td className="text-sm font-semibold" style={{ color: 'rgb(var(--text-secondary))' }}>
                        {row.financialYear}
                      </td>
                      <td className="text-sm font-medium" style={{ color: 'rgb(var(--text-primary))' }}>
                        {formatCurrency(row.openingValue)}
                      </td>
                      <td className="text-sm" style={{ color: 'rgb(var(--text-secondary))' }}>
                        {(Number(row.depreciationRate || 0) * 100).toFixed(1)}%
                      </td>
                      <td className="text-sm text-red-500 font-medium">
                        -{formatCurrency(row.depreciationAmt)}
                      </td>
                      <td className="text-sm font-semibold" style={{ color: 'var(--ams-blue-mid)' }}>
                        {formatCurrency(row.closingValue)}
                      </td>
                      <td className="text-xs font-semibold" style={{ color: 'rgb(var(--text-secondary))' }}>
                        {row.method?.replace('_', ' ') || 'STRAIGHT LINE'}
                      </td>
                      <td className="text-sm" style={{ color: 'rgb(var(--text-muted))' }}>
                        {formatDate(row.calculatedAt)}
                      </td>
                      {isAdmin && isAdmin() && (
                        <td>
                          <div className="flex justify-center">
                            <button
                              onClick={() => handleCalculateSingle(row.assetId)}
                              className="btn-secondary btn-xs flex items-center gap-1"
                              title="Recalculate"
                            >
                              <RefreshCw size={11} /> Recalculate
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View Card List */}
            <div className="block md:hidden divide-y divide-slate-100 dark:divide-slate-800/80">
              {records.length === 0 ? (
                <div className="text-center py-12 px-4 flex flex-col items-center gap-2">
                  <p className="text-sm" style={{ color: 'rgb(var(--text-muted))' }}>
                    No depreciation records found.
                  </p>
                </div>
              ) : (
                records.map(row => (
                  <div key={row.id} className="p-4 space-y-3 text-left">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-xs font-bold text-red-700 dark:text-red-400">#{row.assetId}</span>
                        <h4 className="text-sm font-bold mt-1" style={{ color: 'rgb(var(--text-primary))' }}>
                          {row.assetName || `Asset #${row.assetId}`}
                        </h4>
                        <p className="text-xs mt-0.5 text-slate-500 font-semibold">
                          Financial Year: {row.financialYear}
                        </p>
                      </div>
                      <span className="badge badge-info text-[10px] px-2 py-0.5 rounded font-bold">
                        {row.method?.replace('_', ' ') || 'STRAIGHT LINE'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold text-slate-500">
                      <div>
                        <span className="block text-[9px] uppercase tracking-wider text-slate-400">Opening Value</span>
                        <span className="text-slate-700 dark:text-slate-200">{formatCurrency(row.openingValue)}</span>
                      </div>
                      <div>
                        <span className="block text-[9px] uppercase tracking-wider text-slate-400">Closing Value</span>
                        <span className="text-slate-700 dark:text-slate-200">{formatCurrency(row.closingValue)}</span>
                      </div>
                      <div>
                        <span className="block text-[9px] uppercase tracking-wider text-slate-400">Depreciation Rate</span>
                        <span className="text-slate-700 dark:text-slate-200">{(Number(row.depreciationRate || 0) * 100).toFixed(1)}%</span>
                      </div>
                      <div>
                        <span className="block text-[9px] uppercase tracking-wider text-slate-400">Depreciation Amt</span>
                        <span className="text-red-500">-{formatCurrency(row.depreciationAmt)}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="block text-[9px] uppercase tracking-wider text-slate-400">Calculated On</span>
                        <span className="text-slate-700 dark:text-slate-200">{formatDate(row.calculatedAt)}</span>
                      </div>
                    </div>

                    {isAdmin && isAdmin() && (
                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100/60 dark:border-slate-800/40">
                        <button
                          onClick={() => handleCalculateSingle(row.assetId)}
                          className="btn-secondary btn-sm py-1.5 px-3 flex items-center gap-1"
                          title="Recalculate"
                        >
                          <RefreshCw size={12} /> Recalculate
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t"
                   style={{ borderColor: 'rgb(var(--border-color))' }}>
                <p className="text-xs" style={{ color: 'rgb(var(--text-muted))' }}>
                  Page {page + 1} of {totalPages}
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
    </div>
  )
}
