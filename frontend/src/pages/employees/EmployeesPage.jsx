import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, Filter, Eye, Edit, Trash2, X, RefreshCw, Phone, Mail } from 'lucide-react'
import { employeeApi } from '../../api/index'
import { getErrorMessage } from '../../utils/formatters'
import { useToast } from '../../hooks/useToast'
import { useDebounce } from '../../hooks/useDebounce'
import useAuthStore from '../../store/authStore'

// ── Employee Form Modal ────────────────────────────────────────────────────────
function EmployeeModal({ emp, onClose, onSave }) {
  const [form, setForm] = useState(emp || {
    firstName: '', lastName: '', email: '', phone: '',
    department: '', designation: '', employeeCode: ''
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const fields = [
    { key: 'firstName',    label: 'First Name',    placeholder: 'John', col: 1 },
    { key: 'lastName',     label: 'Last Name',     placeholder: 'Doe',  col: 1 },
    { key: 'email',        label: 'Email',         placeholder: 'john@company.com', type: 'email', col: 2 },
    { key: 'phone',        label: 'Phone',         placeholder: '+91 00000 00000', col: 1 },
    { key: 'department',   label: 'Department',    placeholder: 'IT Department', col: 1 },
    { key: 'designation',  label: 'Designation',   placeholder: 'Software Engineer', col: 2 },
    { key: 'employeeCode', label: 'Employee Code', placeholder: 'EMP-001', col: 1 },
  ]

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box max-w-lg">
        <div className="px-6 py-4 border-b flex items-center justify-between"
             style={{ borderColor: 'rgb(var(--border-color))' }}>
          <h2 className="text-sm font-bold" style={{ color: 'rgb(var(--text-primary))' }}>
            {emp ? 'Edit Employee' : 'Add Employee'}
          </h2>
          <button onClick={onClose} className="btn-icon">
            <X size={16} style={{ color: 'rgb(var(--text-muted))' }} />
          </button>
        </div>
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {fields.map(f => (
            <div key={f.key} className={f.col === 2 ? 'col-span-2' : ''}>
              <label className="form-label">{f.label}</label>
              <input
                type={f.type || 'text'}
                value={form[f.key] || ''}
                onChange={e => set(f.key, e.target.value)}
                placeholder={f.placeholder}
                className="input text-sm"
              />
            </div>
          ))}
        </div>
        <div className="px-6 pb-6 flex items-center justify-end gap-3">
          <button onClick={onClose} className="btn-secondary btn-sm">Cancel</button>
          <button onClick={() => onSave(form)} className="btn-primary btn-sm">
            {emp ? 'Save Changes' : 'Add Employee'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function EmployeesPage() {
  const { isAdmin } = useAuthStore()
  const qc = useQueryClient()
  const { success, error } = useToast()

  const [search, setSearch]   = useState('')
  const [page, setPage]       = useState(0)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const debouncedSearch       = useDebounce(search, 400)

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['employees', { page, search: debouncedSearch }],
    queryFn: () => employeeApi.getAll({
      page, size: 20,
      search: debouncedSearch || undefined,
    }).then(r => r.data.data),
    keepPreviousData: true,
  })

  const createMutation = useMutation({
    mutationFn: employeeApi.create,
    onSuccess: () => { success('Employee added!'); qc.invalidateQueries(['employees']); setShowModal(false) },
    onError: (e) => error(getErrorMessage(e)),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => employeeApi.update(id, data),
    onSuccess: () => { success('Employee updated!'); qc.invalidateQueries(['employees']); setEditing(null) },
    onError: (e) => error(getErrorMessage(e)),
  })

  const deleteMutation = useMutation({
    mutationFn: employeeApi.delete,
    onSuccess: () => { success('Employee removed'); qc.invalidateQueries(['employees']) },
    onError: (e) => error(getErrorMessage(e)),
  })

  const handleDelete = (id, name) => {
    if (window.confirm(`Remove employee "${name}"?`)) deleteMutation.mutate(id)
  }

  const handleSave = (form) => {
    if (editing) {
      updateMutation.mutate({ id: editing.id, data: form })
    } else {
      createMutation.mutate(form)
    }
  }

  const employees   = data?.content || []
  const totalPages  = data?.totalPages || 0
  const totalEl     = data?.totalElements || 0

  const initials = (e) => ((e?.firstName?.[0] || '') + (e?.lastName?.[0] || '')).toUpperCase()

  return (
    <div className="animate-fade-in">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Employees</h1>
          <nav className="text-xs mt-0.5" style={{ color: 'rgb(var(--text-muted))' }}>
            Dashboard &rsaquo; <span style={{ color: 'var(--ams-blue-mid)' }}>Employees</span>
          </nav>
        </div>
        {isAdmin && isAdmin() && (
          <button onClick={() => { setEditing(null); setShowModal(true) }} className="btn-primary btn-sm flex items-center gap-1.5">
            <Plus size={14} /> Add Employee
          </button>
        )}
      </div>

      {/* ── Search + Filter bar ──────────────────────────────────────────────── */}
      <div className="card p-4 mb-5">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1" style={{ minWidth: '220px' }}>
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: 'rgb(var(--text-muted))' }} />
            <input
              type="text"
              placeholder="Search employees..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(0) }}
              className="search-input"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X size={13} style={{ color: 'rgb(var(--text-muted))' }} />
              </button>
            )}
          </div>
          <button className="btn-secondary btn-sm gap-1.5">
            <Filter size={13} /> Filters
          </button>
          <button onClick={() => refetch()} className="btn-secondary btn-sm">
            <RefreshCw size={13} className={isFetching ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* ── Table ───────────────────────────────────────────────────────────── */}
      <div className="card overflow-hidden">
        <div className="px-5 py-3.5 border-b flex items-center justify-between"
             style={{ borderColor: 'rgb(var(--border-color))' }}>
          <p className="text-sm font-semibold" style={{ color: 'rgb(var(--text-primary))' }}>
            Employee Directory
            <span className="ml-2 text-xs font-normal" style={{ color: 'rgb(var(--text-muted))' }}>
              ({totalEl} total)
            </span>
          </p>
        </div>

        {isLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 7 }).map((_, i) => <div key={i} className="skeleton h-12 rounded-lg" />)}
          </div>
        ) : (
          <>
            <div className="hidden md:block table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Name</th>
                    <th>Department</th>
                    <th>Designation</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th className="text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-16">
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-12 h-12 rounded-full flex items-center justify-center"
                               style={{ background: 'rgb(var(--bg-elevated))' }}>
                            <Search size={20} style={{ color: 'rgb(var(--text-muted))' }} />
                          </div>
                          <p className="text-sm" style={{ color: 'rgb(var(--text-muted))' }}>
                            {search ? 'No employees match your search' : 'No employees found'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : employees.map(emp => (
                    <tr key={emp.id}>
                      {/* Avatar + Code */}
                      <td>
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                               style={{ background: 'var(--ams-blue-mid)' }}>
                            {initials(emp)}
                          </div>
                          <span className="table-asset-tag">{emp.employeeCode || `EMP-${emp.id}`}</span>
                        </div>
                      </td>
                      {/* Name */}
                      <td>
                        <div className="font-medium text-sm" style={{ color: 'rgb(var(--text-primary))' }}>
                          {emp.firstName} {emp.lastName}
                        </div>
                      </td>
                      {/* Department */}
                      <td className="text-sm" style={{ color: 'rgb(var(--text-secondary))' }}>
                        {emp.departmentName || emp.department || '—'}
                      </td>
                      {/* Designation */}
                      <td className="text-sm" style={{ color: 'rgb(var(--text-secondary))' }}>
                        {emp.designation || '—'}
                      </td>
                      {/* Email */}
                      <td>
                        <a href={`mailto:${emp.email}`}
                           className="text-xs flex items-center gap-1 hover:underline"
                           style={{ color: 'var(--ams-blue-mid)' }}>
                          <Mail size={11} /> {emp.email}
                        </a>
                      </td>
                      {/* Phone */}
                      <td className="text-sm" style={{ color: 'rgb(var(--text-secondary))' }}>
                        {emp.phone || '—'}
                      </td>
                      {/* Actions */}
                      <td>
                        <div className="flex items-center justify-center gap-1.5">
                          <button className="btn-icon-view" title="View">
                            <Eye size={14} />
                          </button>
                          {isAdmin && isAdmin() && (
                            <>
                              <button
                                onClick={() => { setEditing(emp); setShowModal(true) }}
                                className="btn-icon-edit" title="Edit">
                                <Edit size={14} />
                              </button>
                              <button
                                onClick={() => handleDelete(emp.id, `${emp.firstName} ${emp.lastName}`)}
                                className="btn-icon-delete" title="Delete">
                                <Trash2 size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View Card List */}
            <div className="block md:hidden divide-y divide-slate-100 dark:divide-slate-800/80">
              {employees.length === 0 ? (
                <div className="text-center py-12 px-4 flex flex-col items-center gap-2">
                  <Search size={20} style={{ color: 'rgb(var(--text-muted))' }} />
                  <p className="text-sm" style={{ color: 'rgb(var(--text-muted))' }}>
                    {search ? 'No employees match your search' : 'No employees found'}
                  </p>
                </div>
              ) : (
                employees.map(emp => (
                  <div key={emp.id} className="p-4 space-y-3 text-left">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                           style={{ background: 'var(--ams-blue-mid)' }}>
                        {initials(emp)}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold" style={{ color: 'rgb(var(--text-primary))' }}>
                          {emp.firstName} {emp.lastName}
                        </h4>
                        <p className="text-xs" style={{ color: 'rgb(var(--text-muted))' }}>
                          {emp.employeeCode || `EMP-${emp.id}`}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold text-slate-500">
                      <div>
                        <span className="block text-[9px] uppercase tracking-wider text-slate-400">Department</span>
                        <span className="text-slate-700 dark:text-slate-200">{emp.departmentName || emp.department || '—'}</span>
                      </div>
                      <div>
                        <span className="block text-[9px] uppercase tracking-wider text-slate-400">Designation</span>
                        <span className="text-slate-700 dark:text-slate-200">{emp.designation || '—'}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="block text-[9px] uppercase tracking-wider text-slate-400">Email Address</span>
                        <a href={`mailto:${emp.email}`} className="font-mono text-blue-600 dark:text-blue-400 hover:underline">{emp.email}</a>
                      </div>
                      <div className="col-span-2">
                        <span className="block text-[9px] uppercase tracking-wider text-slate-400">Phone Number</span>
                        <span className="text-slate-700 dark:text-slate-200">{emp.phone || '—'}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100/60 dark:border-slate-800/40">
                      <button className="btn-secondary btn-sm py-1.5 px-3 flex items-center gap-1">
                        <Eye size={12} /> View
                      </button>
                      {isAdmin && isAdmin() && (
                        <>
                          <button onClick={() => { setEditing(emp); setShowModal(true) }} className="btn-secondary btn-sm py-1.5 px-3 flex items-center gap-1">
                            <Edit size={12} /> Edit
                          </button>
                          <button onClick={() => handleDelete(emp.id, `${emp.firstName} ${emp.lastName}`)} className="btn-secondary btn-sm py-1.5 px-3 flex items-center gap-1 text-red-700 dark:text-red-400">
                            <Trash2 size={12} /> Delete
                          </button>
                        </>
                      )}
                    </div>
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
                  {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => (
                    <button key={i} onClick={() => setPage(i)}
                            className={`pagination-btn ${i === page ? 'active' : ''}`}>
                      {i + 1}
                    </button>
                  ))}
                  <button disabled={page === totalPages - 1} onClick={() => setPage(p => p + 1)} className="pagination-btn disabled:opacity-40">
                    Next &rsaquo;
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Modal ───────────────────────────────────────────────────────────── */}
      {showModal && (
        <EmployeeModal
          emp={editing}
          onClose={() => { setShowModal(false); setEditing(null) }}
          onSave={handleSave}
        />
      )}
    </div>
  )
}
