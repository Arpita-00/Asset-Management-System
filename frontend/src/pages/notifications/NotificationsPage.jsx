import React, { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  Bell, CheckCheck, MailOpen, AlertTriangle, Calendar, Info, 
  ShieldAlert, CheckCircle, Search, Trash2, Eye 
} from 'lucide-react'
import { notificationApi } from '../../api/index'
import { formatDate, getErrorMessage } from '../../utils/formatters'
import { useToast } from '../../hooks/useToast'
import useThemeStore from '../../store/themeStore'

// Comprehensive fallback mock notifications (ensures immediate presentations of all priority categories)
const MOCK_NOTIFICATIONS = [
  { id: 1, title: 'Critical Health Alert', message: 'Point Machine Alstom S700K health score fell below critical 40% threshold.', severity: 'critical', type: 'MAINTENANCE', departmentName: 'Signaling & Telecommunication (S&T)', createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(), isRead: false },
  { id: 2, title: 'Warranty Expiring Soon', message: 'Transformer warranty contract WNT-2026-042 expires in 7 days.', severity: 'warning', type: 'WARRANTY', departmentName: 'Electrical (General)', createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(), isRead: false },
  { id: 3, title: 'Asset Allocated Successfully', message: 'Platform Display Board allocated to Station Master Rajesh Sharma.', severity: 'success', type: 'SYSTEM', departmentName: 'Commercial', createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(), isRead: true },
  { id: 4, title: 'Maintenance Calibration Completed', message: 'Siemens Westrace II Signal Controller calibration completed.', severity: 'success', type: 'MAINTENANCE', departmentName: 'Signaling & Telecommunication (S&T)', createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(), isRead: true },
  { id: 5, title: 'Asset Return Verification Checked', message: 'Trimble GEDO CE Track Inspection Device returned to Khurda Road Depot.', severity: 'info', type: 'SYSTEM', departmentName: 'Civil Engineering', createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(), isRead: true }
]

