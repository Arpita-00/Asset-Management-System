import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, Edit, Trash2, X, RefreshCw, Mail, Phone, Shield, Building2, ToggleLeft, ToggleRight } from 'lucide-react'
import { userApi, departmentApi } from '../../api/index'
import { getErrorMessage } from '../../utils/formatters'
import { useToast } from '../../hooks/useToast'
import { useDebounce } from '../../hooks/useDebounce'

// ── User Modal ─────────────────────────────────────────────────────────────
function UserModal({ item, onClose, onSave, departments }) {
  const [form, setForm] = useState(item || {
    firstName: '', lastName: '', email: '', password: '', phone: '',
    departmentId: '', roles: ['ROLE_EMPLOYEE'], isActive: true
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleRoleToggle = (role) => {
    const currentRoles = form.roles || []
    if (currentRoles.includes(role)) {
      set('roles', currentRoles.filter(r => r !== role))
    } else {
      set('roles', [...currentRoles, role])
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box max-w-lg">
        <div className="px-6 py-4 border-b flex items-center justify-between"
             style={{ borderColor: 'rgb(var(--border-color))' }}>
          <h2 className="text-sm font-bold" style={{ color: 'rgb(var(--text-primary))' }}>
            {item ? 'Edit User' : 'Add User'}
          </h2>
          <button onClick={onClose} className="btn-icon">
            <X size={16} style={{ color: 'rgb(var(--text-muted))' }} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label">First Name *</label>
              <input
                type="text"
                value={form.firstName || ''}
                onChange={e => set('firstName', e.target.value)}
                placeholder="First name"
                className="input text-sm"
              />
            </div>
            <div>
              <label className="form-label">Last Name *</label>
              <input
                type="text"
                value={form.lastName || ''}
                onChange={e => set('lastName', e.target.value)}
                placeholder="Last name"
                className="input text-sm"
              />
            </div>
          </div>

          <div>
            <label className="form-label">Email Address *</label>
            <input
              type="email"
              value={form.email || ''}
              onChange={e => set('email', e.target.value)}
              placeholder="e.g. user@company.com"
              disabled={!!item}
              className="input text-sm"
            />
          </div>

          <div>
            <label className="form-label">{item ? 'Password (leave blank to keep unchanged)' : 'Password *'}</label>
            <input
              type="password"
              value={form.password || ''}
              onChange={e => set('password', e.target.value)}
              placeholder={item ? '••••••••' : 'Minimum 8 characters'}
              className="input text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Contact Number</label>
              <input
                type="text"
                value={form.phone || ''}
                onChange={e => set('phone', e.target.value)}
                placeholder="e.g. +91 99999 88888"
                className="input text-sm"
              />
            </div>
            <div>
              <label className="form-label">Department</label>
              <select
                value={form.departmentId || ''}
                onChange={e => set('departmentId', e.target.value)}
                className="input text-sm select-reset"
                style={{ background: 'rgb(var(--bg-elevated))', color: 'rgb(var(--text-primary))' }}
              >
                <option value="" style={{ background: 'rgb(var(--bg-surface))', color: 'rgb(var(--text-primary))' }}>No Department</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id} style={{ background: 'rgb(var(--bg-surface))', color: 'rgb(var(--text-primary))' }}>{d.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="form-label mb-2">Assign Roles *</label>
            <div className="flex flex-wrap gap-4 p-3 rounded-lg" style={{ background: 'rgb(var(--bg-elevated))', border: '1px solid rgb(var(--border-color))' }}>
              {['ROLE_EMPLOYEE', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN'].map(role => (
                <label key={role} className="flex items-center gap-2 text-xs font-semibold cursor-pointer" style={{ color: 'rgb(var(--text-secondary))' }}>
                  <input
                    type="checkbox"
                    checked={(form.roles || []).includes(role)}
                    onChange={() => handleRoleToggle(role)}
                    className="accent-amber-600 rounded"
                  />
                  {role.replace('ROLE_', '')}
                </label>
              ))}
            </div>
          </div>

          {item && (
            <div className="flex items-center gap-2 py-1">
              <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer" style={{ color: 'rgb(var(--text-secondary))' }}>
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={e => set('isActive', e.target.checked)}
                  className="accent-amber-600 rounded"
                />
                Account Active
              </label>
            </div>
          )}
        </div>
        <div className="px-6 pb-6 flex justify-end gap-3">
          <button onClick={onClose} className="btn-secondary btn-sm">Cancel</button>
          <button
            onClick={() => onSave(form)}
            disabled={!form.firstName || !form.lastName || !form.email || (!item && !form.password) || (form.roles || []).length === 0}
            className="btn-primary btn-sm"
          >
            {item ? 'Save Changes' : 'Add User'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main Users Page ─────────────────────────────────────────────────────────
export default function UsersPage() {
  const qc = useQueryClient()
  const { success, error } = useToast()

  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const debouncedSearch = useDebounce(search, 400)

  // Fetch Users
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['users', { page, search: debouncedSearch }],
    queryFn: () => userApi.getAll({
      page,
      size: 10,
      search: debouncedSearch || undefined,
    }).then(r => r.data.data),
    keepPreviousData: true,
  })

  // Fetch Departments
  const { data: deptsData } = useQuery({
    queryKey: ['departments'],
    queryFn: () => departmentApi.getAll().then(r => r.data.data),
  })
  const departments = deptsData || []

  const createMutation = useMutation({
    mutationFn: userApi.create,
    onSuccess: () => {
      success('User created successfully!')
      qc.invalidateQueries(['users'])
      setShowModal(false)
    },
    onError: e => error(getErrorMessage(e)),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => userApi.update(id, data),
    onSuccess: () => {
      success('User details updated!')
      qc.invalidateQueries(['users'])
      setEditing(null)
      setShowModal(false)
    },
    onError: e => error(getErrorMessage(e)),
  })

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, data }) => userApi.update(id, data),
    onSuccess: () => {
      success('User status changed')
      qc.invalidateQueries(['users'])
    },
    onError: e => error(getErrorMessage(e)),
  })

  const handleSave = (form) => {
    // extract departmentId as int
    const deptId = form.departmentId ? parseInt(form.departmentId) : null
    const payload = { ...form, departmentId: deptId }

    if (editing) {
      updateMutation.mutate({ id: editing.id, data: payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  const handleToggleActive = (user) => {
    toggleStatusMutation.mutate({
      id: user.id,
      data: { isActive: !user.isActive }
    })
  }

  const users = data?.content || []
  const totalPages = data?.totalPages || 0
  const totalEl = data?.totalElements || 0

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">User Administration</h1>
          <nav className="text-xs mt-0.5" style={{ color: 'rgb(var(--text-muted))' }}>
            Dashboard &rsaquo; <span style={{ color: 'var(--ams-blue-mid)' }}>Users</span>
          </nav>
        </div>
        <button onClick={() => { setEditing(null); setShowModal(true) }} className="btn-primary btn-sm flex items-center gap-1.5">
          <Plus size={14} /> Add User
        </button>
      </div>

      {/* Search Filter */}
      <div className="card p-4 mb-5">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1" style={{ minWidth: '220px' }}>
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: 'rgb(var(--text-muted))' }} />
            <input
              type="text"
              placeholder="Search users by name or email..."
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

      {/* Users List Grid */}
      <div className="card overflow-hidden">
        <div className="hidden md:block overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Department</th>
                <th>Roles</th>
                <th className="text-center">Active</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={7}>
                      <div className="skeleton h-8 w-full rounded" />
                    </td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8" style={{ color: 'rgb(var(--text-muted))' }}>
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div className="font-semibold" style={{ color: 'rgb(var(--text-primary))' }}>
                        {u.firstName} {u.lastName}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5 text-xs" style={{ color: 'rgb(var(--text-secondary))' }}>
                        <Mail size={12} className="text-slate-500" />
                        {u.email}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5 text-xs" style={{ color: 'rgb(var(--text-secondary))' }}>
                        {u.phone ? (
                          <>
                            <Phone size={12} className="text-slate-500" />
                            {u.phone}
                          </>
                        ) : (
                          <span className="text-slate-500">-</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5 text-xs" style={{ color: 'rgb(var(--text-secondary))' }}>
                        <Building2 size={12} className="text-slate-500" />
                        {u.department?.name || <span className="text-slate-500">Unassigned</span>}
                      </div>
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-1">
                        {u.roles.map(role => (
                          <span
                            key={role}
                            className="px-1.5 py-0.5 rounded text-[10px] font-bold"
                            style={{
                              background: role === 'ROLE_SUPER_ADMIN' ? 'rgba(139,0,0,0.2)' : role === 'ROLE_ADMIN' ? 'rgba(184,134,11,0.2)' : 'rgba(21,128,61,0.2)',
                              color: role === 'ROLE_SUPER_ADMIN' ? '#ff6b6b' : role === 'ROLE_ADMIN' ? '#f59e0b' : '#4ade80',
                              border: role === 'ROLE_SUPER_ADMIN' ? '1px solid rgba(139,0,0,0.4)' : role === 'ROLE_ADMIN' ? '1px solid rgba(184,134,11,0.4)' : '1px solid rgba(21,128,61,0.4)',
                            }}
                          >
                            {role.replace('ROLE_', '')}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="text-center">
                      <button
                        onClick={() => handleToggleActive(u)}
                        className="btn-icon hover:scale-105 transition-transform"
                        title={u.isActive ? 'Deactivate user' : 'Activate user'}
                      >
                        {u.isActive ? (
                          <ToggleRight size={20} className="text-green-400" />
                        ) : (
                          <ToggleLeft size={20} className="text-slate-500" />
                        )}
                      </button>
                    </td>
                    <td className="text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => {
                            setEditing({
                              ...u,
                              departmentId: u.department?.id || '',
                              password: ''
                            })
                            setShowModal(true)
                          }}
                          className="btn-icon w-7 h-7 rounded hover:bg-sky-500/10 text-sky-500"
                          title="Edit"
                        >
                          <Edit size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View Card List */}
        <div className="block md:hidden divide-y divide-slate-100 dark:divide-slate-800/80">
          {users.length === 0 ? (
            <div className="text-center py-8" style={{ color: 'rgb(var(--text-muted))' }}>
              No users found.
            </div>
          ) : (
            users.map(u => (
              <div key={u.id} className="p-4 space-y-3 text-left">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold" style={{ color: 'rgb(var(--text-primary))' }}>
                      {u.firstName} {u.lastName}
                    </h4>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {u.roles.map(role => (
                        <span
                          key={role}
                          className="px-1.5 py-0.5 rounded text-[9px] font-bold"
                          style={{
                            background: role === 'ROLE_SUPER_ADMIN' ? 'rgba(139,0,0,0.2)' : role === 'ROLE_ADMIN' ? 'rgba(184,134,11,0.2)' : 'rgba(21,128,61,0.2)',
                            color: role === 'ROLE_SUPER_ADMIN' ? '#ff6b6b' : role === 'ROLE_ADMIN' ? '#f59e0b' : '#4ade80',
                            border: role === 'ROLE_SUPER_ADMIN' ? '1px solid rgba(139,0,0,0.4)' : role === 'ROLE_ADMIN' ? '1px solid rgba(184,134,11,0.4)' : '1px solid rgba(21,128,61,0.4)',
                          }}
                        >
                          {role.replace('ROLE_', '')}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleActive(u)}
                    className="btn-icon"
                    title={u.isActive ? 'Deactivate user' : 'Activate user'}
                  >
                    {u.isActive ? (
                      <ToggleRight size={22} className="text-green-400" />
                    ) : (
                      <ToggleLeft size={22} className="text-slate-500" />
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold text-slate-500">
                  <div className="col-span-2">
                    <span className="block text-[9px] uppercase tracking-wider text-slate-400">Email Address</span>
                    <a href={`mailto:${u.email}`} className="font-mono text-blue-600 dark:text-blue-400 hover:underline">{u.email}</a>
                  </div>
                  <div>
                    <span className="block text-[9px] uppercase tracking-wider text-slate-400">Phone Number</span>
                    <span className="text-slate-700 dark:text-slate-200">{u.phone || '—'}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] uppercase tracking-wider text-slate-400">Department</span>
                    <span className="text-slate-700 dark:text-slate-200">{u.department?.name || 'Unassigned'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100/60 dark:border-slate-800/40">
                  <button
                    onClick={() => {
                      setEditing({
                        ...u,
                        departmentId: u.department?.id || '',
                        password: ''
                      })
                      setShowModal(true)
                    }}
                    className="btn-secondary btn-sm py-1.5 px-3 flex items-center gap-1"
                  >
                    <Edit size={12} /> Edit
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination footer */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t flex items-center justify-between"
               style={{ borderColor: 'rgb(var(--border-color))' }}>
            <span className="text-xs" style={{ color: 'rgb(var(--text-muted))' }}>
              Showing {users.length} of {totalEl} users
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
                disabled={page >= totalPages - 1}
                onClick={() => setPage(p => p + 1)}
                className="btn-secondary btn-xs"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <UserModal
          item={editing}
          departments={departments}
          onClose={() => { setShowModal(false); setEditing(null) }}
          onSave={handleSave}
        />
      )}
    </div>
  )
}
