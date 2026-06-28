import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, RefreshCw, Eye, X, Calendar, User, ShieldAlert, Monitor, Globe } from 'lucide-react'
import { auditApi } from '../../api/index'

function DiffModal({ log, onClose }) {
  const formatJSON = (val) => {
    if (!val) return 'None'
    try {
      return JSON.stringify(val, null, 2)
    } catch (e) {
      return String(val)
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box max-w-4xl text-[12px] animate-fade-in">
        <div className="px-6 py-4 border-b flex items-center justify-between"
             style={{ borderColor: 'rgb(var(--border-color))' }}>
          <div>
            <h2 className="text-sm font-bold" style={{ color: 'rgb(var(--text-primary))' }}>
              Audit Log Details: #{log.id}
            </h2>
            <p className="text-[11px] mt-0.5" style={{ color: 'rgb(var(--text-muted))' }}>
              {log.description}
            </p>
          </div>
          <button onClick={onClose} className="btn-icon">
            <X size={16} style={{ color: 'rgb(var(--text-muted))' }} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="font-semibold mb-2" style={{ color: 'rgb(var(--text-secondary))' }}>
                Metadata
              </div>
              <div className="card p-3 space-y-1.5" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <div className="flex justify-between">
                  <span style={{ color: 'rgb(var(--text-muted))' }}>Action:</span>
                  <span className="font-semibold text-white">{log.action}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'rgb(var(--text-muted))' }}>Target Entity:</span>
                  <span className="font-semibold text-white">{log.entityType} (ID: {log.entityId || 'N/A'})</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'rgb(var(--text-muted))' }}>IP Address:</span>
                  <span className="font-semibold text-white">{log.ipAddress || 'Unknown'}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'rgb(var(--text-muted))' }}>User Agent:</span>
                  <span className="font-semibold text-white truncate max-w-[200px]" title={log.userAgent}>
                    {log.userAgent || 'Unknown'}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <div className="font-semibold mb-2" style={{ color: 'rgb(var(--text-secondary))' }}>
                User Info
              </div>
              <div className="card p-3 space-y-1.5 flex flex-col justify-center" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <div className="flex items-center gap-2">
                  <User size={14} style={{ color: 'var(--ams-blue-mid)' }} />
                  <div>
                    <div className="font-semibold text-white">
                      {log.performedBy ? `${log.performedBy.firstName} ${log.performedBy.lastName}` : 'System / Auto'}
                    </div>
                    <div className="text-[10px]" style={{ color: 'rgb(var(--text-muted))' }}>
                      {log.performedBy?.email || 'automated-task@system.local'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="font-semibold mb-1 text-red-400">Previous Value (Before)</div>
              <pre
                className="p-3 rounded overflow-auto max-h-72 font-mono leading-normal"
                style={{ background: 'rgb(5, 12, 22)', color: '#fda4af', border: '1px solid rgba(255,255,255,0.05)' }}
              >
                {formatJSON(log.oldValues)}
              </pre>
            </div>
            <div>
              <div className="font-semibold mb-1 text-emerald-400">New Value (After)</div>
              <pre
                className="p-3 rounded overflow-auto max-h-72 font-mono leading-normal"
                style={{ background: 'rgb(5, 12, 22)', color: '#6ee7b7', border: '1px solid rgba(255,255,255,0.05)' }}
              >
                {formatJSON(log.newValues)}
              </pre>
            </div>
          </div>
        </div>
        <div className="px-6 pb-6 flex justify-end">
          <button onClick={onClose} className="btn-secondary btn-sm">Close Viewer</button>
        </div>
      </div>
    </div>
  )
}

