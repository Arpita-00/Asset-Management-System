import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, StopCircle, CheckCircle2, Eye, GitBranch, RotateCcw, Wrench, AlertTriangle, Search, History, Trash2, Package } from 'lucide-react'
import { Html5Qrcode } from 'html5-qrcode'
import { useToast } from '../../hooks/useToast'
import { getErrorMessage, formatDate, formatStatus, getStatusClass } from '../../utils/formatters'
import { publicApi } from '../../api/index'

// ─── Scan Result overlay ──────────────────────────────────────────────────────
function ScanResult({ asset, onClose }) {
  const navigate = useNavigate()

  return (
    <div className="animate-scale-in">
      {/* Success banner */}
      <div className="rounded-xl p-4 mb-5 flex items-center gap-3"
           style={{ background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.25)' }}>
        <CheckCircle2 size={28} className="text-green-600 flex-shrink-0" />
        <div>
          <p className="font-semibold text-sm text-green-700">Asset Identified!</p>
          <p className="text-xs text-green-600 mt-0.5">Asset ID: {asset.assetUniqueId || asset.assetTag || `#${asset.id}`}</p>
        </div>
      </div>

      {/* Asset info grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        <div className="col-span-2 flex items-start gap-4 p-4 rounded-xl"
             style={{ background: 'rgb(var(--bg-elevated))' }}>
          <div className="w-20 h-20 rounded-xl flex items-center justify-center flex-shrink-0"
               style={{ background: 'rgba(139,0,0,0.08)', border: '1px solid rgba(139,0,0,0.15)' }}>
            <Package size={32} className="text-red-500" />
          </div>
          <div>
            <h2 className="font-bold text-base" style={{ color: 'rgb(var(--text-primary))' }}>
              {asset.name}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 mt-2">
              {[
                ['Category',   asset.categoryName],
                ['Brand',      asset.brand],
                ['Model',      asset.model],
                ['Serial No.', asset.serialNumber],
                ['Status',     formatStatus(asset.status)],
                ['Assigned To', asset.assignedToName],
                ['Location',   asset.currentLocation],
              ].map(([k, v]) => (
                <div key={k} className="flex gap-2 text-xs">
                  <span style={{ color: 'rgb(var(--text-muted))', minWidth: '85px' }}>{k}:</span>
                  <span className="font-medium" style={{ color: 'rgb(var(--text-primary))' }}>{v || '—'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <button
          onClick={() => navigate(`/asset/${asset.assetUniqueId || asset.assetTag}`)}
          className="btn-primary btn-sm flex-col py-3 gap-1"
        >
          <Eye size={16} />
          <span className="text-xs">View Details</span>
        </button>
        <button 
          onClick={() => navigate(`/assets/${asset.id}`)}
          className="btn-secondary btn-sm flex-col py-3 gap-1"
        >
          <GitBranch size={16} />
          <span className="text-xs">Manage Asset</span>
        </button>
        <button 
          onClick={() => navigate(`/maintenance?assetId=${asset.id}`)}
          className="btn-secondary btn-sm flex-col py-3 gap-1"
        >
          <Wrench size={16} />
          <span className="text-xs">Report Issue</span>
        </button>
        <button 
          onClick={onClose} 
          className="btn-secondary btn-sm flex-col py-3 gap-1"
        >
          <RotateCcw size={16} />
          <span className="text-xs">Scan Another</span>
        </button>
      </div>
    </div>
  )
}

// ─── Main QR Scanner Page ─────────────────────────────────────────────────────
export default function QrScannerPage() {
  const { success: toastSuccess, error: toastError } = useToast()
  const [scanning, setScanning] = useState(false)
  const [scannedAsset, setScannedAsset] = useState(null)
  const [manualSearchId, setManualSearchId] = useState('')
  const [scanHistory, setScanHistory] = useState([])
  const html5QrCodeRef = useRef(null)

  // Load Scan History from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('ams_scan_history')
    if (saved) {
      try {
        setScanHistory(JSON.parse(saved))
      } catch (e) {
        console.error(e)
      }
    }
  }, [])

  // Save history helper
  const addHistoryItem = (asset) => {
    const newItem = {
      id: asset.id,
      name: asset.name,
      tag: asset.assetUniqueId || asset.assetTag,
      status: asset.status,
      timestamp: new Date().toLocaleString()
    }
    const updated = [newItem, ...scanHistory.filter(h => h.tag !== newItem.tag)].slice(0, 10)
    setScanHistory(updated)
    localStorage.setItem('ams_scan_history', JSON.stringify(updated))
  }

  // Clear history helper
  const clearHistory = () => {
    setScanHistory([])
    localStorage.removeItem('ams_scan_history')
    toastSuccess('Scan history cleared.')
  }

  // Stop camera scanning
  const stopScan = async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      try {
        await html5QrCodeRef.current.stop()
        html5QrCodeRef.current = null
      } catch (err) {
        console.error('Failed to stop camera:', err)
      }
    }
    setScanning(false)
  }

  // Start camera scanning
  const startScan = async () => {
    setScannedAsset(null)
    setScanning(true)
    
    // Tiny delay to ensure the container DOM element renders
    setTimeout(() => {
      const qrCode = new Html5Qrcode('qr-reader-viewfinder')
      html5QrCodeRef.current = qrCode

      qrCode.start(
        { facingMode: 'environment' },
        {
          fps: 15,
          qrbox: (width, height) => {
            const size = Math.min(width, height) * 0.7
            return { width: size, height: size }
          }
        },
        async (decodedText) => {
          // On Success
          try {
            await qrCode.stop()
            html5QrCodeRef.current = null
            setScanning(false)

            // Extract asset ID / Tag from decodedText (URL or Tag)
            let assetId = decodedText
            if (decodedText.includes('/asset/')) {
              const parts = decodedText.split('/asset/')
              assetId = parts[parts.length - 1]
            } else if (decodedText.includes('/passport/')) {
              const parts = decodedText.split('/passport/')
              assetId = parts[parts.length - 1]
            }

            toastSuccess('QR Code scanned successfully!')
            lookupAsset(assetId)
          } catch (err) {
            console.error('OCR stop failure', err)
          }
        },
        (errorMessage) => {
          // Silent catch parsing frames
        }
      ).catch((err) => {
        console.error('Camera startup error', err)
        toastError('Failed to access camera. Check permissions.')
        setScanning(false)
      })
    }, 200)
  }

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current.stop().catch(err => console.error(err))
      }
    }
  }, [])

  // Lookup Asset details via passport API
  const lookupAsset = async (assetId) => {
    try {
      const res = await publicApi.getPassport(assetId)
      const data = res.data?.data || res.data || res
      if (data && data.asset) {
        setScannedAsset(data.asset)
        addHistoryItem(data.asset)
      } else {
        toastError('Asset passport details not found.')
      }
    } catch (e) {
      toastError('Asset not found or network connection offline.')
    }
  }

  // Handle manual submit search
  const handleManualSearch = (e) => {
    e.preventDefault()
    if (!manualSearchId.trim()) return
    lookupAsset(manualSearchId.trim())
  }

  return (
    <div className="animate-fade-in space-y-6">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Device QR Code Scanner</h1>
          <nav className="text-xs mt-0.5" style={{ color: 'rgb(var(--text-muted))' }}>
            Dashboard &rsaquo; <span style={{ color: 'var(--ams-blue-mid)' }}>QR Code Scanner</span>
          </nav>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Camera / Result Panel ────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b flex justify-between items-center" style={{ borderColor: 'rgb(var(--border-color))' }}>
              <h2 className="text-sm font-semibold text-white">
                {scannedAsset ? 'Verified Asset Passport' : 'Live Camera Viewfinder'}
              </h2>
              {scanning && (
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                </span>
              )}
            </div>
            
            <div className="p-5">
              {scannedAsset ? (
                <ScanResult asset={scannedAsset} onClose={() => setScannedAsset(null)} />
              ) : (
                <div className="flex flex-col items-center">
                  {/* Viewfinder Container */}
                  <div className="w-full relative rounded-2xl border-2 border-slate-800 bg-slate-950 overflow-hidden mb-5" style={{ height: '350px' }}>
                    {scanning ? (
                      <div id="qr-reader-viewfinder" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-slate-500">
                        <Camera size={48} className="animate-pulse" />
                        <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Scanner Standby</p>
                        <p className="text-xs text-slate-500 max-w-xs text-center px-4">Click "Activate Camera" to scan QR tags attached to physical equipment.</p>
                      </div>
                    )}
                  </div>

                  {/* Camera Controls */}
                  <div className="flex justify-center">
                    {scanning ? (
                      <button onClick={stopScan} className="btn-secondary btn-md text-red-500 border-red-950/40 hover:bg-red-950/20 flex items-center gap-1.5">
                        <StopCircle size={16} /> Deactivate Camera
                      </button>
                    ) : (
                      <button onClick={startScan} className="btn-primary btn-md flex items-center gap-1.5">
                        <Camera size={16} /> Activate Camera
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Manual ID Search Box */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold mb-3 text-white flex items-center gap-2">
              <Search size={16} style={{ color: 'var(--ams-blue-mid)' }} /> Manual Asset Lookup
            </h3>
            <form onSubmit={handleManualSearch} className="flex gap-2">
              <input
                type="text"
                placeholder="Enter Asset ID or Tag (e.g. AST-2026-000001)"
                value={manualSearchId}
                onChange={(e) => setManualSearchId(e.target.value)}
                className="flex-1 input py-2"
              />
              <button type="submit" className="btn-primary btn-sm px-4">
                Search
              </button>
            </form>
          </div>
        </div>

        {/* ── Scan History & Help Panels ────────────────────────────────────── */}
        <div className="lg:col-span-1 space-y-4">
          {/* Scan History */}
          <div className="card p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <History size={16} style={{ color: 'var(--ams-blue-mid)' }} /> Recent Scans
              </h3>
              {scanHistory.length > 0 && (
                <button 
                  onClick={clearHistory}
                  className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 transition"
                >
                  <Trash2 size={12} /> Clear
                </button>
              )}
            </div>
            
            {scanHistory.length === 0 ? (
              <div className="py-6 text-center text-slate-500 text-xs">
                No recent scans in session history.
              </div>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {scanHistory.map((item, idx) => (
                  <div 
                    key={idx} 
                    className="p-2.5 rounded-lg border border-slate-800 bg-slate-900/40 hover:bg-slate-900 flex justify-between items-center transition cursor-pointer"
                    onClick={() => lookupAsset(item.tag)}
                  >
                    <div>
                      <p className="text-xs font-semibold text-slate-200 line-clamp-1">{item.name}</p>
                      <p className="text-[10px] font-mono text-slate-400 mt-0.5">{item.tag}</p>
                      <p className="text-[9px] text-slate-500 mt-1">{item.timestamp}</p>
                    </div>
                    <span className={`badge text-[9px] ${getStatusClass(item.status)}`}>
                      {formatStatus(item.status)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Guide */}
          <div className="card p-5">
            <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-3 flex items-center gap-1.5">
              <AlertTriangle size={14} className="text-sky-500" /> Scanner Guide
            </h3>
            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex gap-2">
                <span className="font-bold text-sky-500">1.</span>
                <span>Stand in a well-lit area to avoid lens shadows on the code label.</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-sky-500">2.</span>
                <span>Hold your mobile device parallel and 10-20 cm away from the QR label.</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-sky-500">3.</span>
                <span>Make sure the code matches the official Indian Railways AMS template.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
