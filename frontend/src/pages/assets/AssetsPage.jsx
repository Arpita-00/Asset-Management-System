import React, { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, Filter, RefreshCw, Eye, Edit, Trash2, QrCode, Download, FileSpreadsheet, X, Mail, Printer, ArrowRight, Calendar, User, Building, Tag, MapPin } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { assetApi, reportApi } from '../../api/index'
import { formatDate, formatCurrency, getStatusClass, formatStatus, downloadBlob, getErrorMessage } from '../../utils/formatters'
import { useDebounce } from '../../hooks/useDebounce'
import { useToast } from '../../hooks/useToast'
import { ASSET_STATUSES } from '../../utils/constants'
import useAuthStore from '../../store/authStore'
import useLanguageStore from '../../store/languageStore'
import { useTranslation } from '../../utils/translations'
import EnterpriseTable from '../../components/common/EnterpriseTable'

export default function AssetsPage() {
  const { lang } = useLanguageStore()
  const t = useTranslation(lang)
  const { isAdmin } = useAuthStore()
  const qc = useQueryClient()
  const { success, error } = useToast()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState('inventory') // 'inventory', 'movements', 'categories'
  const [selectedQrAsset, setSelectedQrAsset] = useState(null)
  const [regenerating, setRegenerating] = useState(false)
  const [sendingEmail, setSendingEmail] = useState(false)

  // Fetch all assets in one call so that the Enterprise Table can sort, filter, and page them with zero lag
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['assets', 'all-list'],
    queryFn: () => assetApi.getAll({
      page: 0, size: 200
    }).then(r => r.data.data),
  })

  const deleteMutation = useMutation({
    mutationFn: assetApi.delete,
    onSuccess: () => {
      success('Asset deleted successfully')
      qc.invalidateQueries(['assets'])
      qc.invalidateQueries(['dashboard'])
    },
    onError: (err) => error(getErrorMessage(err)),
  })

  const handleDelete = (id, name) => {
    if (window.confirm(`Delete "${name}"? This action cannot be undone.`)) {
      deleteMutation.mutate(id)
    }
  }

  const handleDownload = async (format) => {
    success('Generating report...')
    try {
      const res = await reportApi.downloadAssets({ format })
      const ext = format === 'excel' ? 'xlsx' : 'pdf'
      downloadBlob(res.data, `assets_report.${ext}`)
    } catch (e) { error(getErrorMessage(e)) }
  }

  const handleDownloadQr = (asset) => {
    if (!asset) return
    const tag = asset.assetUniqueId || asset.assetTag
    const url = `${import.meta.env.VITE_API_BASE_URL || 'https://asset-management-system-2s9o.onrender.com/api'}/qr/${tag}`
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `QR_${tag}.png`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    success('QR Code download started.')
  }

  const handlePrintQr = (asset) => {
    if (!asset) return
    const tag = asset.assetUniqueId || asset.assetTag
    const qrUrl = `${import.meta.env.VITE_API_BASE_URL || 'https://asset-management-system-2s9o.onrender.com/api'}/qr/${tag}`
    const printWindow = window.open('', '_blank', 'width=350,height=400')
    printWindow.document.write(`
      <html>
        <head>
          <title>Print QR Label</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; margin: 15px; }
            .label { border: 2px dashed #000; padding: 15px; border-radius: 8px; display: inline-block; }
            img { width: 180px; height: 180px; }
            h2 { font-size: 13px; margin: 8px 0 2px 0; }
            p { font-size: 10px; font-family: monospace; margin: 0; }
          </style>
        </head>
        <body>
          <div class="label">
            <h2>${asset.name}</h2>
            <img src="${qrUrl}" />
            <p>ID: ${tag}</p>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            }
          </script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  const handleRegenerateQr = async (asset) => {
    try {
      setRegenerating(true)
      await assetApi.generateQr(asset.id)
      success('QR Code regenerated successfully.')
      qc.invalidateQueries(['assets'])
    } catch (e) {
      error('Failed to regenerate QR code: ' + getErrorMessage(e))
    } finally {
      setRegenerating(false)
    }
  }

  const handleEmailQr = async (asset) => {
    try {
      setSendingEmail(true)
      await assetApi.generateQr(asset.id)
      success('QR Code emailed to administrator.')
    } catch (e) {
      error('Failed to email QR code: ' + getErrorMessage(e))
    } finally {
      setSendingEmail(false)
    }
  }

  const assets = data?.content || []

  // Define table columns
  const tableColumns = useMemo(() => [
    {
      key: 'assetTag',
      header: t('Asset ID'),
      sortable: true,
      width: 120,
      render: (a) => (
        <span className="table-asset-tag" onClick={(e) => { e.stopPropagation(); navigate(`/assets/${a.id}`); }}>
          #{a.assetTag || a.id}
        </span>
      )
    },
    {
      key: 'name',
      header: t('Asset Name'),
      sortable: true,
      width: 250,
      render: (a) => (
        <div>
          <div className="font-bold text-white leading-tight">{a.name}</div>
          {a.brand && <div className="text-[10.5px] text-slate-500 mt-0.5">{a.brand} {a.model}</div>}
        </div>
      )
    },
    {
      key: 'categoryName',
      header: t('Category'),
      sortable: true,
      filterable: true,
      width: 150
    },
    {
      key: 'serialNumber',
      header: t('Serial Number'),
      sortable: false,
      width: 140,
      render: (a) => <span className="font-mono text-[10.5px]">{a.serialNumber || '—'}</span>
    },
    {
      key: 'status',
      header: t('Status'),
      sortable: true,
      filterable: true,
      width: 130,
      render: (a) => (
        <span className={`badge ${getStatusClass(a.status)}`}>
          {formatStatus(a.status)}
        </span>
      )
    },
    {
      key: 'assignedToName',
      header: t('Assigned To'),
      sortable: true,
      width: 150
    },
    {
      key: 'purchaseCost',
      header: t('Purchase Cost'),
      sortable: true,
      width: 130,
      render: (a) => <span className="font-mono">{formatCurrency(a.purchaseCost)}</span>
    },
    {
      key: 'warrantyExpiry',
      header: t('Warranty'),
      sortable: true,
      width: 120,
      render: (a) => <span>{formatDate(a.warrantyExpiry) || '—'}</span>
    },
    {
      key: 'actions',
      header: t('Action'),
      sortable: false,
      width: 130,
      render: (a) => (
        <div className="flex items-center gap-1.5 justify-center">
          <Link to={`/assets/${a.id}`} className="btn-icon-view" title="View Details">
            <Eye size={13} />
          </Link>
          {isAdmin && isAdmin() && (
            <>
              <button 
                onClick={(e) => { e.stopPropagation(); setSelectedQrAsset(a); }} 
                className="btn-icon-qr" 
                title="QR Code Options"
              >
                <QrCode size={13} />
              </button>
              <Link to={`/assets/${a.id}/edit`} className="btn-icon-edit" title="Edit" onClick={(e) => e.stopPropagation()}>
                <Edit size={13} />
              </Link>
              <button 
                onClick={(e) => { e.stopPropagation(); handleDelete(a.id, a.name); }} 
                className="btn-icon-delete" 
                title="Delete"
              >
                <Trash2 size={13} />
              </button>
            </>
          )}
        </div>
      )
    }
  ], [t, isAdmin, navigate])

  const bulkActionsList = useMemo(() => [
    {
      label: 'Delete Selected',
      variant: 'danger',
      action: (ids) => {
        if (window.confirm(`Delete these ${ids.length} assets? This action cannot be undone.`)) {
          ids.forEach(id => {
            const match = assets.find(a => a.id === id || a.assetTag === id)
            if (match) deleteMutation.mutate(match.id)
          })
        }
      }
    }
  ], [assets, deleteMutation])

  return (
    <div className="animate-fade-in text-left">

      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <div className="page-header flex items-center justify-between border-b pb-4 mb-5" style={{ borderColor: 'rgb(var(--border-color))' }}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-5 rounded-sm bg-[#7c0a0a]" />
            <h1 className="text-base font-bold uppercase tracking-wider text-white">{t("Assets")}</h1>
          </div>
          <nav className="text-xs text-slate-400 pl-4">
            {t("Dashboard")} &rsaquo; <span className="text-[#3b82f6]">{t("Assets")}</span>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          {activeTab === 'inventory' && (
            <>
              <button onClick={() => handleDownload('excel')} className="btn-secondary btn-sm flex items-center gap-1.5 shadow-sm">
                <FileSpreadsheet size={13} />
                <span>Export Dataset</span>
              </button>
              {isAdmin && isAdmin() && (
                <Link to="/assets/new" className="btn-primary btn-sm flex items-center gap-1.5 shadow">
                  <Plus size={13} />
                  <span>{t("Add Asset")}</span>
                </Link>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Tab Header ──────────────────────────────────────────────────────── */}
      {isAdmin && isAdmin() && (
        <div className="tab-bar px-4 mb-5 border-b border-slate-800">
          <button 
            onClick={() => setActiveTab('inventory')}
            className={`tab-btn ${activeTab === 'inventory' ? 'active' : ''}`}
          >
            Asset Inventory
          </button>
          <button 
            onClick={() => setActiveTab('movements')}
            className={`tab-btn ${activeTab === 'movements' ? 'active' : ''}`}
          >
            Asset Movements
          </button>
          <button 
            onClick={() => setActiveTab('categories')}
            className={`tab-btn ${activeTab === 'categories' ? 'active' : ''}`}
          >
            Asset Categories
          </button>
        </div>
      )}

      {activeTab === 'movements' && isAdmin && isAdmin() ? (
        <MovementsTab />
      ) : activeTab === 'categories' && isAdmin && isAdmin() ? (
        <CategoriesTab />
      ) : (
        <>
          <EnterpriseTable
            data={assets}
            columns={tableColumns}
            isLoading={isLoading}
            emptyMessage={t('No assets found')}
            bulkActions={bulkActionsList}
            exportFilename="ecor_assets_inventory"
            searchPlaceholder="Search asset name, brands, or tag serials..."
            onRowClick={(item) => navigate(`/assets/${item.id}`)}
          />
        </>
      )}

      {/* QR Code Actions Modal */}
      {selectedQrAsset && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-scale-in">
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/20">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <QrCode size={16} style={{ color: 'var(--ams-blue-mid)' }} /> Asset QR Code Actions
              </h3>
              <button 
                onClick={() => setSelectedQrAsset(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6 flex flex-col items-center gap-4 text-xs">
              <div className="text-center">
                <h4 className="font-bold text-slate-200 text-sm">{selectedQrAsset.name}</h4>
                <p className="text-[10px] text-slate-400 mt-1">{selectedQrAsset.brand} {selectedQrAsset.model}</p>
              </div>

              <div className="bg-slate-950 border border-slate-850 rounded-xl p-4 flex flex-col items-center justify-center gap-3">
                <img 
                  src={`${import.meta.env.VITE_API_BASE_URL || 'https://asset-management-system-2s9o.onrender.com/api'}/qr/${selectedQrAsset.assetUniqueId || selectedQrAsset.assetTag}`} 
                  alt="Asset QR Code" 
                  className="w-44 h-44 rounded-lg border bg-white p-1"
                  style={{ borderColor: 'rgb(var(--border-color))' }}
                />
                <p className="text-xs font-mono select-all animate-pulse" style={{ color: 'rgb(var(--text-muted))' }}>
                  {selectedQrAsset.assetUniqueId || selectedQrAsset.assetTag}
                </p>
              </div>

              <div className="w-full grid grid-cols-2 gap-2 mt-2">
                <button 
                  onClick={() => handleDownloadQr(selectedQrAsset)} 
                  className="btn-secondary btn-sm justify-center gap-1.5"
                >
                  <Download size={13} /> Download QR
                </button>
                <button 
                  onClick={() => handlePrintQr(selectedQrAsset)} 
                  className="btn-secondary btn-sm justify-center gap-1.5"
                >
                  <Printer size={13} /> Print Label
                </button>
                <button 
                  onClick={() => handleRegenerateQr(selectedQrAsset)} 
                  disabled={regenerating}
                  className="btn-secondary btn-sm justify-center gap-1.5 col-span-2"
                >
                  <RefreshCw size={13} className={regenerating ? 'animate-spin' : ''} />
                  {regenerating ? 'Regenerating...' : 'Regenerate QR Code'}
                </button>
                <button 
                  onClick={() => handleEmailQr(selectedQrAsset)} 
                  disabled={sendingEmail}
                  className="btn-secondary btn-sm justify-center gap-1.5 col-span-2"
                >
                  <Mail size={13} />
                  {sendingEmail ? 'Sending Email...' : 'Email QR to Admin'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function CategoryModal({ item, onClose, onSave }) {
  const [form, setForm] = useState(item || { name: '', code: '', description: '' })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box max-w-md animate-fade-in text-left">
        <div className="px-6 py-4 border-b flex items-center justify-between"
             style={{ borderColor: 'rgb(var(--border-color))' }}>
          <h2 className="text-sm font-bold" style={{ color: 'rgb(var(--text-primary))' }}>
            {item ? 'Edit Category' : 'Add Category'}
          </h2>
          <button onClick={onClose} className="btn-icon">
            <X size={16} style={{ color: 'rgb(var(--text-muted))' }} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="form-label">Category Name *</label>
            <input
              type="text"
              value={form.name || ''}
              onChange={e => set('name', e.target.value)}
              placeholder="e.g. IT Equipment"
              className="input text-sm"
              required
            />
          </div>
          <div>
            <label className="form-label">Category Code *</label>
            <input
              type="text"
              value={form.code || ''}
              onChange={e => set('code', e.target.value)}
              placeholder="e.g. ITE"
              className="input text-sm"
              required
              disabled={!!item}
            />
          </div>
          <div>
            <label className="form-label">Description</label>
            <textarea
              value={form.description || ''}
              onChange={e => set('description', e.target.value)}
              placeholder="Provide a description of assets under this category..."
              rows={3}
              className="input text-sm resize-none"
            />
          </div>
        </div>
        <div className="px-6 pb-6 flex justify-end gap-3">
          <button onClick={onClose} className="btn-secondary btn-sm">Cancel</button>
          <button onClick={() => onSave(form)} disabled={!form.name || !form.code} className="btn-primary btn-sm">
            {item ? 'Save Changes' : 'Add Category'}
          </button>
        </div>
      </div>
    </div>
  )
}

function CategoriesTab() {
  const { isAdmin } = useAuthStore()
  const qc = useQueryClient()
  const { success, error } = useToast()

  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)

  const { data = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ['categories'],
    queryFn: () => assetApi.getCategories().then(r => r.data.data),
  })

  const createMutation = useMutation({
    mutationFn: assetApi.createCategory,
    onSuccess: () => {
      success('Category added successfully!')
      qc.invalidateQueries(['categories'])
      setShowModal(false)
    },
    onError: e => error(getErrorMessage(e)),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => assetApi.updateCategory(id, data),
    onSuccess: () => {
      success('Category updated successfully!')
      qc.invalidateQueries(['categories'])
      setEditing(null)
      setShowModal(false)
    },
    onError: e => error(getErrorMessage(e)),
  })

  const deleteMutation = useMutation({
    mutationFn: assetApi.deleteCategory,
    onSuccess: () => {
      success('Category deactivated successfully!')
      qc.invalidateQueries(['categories'])
    },
    onError: e => error(getErrorMessage(e)),
  })

  const handleDelete = (id, name) => {
    if (window.confirm(`Are you sure you want to deactivate category "${name}"?`)) {
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

  const filtered = data.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.code.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-4 text-left">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">
          Asset Categories
        </h3>
        {isAdmin && isAdmin() && (
          <button onClick={() => { setEditing(null); setShowModal(true) }} className="btn-primary btn-sm flex items-center gap-1.5">
            <Plus size={14} /> Add Category
          </button>
        )}
      </div>

      <div className="card p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1" style={{ minWidth: '220px' }}>
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: 'rgb(var(--text-muted))' }} />
            <input
              type="text"
              placeholder="Search categories by name or code..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="search-input"
            />
          </div>
          <button onClick={() => refetch()} className="btn-secondary btn-sm">
            <RefreshCw size={13} className={isFetching ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="card overflow-hidden text-[13px]">
        <div className="overflow-x-auto">
          <table className="table">
          <thead>
            <tr>
              <th className="w-16">ID</th>
              <th>Name</th>
              <th>Code</th>
              <th>Description</th>
              <th className="w-24 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}>
                  <td><div className="skeleton h-4 w-8 rounded" /></td>
                  <td><div className="skeleton h-4 w-28 rounded" /></td>
                  <td><div className="skeleton h-4 w-12 rounded" /></td>
                  <td><div className="skeleton h-4 w-48 rounded" /></td>
                  <td className="text-right"><div className="skeleton h-4 w-16 rounded ml-auto" /></td>
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8" style={{ color: 'rgb(var(--text-muted))' }}>
                  No active categories found.
                </td>
              </tr>
            ) : (
              filtered.map(c => (
                <tr key={c.id}>
                  <td className="font-semibold" style={{ color: 'rgb(var(--text-muted))' }}>#{c.id}</td>
                  <td className="font-semibold" style={{ color: 'rgb(var(--text-primary))' }}>{c.name}</td>
                  <td>
                    <span className="table-asset-tag">
                      {c.code}
                    </span>
                  </td>
                  <td style={{ color: 'rgb(var(--text-secondary))' }}>{c.description || 'N/A'}</td>
                  <td className="text-right">
                    <div className="flex justify-end gap-1.5">
                      {isAdmin && isAdmin() && (
                        <>
                          <button
                            onClick={() => { setEditing(c); setShowModal(true) }}
                            className="btn-icon"
                            title="Edit"
                          >
                            <Edit size={14} style={{ color: 'rgb(var(--text-muted))' }} />
                          </button>
                          <button
                            onClick={() => handleDelete(c.id, c.name)}
                            className="btn-icon hover:bg-red-500/10"
                            title="Delete"
                          >
                            <Trash2 size={14} style={{ color: '#8B0000' }} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </div>

      {showModal && (
        <CategoryModal
          item={editing}
          onClose={() => { setShowModal(false); setEditing(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  )
}

function MovementsTab() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')

  const { data = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ['movements'],
    queryFn: () => assetApi.getAllMovements().then(r => r.data.data),
  })

  const filtered = data.filter(m => {
    if (typeFilter && m.movementType !== typeFilter) return false

    const q = search.toLowerCase()
    const assetName = m.asset?.name || ''
    const assetTag = m.asset?.assetTag || ''
    const reason = m.reason || ''
    const fromLoc = m.fromLocation || ''
    const toLoc = m.toLocation || ''
    const fromDept = m.fromDepartment || ''
    const toDept = m.toDepartment || ''
    const fromEmp = m.fromEmployee || ''
    const toEmp = m.toEmployee || ''

    return (
      assetName.toLowerCase().includes(q) ||
      assetTag.toLowerCase().includes(q) ||
      reason.toLowerCase().includes(q) ||
      fromLoc.toLowerCase().includes(q) ||
      toLoc.toLowerCase().includes(q) ||
      fromDept.toLowerCase().includes(q) ||
      toDept.toLowerCase().includes(q) ||
      fromEmp.toLowerCase().includes(q) ||
      toEmp.toLowerCase().includes(q)
    )
  })

  const getMovementBadge = (type) => {
    const styles = {
      ALLOCATION: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20',
      RETURN: 'bg-blue-500/10 text-blue-500 border border-blue-500/20',
      TRANSFER: 'bg-purple-500/10 text-purple-500 border border-purple-500/20',
      REPAIR_CENTER: 'bg-amber-500/10 text-amber-500 border border-amber-500/20',
      DISPOSAL: 'bg-red-500/10 text-red-500 border border-red-500/20',
      LOCATION_CHANGE: 'bg-cyan-500/10 text-cyan-500 border border-cyan-500/20',
    }
    return styles[type] || 'bg-gray-500/10 text-gray-500 border border-gray-500/20'
  }

  return (
    <div className="space-y-4 text-left">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">
          Asset Movements Log
        </h3>
      </div>

      <div className="card p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1" style={{ minWidth: '220px' }}>
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: 'rgb(var(--text-muted))' }} />
            <input
              type="text"
              placeholder="Search by asset, employee, department, location..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="search-input"
            />
          </div>

          <div style={{ minWidth: '180px' }}>
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="input py-1.5 px-3 text-xs"
            >
              <option value="">All Movement Types</option>
              <option value="ALLOCATION">Allocation</option>
              <option value="RETURN">Return</option>
              <option value="TRANSFER">Transfer</option>
              <option value="REPAIR_CENTER">Repair Center</option>
              <option value="DISPOSAL">Disposal</option>
              <option value="LOCATION_CHANGE">Location Change</option>
            </select>
          </div>

          <button onClick={() => refetch()} className="btn-secondary btn-sm">
            <RefreshCw size={13} className={isFetching ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="card overflow-hidden text-[13px]">
        <div className="hidden md:block overflow-x-auto">
          <table className="table">
          <thead>
            <tr>
              <th>Date & Time</th>
              <th>Asset</th>
              <th>Type</th>
              <th>Origin & Destination Details</th>
              <th>Reason / Notes</th>
              <th>Authorized By</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td><div className="skeleton h-4 w-24 rounded" /></td>
                  <td><div className="skeleton h-4 w-36 rounded" /></td>
                  <td><div className="skeleton h-4 w-16 rounded" /></td>
                  <td><div className="skeleton h-4 w-48 rounded" /></td>
                  <td><div className="skeleton h-4 w-28 rounded" /></td>
                  <td><div className="skeleton h-4 w-20 rounded" /></td>
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8" style={{ color: 'rgb(var(--text-muted))' }}>
                  No movement logs found.
                </td>
              </tr>
            ) : (
              filtered.map(m => {
                const showEmployee = m.fromEmployee || m.toEmployee
                const showDept = m.fromDepartment || m.toDepartment
                const showLoc = m.fromLocation || m.toLocation

                return (
                  <tr key={m.id}>
                    <td className="whitespace-nowrap" style={{ color: 'rgb(var(--text-secondary))' }}>
                      <div className="flex items-center gap-1.5">
                        <Calendar size={13} style={{ color: 'rgb(var(--text-muted))' }} />
                        {new Date(m.movementDate).toLocaleString()}
                      </div>
                    </td>
                    <td>
                      <div>
                        <div className="font-semibold" style={{ color: 'rgb(var(--text-primary))' }}>
                          {m.asset?.name || 'Unknown Asset'}
                        </div>
                        <span className="table-asset-tag text-[10px] mt-0.5 inline-block">
                          {m.asset?.assetTag || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getMovementBadge(m.movementType)}`}>
                        {m.movementType}
                      </span>
                    </td>
                    <td className="max-w-xs">
                      <div className="space-y-1">
                        {showEmployee && (
                          <div className="flex items-center gap-1 text-[11px]" style={{ color: 'rgb(var(--text-secondary))' }}>
                            <User size={11} style={{ color: 'rgb(var(--text-muted))' }} />
                            <span>{m.fromEmployee || 'N/A'}</span>
                            <ArrowRight size={10} className="mx-1" />
                            <span>{m.toEmployee || 'N/A'}</span>
                          </div>
                        )}
                        {showDept && (
                          <div className="flex items-center gap-1 text-[11px]" style={{ color: 'rgb(var(--text-secondary))' }}>
                            <Building size={11} style={{ color: 'rgb(var(--text-muted))' }} />
                            <span>{m.fromDepartment || 'N/A'}</span>
                            <ArrowRight size={10} className="mx-1" />
                            <span>{m.toDepartment || 'N/A'}</span>
                          </div>
                        )}
                        {showLoc && (
                          <div className="flex items-center gap-1 text-[11px]" style={{ color: 'rgb(var(--text-secondary))' }}>
                            <MapPin size={11} style={{ color: 'rgb(var(--text-muted))' }} />
                            <span>{m.fromLocation || 'N/A'}</span>
                            <ArrowRight size={10} className="mx-1" />
                            <span>{m.toLocation || 'N/A'}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="max-w-xs truncate" style={{ color: 'rgb(var(--text-secondary))' }} title={m.reason}>
                      {m.reason || 'No reason provided'}
                    </td>
                    <td>
                      <div className="font-medium" style={{ color: 'rgb(var(--text-primary))' }}>
                        {m.movedBy ? `${m.movedBy.firstName} ${m.movedBy.lastName}` : 'System / Auto'}
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
        </div>

        {/* Mobile View Card List */}
        <div className="block md:hidden divide-y divide-slate-100 dark:divide-slate-800/40">
          {isLoading ? (
            /* Skeletal Loading Cards */
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-4 space-y-3 animate-pulse">
                <div className="h-4 bg-slate-800 rounded w-1/3" />
                <div className="h-4 bg-slate-800 rounded w-1/2" />
                <div className="h-3 bg-slate-800 rounded w-2/3" />
              </div>
            ))
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-slate-500 font-semibold">
              No movement logs found.
            </div>
          ) : (
            filtered.map(m => {
              const showEmployee = m.fromEmployee || m.toEmployee
              const showDept = m.fromDepartment || m.toDepartment
              const showLoc = m.fromLocation || m.toLocation

              return (
                <div key={m.id} className="p-4 space-y-3 text-left">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-white leading-tight">
                        {m.asset?.name || 'Unknown Asset'}
                      </h4>
                      <span className="table-asset-tag text-[9.5px] mt-1 inline-block">
                        {m.asset?.assetTag || 'N/A'}
                      </span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold self-start ${getMovementBadge(m.movementType)}`}>
                      {m.movementType}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-2 text-[11px] font-semibold text-slate-500 pt-1 border-t border-slate-100/50 dark:border-slate-800/40">
                    {/* Directional details */}
                    {(showEmployee || showDept || showLoc) && (
                      <div className="space-y-1.5 bg-slate-50/50 dark:bg-slate-900/40 p-2.5 rounded-lg">
                        <span className="block text-[8px] uppercase tracking-wider text-slate-400 font-bold">Movement Path</span>
                        {showEmployee && (
                          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200">
                            <User size={12} className="text-indigo-400" />
                            <span className="truncate">{m.fromEmployee || 'N/A'}</span>
                            <ArrowRight size={10} className="mx-1 flex-shrink-0 text-slate-400" />
                            <span className="truncate">{m.toEmployee || 'N/A'}</span>
                          </div>
                        )}
                        {showDept && (
                          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200">
                            <Building size={12} className="text-amber-500" />
                            <span className="truncate">{m.fromDepartment || 'N/A'}</span>
                            <ArrowRight size={10} className="mx-1 flex-shrink-0 text-slate-400" />
                            <span className="truncate">{m.toDepartment || 'N/A'}</span>
                          </div>
                        )}
                        {showLoc && (
                          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200">
                            <MapPin size={12} className="text-rose-500" />
                            <span className="truncate">{m.fromLocation || 'N/A'}</span>
                            <ArrowRight size={10} className="mx-1 flex-shrink-0 text-slate-400" />
                            <span className="truncate">{m.toLocation || 'N/A'}</span>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <div>
                        <span className="block text-[8.5px] uppercase tracking-wider text-slate-400 font-bold">Date & Time</span>
                        <span className="text-slate-750 dark:text-slate-300 font-mono text-[10px]">
                          {new Date(m.movementDate).toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[8.5px] uppercase tracking-wider text-slate-400 font-bold">Authorized By</span>
                        <span className="text-slate-750 dark:text-slate-300">
                          {m.movedBy ? `${m.movedBy.firstName} ${m.movedBy.lastName}` : 'System / Auto'}
                        </span>
                      </div>
                      <div className="col-span-2 mt-1">
                        <span className="block text-[8.5px] uppercase tracking-wider text-slate-400 font-bold">Reason / Notes</span>
                        <p className="text-slate-700 dark:text-slate-350 italic mt-0.5 leading-tight">
                          {m.reason || 'No reason provided'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

