import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import {
  User, Mail, Lock, Eye, EyeOff, CheckCircle2,
  ArrowLeft, ArrowRight, RefreshCw, Shield, Building2,
  Phone, ChevronRight, AlertCircle
} from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import { authApi } from '../../api/authApi'
import { useToast } from '../../hooks/useToast'
import { getErrorMessage } from '../../utils/formatters'
import irLogo from '../../assets/images/indian_railways.png'
import trainWatermark from '../../assets/images/train_watermark.png'

// ─── Password Strength Meter ──────────────────────────────────────────────────
const getStrength = (pw) => {
  if (!pw) return { score: 0, label: '', color: 'transparent' }
  let score = 0
  if (pw.length >= 8)  score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  const map = [
    { label: '', color: 'transparent' },
    { label: 'Weak', color: '#b91c1c' },
    { label: 'Fair', color: '#d97706' },
    { label: 'Good', color: '#16a34a' },
    { label: 'Strong', color: '#15803d' },
  ]
  return { score, ...map[score] }
}

const PasswordStrengthBar = ({ password }) => {
  const { score, label, color } = getStrength(password)
  if (!password) return null
  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="flex-1 h-1 rounded-full transition-all duration-300"
               style={{ background: i <= score ? color : 'rgba(255,255,255,0.1)' }} />
        ))}
      </div>
      <p className="text-xs" style={{ color }}>{label}</p>
    </div>
  )
}

// ─── OTP Input ────────────────────────────────────────────────────────────────
const OtpInput = ({ value, onChange, hasError }) => {
  const inputRefs = useRef([])
  const digits = value.split('')

  const handleKey = (e, idx) => {
    if (e.key === 'Backspace') {
      const next = [...digits]
      next[idx] = ''
      onChange(next.join(''))
      if (idx > 0) inputRefs.current[idx - 1]?.focus()
      return
    }
    if (e.key === 'ArrowLeft' && idx > 0) { inputRefs.current[idx - 1]?.focus(); return }
    if (e.key === 'ArrowRight' && idx < 5) { inputRefs.current[idx + 1]?.focus(); return }
  }

  const handleChange = (e, idx) => {
    const char = e.target.value.replace(/\D/g, '').slice(-1)
    if (!char) return
    const next = [...digits]
    next[idx] = char
    onChange(next.join(''))
    if (idx < 5) inputRefs.current[idx + 1]?.focus()
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    onChange(pasted.padEnd(6, '').slice(0, 6))
    inputRefs.current[Math.min(pasted.length, 5)]?.focus()
  }

  return (
    <div className="flex gap-3 justify-center">
      {[0, 1, 2, 3, 4, 5].map(i => (
        <input
          key={i}
          ref={el => inputRefs.current[i] = el}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[i] || ''}
          onChange={e => handleChange(e, i)}
          onKeyDown={e => handleKey(e, i)}
          onPaste={handlePaste}
          className="w-12 h-14 text-center text-xl font-bold rounded-lg outline-none transition-all duration-200"
          style={{
            background: 'rgba(255,255,255,0.08)',
            border: `2px solid ${hasError ? '#b91c1c' : digits[i] ? '#B8860B' : 'rgba(255,255,255,0.15)'}`,
            color: '#fff',
            caretColor: '#B8860B',
          }}
        />
      ))}
    </div>
  )
}

// ─── Countdown Timer ──────────────────────────────────────────────────────────
const useCountdown = (seconds) => {
  const [remaining, setRemaining] = useState(seconds)
  const timerRef = useRef(null)

  const start = useCallback((s = seconds) => {
    setRemaining(s)
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setRemaining(r => {
        if (r <= 1) { clearInterval(timerRef.current); return 0 }
        return r - 1
      })
    }, 1000)
  }, [seconds])

  useEffect(() => { start(); return () => clearInterval(timerRef.current) }, [start])

  return { remaining, restart: start }
}