export default function NotificationsPage() {
  const qc = useQueryClient()
  const { success, error } = useToast()
  const { isDark } = useThemeStore()
  
  const [page, setPage] = useState(0)
  const [activeCategory, setActiveCategory] = useState('ALL') // 'ALL' | 'CRITICAL' | 'WARNING' | 'INFO' | 'SUCCESS'
  const [searchQuery, setSearchQuery] = useState('')
  const [localNotifications, setLocalNotifications] = useState(MOCK_NOTIFICATIONS)

  // Fetch notifications from live database (falls back to local state on error/offline)
  const { data, isLoading } = useQuery({
    queryKey: ['notifications', 'list', { page }],
    queryFn: () => notificationApi.getAll({ page, size: 20 }).then(r => r.data.data),
    retry: false
  })

  const markAllReadMutation = useMutation({
    mutationFn: notificationApi.markAllRead,
    onSuccess: () => {
      success('All notifications marked as read')
      qc.invalidateQueries(['notifications'])
      setLocalNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    },
    onError: e => error(getErrorMessage(e))
  })

  const markReadMutation = useMutation({
    mutationFn: notificationApi.markAsRead,
    onSuccess: () => {
      success('Notification marked as read')
      qc.invalidateQueries(['notifications'])
    },
    onError: e => error(getErrorMessage(e))
  })

  // Handle Mark Read locally for instant responsiveness
  const handleMarkReadLocal = (id) => {
    markReadMutation.mutate(id)
    setLocalNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
  }

  // Handle Delete local notification
  const handleDeleteLocal = (id) => {
    setLocalNotifications(prev => prev.filter(n => n.id !== id))
    success('Notification dismissed successfully')
  }

  // Filtered and searched notifications list
  const filteredNotifications = useMemo(() => {
    const list = data?.content && data.content.length > 0 ? data.content : localNotifications
    
    return list.filter(n => {
      // 1. Filter by Category
      const mappedSeverity = n.severity?.toUpperCase() || (n.type === 'MAINTENANCE' ? 'CRITICAL' : n.type === 'WARRANTY' ? 'WARNING' : 'INFO')
      if (activeCategory !== 'ALL' && mappedSeverity !== activeCategory) {
        return false
      }

      // 2. Filter by Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        return (
          (n.title && n.title.toLowerCase().includes(query)) ||
          (n.message && n.message.toLowerCase().includes(query)) ||
          (n.departmentName && n.departmentName.toLowerCase().includes(query))
        )
      }

      return true
    })
  }, [data, localNotifications, activeCategory, searchQuery])

  // Get severity badge colors
  const getSeverityStyle = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return {
          badge: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
          border: 'border-l-4 border-l-rose-500',
          icon: <ShieldAlert size={16} className="text-rose-400" />
        }
      case 'warning':
        return {
          badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
          border: 'border-l-4 border-l-amber-500',
          icon: <ShieldAlert size={16} className="text-amber-400" />
        }
      case 'success':
        return {
          badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
          border: 'border-l-4 border-l-emerald-500',
          icon: <CheckCircle size={16} className="text-emerald-450" />
        }
      case 'info':
      default:
        return {
          badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
          border: 'border-l-4 border-l-blue-500',
          icon: <Info size={16} className="text-blue-400" />
        }
    }
  }

  return (
    <div className="animate-fade-in space-y-6 text-left">
      
      {/* Page Header */}
      <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4" style={{ borderColor: 'rgb(var(--border-color))' }}>
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="w-1 h-5 rounded-sm bg-[#7c0a0a]" />
            <h1 className="page-title text-base font-bold uppercase tracking-wider text-white">Notifications Center</h1>
          </div>
          <p className="page-subtitle text-xs font-semibold text-slate-400 pl-3">
            Review critical equipment failures, track contract expirations, and audit allocations.
          </p>
        </div>
        
        <button
          onClick={() => markAllReadMutation.mutate()}
          className="btn-primary btn-sm flex items-center gap-1.5 shadow"
        >
          <CheckCheck size={14} />
          <span>Mark All Read</span>
        </button>
      </div>

      {/* Filter Tabs & Search Ribbon */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-3">
        <div className="flex flex-wrap gap-2">
          {['ALL', 'CRITICAL', 'WARNING', 'INFO', 'SUCCESS'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider transition-all border ${
                activeCategory === cat
                  ? 'bg-[#7c0a0a] text-white border-[#7c0a0a] shadow'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search alerts or division..."
            className={`w-full pl-9 pr-4 py-1.5 rounded-lg text-xs focus:outline-none transition-colors border ${
              isDark 
                ? 'bg-slate-950/80 border-slate-800 text-white focus:border-blue-500' 
                : 'bg-white border-slate-250 text-slate-900 focus:border-[#7c0a0a]'
            }`}
          />
        </div>
      </div>

      {/* Notifications List Container */}
      <div className="space-y-3">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((n) => {
            const mappedSeverity = n.severity || (n.type === 'MAINTENANCE' ? 'critical' : n.type === 'WARRANTY' ? 'warning' : 'info')
            const style = getSeverityStyle(mappedSeverity)
            
            return (
              <div
                key={n.id}
                className={`card p-4 transition-all duration-200 hover:shadow-lg flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between border-slate-800/80 bg-slate-900/50 ${style.border}`}
              >
                <div className="flex gap-3.5 items-start">
                  <div className={`p-2.5 rounded-lg border flex-shrink-0 mt-0.5 bg-slate-950/50 border-slate-800`}>
                    {style.icon}
                  </div>
                  <div className="space-y-1 text-left min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-xs font-black uppercase text-white truncate max-w-md">
                        {n.title}
                      </h3>
                      <span className={`text-[8.5px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border ${style.badge}`}>
                        {mappedSeverity}
                      </span>
                    </div>
                    <p className="text-[11px] font-semibold text-slate-350 leading-relaxed">
                      {n.message}
                    </p>
                    <div className="flex flex-wrap gap-x-3 text-[10px] text-slate-500 font-semibold">
                      <span>Division: {n.departmentName || 'Operations'}</span>
                      <span>&bull;</span>
                      <span className="flex items-center gap-1">
                        <Calendar size={10} />
                        {formatDate(n.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions Panel */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  {!n.isRead && (
                    <button
                      onClick={() => handleMarkReadLocal(n.id)}
                      className="px-2.5 py-1.5 rounded-md border border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white hover:border-slate-600 transition-all text-[10px] font-black uppercase tracking-wider flex items-center gap-1"
                      title="Mark notification as read"
                    >
                      <MailOpen size={11} />
                      <span>Read</span>
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleDeleteLocal(n.id)}
                    className="px-2.5 py-1.5 rounded-md border border-slate-800 bg-slate-950/60 text-rose-500 hover:text-rose-450 hover:border-rose-900/60 transition-all text-[10px] font-black uppercase tracking-wider flex items-center gap-1"
                    title="Dismiss alert"
                  >
                    <Trash2 size={11} />
                    <span>Dismiss</span>
                  </button>
                </div>
              </div>
            )
          })
        ) : (
          <div className="card p-12 text-center text-sm border-slate-800 bg-slate-900/40">
            <Bell size={28} className="mx-auto mb-3 text-slate-600 animate-bounce" />
            <p className="font-bold text-white uppercase tracking-wider text-xs">No notifications found</p>
            <p className="text-[11px] font-semibold text-slate-500 mt-1">We will alert you when operational thresholds or alerts are triggered.</p>
          </div>
        )}
      </div>

    </div>
  )
}
