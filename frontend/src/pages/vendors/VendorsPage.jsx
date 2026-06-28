import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, Eye, Edit, Trash2, X, RefreshCw, Star, Mail, Phone, Globe, Award } from 'lucide-react'
import { vendorApi } from '../../api/index'
import { getErrorMessage } from '../../utils/formatters'
import { useToast } from '../../hooks/useToast'
import { useDebounce } from '../../hooks/useDebounce'
import useAuthStore from '../../store/authStore'

// ── Vendor Modal ─────────────────────────────────────────────────────────────
function VendorModal({ item, onClose, onSave }) {
  const [form, setForm] = useState(item || {
    name: '', vendorCode: '', contactPerson: '', email: '', phone: '',
    address: '', city: '', state: '', gstin: '', website: '', notes: ''
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const fields = [
    { key: 'name',          label: 'Vendor Name *',    placeholder: 'e.g. Dell India', col: 2 },
    { key: 'vendorCode',    label: 'Vendor Code',      placeholder: 'e.g. VEN-DLL', col: 1 },
    { key: 'contactPerson', label: 'Contact Person',   placeholder: 'e.g. Rajesh Kumar', col: 1 },
    { key: 'email',         label: 'Email',            placeholder: 'sales@dell.com', type: 'email', col: 1 },
    { key: 'phone',         label: 'Phone',            placeholder: '+91 99999 88888', col: 1 },
    { key: 'gstin',         label: 'GSTIN',            placeholder: 'e.g. 07AAAAA1111A1Z1', col: 1 },
    { key: 'website',       label: 'Website',          placeholder: 'https://dell.in', col: 1 },
    { key: 'city',          label: 'City',             placeholder: 'New Delhi', col: 1 },
    { key: 'state',         label: 'State',            placeholder: 'Delhi', col: 1 },
    { key: 'address',       label: 'Address',          placeholder: 'Full address details...', col: 2 },
    { key: 'notes',         label: 'Notes',            placeholder: 'Any internal vendor notes...', col: 2 }
  ]

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box max-w-lg">
        <div className="px-6 py-4 border-b flex items-center justify-between"
             style={{ borderColor: 'rgb(var(--border-color))' }}>
          <h2 className="text-sm font-bold" style={{ color: 'rgb(var(--text-primary))' }}>
            {item ? 'Edit Vendor' : 'Add Vendor'}
          </h2>
          <button onClick={onClose} className="btn-icon">
            <X size={16} style={{ color: 'rgb(var(--text-muted))' }} />
          </button>
        </div>
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {fields.map(f => (
            <div key={f.key} className={f.col === 2 ? 'col-span-2' : ''}>
              <label className="form-label">{f.label}</label>
              {f.key === 'address' || f.key === 'notes' ? (
                <textarea
                  value={form[f.key] || ''}
                  onChange={e => set(f.key, e.target.value)}
                  placeholder={f.placeholder}
                  rows={2}
                  className="input text-sm resize-none"
                />
              ) : (
                <input
                  type={f.type || 'text'}
                  value={form[f.key] || ''}
                  onChange={e => set(f.key, e.target.value)}
                  placeholder={f.placeholder}
                  className="input text-sm"
                />
              )}
            </div>
          ))}
        </div>
        <div className="px-6 pb-6 flex justify-end gap-3">
          <button onClick={onClose} className="btn-secondary btn-sm">Cancel</button>
          <button onClick={() => onSave(form)} disabled={!form.name} className="btn-primary btn-sm">
            {item ? 'Save Changes' : 'Add Vendor'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Rating Modal ─────────────────────────────────────────────────────────────
function RatingModal({ vendorId, onClose, onSave }) {
  const [rating, setRating] = useState(5)
  const [comments, setComments] = useState('')

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box max-w-sm">
        <div className="px-6 py-4 border-b flex items-center justify-between"
             style={{ borderColor: 'rgb(var(--border-color))' }}>
          <h2 className="text-sm font-bold" style={{ color: 'rgb(var(--text-primary))' }}>
            Rate Vendor
          </h2>
          <button onClick={onClose} className="btn-icon">
            <X size={16} style={{ color: 'rgb(var(--text-muted))' }} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="form-label">Rating (1 to 5 Stars)</label>
            <div className="flex gap-2 justify-center py-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    size={28}
                    fill={star <= rating ? '#f59e0b' : 'none'}
                    stroke={star <= rating ? '#f59e0b' : 'rgb(var(--text-muted))'}
                  />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="form-label">Feedback Comments</label>
            <textarea
              value={comments}
              onChange={e => setComments(e.target.value)}
              rows={3}
              placeholder="e.g. Excellent service, timely delivery..."
              className="input text-sm resize-none"
            />
          </div>
        </div>
        <div className="px-6 pb-6 flex justify-end gap-3">
          <button onClick={onClose} className="btn-secondary btn-sm">Cancel</button>
          <button onClick={() => onSave({ rating, comments })} className="btn-primary btn-sm">
            Submit Rating
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function VendorsPage() {
  const { isAdmin } = useAuthStore()
  const qc = useQueryClient()
  const { success, error } = useToast()

  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const [ratingTarget, setRatingTarget] = useState(null)
  const [editing, setEditing] = useState(null)
  const debouncedSearch = useDebounce(search, 400)

  // Fetch Vendors
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['vendors', { page, search: debouncedSearch }],
    queryFn: () => vendorApi.getAll({
      page,
      size: 20,
      search: debouncedSearch || undefined,
    }).then(r => r.data.data),
    keepPreviousData: true,
  })

  const createMutation = useMutation({
    mutationFn: vendorApi.create,
    onSuccess: () => {
      success('Vendor added successfully!')
      qc.invalidateQueries(['vendors'])
      setShowModal(false)
    },
    onError: e => error(getErrorMessage(e)),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => vendorApi.update(id, data),
    onSuccess: () => {
      success('Vendor details updated!')
      qc.invalidateQueries(['vendors'])
      setEditing(null)
      setShowModal(false)
    },
    onError: e => error(getErrorMessage(e)),
  })

  const deleteMutation = useMutation({
    mutationFn: vendorApi.delete,
    onSuccess: () => {
      success('Vendor removed')
      qc.invalidateQueries(['vendors'])
    },
    onError: e => error(getErrorMessage(e)),
  })

  const addRatingMutation = useMutation({
    mutationFn: ({ id, ratingData }) => vendorApi.addRating(id, ratingData),
    onSuccess: () => {
      success('Rating added!')
      qc.invalidateQueries(['vendors'])
      setRatingTarget(null)
    },
    onError: e => error(getErrorMessage(e)),
  })

  const handleDelete = (id, name) => {
    if (window.confirm(`Delete vendor "${name}"?`)) {
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

  const handleRate = (ratingData) => {
    addRatingMutation.mutate({ id: ratingTarget, ratingData })
  }

  const vendors = data?.content || []
  const totalPages = data?.totalPages || 0
  const totalEl = data?.totalElements || 0

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Vendor Management</h1>
          <nav className="text-xs mt-0.5" style={{ color: 'rgb(var(--text-muted))' }}>
            Dashboard &rsaquo; <span style={{ color: 'var(--ams-blue-mid)' }}>Vendors</span>
          </nav>
        </div>
        {isAdmin && isAdmin() && (
          <button onClick={() => { setEditing(null); setShowModal(true) }} className="btn-primary btn-sm flex items-center gap-1.5">
            <Plus size={14} /> Add Vendor
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="card p-4 mb-5">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1" style={{ minWidth: '220px' }}>
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: 'rgb(var(--text-muted))' }} />
            <input
              type="text"
              placeholder="Search vendors by name or code..."
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

      {/* Vendors List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card p-6 space-y-3">
              <div className="skeleton h-5 w-40 rounded" />
              <div className="skeleton h-4 w-24 rounded" />
              <div className="skeleton h-12 w-full rounded-lg" />
            </div>
          ))
        ) : vendors.length === 0 ? (
          <div className="col-span-full card p-12 text-center" style={{ color: 'rgb(var(--text-muted))' }}>
            No vendors found.
          </div>
        ) : (
          vendors.map(v => (
            <div key={v.id} className="card p-5 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden">
              {/* Top Row: Name & Rating */}
              <div>
                <div className="flex justify-between items-start gap-2 mb-2">
                  <div>
                    <h3 className="font-semibold text-sm leading-snug" style={{ color: 'rgb(var(--text-primary))' }}>
                      {v.name}
                    </h3>
                    <span className="table-asset-tag text-[10px] py-0.5 mt-1 inline-block">
                      {v.vendorCode || `VEN-${v.id}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded text-amber-500 text-xs font-bold">
                    <Star size={12} fill="#f59e0b" />
                    {Number(v.avgRating || 0).toFixed(1)}
                  </div>
                </div>

                {/* Details list */}
                <div className="space-y-1.5 py-3 text-xs" style={{ color: 'rgb(var(--text-secondary))' }}>
                  {v.contactPerson && (
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium">Contact:</span> {v.contactPerson}
                    </div>
                  )}
                  {v.email && (
                    <a href={`mailto:${v.email}`} className="flex items-center gap-1.5 hover:underline" style={{ color: 'var(--ams-blue-mid)' }}>
                      <Mail size={12} /> {v.email}
                    </a>
                  )}
                  {v.phone && (
                    <div className="flex items-center gap-1.5">
                      <Phone size={12} /> {v.phone}
                    </div>
                  )}
                  {v.website && (
                    <a href={v.website} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:underline" style={{ color: 'var(--ams-blue-mid)' }}>
                      <Globe size={12} /> {v.website}
                    </a>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between border-t pt-3 mt-4" style={{ borderColor: 'rgb(var(--border-color))' }}>
                <button
                  onClick={() => setRatingTarget(v.id)}
                  className="btn-secondary btn-xs flex items-center gap-1"
                  style={{ color: 'var(--ams-blue-mid)' }}
                >
                  <Award size={12} /> Rate Vendor
                </button>

                {isAdmin && isAdmin() && (
                  <div className="flex gap-1">
                    <button
                      onClick={() => { setEditing(v); setShowModal(true) }}
                      className="btn-icon w-7 h-7 rounded hover:bg-sky-500/10 text-sky-500"
                      title="Edit"
                    >
                      <Edit size={13} />
                    </button>
                    <button
                      onClick={() => handleDelete(v.id, v.name)}
                      className="btn-icon w-7 h-7 rounded hover:bg-red-500/10 text-red-500"
                      title="Delete"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modals */}
      {showModal && (
        <VendorModal
          item={editing}
          onClose={() => { setShowModal(false); setEditing(null) }}
          onSave={handleSave}
        />
      )}

      {ratingTarget && (
        <RatingModal
          vendorId={ratingTarget}
          onClose={() => setRatingTarget(null)}
          onSave={handleRate}
        />
      )}
    </div>
  )
}