// ─── Step Indicator ───────────────────────────────────────────────────────────
const StepIndicator = ({ current, total }) => (
  <div className="flex items-center justify-center gap-2 mb-6">
    {Array.from({ length: total }, (_, i) => (
      <React.Fragment key={i}>
        <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all duration-300 ${
          i < current ? 'text-white' : i === current ? 'text-white' : 'text-white/40'
        }`}
          style={{
            background: i < current ? '#15803d' : i === current ? '#8B0000' : 'rgba(255,255,255,0.1)',
            border: i === current ? '2px solid rgba(184,134,11,0.6)' : '2px solid transparent',
          }}>
          {i < current ? <CheckCircle2 size={14} /> : i + 1}
        </div>
        {i < total - 1 && (
          <div className="w-10 h-0.5 rounded-full transition-all duration-300"
               style={{ background: i < current ? '#15803d' : 'rgba(255,255,255,0.1)' }} />
        )}
      </React.Fragment>
    ))}
  </div>
)

const STEP_LABELS = ['Personal Details', 'OTP Verification', 'Set Password']

// ─── Main Register Page ───────────────────────────────────────────────────────
export default function RegisterPage() {
  const navigate = useNavigate()
  const { success, error, info } = useToast()
  const [step, setStep] = useState(0) // 0=details, 1=otp, 2=password, 3=done
  const [formData, setFormData] = useState({})
  const [otp, setOtp] = useState('')
  const [otpError, setOtpError] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const { remaining, restart } = useCountdown(60)

  const {
    register: reg1,
    handleSubmit: hs1,
    formState: { errors: e1 },
    watch: w1,
  } = useForm()

  const {
    register: reg3,
    handleSubmit: hs3,
    formState: { errors: e3 },
    watch: w3,
  } = useForm()

  const password = w3('password', '')

  // Step 1 — Send OTP
  const sendOtpMutation = useMutation({
    mutationFn: authApi.sendOtp,
    onSuccess: () => {
      info('A 6-digit OTP has been sent to your email address.')
      restart(60)
      setStep(1)
    },
    onError: (err) => error(getErrorMessage(err)),
  })

  // Step 2 — Verify OTP
  const verifyOtpMutation = useMutation({
    mutationFn: (data) => authApi.verifyOtp(data.email, data.otp),
    onSuccess: () => {
      setOtpError('')
      setStep(2)
    },
    onError: (err) => {
      setOtpError(getErrorMessage(err) || 'Invalid or expired OTP. Please try again.')
    },
  })

  // Step 3 — Register
  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: () => {
      success('Account registered successfully! You may now sign in.')
      setStep(3)
    },
    onError: (err) => error(getErrorMessage(err)),
  })

  const onStep1Submit = (data) => {
    setFormData(data)
    sendOtpMutation.mutate(data.email)
  }

  const onOtpVerify = () => {
    if (otp.length < 6) { setOtpError('Please enter the complete 6-digit OTP.'); return }
    setOtpError('')
    verifyOtpMutation.mutate({ email: formData.email, otp })
  }

  const onStep3Submit = (data) => {
    registerMutation.mutate({
      ...formData,
      password: data.password,
    })
  }

  const resendOtp = () => {
    if (remaining > 0) return
    sendOtpMutation.mutate(formData.email)
  }

  // ─── UI ────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden"
         style={{ background: 'linear-gradient(160deg, #0A1628 0%, #0D2044 55%, #0A1628 100%)' }}>

      {/* Background train watermark decorative overlay */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden flex items-center justify-center">
        <img 
          src={trainWatermark} 
          alt="Railway Background Watermark" 
          className="w-[85%] max-w-4xl object-contain opacity-[0.05] invert select-none" 
          style={{ mixBlendMode: 'screen' }}
        />
      </div>

      {/* Gov header */}
      <div className="flex-shrink-0 px-6 py-2 flex items-center justify-between"
           style={{ background: 'rgba(139,0,0,0.9)', borderBottom: '1px solid rgba(184,134,11,0.4)' }}>
        <div className="text-xs text-white/80 font-medium tracking-wide">Government of India</div>
        <div className="text-xs text-white/80 font-medium tracking-wide">Ministry of Railways</div>
      </div>
      <div className="h-0.5 flex-shrink-0"
           style={{ background: 'linear-gradient(90deg, transparent, #B8860B, transparent)' }} />

      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-lg animate-scale-in">

          {/* Header */}
          <div className="text-center mb-7">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center">
                <img src={irLogo} alt="Indian Railways" className="w-full h-full object-contain rounded-full shadow-md" />
              </div>
            </div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#B8860B' }}>
              Indian Railways — AMS
            </p>
            <h1 className="text-xl font-bold text-white">New Employee Registration</h1>
            <p className="text-xs mt-1" style={{ color: 'rgba(140,160,185,0.85)' }}>
              {STEP_LABELS[Math.min(step, 2)]}
            </p>
          </div>

          {/* Step indicator */}
          {step < 3 && <StepIndicator current={step} total={3} />}

          {/* Card */}
          <div className="rounded-xl overflow-hidden"
               style={{
                 background: 'rgba(255,255,255,0.04)',
                 border: '1px solid rgba(255,255,255,0.09)',
                 backdropFilter: 'blur(16px)',
                 boxShadow: '0 25px 50px rgba(0,0,0,0.4)',
               }}>
            <div className="h-1" style={{ background: 'linear-gradient(90deg, #8B0000, #B8860B, #8B0000)' }} />

            <div className="p-7">

              {/* ── Step 0: Personal Details ── */}
              {step === 0 && (
                <form onSubmit={hs1(onStep1Submit)} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide"
                             style={{ color: 'rgba(160,178,200,0.9)' }}>First Name</label>
                      <div className="relative">
                        <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(140,160,185,0.55)' }} />
                        <input id="reg-firstname" type="text" placeholder="First name"
                          {...reg1('firstName', { required: 'Required' })}
                          className="w-full pl-9 pr-3 py-2.5 rounded-md text-sm outline-none transition-all"
                          style={{
                            background: 'rgba(255,255,255,0.07)',
                            border: `1px solid ${e1.firstName ? '#b91c1c' : 'rgba(255,255,255,0.12)'}`,
                            color: '#fff',
                          }} />
                      </div>
                      {e1.firstName && <p className="mt-1 text-xs text-red-400">{e1.firstName.message}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide"
                             style={{ color: 'rgba(160,178,200,0.9)' }}>Last Name</label>
                      <div className="relative">
                        <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(140,160,185,0.55)' }} />
                        <input id="reg-lastname" type="text" placeholder="Last name"
                          {...reg1('lastName', { required: 'Required' })}
                          className="w-full pl-9 pr-3 py-2.5 rounded-md text-sm outline-none transition-all"
                          style={{
                            background: 'rgba(255,255,255,0.07)',
                            border: `1px solid ${e1.lastName ? '#b91c1c' : 'rgba(255,255,255,0.12)'}`,
                            color: '#fff',
                          }} />
                      </div>
                      {e1.lastName && <p className="mt-1 text-xs text-red-400">{e1.lastName.message}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide"
                           style={{ color: 'rgba(160,178,200,0.9)' }}>Official Email Address</label>
                    <div className="relative">
                      <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(140,160,185,0.55)' }} />
                      <input id="reg-email" type="email" placeholder="name@indianrailways.gov.in"
                        {...reg1('email', {
                          required: 'Email is required',
                          pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email address' }
                        })}
                        className="w-full pl-9 pr-3 py-2.5 rounded-md text-sm outline-none transition-all"
                        style={{
                          background: 'rgba(255,255,255,0.07)',
                          border: `1px solid ${e1.email ? '#b91c1c' : 'rgba(255,255,255,0.12)'}`,
                          color: '#fff',
                        }} />
                    </div>
                    {e1.email && <p className="mt-1 text-xs text-red-400">{e1.email.message}</p>}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide"
                             style={{ color: 'rgba(160,178,200,0.9)' }}>Employee ID</label>
                      <div className="relative">
                        <Shield size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(140,160,185,0.55)' }} />
                        <input id="reg-empid" type="text" placeholder="EMP-XXXXX"
                          {...reg1('employeeId', { required: 'Required' })}
                          className="w-full pl-9 pr-3 py-2.5 rounded-md text-sm outline-none transition-all"
                          style={{
                            background: 'rgba(255,255,255,0.07)',
                            border: `1px solid ${e1.employeeId ? '#b91c1c' : 'rgba(255,255,255,0.12)'}`,
                            color: '#fff',
                          }} />
                      </div>
                      {e1.employeeId && <p className="mt-1 text-xs text-red-400">{e1.employeeId.message}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide"
                             style={{ color: 'rgba(160,178,200,0.9)' }}>Department</label>
                      <div className="relative">
                        <Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(140,160,185,0.55)' }} />
                        <input id="reg-dept" type="text" placeholder="e.g. IT, Civil"
                          {...reg1('department', { required: 'Required' })}
                          className="w-full pl-9 pr-3 py-2.5 rounded-md text-sm outline-none transition-all"
                          style={{
                            background: 'rgba(255,255,255,0.07)',
                            border: `1px solid ${e1.department ? '#b91c1c' : 'rgba(255,255,255,0.12)'}`,
                            color: '#fff',
                          }} />
                      </div>
                      {e1.department && <p className="mt-1 text-xs text-red-400">{e1.department.message}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide"
                           style={{ color: 'rgba(160,178,200,0.9)' }}>Contact Number</label>
                    <div className="relative">
                      <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(140,160,185,0.55)' }} />
                      <input id="reg-phone" type="tel" placeholder="+91 XXXXX XXXXX"
                        {...reg1('phone', {
                          required: 'Phone number is required',
                          pattern: { value: /^[+]?[\d\s-]{10,15}$/, message: 'Enter a valid phone number' }
                        })}
                        className="w-full pl-9 pr-3 py-2.5 rounded-md text-sm outline-none transition-all"
                        style={{
                          background: 'rgba(255,255,255,0.07)',
                          border: `1px solid ${e1.phone ? '#b91c1c' : 'rgba(255,255,255,0.12)'}`,
                          color: '#fff',
                        }} />
                    </div>
                    {e1.phone && <p className="mt-1 text-xs text-red-400">{e1.phone.message}</p>}
                  </div>

                  <button id="reg-send-otp" type="submit" disabled={sendOtpMutation.isLoading}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-md font-semibold text-sm text-white transition-all duration-200 disabled:opacity-60 mt-2"
                    style={{ background: 'linear-gradient(135deg, #8B0000, #A52A2A)', boxShadow: '0 4px 14px rgba(139,0,0,0.4)', border: '1px solid rgba(139,0,0,0.5)' }}>
                    {sendOtpMutation.isLoading
                      ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Sending OTP...</>
                      : <>Send Verification OTP <ArrowRight size={15} /></>}
                  </button>
                </form>
              )}

              {/* ── Step 1: OTP Verification ── */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                         style={{ background: 'rgba(184,134,11,0.15)', border: '1px solid rgba(184,134,11,0.3)' }}>
                      <Mail size={24} style={{ color: '#B8860B' }} />
                    </div>
                    <p className="text-sm" style={{ color: 'rgba(180,200,225,0.9)' }}>
                      A 6-digit OTP was sent to
                    </p>
                    <p className="text-sm font-bold text-white mt-0.5">{formData.email}</p>
                  </div>

                  <OtpInput value={otp} onChange={setOtp} hasError={!!otpError} />

                  {otpError && (
                    <div className="flex items-center gap-2 p-3 rounded-md"
                         style={{ background: 'rgba(185,28,28,0.12)', border: '1px solid rgba(185,28,28,0.25)' }}>
                      <AlertCircle size={14} className="text-red-400 flex-shrink-0" />
                      <p className="text-xs text-red-400">{otpError}</p>
                    </div>
                  )}

                  <button id="reg-verify-otp" onClick={onOtpVerify} disabled={verifyOtpMutation.isLoading || otp.length < 6}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-md font-semibold text-sm text-white transition-all duration-200 disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg, #8B0000, #A52A2A)', boxShadow: '0 4px 14px rgba(139,0,0,0.4)', border: '1px solid rgba(139,0,0,0.5)' }}>
                    {verifyOtpMutation.isLoading
                      ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Verifying...</>
                      : <>Verify OTP <ArrowRight size={15} /></>}
                  </button>

                  <div className="flex items-center justify-between text-xs" style={{ color: 'rgba(140,160,185,0.8)' }}>
                    <button onClick={() => setStep(0)} className="flex items-center gap-1 hover:text-white transition-colors">
                      <ArrowLeft size={13} /> Edit details
                    </button>
                    <button
                      id="reg-resend-otp"
                      onClick={resendOtp}
                      disabled={remaining > 0 || sendOtpMutation.isLoading}
                      className="flex items-center gap-1 transition-colors disabled:opacity-40"
                      style={{ color: remaining > 0 ? 'rgba(140,160,185,0.5)' : '#B8860B' }}>
                      <RefreshCw size={12} />
                      {remaining > 0 ? `Resend in ${remaining}s` : 'Resend OTP'}
                    </button>
                  </div>
                </div>
              )}

              {/* ── Step 2: Set Password ── */}
              {step === 2 && (
                <form onSubmit={hs3(onStep3Submit)} className="space-y-4">
                  <div className="flex items-center gap-2 p-3 rounded-md mb-2"
                       style={{ background: 'rgba(21,128,61,0.12)', border: '1px solid rgba(21,128,61,0.25)' }}>
                    <CheckCircle2 size={14} className="text-green-400 flex-shrink-0" />
                    <p className="text-xs text-green-400">OTP verified successfully. Please set a secure password.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide"
                           style={{ color: 'rgba(160,178,200,0.9)' }}>New Password</label>
                    <div className="relative">
                      <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(140,160,185,0.55)' }} />
                      <input id="reg-password" type={showPass ? 'text' : 'password'} placeholder="Minimum 8 characters"
                        {...reg3('password', {
                          required: 'Password is required',
                          minLength: { value: 8, message: 'Minimum 8 characters required' },
                          pattern: { value: /^(?=.*[A-Z])(?=.*[0-9])/, message: 'Must include uppercase letter and number' }
                        })}
                        className="w-full pl-9 pr-10 py-2.5 rounded-md text-sm outline-none transition-all"
                        style={{
                          background: 'rgba(255,255,255,0.07)',
                          border: `1px solid ${e3.password ? '#b91c1c' : 'rgba(255,255,255,0.12)'}`,
                          color: '#fff',
                        }} />
                      <button type="button" onClick={() => setShowPass(s => !s)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                        style={{ color: 'rgba(140,160,185,0.6)' }}>
                        {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                    <PasswordStrengthBar password={password} />
                    {e3.password && <p className="mt-1 text-xs text-red-400">{e3.password.message}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide"
                           style={{ color: 'rgba(160,178,200,0.9)' }}>Confirm Password</label>
                    <div className="relative">
                      <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(140,160,185,0.55)' }} />
                      <input id="reg-confirm-password" type={showConfirm ? 'text' : 'password'} placeholder="Re-enter password"
                        {...reg3('confirmPassword', {
                          required: 'Please confirm your password',
                          validate: v => v === w3('password') || 'Passwords do not match'
                        })}
                        className="w-full pl-9 pr-10 py-2.5 rounded-md text-sm outline-none transition-all"
                        style={{
                          background: 'rgba(255,255,255,0.07)',
                          border: `1px solid ${e3.confirmPassword ? '#b91c1c' : 'rgba(255,255,255,0.12)'}`,
                          color: '#fff',
                        }} />
                      <button type="button" onClick={() => setShowConfirm(s => !s)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                        style={{ color: 'rgba(140,160,185,0.6)' }}>
                        {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                    {e3.confirmPassword && <p className="mt-1 text-xs text-red-400">{e3.confirmPassword.message}</p>}
                  </div>

                  {/* Policy notice */}
                  <div className="p-3 rounded-md text-xs" style={{ background: 'rgba(184,134,11,0.08)', border: '1px solid rgba(184,134,11,0.2)', color: 'rgba(160,178,200,0.8)' }}>
                    Password must be at least 8 characters, include one uppercase letter and one number. Do not share your password with anyone.
                  </div>

                  <button id="reg-complete" type="submit" disabled={registerMutation.isLoading}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-md font-semibold text-sm text-white transition-all duration-200 disabled:opacity-60"
                    style={{ background: 'linear-gradient(135deg, #8B0000, #A52A2A)', boxShadow: '0 4px 14px rgba(139,0,0,0.4)', border: '1px solid rgba(139,0,0,0.5)' }}>
                    {registerMutation.isLoading
                      ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating Account...</>
                      : <>Complete Registration <CheckCircle2 size={15} /></>}
                  </button>
                </form>
              )}

              {/* ── Step 3: Success ── */}
              {step === 3 && (
                <div className="text-center py-4 space-y-5">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto"
                       style={{ background: 'rgba(21,128,61,0.15)', border: '2px solid rgba(21,128,61,0.4)' }}>
                    <CheckCircle2 size={40} className="text-green-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Registration Successful</h2>
                    <p className="text-sm mt-2" style={{ color: 'rgba(160,178,200,0.85)' }}>
                      Your account has been created. Please wait for administrator approval before signing in.
                    </p>
                  </div>
                  <div className="p-4 rounded-md text-xs text-left space-y-1.5"
                       style={{ background: 'rgba(184,134,11,0.08)', border: '1px solid rgba(184,134,11,0.2)', color: 'rgba(160,178,200,0.8)' }}>
                    <p><span className="font-semibold text-white/70">Name:</span> {formData.firstName} {formData.lastName}</p>
                    <p><span className="font-semibold text-white/70">Email:</span> {formData.email}</p>
                    <p><span className="font-semibold text-white/70">Employee ID:</span> {formData.employeeId}</p>
                    <p><span className="font-semibold text-white/70">Department:</span> {formData.department}</p>
                  </div>
                  <Link id="reg-go-login" to="/login"
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-md font-semibold text-sm text-white transition-all duration-200"
                    style={{ background: 'linear-gradient(135deg, #8B0000, #A52A2A)', boxShadow: '0 4px 14px rgba(139,0,0,0.35)' }}>
                    Proceed to Sign In <ArrowRight size={15} />
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          {step < 3 && (
            <p className="text-center text-xs mt-5" style={{ color: 'rgba(100,120,145,0.7)' }}>
              Already have an account?{' '}
              <Link to="/login" className="font-medium transition-colors hover:text-white"
                    style={{ color: '#B8860B' }}>Sign in here</Link>
            </p>
          )}
          <p className="text-center text-xs mt-3" style={{ color: 'rgba(80,100,125,0.5)' }}>
            Indian Railways AMS &copy; {new Date().getFullYear()} | Government of India
          </p>
        </div>
      </div>

      {/* Footer bar */}
      <div className="flex-shrink-0 px-6 py-2 text-center"
           style={{ background: 'rgba(10,22,40,0.8)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <p className="text-xs" style={{ color: 'rgba(100,120,145,0.6)' }}>
          Registration is subject to verification and approval by the department administrator.
        </p>
      </div>
    </div>
  )
}