export default function AuditLogsPage() {
  const [page, setPage] = useState(0)
  const [entityType, setEntityType] = useState('')
  const [action, setAction] = useState('')
  const [viewingLog, setViewingLog] = useState(null)

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['audit-logs', { page, entityType, action }],
    queryFn: () => auditApi.getLogs({
      page,
      size: 20,
      entityType: entityType || undefined,
      action: action || undefined,
    }).then(r => r.data.data),
    keepPreviousData: true,
  })

  const logs = data?.content || []
  const totalPages = data?.total || 0 // Wait, let's verify if the backend returns 'total' as total pages or total elements. The service returns `total: count`. So totalPages should be Math.ceil(total / size). Let's see: `total: count` and `size: 20`.
  const totalElements = data?.total || 0
  const size = data?.size || 20
  const computedTotalPages = Math.ceil(totalElements / size)

  const getActionBadge = (act) => {
    const styles = {
      CREATE: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20',
      UPDATE: 'bg-blue-500/10 text-blue-500 border border-blue-500/20',
      DELETE: 'bg-red-500/10 text-red-500 border border-red-500/20',
      LOGIN: 'bg-purple-500/10 text-purple-500 border border-purple-500/20',
    }
    return styles[act] || 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
  }

  return (
    <div className="animate-fade-in text-[13px]">
      <div className="page-header">
        <div>
          <h1 className="page-title">Compliance Audit Logs</h1>
          <nav className="text-xs mt-0.5" style={{ color: 'rgb(var(--text-muted))' }}>
            System &rsaquo; <span style={{ color: 'var(--ams-blue-mid)' }}>Audit Logs</span>
          </nav>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-5">
        <div className="flex flex-wrap gap-3 items-center">
          <div style={{ minWidth: '180px' }} className="flex-1">
            <select
              value={entityType}
              onChange={e => { setEntityType(e.target.value); setPage(0) }}
              className="input py-1.5 px-3 text-xs"
            >
              <option value="">All Entities</option>
              <option value="ASSET">Asset</option>
              <option value="USER">User</option>
              <option value="VENDOR">Vendor</option>
              <option value="DEPARTMENT">Department</option>
              <option value="EMPLOYEE">Employee</option>
              <option value="BUDGET_FORECAST">Budget Forecast</option>
              <option value="MAINTENANCE_REQUEST">Maintenance Request</option>
            </select>
          </div>

          <div style={{ minWidth: '180px' }}>
            <select
              value={action}
              onChange={e => { setAction(e.target.value); setPage(0) }}
              className="input py-1.5 px-3 text-xs"
            >
              <option value="">All Actions</option>
              <option value="CREATE">Create</option>
              <option value="UPDATE">Update</option>
              <option value="DELETE">Delete</option>
              <option value="LOGIN">Login</option>
            </select>
          </div>

          <button onClick={() => refetch()} className="btn-secondary btn-sm">
            <RefreshCw size={13} className={isFetching ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Audit table */}
      <div className="card overflow-hidden mb-5">
        <div className="hidden md:block table-wrapper">
          <table className="table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Action</th>
              <th>Target Entity</th>
              <th>Description</th>
              <th>User</th>
              <th>Device / Location</th>
              <th className="w-20 text-right">Details</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td><div className="skeleton h-4 w-28 rounded" /></td>
                  <td><div className="skeleton h-4 w-16 rounded" /></td>
                  <td><div className="skeleton h-4 w-24 rounded" /></td>
                  <td><div className="skeleton h-4 w-48 rounded" /></td>
                  <td><div className="skeleton h-4 w-28 rounded" /></td>
                  <td><div className="skeleton h-4 w-24 rounded" /></td>
                  <td className="text-right"><div className="skeleton h-4 w-8 rounded ml-auto" /></td>
                </tr>
              ))
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8" style={{ color: 'rgb(var(--text-muted))' }}>
                  No compliance audit logs found matching criteria.
                </td>
              </tr>
            ) : (
              logs.map(log => (
                <tr key={log.id}>
                  <td className="whitespace-nowrap" style={{ color: 'rgb(var(--text-secondary))' }}>
                    <div className="flex items-center gap-1.5">
                      <Calendar size={13} style={{ color: 'rgb(var(--text-muted))' }} />
                      {new Date(log.createdAt).toLocaleString()}
                    </div>
                  </td>
                  <td>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getActionBadge(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="whitespace-nowrap font-medium" style={{ color: 'rgb(var(--text-primary))' }}>
                    {log.entityType} <span style={{ color: 'rgb(var(--text-muted))' }}>#{log.entityId}</span>
                  </td>
                  <td className="max-w-xs truncate" style={{ color: 'rgb(var(--text-secondary))' }} title={log.description}>
                    {log.description}
                  </td>
                  <td>
                    <div>
                      <div className="font-semibold" style={{ color: 'rgb(var(--text-primary))' }}>
                        {log.performedBy ? `${log.performedBy.firstName} ${log.performedBy.lastName}` : 'System / Auto'}
                      </div>
                      <div className="text-[10px]" style={{ color: 'rgb(var(--text-muted))' }}>
                        {log.performedBy?.email || 'automated-task@system.local'}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="space-y-0.5">
                      {log.ipAddress && (
                        <div className="flex items-center gap-1 text-[11px]" style={{ color: 'rgb(var(--text-secondary))' }}>
                          <Globe size={11} style={{ color: 'rgb(var(--text-muted))' }} />
                          <span>{log.ipAddress}</span>
                        </div>
                      )}
                      {log.userAgent && (
                        <div className="flex items-center gap-1 text-[11px] max-w-[150px] truncate" style={{ color: 'rgb(var(--text-muted))' }} title={log.userAgent}>
                          <Monitor size={11} />
                          <span>{log.userAgent}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="text-right">
                    <button
                      onClick={() => setViewingLog(log)}
                      className="btn-icon"
                      title="View Details / JSON Diff"
                    >
                      <Eye size={14} style={{ color: 'rgb(var(--text-muted))' }} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

        {/* Mobile View Card List */}
        <div className="block md:hidden divide-y divide-slate-100 dark:divide-slate-800/80">
          {logs.length === 0 ? (
            <div className="text-center py-8" style={{ color: 'rgb(var(--text-muted))' }}>
              No compliance audit logs found matching criteria.
            </div>
          ) : (
            logs.map(log => (
              <div key={log.id} className="p-4 space-y-3 text-left">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-405">
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                    <h4 className="text-sm font-bold mt-1" style={{ color: 'rgb(var(--text-primary))' }}>
                      {log.entityType} <span style={{ color: 'rgb(var(--text-muted))' }}>#{log.entityId}</span>
                    </h4>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getActionBadge(log.action)}`}>
                    {log.action}
                  </span>
                </div>

                <p className="text-xs" style={{ color: 'rgb(var(--text-secondary))' }}>
                  {log.description}
                </p>

                <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold text-slate-500">
                  <div>
                    <span className="block text-[9px] uppercase tracking-wider text-slate-400">User</span>
                    <span className="text-slate-700 dark:text-slate-200">
                      {log.performedBy ? `${log.performedBy.firstName} ${log.performedBy.lastName}` : 'System'}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[9px] uppercase tracking-wider text-slate-400">IP Address</span>
                    <span className="text-slate-700 dark:text-slate-200">{log.ipAddress || '—'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100/60 dark:border-slate-800/40">
                  <button
                    onClick={() => setViewingLog(log)}
                    className="btn-secondary btn-sm py-1.5 px-3 flex items-center gap-1"
                  >
                    <Eye size={12} /> View Details
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Pagination */}
      {computedTotalPages > 1 && (
        <div className="px-6 py-4 card flex items-center justify-between"
             style={{ borderColor: 'rgb(var(--border-color))' }}>
          <span style={{ color: 'rgb(var(--text-muted))' }}>
            Showing Page {page + 1} of {computedTotalPages}
          </span>
          <div className="flex gap-2">
            <button
              disabled={page === 0}
              onClick={() => setPage(p => p - 1)}
              className="btn-secondary btn-xs"
            >
              Previous
            </button>
            <button
              disabled={page === computedTotalPages - 1}
              onClick={() => setPage(p => p + 1)}
              className="btn-secondary btn-xs"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {viewingLog && (
        <DiffModal
          log={viewingLog}
          onClose={() => setViewingLog(null)}
        />
      )}
    </div>
  )
}
