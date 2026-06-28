import React, { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { User, Shield, Bell, Save, Lock, Mail, Phone, Settings, RefreshCw, Sparkles, Database } from 'lucide-react'
import { authApi } from '../../api/authApi'
import axiosClient from '../../api/axiosClient'
import useAuthStore from '../../store/authStore'
import { useToast } from '../../hooks/useToast'
import { getErrorMessage } from '../../utils/formatters'

export default function SettingsPage() {
  const { updateUser } = useAuthStore()
  const { success, error } = useToast()
  const [activeTab, setActiveTab] = useState('profile')
  const [isResetting, setIsResetting] = useState(false)

  // Profile Form States
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
  })

  // Password Form States
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  // Notification Preferences States
  const [notificationPrefs, setNotificationPrefs] = useState({
    emailAlerts: true,
    maintenanceUpdates: true,
    systemAudits: true,
  })

  // Fetch complete profile details (including db columns)
  const { data: profileData, isLoading, refetch } = useQuery({
    queryKey: ['user-profile'],
    queryFn: () => authApi.getProfile().then(r => r.data.data),
    onSuccess: (data) => {
      if (data) {
        setProfileForm({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          phone: data.phone || '',
        })
        setNotificationPrefs({
          emailAlerts: data.emailAlerts ?? true,
          maintenanceUpdates: data.maintenanceUpdates ?? true,
          systemAudits: data.systemAudits ?? true,
        })
        // Also sync basic details back to zustand authStore
        updateUser({
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
        })
      }
    }
  })

  // Profile Update Mutation
  const updateProfileMutation = useMutation({
    mutationFn: authApi.updateProfile,
    onSuccess: (res) => {
      success('Profile details updated successfully!')
      const updated = res.data.data
      updateUser({
        firstName: updated.firstName,
        lastName: updated.lastName,
        phone: updated.phone,
      })
      refetch()
    },
    onError: e => error(getErrorMessage(e))
  })

  // Password Change Mutation
  const changePasswordMutation = useMutation({
    mutationFn: authApi.changePassword,
    onSuccess: () => {
      success('Password changed successfully!')
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    },
    onError: e => error(getErrorMessage(e))
  })

  const handleProfileSubmit = (e) => {
    e.preventDefault()
    updateProfileMutation.mutate(profileForm)
  }

  const handlePasswordSubmit = (e) => {
    e.preventDefault()
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      error('Confirm password does not match new password')
      return
    }
    changePasswordMutation.mutate(passwordForm)
  }

  const handleTogglePref = (key) => {
    const newVal = !notificationPrefs[key]
    const updatedPrefs = { ...notificationPrefs, [key]: newVal }
    setNotificationPrefs(updatedPrefs)
    
    // Save immediately to backend
    updateProfileMutation.mutate(updatedPrefs)
  }

  // Handle Demo mode reset trigger call
  const handleDemoReset = async () => {
    if (window.confirm("Purge and reseed the entire divisional database with mock East Coast Railway data? This action drops all active inventory and cannot be undone.")) {
      setIsResetting(true)
      try {
        await axiosClient.post('/dashboard/demo-reset')
        success("Divisional database reset completed! 100+ equipment assets, 12 departments, and logs successfully re-seeded.")
      } catch (err) {
        error("Reset failed: " + getErrorMessage(err))
      } finally {
        setIsResetting(false)
      }
    }
  }

  const isSaving = updateProfileMutation.isLoading || changePasswordMutation.isLoading

  return (
    <div className="animate-fade-in space-y-6 text-left">
      <div className="page-header border-b pb-4 mb-5" style={{ borderColor: 'rgb(var(--border-color))' }}>
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="w-1.5 h-5 rounded-sm bg-[#7c0a0a]" />
            <h1 className="page-title text-base font-bold uppercase tracking-wider text-white">Account Settings</h1>
          </div>
          <p className="page-subtitle text-xs font-semibold text-slate-400 pl-3">
            Manage profile information, notification preferences, and divisional system configurations.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start text-xs font-semibold">
        {/* Left Side: Tabs Navigation */}
        <div className="card p-3 md:col-span-1 flex flex-row md:flex-col overflow-x-auto gap-1 md:space-y-1 border-slate-800 bg-slate-900/30">
          <button
            onClick={() => setActiveTab('profile')}
            className={`settings-tab ${activeTab === 'profile' ? 'active' : ''}`}
          >
            <User size={15} />
            <span>Profile Details</span>
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`settings-tab ${activeTab === 'security' ? 'active' : ''}`}
          >
            <Shield size={15} />
            <span>Security Settings</span>
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`settings-tab ${activeTab === 'notifications' ? 'active' : ''}`}
          >
            <Bell size={15} />
            <span>Notification Toggles</span>
          </button>
          <button
            onClick={() => setActiveTab('demo')}
            className={`settings-tab ${activeTab === 'demo' ? 'active' : ''}`}
          >
            <Database size={15} />
            <span>Demo Mode Control</span>
          </button>
        </div>

        {/* Right Side: Tab Contents Panel */}
        <div className="card p-6 md:col-span-3 border-slate-800 bg-slate-900/30">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-500">
              <RefreshCw size={22} className="animate-spin" />
              <span>Loading account profile...</span>
            </div>
          ) : (
            <>
              {/* Profile Details Tab */}
              {activeTab === 'profile' && (
                <form onSubmit={handleProfileSubmit} className="space-y-4 text-left">
                  <h2 className="text-sm font-black uppercase text-white flex items-center gap-2 border-b border-slate-800 pb-2 mb-4">
                    <User size={16} className="text-blue-400" /> Personal Details
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">First Name</label>
                      <input
                        type="text"
                        required
                        value={profileForm.firstName}
                        onChange={e => setProfileForm({ ...profileForm, firstName: e.target.value })}
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="form-label">Last Name</label>
                      <input
                        type="text"
                        required
                        value={profileForm.lastName}
                        onChange={e => setProfileForm({ ...profileForm, lastName: e.target.value })}
                        className="input"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="form-label">Email Address (Read Only)</label>
                      <div className="relative">
                        <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-550" />
                        <input
                          type="email"
                          disabled
                          value={profileData?.email || ''}
                          className="input pl-10 bg-slate-950/60 cursor-not-allowed opacity-75"
                        />
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="form-label">Phone Number</label>
                      <div className="relative">
                        <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-550" />
                        <input
                          type="text"
                          value={profileForm.phone}
                          onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                          className="input pl-10"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-slate-850 flex justify-end">
                    <button type="submit" disabled={isSaving} className="btn-primary btn-sm flex items-center gap-1.5 shadow">
                      <Save size={13} />
                      <span>{updateProfileMutation.isLoading ? 'Saving...' : 'Save Profile'}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <form onSubmit={handlePasswordSubmit} className="space-y-4 text-left">
                  <h2 className="text-sm font-black uppercase text-white flex items-center gap-2 border-b border-slate-800 pb-2 mb-4">
                    <Lock size={16} className="text-blue-400" /> Update Password
                  </h2>
                  <div className="space-y-4 max-w-md">
                    <div>
                      <label className="form-label">Current Password</label>
                      <input
                        type="password"
                        required
                        placeholder="Enter current password"
                        value={passwordForm.currentPassword}
                        onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="form-label">New Password</label>
                      <input
                        type="password"
                        required
                        placeholder="Enter new password"
                        value={passwordForm.newPassword}
                        onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="form-label">Confirm New Password</label>
                      <input
                        type="password"
                        required
                        placeholder="Re-enter new password"
                        value={passwordForm.confirmPassword}
                        onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        className="input"
                      />
                    </div>
                  </div>
                  <div className="pt-4 border-t border-slate-850 flex justify-end">
                    <button type="submit" disabled={isSaving} className="btn-primary btn-sm flex items-center gap-1.5 shadow">
                      <Shield size={13} />
                      <span>{changePasswordMutation.isLoading ? 'Updating...' : 'Change Password'}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Notification Toggles Tab */}
              {activeTab === 'notifications' && (
                <div className="space-y-4 text-left">
                  <h2 className="text-sm font-black uppercase text-white flex items-center gap-2 border-b border-slate-800 pb-2 mb-4">
                    <Bell size={16} className="text-blue-400" /> Notification Preferences
                  </h2>
                  <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                    Select which events triggers alert messages to your registered email/phone coordinates.
                  </p>

                  <div className="divide-y divide-slate-850">
                    {[
                      {
                        key: 'emailAlerts',
                        title: 'General System Mailings',
                        desc: 'Receive alerts when credentials, allocations or profile data shifts.',
                      },
                      {
                        key: 'maintenanceUpdates',
                        title: 'Maintenance & Work Orders',
                        desc: 'Alerts when scheduled repairs, risk analysis updates or condition tasks are registered.',
                      },
                      {
                        key: 'systemAudits',
                        title: 'Security Audits & Logs',
                        desc: 'Notifications when logins or data reports exports are executed.',
                      }
                    ].map((pref) => (
                      <div key={pref.key} className="flex items-center justify-between py-4 gap-4">
                        <div>
                          <p className="text-xs font-bold text-white">{pref.title}</p>
                          <p className="text-[10.5px] text-slate-400 mt-0.5 leading-relaxed">{pref.desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer select-none">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={notificationPrefs[pref.key]}
                            onChange={() => handleTogglePref(pref.key)}
                          />
                          <div className="w-8 h-4 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#7c0a0a] peer-checked:after:bg-white"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Demo Mode Control Tab */}
              {activeTab === 'demo' && (
                <div className="space-y-5 text-left">
                  <h2 className="text-sm font-black uppercase text-white flex items-center gap-2 border-b border-slate-800 pb-2 mb-4">
                    <Sparkles size={16} className="text-blue-400" /> Divisional Demo Control
                  </h2>
                  
                  <div className="relative overflow-hidden p-6 rounded-xl border border-blue-900/20 bg-blue-950/10 space-y-4">
                    {/* Tricolor top strip */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-white to-emerald-500" />
                    
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-950/40 border border-blue-900/40 text-blue-400 mt-0.5 flex-shrink-0">
                        <Sparkles size={20} className={isResetting ? "animate-spin" : ""} />
                      </div>
                      <div className="space-y-1">
                        <h2 className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-2 leading-tight">
                          Zonal Database Reset & Seeder
                        </h2>
                        <p className="text-[10.5px] font-semibold text-slate-400 leading-relaxed">
                          This utility drops, purges, and reseeds the entire relational database with realistic, high-fidelity East Coast Railway (ECoR) categories, departments, and equipment assets. It instantly generates maintenance work tickets, warranty contracts, health scores, and active logs.
                        </p>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={handleDemoReset}
                        disabled={isResetting}
                        className="px-4 py-2.5 rounded-lg bg-[#7c0a0a] hover:bg-[#5e0808] text-white font-black uppercase text-[10px] tracking-wider transition-all flex items-center gap-2 disabled:opacity-50 shadow-md"
                      >
                        <RefreshCw size={12} className={isResetting ? "animate-spin" : ""} />
                        <span>{isResetting ? "Reseeding Division..." : "1-Click Divisional Database Reset"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
