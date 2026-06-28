import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { 
  Package, Shield, Wrench, Calendar, ArrowDownRight, Tag, 
  Building2, User, MapPin, Printer, Download, AlertTriangle, 
  FileText, Image, Clock, X, Activity, DollarSign, Award, ChevronRight
} from 'lucide-react'
import { publicApi, assetApi } from '../../api/index'
import { formatDate, formatCurrency, getStatusClass, formatStatus } from '../../utils/formatters'
import useAuthStore from '../../store/authStore'
import { useToast } from '../../hooks/useToast'

export default function AssetPassportPage() {
  const { assetTag } = useParams()
  const queryClient = useQueryClient()
  const { isAdmin, isAuthenticated } = useAuthStore()
  const { success: toastSuccess, error: toastError } = useToast()

  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  const [submittingReport, setSubmittingReport] = useState(false)
  const [downloadingPdf, setDownloadingPdf] = useState(false)
  const [imageError, setImageError] = useState(false)

  // Report issue form states
  const [reportTitle, setReportTitle] = useState('')
  const [reportType, setReportType] = useState('OTHER')
  const [reportPriority, setReportPriority] = useState('MEDIUM')
  const [reportDesc, setReportDesc] = useState('')

  const { data: passport, isLoading, error } = useQuery({
    queryKey: ['assetPassport', assetTag],
    queryFn: () => publicApi.getPassport(assetTag).then(r => r.data?.data || r),
    enabled: !!assetTag,
  })

  const showSensitiveInfo = isAuthenticated && isAdmin && isAdmin()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-4 text-center">
          <div className="w-16 h-16 border-4 border-red-800 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-sm font-semibold tracking-wider uppercase text-slate-400">Verifying Secure Passport</h2>
          <p className="text-xs text-slate-500">Querying database for real-time asset tracking data...</p>
        </div>
      </div>
    )
  }

  if (error || !passport || !passport.asset) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full card p-8 text-center border border-red-900 bg-red-950/20">
          <AlertTriangle size={36} className="text-red-500 mx-auto mb-3" />
          <p className="text-sm font-medium text-red-400">Asset passport information not found or inaccessible.</p>
          <p className="text-xs text-slate-400 mt-2">Please ensure the QR code scanned contains a valid Asset Tag or unique identifier.</p>
          <Link to="/" className="btn-secondary btn-sm mt-5 inline-block">Return to Dashboard</Link>
        </div>
      </div>
    )
  }

  const { asset, allocations = [], maintenance = [], warranty, depreciation = [], documents = [], history = [] } = passport

  // Calculations
  const daysRemaining = (() => {
    const expiry = warranty?.expiryDate || asset?.warrantyExpiry
    if (!expiry) return null
    const diff = new Date(expiry) - new Date()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  })()

  const healthScore = asset.healthScore || 100
  const totalDowntime = maintenance.reduce((sum, req) => sum + parseFloat(req.downtimeHours || 0), 0)

  // Expected Replacement Date = Purchase Date + usefulLife in years
  const expectedReplacementDate = (() => {
    if (!asset.purchaseDate) return null
    const lifeYears = asset.usefulLife || 5
    const purchaseYear = new Date(asset.purchaseDate).getFullYear()
    const replacementYear = purchaseYear + lifeYears
    const date = new Date(asset.purchaseDate)
    date.setFullYear(replacementYear)
    return date.toLocaleDateString('en-GB')
  })()

  // Handle PDF passport download
  const handleDownloadPdf = async () => {
    try {
      setDownloadingPdf(true)
      const res = await assetApi.downloadSingleAssetPdf(asset.assetUniqueId || asset.assetTag)
      const blob = new Blob([res.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `AssetPassport_${asset.assetUniqueId || asset.assetTag}.pdf`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toastSuccess('Digital passport PDF downloaded successfully.')
    } catch (e) {
      toastError('Failed to generate passport PDF.')
    } finally {
      setDownloadingPdf(false)
    }
  }

  // Handle Issue Ticket Submission
  const handleReportIssueSubmit = async (e) => {
    e.preventDefault()
    if (!reportTitle.trim() || !reportDesc.trim()) {
      toastError('Please fill in all required fields.')
      return
    }

    try {
      setSubmittingReport(true)
      await assetApi.reportIssue(asset.id, {
        title: reportTitle,
        issueType: reportType,
        priority: reportPriority,
        description: reportDesc
      })
      toastSuccess('Maintenance issue reported. A service ticket has been created.')
      setIsReportModalOpen(false)
      // Reset form
      setReportTitle('')
      setReportType('OTHER')
      setReportPriority('MEDIUM')
      setReportDesc('')
      
      // Invalidate queries to refresh details
      queryClient.invalidateQueries(['assetPassport', assetTag])
    } catch (err) {
      toastError('Failed to submit issue ticket: ' + (err.response?.data?.message || err.message))
    } finally {
      setSubmittingReport(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        
        {/* ── Header Branding ─────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-center justify-between border-b border-slate-800 pb-5 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-8 rounded-full bg-red-700" />
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                INDIAN RAILWAYS AMS
                <span className="text-[10px] bg-red-950 text-red-400 border border-red-800 px-2 py-0.5 rounded-full font-mono">SECURE</span>
              </h1>
              <p className="text-xs text-slate-400">Official Device Verification & Digital Passport</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleDownloadPdf}
              disabled={downloadingPdf}
              className="flex items-center gap-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-50 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold transition"
            >
              <Printer size={14} /> 
              {downloadingPdf ? 'Exporting...' : 'Print Passport'}
            </button>
            {isAuthenticated && (
              <Link 
                to={showSensitiveInfo ? `/assets/${asset.id}` : '#'} 
                onClick={(e) => { if (!showSensitiveInfo) e.preventDefault() }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  showSensitiveInfo 
                    ? 'bg-red-800 text-white hover:bg-red-700' 
                    : 'bg-slate-900/60 border border-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                Manage Asset
              </Link>
            )}
          </div>
        </div>

        {/* ── Main Details Grid ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Left Column: Identity, Health & Warranty Indicators */}
          <div className="md:col-span-1 space-y-4">
            
            {/* Identity Card */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl text-center shadow-xl">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-slate-950 border border-slate-850 overflow-hidden">
                {asset.imageUrl && !imageError ? (
                  <img
                    src={asset.imageUrl.startsWith('http') ? asset.imageUrl : `${(import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api').endsWith('/api') ? (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api').slice(0, -4) : (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api')}/${asset.imageUrl}`}
                    alt={asset.name}
                    className="w-full h-full object-cover"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <Package size={36} className="text-[#7c0a0a] animate-pulse" />
                )}
              </div>
              <h2 className="text-base font-bold text-white leading-tight">{asset.name}</h2>
              <p className="text-xs text-slate-400 mt-1">{asset.brand || 'General'} · {asset.model || 'Generic'}</p>

              <div className="flex flex-col gap-2 mt-4">
                <div className="px-3 py-1.5 rounded bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 select-all">
                  TAG: {asset.assetTag}
                </div>
                <div className="mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${getStatusClass(asset.status)}`}>
                    {formatStatus(asset.status)}
                  </span>
                </div>
              </div>

              <div className="border-t border-slate-800 mt-5 pt-4 text-left space-y-2.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Department</span>
                  <span className="font-semibold text-slate-200">{asset.departmentName || 'General'}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Assigned To</span>
                  <span className="font-semibold text-slate-200">{asset.assignedToName || 'Unassigned'}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Location</span>
                  <span className="font-semibold text-slate-200">{asset.currentLocation || 'AMS Core'}</span>
                </div>
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400 font-sans">Serial No.</span>
                  <span className="font-semibold text-slate-200 select-all">{asset.serialNumber || '—'}</span>
                </div>
              </div>
            </div>

            {/* Health Analytics Gauge */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-3">
              <h3 className="text-xs font-bold text-slate-300 tracking-wider uppercase flex items-center gap-1.5">
                <Activity size={14} className="text-emerald-500" /> Health Analytics
              </h3>
              
              {/* Radial Score Gauge */}
              <div className="py-3 flex flex-col items-center justify-center">
                <div className="relative w-24 h-24 flex items-center justify-center">
                  {/* Gauge Ring */}
                  <svg className="absolute w-full h-full transform -rotate-90">
                    <circle cx="48" cy="48" r="40" stroke="rgba(255,255,255,0.05)" strokeWidth="6" fill="transparent" />
                    <circle cx="48" cy="48" r="40" 
                      stroke={healthScore >= 80 ? '#10b981' : healthScore >= 50 ? '#eab308' : '#ef4444'} 
                      strokeWidth="6" 
                      fill="transparent" 
                      strokeDasharray={2 * Math.PI * 40}
                      strokeDashoffset={2 * Math.PI * 40 * (1 - healthScore / 100)}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="text-center">
                    <span className="text-xl font-bold text-white">{healthScore}%</span>
                    <p className="text-[8px] text-slate-400 uppercase font-bold tracking-wider">Health</p>
                  </div>
                </div>
                <span className={`mt-3 text-[10px] font-bold px-2 py-0.5 rounded border ${
                  healthScore >= 80 ? 'text-green-400 bg-green-950/20 border-green-800/40' : 
                  healthScore >= 50 ? 'text-yellow-400 bg-yellow-950/20 border-yellow-800/40' : 
                  'text-red-400 bg-red-950/20 border-red-800/40'
                }`}>
                  {asset.healthLevel || (healthScore >= 80 ? 'Excellent' : healthScore >= 50 ? 'Warning' : 'Critical')} Status
                </span>
              </div>

              <div className="border-t border-slate-800 pt-3 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Risk Profile</span>
                  <span className={`font-bold uppercase ${
                    asset.riskLevel === 'HIGH' ? 'text-red-400' : 
                    asset.riskLevel === 'MEDIUM' ? 'text-yellow-400' : 'text-green-400'
                  }`}>
                    {asset.riskLevel || 'LOW'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Expected Replace</span>
                  <span className="font-semibold text-slate-200">{expectedReplacementDate || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Downtime</span>
                  <span className="font-semibold text-slate-200 font-mono">{totalDowntime} hrs</span>
                </div>
              </div>
            </div>

            {/* Financial Card (Restricted) */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-3">
              <h3 className="text-xs font-bold text-slate-300 tracking-wider uppercase flex items-center gap-1.5">
                <DollarSign size={14} className="text-red-500" /> Valuation Details
              </h3>
              {showSensitiveInfo ? (
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Purchase Cost</span>
                    <span className="font-semibold text-white">{formatCurrency(asset.purchaseCost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Current Book Value</span>
                    <span className="font-semibold text-emerald-400">{formatCurrency(asset.currentValue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Purchase Date</span>
                    <span className="font-semibold text-slate-200">{formatDate(asset.purchaseDate) || '—'}</span>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-slate-950 border border-slate-850 rounded-lg text-center space-y-1.5">
                  <Shield size={18} className="text-slate-500 mx-auto" />
                  <p className="text-[10px] text-slate-400 leading-snug">Valuation details are restricted for standard staff views.</p>
                </div>
              )}
            </div>

            {/* Quick Actions Panel */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Scanned QR Actions</h4>
              <button 
                onClick={() => setIsReportModalOpen(true)}
                className="w-full btn-secondary text-red-400 hover:text-red-300 border-red-950/40 hover:bg-red-950/10 btn-sm justify-center gap-2 py-2"
              >
                <AlertTriangle size={14} /> Report Asset Issue
              </button>
            </div>

          </div>

          {/* Right Column: Warranty Details, Timelines, Maintenance Logs, Documents */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Warranty & AMC Alert Status */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-xl space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Shield size={16} className="text-red-500" /> Warranty & Annual Contract (AMC)
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3 bg-slate-950 border border-slate-850 rounded-lg text-xs space-y-1.5">
                  <p className="text-slate-400 font-medium">Warranty Expiry</p>
                  <p className="text-sm font-bold text-white">
                    {warranty?.expiryDate ? formatDate(warranty.expiryDate) : asset?.warrantyExpiry ? formatDate(asset.warrantyExpiry) : 'No Warranty'}
                  </p>
                  {daysRemaining !== null && (
                    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                      daysRemaining > 90 ? 'text-green-400 bg-green-950/20' : 
                      daysRemaining > 0 ? 'text-yellow-400 bg-yellow-950/20' : 'text-red-400 bg-red-950/20'
                    }`}>
                      {daysRemaining > 0 ? `${daysRemaining} Days Left` : 'Expired'}
                    </span>
                  )}
                </div>
                <div className="p-3 bg-slate-950 border border-slate-850 rounded-lg text-xs space-y-1.5">
                  <p className="text-slate-400 font-medium">AMC Status & Provider</p>
                  <p className="text-sm font-bold text-white">
                    {warranty?.providerName || 'Manufacturer Warranty'}
                  </p>
                  <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    warranty?.warrantyType === 'COMPREHENSIVE' ? 'text-cyan-400 bg-cyan-950/20' : 'text-slate-400 bg-slate-950'
                  }`}>
                    Contract: {warranty?.warrantyType || 'STANDARD'}
                  </span>
                </div>
              </div>
            </div>

            {/* Maintenance Logs Cards */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-xl space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Wrench size={16} className="text-red-500" /> Active & Historical Repair Logs
              </h3>
              {maintenance.length === 0 ? (
                <p className="text-xs text-slate-500 py-2">No maintenance requests registered for this asset.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {maintenance.map((req, idx) => (
                    <div key={idx} className="bg-slate-950 border border-slate-850 p-4 rounded-xl text-xs flex flex-col justify-between gap-3 hover:border-slate-800 transition">
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-start">
                          <span className="font-mono text-[10px] text-red-400 font-semibold">{req.requestNumber}</span>
                          <span className={`badge text-[9px] ${
                            req.status === 'COMPLETED' ? 'badge-success' : 
                            req.status === 'IN_PROGRESS' ? 'badge-info' : 'badge-warning'
                          }`}>
                            {req.status}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-200 text-sm line-clamp-1">{req.title}</h4>
                        <p className="text-slate-400 line-clamp-2">{req.description || 'No description'}</p>
                      </div>
                      
                      <div className="border-t border-slate-900 pt-2.5 flex justify-between items-center text-[10px] text-slate-400">
                        <span>Technician: {req.assignedTechnician || 'Staff'}</span>
                        <span>Date: {formatDate(req.completedAt || req.startedAt || req.createdAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Unified Chronological Activity Timeline */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-xl space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Clock size={16} className="text-red-500" /> Unified Lifecycle Log
              </h3>
              
              {history.length === 0 ? (
                <p className="text-xs text-slate-500 py-2">No system logs available for this lifecycle.</p>
              ) : (
                <div className="relative border-l border-slate-800 pl-4 ml-2.5 space-y-5 py-2">
                  {history.map((h, idx) => (
                    <div key={idx} className="relative">
                      {/* Timeline dot */}
                      <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full border bg-slate-950 border-red-500 flex items-center justify-center" />
                      
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center justify-between gap-1 text-[10px]">
                          <span className="font-semibold uppercase tracking-wider text-red-500">
                            {h.type}
                          </span>
                          <span style={{ color: 'rgb(var(--text-muted))' }}>
                            {formatDate(h.date)}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-200 text-xs">{h.title}</h4>
                        <p className="text-slate-400 text-xs leading-relaxed">{h.description}</p>
                        <p className="text-[10px]" style={{ color: 'rgb(var(--text-muted))' }}>
                          Operator: {h.user}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Asset Documents Vault */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-xl space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <FileText size={16} className="text-red-500" /> Verified Document Vault
              </h3>
              {documents.length === 0 ? (
                <p className="text-xs text-slate-500 py-2">No manuals or invoices uploaded for this asset.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {documents.map((doc, idx) => (
                    <div key={idx} className="bg-slate-950 border border-slate-850 p-3 rounded-lg flex items-center justify-between text-xs hover:border-slate-800 transition">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center flex-shrink-0 text-slate-300">
                          {doc.documentType === 'PHOTO' ? <Image size={16} /> : <FileText size={16} />}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-200 line-clamp-1">{doc.fileName}</p>
                          <p className="text-[9px] uppercase tracking-wider text-slate-500 font-bold mt-0.5">{doc.documentType}</p>
                        </div>
                      </div>
                      <a 
                        href={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'}/documents/download/${doc.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 hover:bg-slate-900 rounded-lg text-slate-400 hover:text-slate-200 transition"
                      >
                        <Download size={14} />
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Depreciation Ledger (Restricted) */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-xl space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <ArrowDownRight size={16} className="text-red-500" /> Depreciation Ledger
              </h3>
              {showSensitiveInfo ? (
                depreciation.length === 0 ? (
                  <p className="text-xs text-slate-500 py-2">No depreciation calculations completed.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400">
                          <th className="pb-2">Year</th>
                          <th className="pb-2">Method</th>
                          <th className="pb-2 text-right">Depreciation</th>
                          <th className="pb-2 text-right">Remaining Value</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850">
                        {depreciation.map((dep, idx) => (
                          <tr key={idx} className="text-slate-300">
                            <td className="py-2.5">{dep.financialYear || dep.year}</td>
                            <td className="py-2.5">{dep.depreciationMethod || dep.method || 'Straight Line'}</td>
                            <td className="py-2.5 text-right text-red-400">{formatCurrency(dep.depreciationValue)}</td>
                            <td className="py-2.5 text-right font-medium text-emerald-400">{formatCurrency(dep.bookValue)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              ) : (
                <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl text-center space-y-2">
                  <Shield size={20} className="text-slate-600 mx-auto" />
                  <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">Asset depreciation and valuation history are restricted to administrative views.</p>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* ── Report Issue Modal ──────────────────────────────────────────────── */}
        {isReportModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-scale-in">
              <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/20">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <AlertTriangle size={16} className="text-red-500" /> Report Asset Issue
                </h3>
                <button 
                  onClick={() => setIsReportModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleReportIssueSubmit} className="p-6 space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Issue Title <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="Short description of the issue"
                    value={reportTitle}
                    onChange={(e) => setReportTitle(e.target.value)}
                    className="w-full input-text py-2"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-400 font-medium">Issue Type</label>
                    <select
                      value={reportType}
                      onChange={(e) => setReportType(e.target.value)}
                      className="w-full input-text py-2 bg-slate-950"
                    >
                      <option value="HARDWARE">Hardware Failure</option>
                      <option value="SOFTWARE">Software Glitch</option>
                      <option value="NETWORK">Network Offline</option>
                      <option value="PHYSICAL_DAMAGE">Physical Damage</option>
                      <option value="ROUTINE">Routine Service</option>
                      <option value="OTHER">Other Issue</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400 font-medium">Priority Level</label>
                    <select
                      value={reportPriority}
                      onChange={(e) => setReportPriority(e.target.value)}
                      className="w-full input-text py-2 bg-slate-950"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="CRITICAL">Critical</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-medium">Detailed Description <span className="text-red-500">*</span></label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Explain what happened, error codes, or symptoms..."
                    value={reportDesc}
                    onChange={(e) => setReportDesc(e.target.value)}
                    className="w-full input-text py-2 resize-none"
                  />
                </div>

                <div className="border-t border-slate-800 pt-4 flex gap-3 justify-end">
                  <button 
                    type="button"
                    onClick={() => setIsReportModalOpen(false)}
                    className="btn-secondary btn-sm px-4"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={submittingReport}
                    className="btn-primary btn-sm px-5"
                  >
                    {submittingReport ? 'Submitting...' : 'Submit Ticket'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-[10px] text-slate-500 border-t border-slate-900 pt-6">
          This digital device passport is generated by the Indian Railways Asset Management System (AMS). Contains verified details of public assets.
        </div>
      </div>
    </div>
  )
}
