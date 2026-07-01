import React, { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { Search, Eye, FileText, RefreshCw, AlertCircle, Calendar, ShieldCheck, Tag, MapPin, BadgePercent } from 'lucide-react'
import { assetApi } from '../../api/index'
import useAuthStore from '../../store/authStore'
import useLanguageStore from '../../store/languageStore'
import { useTranslation } from '../../utils/translations'
import { formatDate, formatCurrency, getStatusClass } from '../../utils/formatters'

export default function MyAssetsPage() {
  const { lang } = useLanguageStore()
  const t = useTranslation(lang)
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  // Query assigned assets
  const { data, isLoading, refetch, isFetching, error } = useQuery({
    queryKey: ['my-assets'],
    queryFn: () => assetApi.getMyAssets().then(r => r.data.data),
  })

  // Format array safely
  const assetsList = useMemo(() => {
    if (!data) return []
    return Array.isArray(data) ? data : (data.content || [])
  }, [data])

  // Local filtering based on search query
  const filteredAssets = useMemo(() => {
    return assetsList.filter(asset => {
      const q = search.toLowerCase()
      return (
        asset.name?.toLowerCase().includes(q) ||
        asset.assetTag?.toLowerCase().includes(q) ||
        asset.serialNumber?.toLowerCase().includes(q) ||
        asset.brand?.toLowerCase().includes(q) ||
        asset.model?.toLowerCase().includes(q) ||
        asset.category?.name?.toLowerCase().includes(q) ||
        asset.currentLocation?.toLowerCase().includes(q)
      )
    })
  }, [assetsList, search])

  const handleCardClick = (id) => {
    navigate(`/assets/${id}`)
  }

  return (
    <div className="space-y-6 text-left animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: 'rgb(var(--border-color))' }}>
        <div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-5 rounded-sm" style={{ background: 'var(--railway-crimson)' }} />
            <h1 className="text-base font-bold uppercase tracking-wider text-slate-800 dark:text-white">
              {t('My Assets')}
            </h1>
          </div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 pl-3">
            Assets currently allocated to {user?.firstName} {user?.lastName} ({user?.department || 'Staff'})
          </p>
        </div>

        <button onClick={() => refetch()} className="btn-secondary btn-sm flex items-center gap-1.5 shadow-sm">
          <RefreshCw size={11} className={isFetching ? 'animate-spin' : ''} />
          <span>Refresh List</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="card p-4 flex flex-wrap gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
          <input
            type="text"
            placeholder="Search by asset tag, name, brand, serial no..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input pl-9"
          />
        </div>
        <div className="text-xs font-bold text-slate-500">
          Total Assigned: {filteredAssets.length} {filteredAssets.length === 1 ? 'asset' : 'assets'}
        </div>
      </div>

      {/* Content Area */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="card p-6 space-y-4 animate-pulse">
              <div className="h-5 bg-slate-200 dark:bg-slate-850 rounded w-1/3" />
              <div className="h-7 bg-slate-200 dark:bg-slate-850 rounded w-3/4" />
              <div className="space-y-2">
                <div className="h-4 bg-slate-200 dark:bg-slate-850 rounded w-5/6" />
                <div className="h-4 bg-slate-200 dark:bg-slate-850 rounded w-4/6" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="card p-8 flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
            <AlertCircle size={22} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Failed to load assigned assets</h3>
            <p className="text-xs text-slate-500 mt-1">Please check your network connection or try again.</p>
          </div>
        </div>
      ) : filteredAssets.length === 0 ? (
        <div className="card p-12 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <ShieldCheck size={28} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {search ? 'No matching assets found' : 'No assets currently assigned to you'}
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {search 
                ? 'Try adjusting your search filters.' 
                : 'All clear! You currently do not have any registered items checked out under your account.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssets.map((asset) => (
            <div 
              key={asset.id} 
              onClick={() => handleCardClick(asset.id)}
              className="card p-5 space-y-4 cursor-pointer hover:border-blue-500/50 hover:shadow-md hover:translate-y-[-2px] transition-all duration-200 flex flex-col justify-between"
            >
              <div className="space-y-2">
                {/* Header Tag and Status */}
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 text-[9.5px] font-bold rounded bg-slate-100 dark:bg-slate-850 text-slate-400 font-mono">
                    #{asset.assetTag}
                  </span>
                  <span className={`badge ${getStatusClass(asset.status)}`}>
                    {asset.status}
                  </span>
                </div>

                {/* Asset Name */}
                <div>
                  <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 line-clamp-1">
                    {asset.name}
                  </h3>
                  {asset.brand && (
                    <p className="text-[10.5px] text-slate-500">
                      {asset.brand} {asset.model}
                    </p>
                  )}
                </div>

                <hr className="border-slate-100 dark:border-slate-850 my-1" />

                {/* Details list */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <Tag size={12} className="text-slate-450" />
                    <span>
                      <strong className="text-[10px] text-slate-400">Category:</strong> {asset.category?.name || 'Uncategorized'}
                    </span>
                  </div>

                  {asset.serialNumber && (
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <FileText size={12} className="text-slate-450" />
                      <span>
                        <strong className="text-[10px] text-slate-400">Serial No:</strong> <span className="font-mono text-[10.5px]">{asset.serialNumber}</span>
                      </span>
                    </div>
                  )}

                  {asset.currentLocation && (
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <MapPin size={12} className="text-slate-450" />
                      <span>
                        <strong className="text-[10px] text-slate-400">Location:</strong> {asset.currentLocation}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <Calendar size={12} className="text-slate-450" />
                    <span>
                      <strong className="text-[10px] text-slate-400">Warranty Ends:</strong> {formatDate(asset.warrantyExpiry) || 'No warranty details'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-4 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <Link 
                  to={`/assets/${asset.id}`} 
                  className="flex-1 btn-secondary btn-xs py-1.5 flex items-center justify-center gap-1 text-[10.5px]"
                >
                  <Eye size={12} />
                  <span>Specs & Details</span>
                </Link>
                <Link 
                  to={`/asset/${asset.assetTag}`} 
                  className="flex-1 btn-primary btn-xs py-1.5 flex items-center justify-center gap-1 text-[10.5px] bg-[#7c0a0a] hover:bg-[#9c0a0a]"
                >
                  <FileText size={12} />
                  <span>Asset Passport</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
