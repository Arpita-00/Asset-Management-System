import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, Edit, Trash2, X, RefreshCw, BarChart3, TrendingUp, IndianRupee, ShieldAlert } from 'lucide-react'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts'
import { budgetApi, departmentApi } from '../../api/index'
import { getErrorMessage } from '../../utils/formatters'
import { useToast } from '../../hooks/useToast'
import useAuthStore from '../../store/authStore'

function BudgetModal({ item, departments, onClose, onSave }) {
  const [form, setForm] = useState(item || {
    departmentId: departments[0]?.id || '',
    forecastType: 'NEW_PURCHASE',
    financialYear: '2026-2027',
    quarter: 1,
    estimatedAmount: '',
    actualAmount: '0.00',
    description: '',
    status: 'DRAFT'
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box max-w-md animate-fade-in text-[13px]">
        <div className="px-6 py-4 border-b flex items-center justify-between"
             style={{ borderColor: 'rgb(var(--border-color))' }}>
          <h2 className="text-sm font-bold" style={{ color: 'rgb(var(--text-primary))' }}>
            {item ? 'Edit Budget Forecast' : 'Create Budget Forecast'}
          </h2>
          <button onClick={onClose} className="btn-icon">
            <X size={16} style={{ color: 'rgb(var(--text-muted))' }} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Department *</label>
              <select
                value={form.departmentId}
                onChange={e => set('departmentId', e.target.value)}
                className="input py-1.5 px-3 text-xs"
                required
              >
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">Type *</label>
              <select
                value={form.forecastType}
                onChange={e => set('forecastType', e.target.value)}
                className="input py-1.5 px-3 text-xs"
                required
              >
                <option value="NEW_PURCHASE">New Purchase</option>
                <option value="MAINTENANCE">Maintenance</option>
                <option value="UPGRADE">Upgrade</option>
                <option value="REPLACEMENT">Replacement</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Financial Year *</label>
              <input
                type="text"
                value={form.financialYear}
                onChange={e => set('financialYear', e.target.value)}
                placeholder="e.g. 2026-2027"
                className="input text-xs"
                required
              />
            </div>
            <div>
              <label className="form-label">Quarter *</label>
              <select
                value={form.quarter}
                onChange={e => set('quarter', parseInt(e.target.value))}
                className="input py-1.5 px-3 text-xs"
                required
              >
                <option value={1}>Q1 (Apr - Jun)</option>
                <option value={2}>Q2 (Jul - Sep)</option>
                <option value={3}>Q3 (Oct - Dec)</option>
                <option value={4}>Q4 (Jan - Mar)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Estimated Amount (₹) *</label>
              <input
                type="number"
                step="0.01"
                value={form.estimatedAmount}
                onChange={e => set('estimatedAmount', e.target.value)}
                placeholder="0.00"
                className="input text-xs"
                required
              />
            </div>
            <div>
              <label className="form-label">Actual Spent (₹)</label>
              <input
                type="number"
                step="0.01"
                value={form.actualAmount}
                onChange={e => set('actualAmount', e.target.value)}
                placeholder="0.00"
                className="input text-xs"
              />
            </div>
          </div>

          <div>
            <label className="form-label">Status</label>
            <select
              value={form.status}
              onChange={e => set('status', e.target.value)}
              className="input py-1.5 px-3 text-xs"
            >
              <option value="DRAFT">Draft</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          <div>
            <label className="form-label">Description</label>
            <textarea
              value={form.description || ''}
              onChange={e => set('description', e.target.value)}
              placeholder="Justify forecast or add item details..."
              rows={2}
              className="input text-sm resize-none"
            />
          </div>
        </div>
        <div className="px-6 pb-6 flex justify-end gap-3">
          <button onClick={onClose} className="btn-secondary btn-sm">Cancel</button>
          <button onClick={() => onSave(form)} disabled={!form.estimatedAmount} className="btn-primary btn-sm">
            {item ? 'Save Changes' : 'Create Forecast'}
          </button>
        </div>
      </div>
    </div>
  )
}

// Custom Tooltip for Recharts
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-slate-900 border border-slate-750 p-2 shadow rounded text-xs text-white">
      <p className="font-bold border-b border-slate-800 pb-1 mb-1">{label || 'Budget comparison'}</p>
      {payload.map((p, i) => (
        <p key={i} className="font-mono">
          <span className="text-slate-400">{p.name}:</span> ₹{Number(p.value).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </p>
      ))}
    </div>
  )
}

