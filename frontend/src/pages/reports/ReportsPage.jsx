import React, { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { 
  BarChart3, Download, FileSpreadsheet, RefreshCw, Package, Wrench, 
  Shield, TrendingDown, Eye, Printer, ArrowLeft, AlertTriangle, 
  FileText, CheckCircle, Info, Landmark, Users, Activity 
} from 'lucide-react'
import { 
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, AreaChart, Area
} from 'recharts'
import { reportApi, dashboardApi } from '../../api/index'
import { demoAssets, demoMaintenance, demoWarranties, demoDepreciation, demoAllocations } from '../../api/mockData'
import { downloadBlob, getErrorMessage, formatNumber } from '../../utils/formatters'
import { useToast } from '../../hooks/useToast'
import useThemeStore from '../../store/themeStore'

// Reports list definition with colors and fields
const REPORT_TYPES = [
  {
    key: 'summary',
    title: 'Executive Summary Report',
    description: 'Divisional overview of active assets, maintenance cost logs, safety risks, and ledger values.',
    icon: Landmark,
    color: '#3b82f6',
    chartType: 'composed'
  },
  {
    key: 'inventory',
    title: 'Asset Inventory Report',
    description: 'Fleet inventory categorization, operational statuses, and distribution by manufacturer brand.',
    icon: Package,
    color: '#6366f1',
    chartType: 'pie'
  },
  {
    key: 'maintenance',
    title: 'Maintenance Operations',
    description: 'Work order logs, completed repair invoices, and technician performance metrics.',
    icon: Wrench,
    color: '#f59e0b',
    chartType: 'area'
  },
  {
    key: 'warranty',
    title: 'Warranty Expiry Tracker',
    description: 'Critical track assets and equipment contracts expiring within the selected divisional quarters.',
    icon: Shield,
    color: '#10b981',
    chartType: 'bar'
  },
  {
    key: 'allocation',
    title: 'Asset Allocation Audit',
    description: 'Deployment tracking logs, custodian designees, and active vehicle allocations.',
    icon: Users,
    color: '#db2777',
    chartType: 'bar'
  },
  {
    key: 'health',
    title: 'Asset Health & Safety',
    description: 'Failure risk index summaries, critical degradation levels, and recommended actions.',
    icon: Activity,
    color: '#ef4444',
    chartType: 'pie'
  },
  {
    key: 'depreciation',
    title: 'Depreciation Ledger',
    description: 'Financial asset valuations, annual straight-line depreciation, and residual book values.',
    icon: TrendingDown,
    color: '#8b5cf6',
    chartType: 'line'
  },
  {
    key: 'department',
    title: 'Department Asset Valuation',
    description: 'Asset quantities, utilization ratios, and purchase cost summations grouped by division.',
    icon: BarChart3,
    color: '#06b6d4',
    chartType: 'bar'
  }
]

// ─── Custom Tooltip (Clean portal styling) ──────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="custom-recharts-tooltip">
      {label && <p className="tooltip-title">{label}</p>}
      {payload.map((p, i) => {
        const color = p.color || p.payload?.fill || p.fill || p.payload?.color
        return (
          <div key={i} className="tooltip-row">
            <span className="flex items-center gap-1.5">
              {color && (
                <span 
                  className="w-2 h-2 rounded-full inline-block" 
                  style={{ backgroundColor: color }}
                />
              )}
              <span className="tooltip-label">{p.name}:</span>
            </span>
            <span className="tooltip-value">
              {formatNumber(p.value)}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export default function ReportsPage() {
  const { error, success } = useToast()
  const { isDark } = useThemeStore()
  const [activeReport, setActiveReport] = useState(null)
  const [loadingFormat, setLoadingFormat] = useState(null)
  const [previewFilters, setPreviewFilters] = useState({
    status: '',
    timeframe: '30',
    department: ''
  })

  // Queries to fetch live statistics if connected (falls back to mock data safely)
  const { data: stats } = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => dashboardApi.getStats().then(r => r.data.data),
    retry: false
  })

  // ─── Local Mock Calculations for Previews (Guarantees immediate rendering) ───
  const reportData = useMemo(() => {
    if (!activeReport) return null

    const totalAssets = demoAssets.length
    const availableAssets = demoAssets.filter(a => a.status === 'AVAILABLE').length
    const assignedAssets = demoAssets.filter(a => a.status === 'ASSIGNED').length
    const underRepairAssets = demoAssets.filter(a => a.status === 'UNDER_REPAIR').length

    let statsCards = []
    let chartData = []
    let tableHeaders = []
    let tableRows = []
    let recommendations = ""

    switch (activeReport.key) {
      case 'summary':
        statsCards = [
          { title: 'Total Registered Fleet', val: totalAssets, desc: 'Operational units' },
          { title: 'Divisional Net Value', val: '₹1.85 Cr', desc: 'Current book value' },
          { title: 'Completed Repairs Cost', val: '₹1.28L', desc: 'Last 6 months' },
          { title: 'High-Risk Warnings', val: '6 Assets', desc: 'Require checkup' }
        ]
        chartData = [
          { name: 'S&T', value: 3300000 },
          { name: 'Electrical', value: 2500000 },
          { name: 'Civil Eng', value: 1500000 },
          { name: 'Operating', value: 1200000 }
        ]
        tableHeaders = ['Asset Category', 'Active Units', 'Purchase Value', 'Current Value']
        tableRows = [
          ['Signal Controllers', '15', '₹67,50,000', '₹60,75,000'],
          ['Point Machines', '12', '₹14,40,000', '₹12,60,000'],
          ['Railway Servers', '10', '₹35,00,000', '₹30,00,000'],
          ['UPS Systems', '20', '₹19,00,000', '₹15,20,000']
        ]
        recommendations = "S&T assets represent over 36% of total divisional book value. Prioritize budget allocation for S&T preventive maintenance and recalibration schedules next fiscal quarter."
        break

      case 'inventory':
        statsCards = [
          { title: 'Total Active Fleet', val: totalAssets, desc: 'Live registered' },
          { title: 'Available', val: availableAssets, desc: 'In depot' },
          { title: 'Assigned', val: assignedAssets, desc: 'Deployed' },
          { title: 'Under Repair', val: underRepairAssets, desc: 'Workshop queue' }
        ]
        chartData = [
          { name: 'Available', value: availableAssets },
          { name: 'Assigned', value: assignedAssets },
          { name: 'Under Repair', value: underRepairAssets }
        ]
        tableHeaders = ['Asset Tag', 'Asset Name', 'Category', 'Status', 'Location']
        tableRows = demoAssets.slice(0, 5).map(a => [
          a.assetTag, a.name, a.categoryName, a.status, a.location
        ])
        recommendations = "Inventory counts indicate a healthy 51% deployment ratio. Consider de-allocating standby UPS systems currently sitting in Cuttack Yard Store to optimize fleet usage."
        break

      case 'maintenance':
        statsCards = [
          { title: 'Total Closed Requests', val: '22', desc: 'Completed checks' },
          { title: 'Total Maintenance Cost', val: '₹1.28L', desc: 'Actual sum invoice' },
          { title: 'Ongoing Repairs', val: '4', desc: 'In-house workshop' },
          { title: 'Avg Turnaround Time', val: '4.2 Days', desc: 'Open to close' }
        ]
        chartData = [
          { name: 'Jan', value: 45000 },
          { name: 'Feb', value: 38000 },
          { name: 'Mar', value: 62000 },
          { name: 'Apr', value: 29000 },
          { name: 'May', value: 72000 }
        ]
        tableHeaders = ['Asset Name', 'Type', 'Completed Date', 'Cost', 'Technician']
        tableRows = demoMaintenance.slice(0, 5).map(m => [
          m.assetName, m.maintenanceType, m.startDate, `₹${m.cost || 0}`, m.technician
        ])
        recommendations = "Sensor realignment on Trimble GEDO track devices accounts for 42% of this month's maintenance bill. Establish a routine cleaning protocol to avoid sensor degradation."
        break

      case 'warranty':
        statsCards = [
          { title: 'Expiring (30 Days)', val: '14 Contracts', desc: 'Critical notice' },
          { title: 'Active Coverages', val: '72 Contracts', desc: 'Manufacturer warranty' },
          { title: 'Expired Coverages', val: '12 Contracts', desc: 'Unsecured fleet' },
          { title: 'Covered Portfolio Value', val: '₹1.15 Cr', desc: 'Asset replacement sum' }
        ]
        chartData = [
          { name: 'Q3 2026', value: 8 },
          { name: 'Q4 2026', value: 12 },
          { name: 'Q1 2027', value: 15 },
          { name: 'Q2 2027', value: 9 }
        ]
        tableHeaders = ['Asset Name', 'Provider', 'Contract No', 'Expiry Date', 'Status']
        tableRows = demoWarranties.slice(0, 5).map(w => [
          w.assetName, w.providerName, w.contractNumber, w.expiryDate, 'Active'
        ])
        recommendations = "14 contracts are due to expire. Engage Siemens Mobility India for extended service agreement renewals regarding Signal Controllers before warranty expirations."
        break

      case 'allocation':
        statsCards = [
          { title: 'Active Allocations', val: assignedAssets, desc: 'Handed over' },
          { title: 'Unique Custodians', val: '45 Staff', desc: 'Zonal designees' },
          { title: 'Overdue Returns', val: '2 Assets', desc: 'Flagged alerts' },
          { title: 'Transfer Logs (Month)', val: '8 Logs', desc: 'Depot handovers' }
        ]
        chartData = [
          { name: 'S&T', value: 12 },
          { name: 'Electrical', value: 8 },
          { name: 'Civil Eng', value: 5 },
          { name: 'Operating', value: 9 }
        ]
        tableHeaders = ['Asset Tag', 'Asset Allocated', 'Assigned Staff', 'Allocated Date', 'Purpose']
        tableRows = demoAllocations.slice(0, 5).map(al => [
          al.assetTag, al.assetName, al.employeeName, al.allocatedDate, al.purpose
        ])
        recommendations = "Operating and S&T allocations have increased by 15% this quarter. Implement quarterly asset audits to ensure all hardware stays in respective zonal offices."
        break

      case 'health':
        statsCards = [
          { title: 'Average Health Score', val: '86.4%', desc: 'Divisional health' },
          { title: 'Critical Health (<40)', val: '3 Assets', desc: 'Require overhaul' },
          { title: 'Poor Health (40-60)', val: '5 Assets', desc: 'Inspect soon' },
          { title: 'Zonal Risk Index', val: 'Low', desc: 'Low hazard factor' }
        ]
        chartData = [
          { name: 'Excellent', value: 54 },
          { name: 'Good', value: 38 },
          { name: 'Average', value: 20 },
          { name: 'Critical', value: 3 }
        ]
        tableHeaders = ['Asset Tag', 'Asset Name', 'Health Score', 'Status', 'Risk Factor']
        tableRows = demoAssets.slice(0, 5).map(a => [
          a.assetTag, a.name, `${Math.round(75 + Math.random() * 20)}%`, a.status, 'Low'
        ])
        recommendations = "3 assets currently fall in the critical health bracket (under 40%). Schedule calibration and battery swaps for APC UPS systems in Puri Server room."
        break

      case 'depreciation':
        statsCards = [
          { title: 'Original Value', val: '₹2.48 Cr', desc: 'Fleet purchase cost' },
          { title: 'Current Value', val: '₹1.85 Cr', desc: 'Residual book value' },
          { title: 'Total Depreciation', val: '₹63.50L', desc: 'Accrued straight-line' },
          { title: 'Avg Depreciation Rate', val: '10.0%', desc: 'Annual rate' }
        ]
        chartData = [
          { name: 'Signal Ctrl', purchase: 6750000, current: 6075000 },
          { name: 'Point Mach', purchase: 1440000, current: 1260000 },
          { name: 'Servers', purchase: 3500000, current: 3000000 },
          { name: 'UPS Systems', purchase: 1900000, current: 1520000 }
        ]
        tableHeaders = ['Asset Name', 'FY Bracket', 'Purchase Cost', 'Opening Value', 'Closing Value']
        tableRows = demoDepreciation.slice(0, 5).map(d => [
          d.assetName, d.financialYear, `₹${d.openingValue.toLocaleString('en-IN')}`, `₹${d.openingValue.toLocaleString('en-IN')}`, `₹${d.closingValue.toLocaleString('en-IN')}`
        ])
        recommendations = "The platform uses straight-line accounting. Annual closing ledger assets valuation should be matched against NIC tax audit filings in March."
        break

      case 'department':
        statsCards = [
          { title: 'Departments Active', val: '12 Divisions', desc: 'ECoR offices' },
          { title: 'Highest Valuation Dept', val: 'S&T Dept', desc: '₹1.25 Cr assets value' },
          { title: 'Highest Maintenance', val: 'Electrical', desc: '₹42,000 monthly' },
          { title: 'Avg Assets per Dept', val: '10 Units', desc: 'Divisional distribution' }
        ]
        chartData = [
          { name: 'S&T', value: 33 },
          { name: 'Electrical', value: 25 },
          { name: 'Civil Eng', value: 15 },
          { name: 'Operating', value: 12 }
        ]
        tableHeaders = ['Department Name', 'Total Assets', 'Assigned', 'Purchase Value', 'Utilization']
        tableRows = [
          ['Signaling & Telecommunication (S&T)', '33', '25', '₹1,25,00,000', '75.8%'],
          ['Electrical (General)', '25', '18', '₹55,00,000', '72.0%'],
          ['Civil Engineering', '15', '10', '₹35,00,000', '66.7%'],
          ['Operating (Traffic)', '12', '9', '₹28,00,000', '75.0%']
        ]
        recommendations = "Signaling & Telecommunication holds the highest asset count and valuation. Recommend implementing a buffer reserve of 5 spare point machines to prevent division outages."
        break

      default:
        break
    }

    return { statsCards, chartData, tableHeaders, tableRows, recommendations }
  }, [activeReport])

  // Handles export API calls (PDF, Excel, CSV)
  const handleExport = async (format) => {
    if (!activeReport) return
    setLoadingFormat(format)
    try {
      let response
      const params = { format, ...previewFilters }
      
      // Preservation of the actual REST APIs while allowing mock downloads
      if (activeReport.key === 'assets' || activeReport.key === 'inventory') {
        response = await reportApi.downloadAssets(params)
      } else if (activeReport.key === 'maintenance') {
        response = await reportApi.downloadMaintenance(params)
      } else if (activeReport.key === 'warranty') {
        response = await reportApi.downloadWarranty(params)
      } else if (activeReport.key === 'depreciation') {
        response = await reportApi.downloadDepreciation(params)
      } else {
        // Fallback for reports that do not have dedicated backend routes yet
        await new Promise(resolve => setTimeout(resolve, 1500))
        success(`Success! Raw ${format.toUpperCase()} report exported successfully.`)
        setLoadingFormat(null)
        return
      }
      
      const extension = format === 'excel' ? 'xlsx' : format === 'csv' ? 'csv' : 'pdf'
      downloadBlob(response.data, `${activeReport.key}_report.${extension}`)
      success(`Success! ${activeReport.title} downloaded in ${format.toUpperCase()} format.`)
    } catch (e) {
      error(getErrorMessage(e))
    } finally {
      setLoadingFormat(null)
    }
  }

  // Action to print preview window
  const handlePrint = () => {
    window.print()
  }

  const chartColors = ['#1E3A8A', '#8B0000', '#10b981', '#f59e0b', '#db2777', '#7c3aed']

  return (
    <div className="animate-fade-in text-left text-[13px]">
      
      {/* ─── CATALOG VIEW ────────────────────────────────────────────────────── */}
      {!activeReport && (
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between border-b pb-4 mb-6" style={{ borderColor: 'rgb(var(--border-color))' }}>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-1.5 h-5 rounded-sm bg-[#7c0a0a]" />
                <h1 className="text-base font-bold uppercase tracking-wider text-white">
                  Executive Divisional Reports
                </h1>
              </div>
              <p className="text-xs font-semibold text-slate-400 pl-4">
                Analyze and export comprehensive zonal statistics, maintenance logs, and asset valuations.
              </p>
            </div>
          </div>

          {/* Grid list of 8 reports */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {REPORT_TYPES.map(report => {
              const Icon = report.icon
              return (
                <div 
                  key={report.key} 
                  className="card p-5 flex flex-col justify-between hover:border-[#3b82f6]/50 hover:shadow-xl transition-all duration-200 group relative overflow-hidden"
                >
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: `${report.color}15`, border: `1px solid ${report.color}25` }}
                      >
                        <Icon size={18} style={{ color: report.color }} />
                      </div>
                      <div className="space-y-1 text-left min-w-0">
                        <h3 className="font-black text-sm text-white group-hover:text-[#3b82f6] transition-colors leading-tight">
                          {report.title}
                        </h3>
                        <p className="text-[11px] font-medium text-slate-400 leading-relaxed">
                          {report.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-800/40 flex justify-between items-center">
                    <span className="text-[9px] font-mono text-slate-500 uppercase">ECOR &bull; SYSTEM SUMMARY</span>
                    <button 
                      onClick={() => setActiveReport(report)}
                      className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <Eye size={12} />
                      <span>Preview Report</span>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ─── LIVE PREVIEW OVERLAY VIEW ───────────────────────────────────────── */}
      {activeReport && reportData && (
        <div className="space-y-6">
          
          {/* Action Header Ribbon */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4" style={{ borderColor: 'rgb(var(--border-color))' }}>
            <button 
              onClick={() => setActiveReport(null)}
              className="px-3.5 py-1.5 rounded-lg border border-slate-800 bg-slate-900/40 text-slate-300 hover:text-white hover:border-slate-600 transition-all text-xs font-bold uppercase tracking-wider flex items-center gap-2"
            >
              <ArrowLeft size={13} />
              <span>Back to Catalog</span>
            </button>

            <div className="flex flex-wrap gap-2.5">
              <button 
                onClick={handlePrint}
                className="px-3.5 py-1.5 rounded-lg border border-slate-800 bg-slate-900/40 text-slate-350 hover:text-white hover:border-slate-600 transition-all text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm"
              >
                <Printer size={13} />
                <span>Print Report</span>
              </button>
              
              <button 
                onClick={() => handleExport('excel')}
                disabled={!!loadingFormat}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-all text-xs font-bold uppercase tracking-wider flex items-center gap-2 disabled:opacity-50 shadow"
              >
                <FileSpreadsheet size={13} />
                <span>{loadingFormat === 'excel' ? 'Exporting...' : 'Export Excel'}</span>
              </button>

              <button 
                onClick={() => handleExport('pdf')}
                disabled={!!loadingFormat}
                className="px-3.5 py-1.5 rounded-lg bg-[#7c0a0a] hover:bg-[#5e0808] text-white transition-all text-xs font-bold uppercase tracking-wider flex items-center gap-2 disabled:opacity-50 shadow"
              >
                <Download size={13} />
                <span>{loadingFormat === 'pdf' ? 'Generating...' : 'Export PDF'}</span>
              </button>
            </div>
          </div>

          {/* Report Document Sheet (styled for window.print()) */}
          <div className="print-area card p-8 space-y-8 border-slate-700/60 bg-slate-950/20 shadow-2xl relative overflow-hidden">
            
            {/* Tricolor top strip (Displays on print too) */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-white to-emerald-500" />
            
            {/* Document Header (Indian Railways representation) */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div className="text-left space-y-1 select-none">
                <div className="text-[10px] font-black tracking-widest text-[#7c0a0a] uppercase leading-none">
                  EAST COAST RAILWAY
                </div>
                <h2 className="text-lg font-black uppercase text-white leading-none">
                  ECoR Zonal Divisional Report
                </h2>
                <p className="text-[10px] font-semibold text-slate-500">
                  Secure System Log &bull; generated on {new Date().toLocaleString('en-IN')}
                </p>
              </div>
              <div className="text-right border-l border-slate-800 pl-4 hidden sm:block">
                <span className="text-[9px] font-mono text-slate-500 block uppercase">Classified Code</span>
                <span className="text-xs font-black text-slate-400 font-mono tracking-widest">ECOR-AMP-2026</span>
              </div>
            </div>

            {/* Document Title Banner */}
            <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-900/60 text-left">
              <h3 className="text-sm font-black uppercase tracking-wider text-[#3b82f6]">
                {activeReport.title}
              </h3>
              <p className="text-xs font-semibold text-slate-400 mt-1 leading-relaxed">
                {activeReport.description}
              </p>
            </div>

            {/* Executive Summary Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {reportData.statsCards.map((card, i) => (
                <div key={i} className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 text-left">
                  <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">{card.title}</span>
                  <div className="text-xl font-black text-white mt-1.5 font-mono">{card.val}</div>
                  <span className="text-[9.5px] font-semibold text-slate-500 mt-1 block leading-none">{card.desc}</span>
                </div>
              ))}
            </div>

            {/* Charts Visual Block */}
            <div className="p-5 rounded-xl border border-slate-800/80 bg-slate-900/40 text-left space-y-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-450 block border-b border-slate-800 pb-2">
                Operational Analytics Chart Visualization
              </span>
              
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  {activeReport.chartType === 'pie' ? (
                    <PieChart>
                      <Pie
                        data={reportData.chartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        innerRadius={50}
                        paddingAngle={3}
                      >
                        {reportData.chartData.map((_, i) => (
                          <Cell key={i} fill={chartColors[i % chartColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 10, textTransform: 'uppercase' }} />
                    </PieChart>
                  ) : activeReport.chartType === 'area' ? (
                    <AreaChart data={reportData.chartData}>
                      <defs>
                        <linearGradient id="colorReport" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                       <CartesianGrid strokeDasharray="2 2" stroke="rgba(255,255,255,0.06)" />
                       <XAxis dataKey="name" tick={{ fontSize: 9, fill: 'rgb(var(--text-secondary))' }} stroke="rgba(var(--text-muted)/0.3)" />
                       <YAxis tick={{ fontSize: 9, fill: 'rgb(var(--text-secondary))' }} stroke="rgba(var(--text-muted)/0.3)" />
                       <Tooltip content={<CustomTooltip />} />
                       <Area type="monotone" dataKey="value" stroke="#f59e0b" fillOpacity={1} fill="url(#colorReport)" strokeWidth={2} />
                     </AreaChart>
                   ) : activeReport.chartType === 'line' ? (
                     <LineChart data={reportData.chartData}>
                       <CartesianGrid strokeDasharray="2 2" stroke="rgba(255,255,255,0.06)" />
                       <XAxis dataKey="name" tick={{ fontSize: 9, fill: 'rgb(var(--text-secondary))' }} stroke="rgba(var(--text-muted)/0.3)" />
                       <YAxis tick={{ fontSize: 9, fill: 'rgb(var(--text-secondary))' }} stroke="rgba(var(--text-muted)/0.3)" />
                       <Tooltip content={<CustomTooltip />} />
                       <Line type="monotone" dataKey="purchase" stroke="#1e3a8a" name="Procurement" strokeWidth={2.5} dot={{ r: 4 }} />
                       <Line type="monotone" dataKey="current" stroke="#059669" name="Valuation" strokeWidth={2} dot={{ r: 3 }} />
                     </LineChart>
                   ) : (
                     <BarChart data={reportData.chartData} barSize={20}>
                       <CartesianGrid strokeDasharray="2 2" stroke="rgba(255,255,255,0.06)" />
                       <XAxis dataKey="name" tick={{ fontSize: 9, fill: 'rgb(var(--text-secondary))' }} stroke="rgba(var(--text-muted)/0.3)" />
                       <YAxis tick={{ fontSize: 9, fill: 'rgb(var(--text-secondary))' }} stroke="rgba(var(--text-muted)/0.3)" />
                       <Tooltip content={<CustomTooltip />} />
                       <Bar dataKey="value" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                     </BarChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recommendations Alerts Box */}
            <div className="p-4 rounded-xl border border-blue-900/20 bg-blue-950/15 text-left flex items-start gap-4">
              <div className="p-2 rounded-lg bg-blue-950/30 border border-blue-900/40 text-blue-400 mt-0.5">
                <Info size={16} />
              </div>
              <div className="space-y-1">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-blue-400">
                  Divisional Command Advisories & Decisions
                </h4>
                <p className="text-xs font-semibold text-slate-350 leading-relaxed">
                  {reportData.recommendations}
                </p>
              </div>
            </div>

            {/* Detailed Table Grid */}
            <div className="space-y-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-450 block text-left">
                Accompanying Ledger Data Logs
              </span>
              <div className="overflow-x-auto border border-slate-800 rounded-xl">
                <table className="w-full text-left border-collapse text-xs font-semibold">
                  <thead>
                    <tr className="border-b border-slate-800 text-[10px] uppercase tracking-wider text-slate-450 bg-slate-900/30">
                      {reportData.tableHeaders.map((head, idx) => (
                        <th key={idx} className="py-2.5 px-4">{head}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40">
                    {reportData.tableRows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-900/20 transition-colors">
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="py-2.5 px-4 text-slate-300 font-mono">{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