export default function BudgetForecastPage() {
  const { isAdmin } = useAuthStore()
  const qc = useQueryClient()
  const { success, error } = useToast()

  const [search, setSearch] = useState('')
  const [deptFilter, setDeptFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)

  // Fetch forecasts
  const { data: forecasts = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ['budgets'],
    queryFn: () => budgetApi.getAll().then(r => r.data.data),
  })

  // Fetch departments for select filter & modal dropdown
  const { data: departments = [] } = useQuery({
    queryKey: ['departments-all'],
    queryFn: () => departmentApi.getAll().then(r => r.data.data),
  })

  const createMutation = useMutation({
    mutationFn: budgetApi.create,
    onSuccess: () => {
      success('Budget forecast created successfully!')
      qc.invalidateQueries(['budgets'])
      setShowModal(false)
    },
    onError: e => error(getErrorMessage(e)),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => budgetApi.update(id, data),
    onSuccess: () => {
      success('Budget forecast updated!')
      qc.invalidateQueries(['budgets'])
      setEditing(null)
      setShowModal(false)
    },
    onError: e => error(getErrorMessage(e)),
  })

  const deleteMutation = useMutation({
    mutationFn: budgetApi.delete,
    onSuccess: () => {
      success('Budget forecast deleted successfully!')
      qc.invalidateQueries(['budgets'])
    },
    onError: e => error(getErrorMessage(e)),
  })

  const handleDelete = (id) => {
    if (window.confirm('Delete this budget forecast entry?')) {
      deleteMutation.mutate(id)
    }
  }

  const handleSave = (form) => {
    if (editing) {
      updateMutation.mutate({ id: editing.id, data: form })
    } else {
      createMutation.mutate(form)
    }
  }

  const filtered = forecasts.filter(f => {
    if (deptFilter && String(f.departmentId) !== String(deptFilter)) return false
    if (typeFilter && f.forecastType !== typeFilter) return false

    const q = search.toLowerCase()
    const desc = f.description || ''
    const deptName = f.department?.name || ''
    const fy = f.financialYear || ''

    return (
      desc.toLowerCase().includes(q) ||
      deptName.toLowerCase().includes(q) ||
      fy.toLowerCase().includes(q)
    )
  })

  // Calculations
  const totalEstimated = filtered.reduce((sum, f) => sum + parseFloat(f.estimatedAmount || 0), 0)
  const totalActual = filtered.reduce((sum, f) => sum + parseFloat(f.actualAmount || 0), 0)
  const variance = totalEstimated - totalActual

  // Budget Comparison by Department
  const deptBudgetMap = filtered.reduce((acc, f) => {
    const deptName = f.department?.name || 'Global'
    const est = parseFloat(f.estimatedAmount || 0)
    const act = parseFloat(f.actualAmount || 0)
    if (!acc[deptName]) acc[deptName] = { name: deptName, Estimated: 0, Actual: 0 }
    acc[deptName].Estimated += est
    acc[deptName].Actual += act
    return acc
  }, {})
  const budgetChartData = Object.values(deptBudgetMap)

  const getStatusBadge = (status) => {
    const styles = {
      DRAFT: 'bg-slate-500/10 text-slate-400 border border-slate-500/20',
      APPROVED: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20',
      REJECTED: 'bg-red-500/10 text-red-500 border border-red-500/20',
      COMPLETED: 'bg-blue-500/10 text-blue-500 border border-blue-500/20',
    }
    return styles[status] || 'bg-gray-500/10 text-gray-500'
  }

  const getForecastTypeLabel = (type) => {
    return type.replace('_', ' ')
  }

  return (
    <div className="animate-fade-in text-[13px]">
      <div className="page-header">
        <div>
          <h1 className="page-title">Budget Forecasting</h1>
          <nav className="text-xs mt-0.5" style={{ color: 'rgb(var(--text-muted))' }}>
            Dashboard &rsaquo; <span style={{ color: 'var(--ams-blue-mid)' }}>Budget Forecasts</span>
          </nav>
        </div>
        {isAdmin && isAdmin() && (
          <button onClick={() => { setEditing(null); setShowModal(true) }} className="btn-primary btn-sm flex items-center gap-1.5">
            <Plus size={14} /> Add Forecast
          </button>
        )}
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        <div className="card p-5 flex items-center gap-4 relative overflow-hidden">
          <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-500">
            <IndianRupee size={24} />
          </div>
          <div>
            <div className="text-xl font-bold" style={{ color: 'rgb(var(--text-primary))' }}>
              ₹{totalEstimated.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-xs" style={{ color: 'rgb(var(--text-muted))' }}>
              Total Estimated Forecast
            </div>
          </div>
        </div>

        <div className="card p-5 flex items-center gap-4 relative overflow-hidden">
          <div className="p-3 rounded-lg bg-blue-500/10 text-blue-500">
            <BarChart3 size={24} />
          </div>
          <div>
            <div className="text-xl font-bold" style={{ color: 'rgb(var(--text-primary))' }}>
              ₹{totalActual.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-xs" style={{ color: 'rgb(var(--text-muted))' }}>
              Total Actual Expenditures
            </div>
          </div>
        </div>

        <div className="card p-5 flex items-center gap-4 relative overflow-hidden">
          <div className="p-3 rounded-lg bg-purple-500/10 text-purple-500">
            <TrendingUp size={24} />
          </div>
          <div>
            <div className="text-xl font-bold" style={{ color: 'rgb(var(--text-primary))' }}>
              ₹{variance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-xs" style={{ color: 'rgb(var(--text-muted))' }}>
              Remaining Budget Variance
            </div>
          </div>
        </div>
      </div>

      {/* Department Budget Comparison Chart */}
      <div className="card p-5 mb-6 text-[13px]">
        <div className="flex items-center justify-between border-b pb-2 mb-4" style={{ borderColor: 'rgb(var(--border-color))' }}>
          <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'rgb(var(--text-primary))' }}>
            Department Budget: Estimated vs. Actual Spent (₹)
          </h3>
          <span className="text-[10px] text-slate-450 font-mono">COMPARISON CHART</span>
        </div>
        {budgetChartData.length > 0 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={budgetChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="rgb(var(--text-muted))" fontSize={11} tickLine={false} />
                <YAxis stroke="rgb(var(--text-muted))" fontSize={11} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="top" height={36} iconSize={12} wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Estimated" fill="var(--ams-blue-mid)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Actual" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-slate-500 text-xs">
            No budget data to compare
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="card p-4 mb-5">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1" style={{ minWidth: '200px' }}>
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: 'rgb(var(--text-muted))' }} />
            <input
              type="text"
              placeholder="Search by description or year..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="search-input"
            />
          </div>

          <div style={{ minWidth: '150px' }}>
            <select
              value={deptFilter}
              onChange={e => setDeptFilter(e.target.value)}
              className="input py-1.5 px-3 text-xs"
            >
              <option value="">All Departments</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div style={{ minWidth: '150px' }}>
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="input py-1.5 px-3 text-xs"
            >
              <option value="">All Forecast Types</option>
              <option value="NEW_PURCHASE">New Purchase</option>
              <option value="MAINTENANCE">Maintenance</option>
              <option value="UPGRADE">Upgrade</option>
              <option value="REPLACEMENT">Replacement</option>
            </select>
          </div>

          <button onClick={() => refetch()} className="btn-secondary btn-sm">
            <RefreshCw size={13} className={isFetching ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Forecast list */}
      <div className="card overflow-hidden">
        <div className="hidden md:block table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Dept / Period</th>
                <th>Type</th>
                <th>Status</th>
                <th>Estimated Budget</th>
                <th>Actual Spent</th>
                <th>Usage Progress</th>
                <th>Description / Justification</th>
                {isAdmin && isAdmin() && <th className="w-24 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    <td><div className="skeleton h-4 w-32 rounded" /></td>
                    <td><div className="skeleton h-4 w-20 rounded" /></td>
                    <td><div className="skeleton h-4 w-16 rounded" /></td>
                    <td><div className="skeleton h-4 w-24 rounded" /></td>
                    <td><div className="skeleton h-4 w-24 rounded" /></td>
                    <td><div className="skeleton h-2 w-28 rounded" /></td>
                    <td><div className="skeleton h-4 w-40 rounded" /></td>
                    {isAdmin && isAdmin() && <td className="text-right"><div className="skeleton h-4 w-16 rounded ml-auto" /></td>}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin && isAdmin() ? 8 : 7} className="text-center py-8" style={{ color: 'rgb(var(--text-muted))' }}>
                    No budget forecasts found.
                  </td>
                </tr>
              ) : (
                filtered.map(f => {
                  const est = parseFloat(f.estimatedAmount || 0)
                  const act = parseFloat(f.actualAmount || 0)
                  const percentage = est > 0 ? Math.min((act / est) * 100, 100) : 0

                  return (
                    <tr key={f.id}>
                      <td>
                        <div>
                          <div className="font-semibold" style={{ color: 'rgb(var(--text-primary))' }}>
                            {f.department?.name || 'Global'}
                          </div>
                          <div className="text-[11px]" style={{ color: 'rgb(var(--text-muted))' }}>
                            FY {f.financialYear} &bull; Quarter {f.quarter}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="uppercase text-[10px] font-bold tracking-wide" style={{ color: 'rgb(var(--text-secondary))' }}>
                          {getForecastTypeLabel(f.forecastType)}
                        </span>
                      </td>
                      <td>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getStatusBadge(f.status)}`}>
                          {f.status}
                        </span>
                      </td>
                      <td className="font-semibold" style={{ color: 'rgb(var(--text-primary))' }}>
                        ₹{est.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="font-semibold" style={{ color: 'rgb(var(--text-primary))' }}>
                        ₹{act.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td>
                        <div className="w-28 space-y-1">
                          <div className="flex justify-between text-[10px]" style={{ color: 'rgb(var(--text-secondary))' }}>
                            <span>Used</span>
                            <span className="font-semibold">{Math.round(percentage)}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-800 rounded overflow-hidden">
                            <div
                              className={`h-full ${percentage > 90 ? 'bg-red-500' : percentage > 50 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="max-w-xs truncate" style={{ color: 'rgb(var(--text-secondary))' }} title={f.description}>
                        {f.description || 'N/A'}
                      </td>
                      {isAdmin && isAdmin() && (
                        <td className="text-right">
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => { setEditing(f); setShowModal(true) }}
                              className="btn-icon"
                              title="Edit"
                            >
                              <Edit size={14} style={{ color: 'rgb(var(--text-muted))' }} />
                            </button>
                            <button
                              onClick={() => handleDelete(f.id)}
                              className="btn-icon hover:bg-red-500/10"
                              title="Delete"
                            >
                              <Trash2 size={14} style={{ color: '#8B0000' }} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View Card List */}
        <div className="block md:hidden divide-y divide-slate-100 dark:divide-slate-800/80">
          {filtered.length === 0 ? (
            <div className="text-center py-8" style={{ color: 'rgb(var(--text-muted))' }}>
              No budget forecasts found.
            </div>
          ) : (
            filtered.map(f => {
              const est = parseFloat(f.estimatedAmount || 0)
              const act = parseFloat(f.actualAmount || 0)
              const percentage = est > 0 ? Math.min((act / est) * 100, 100) : 0

              return (
                <div key={f.id} className="p-4 space-y-3 text-left">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-indigo-500">
                        {f.department?.name || 'Global'}
                      </h4>
                      <p className="text-[10px] mt-0.5 text-slate-500 font-semibold">
                        FY {f.financialYear} &bull; Quarter {f.quarter}
                      </p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getStatusBadge(f.status)}`}>
                      {f.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold text-slate-500">
                    <div>
                      <span className="block text-[9px] uppercase tracking-wider text-slate-400">Forecast Type</span>
                      <span className="text-slate-700 dark:text-slate-200">
                        {getForecastTypeLabel(f.forecastType)}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[9px] uppercase tracking-wider text-slate-400">Estimated Budget</span>
                      <span className="text-slate-700 dark:text-slate-200">
                        ₹{est.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[9px] uppercase tracking-wider text-slate-400">Actual Spent</span>
                      <span className="text-slate-700 dark:text-slate-200">
                        ₹{act.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[9px] uppercase tracking-wider text-slate-400">Usage Progress</span>
                      <div className="w-full space-y-1">
                        <div className="flex justify-between text-[10px]" style={{ color: 'rgb(var(--text-secondary))' }}>
                          <span className="font-semibold">{Math.round(percentage)}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-800 rounded overflow-hidden">
                          <div
                            className={`h-full ${percentage > 90 ? 'bg-red-500' : percentage > 50 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <span className="block text-[9px] uppercase tracking-wider text-slate-400">Justification</span>
                      <span className="text-slate-700 dark:text-slate-200">{f.description || 'N/A'}</span>
                    </div>
                  </div>

                  {isAdmin && isAdmin() && (
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100/60 dark:border-slate-800/40">
                      <button
                        onClick={() => { setEditing(f); setShowModal(true) }}
                        className="btn-secondary btn-sm py-1.5 px-3 flex items-center gap-1"
                      >
                        <Edit size={12} /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(f.id)}
                        className="btn-secondary btn-sm py-1.5 px-3 flex items-center gap-1 text-red-700 dark:text-red-400"
                      >
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>

      {showModal && (
        <BudgetModal
          item={editing}
          departments={departments}
          onClose={() => { setShowModal(false); setEditing(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  )
}
