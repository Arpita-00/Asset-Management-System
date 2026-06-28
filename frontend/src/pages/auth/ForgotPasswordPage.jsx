import React, { useState, useRef, useCallback, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, CheckCircle2, ArrowLeft, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import { authApi } from '../../api/authApi'
import { useToast } from '../../hooks/useToast'
import { getErrorMessage } from '../../utils/formatters'
import irLogo from '../../assets/images/indian_railways.png'
import trainWatermark from '../../assets/images/train_watermark.png'

// ─── OTP Input (reusable) ─────────────────────────────────────────────────────
const OtpInput = ({ value, onChange, hasError }) => {
  const refs = useRef([])
  const digits = value.split('')

  const handleKey = (e, i) => {
    if (e.key === 'Backspace') {
      const next = [...digits]; next[i] = ''; onChange(next.join(''))
      if (i > 0) refs.current[i - 1]?.focus()
    } else if (e.key === 'ArrowLeft' && i > 0) refs.current[i - 1]?.focus()
    else if (e.key === 'ArrowRight' && i < 5) refs.current[i + 1]?.focus()
  }
  const handleChange = (e, i) => {
    const c = e.target.value.replace(/\D/g, '').slice(-1)
    if (!c) return
    const next = [...digits]; next[i] = c; onChange(next.join(''))
    if (i < 5) refs.current[i + 1]?.focus()
  }
  const handlePaste = (e) => {
    e.preventDefault()
    const p = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    onChange(p.padEnd(6, '').slice(0, 6))
    refs.current[Math.min(p.length, 5)]?.focus()
  }

  return (
    <div className="flex gap-3 justify-center">
      {[0, 1, 2, 3, 4, 5].map(i => (
        <input key={i} ref={el => refs.current[i] = el}
          type="text" inputMode="numeric" maxLength={1} value={digits[i] || ''}
          onChange={e => handleChange(e, i)} onKeyDown={e => handleKey(e, i)} onPaste={handlePaste}
          className="w-11 h-13 text-center text-xl font-bold rounded-lg outline-none transition-all duration-200"
          style={{
            width: '2.75rem', height: '3.25rem',
            background: 'rgba(255,255,255,0.08)',
            border: `2px solid ${hasError ? '#b91c1c' : digits[i] ? '#B8860B' : 'rgba(255,255,255,0.15)'}`,
            color: '#fff', caretColor: '#B8860B',
          }} />
      ))}
    </div>
  )
}

const useCountdown = (s) => {
  const [remaining, setRemaining] = useState(s)
  const t = useRef(null)
  const start = useCallback((n = s) => {
    setRemaining(n)
    if (t.current) clearInterval(t.current)
    t.current = setInterval(() => setRemaining(r => { if (r <= 1) { clearInterval(t.current); return 0 } return r - 1 }), 1000)
  }, [s])
  useEffect(() => { start(); return () => clearInterval(t.current) }, [start])
  return { remaining, restart: start }
}

const STEPS = ['Enter Email', 'Verify OTP', 'New Password']
const StepDot = ({ current, total }) => (
  <div className="flex items-center justify-center gap-2 mb-6">
    {Array.from({ length: total }, (_, i) => (
      <React.Fragment key={i}>
        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
          style={{
            background: i < current ? '#15803d' : i === current ? '#8B0000' : 'rgba(255,255,255,0.1)',
            border: i === current ? '2px solid rgba(184,134,11,0.5)' : '2px solid transparent',
            color: i <= current ? '#fff' : 'rgba(255,255,255,0.3)',
          }}>
          {i < current ? <CheckCircle2 size={13} /> : i + 1}
        </div>
        {i < total - 1 && <div className="w-8 h-0.5 rounded-full" style={{ background: i < current ? '#15803d' : 'rgba(255,255,255,0.1)' }} />}
      </React.Fragment>
    ))}
  </div>
)

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const { success, error, info } = useToast()
  const [step, setStep] = useState(0)
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [otpError, setOtpError] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const { remaining, restart } = useCountdown(60)

  const { register: r1, handleSubmit: hs1, formState: { errors: e1 } } = useForm()
  const { register: r3, handleSubmit: hs3, formState: { errors: e3 }, watch } = useForm()

  const sendMut = useMutation({
    mutationFn: (em) => authApi.forgotPassword(em),
    onSuccess: () => { info('OTP sent to your email address.'); restart(60); setStep(1) },
    onError: (err) => error(getErrorMessage(err)),
  })

  const verifyMut = useMutation({
    mutationFn: () => authApi.verifyOtp(email, otp),
    onSuccess: (res) => {
      setOtpError('')
      setResetToken(res?.data?.data?.token || otp) // backend may return a token
      setStep(2)
    },
    onError: (err) => setOtpError(getErrorMessage(err) || 'Invalid or expired OTP.'),
  })

  const resetMut = useMutation({
    mutationFn: (data) => authApi.resetPassword(resetToken, data.password),
    onSuccess: () => { success('Password reset successfully. Please sign in.'); navigate('/login') },
    onError: (err) => error(getErrorMessage(err)),
  })

  const onEmail = ({ email: em }) => { setEmail(em); sendMut.mutate(em) }
  const onVerify = () => {
    if (otp.length < 6) { setOtpError('Enter the complete 6-digit OTP.'); return }
    setOtpError(''); verifyMut.mutate()
  }

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

      <div className="flex-shrink-0 px-6 py-2 flex items-center justify-between"
           style={{ background: 'rgba(139,0,0,0.9)', borderBottom: '1px solid rgba(184,134,11,0.4)' }}>
        <div className="text-xs text-white/80 font-medium tracking-wide">Government of India</div>
        <div className="text-xs text-white/80 font-medium tracking-wide">Ministry of Railways</div>
      </div>
      <div className="h-0.5 flex-shrink-0" style={{ background: 'linear-gradient(90deg, transparent, #B8860B, transparent)' }} />

      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md animate-scale-in">

          <div className="text-center mb-7">
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-full flex items-center justify-center p-1"
                   style={{ background: 'rgba(255,255,255,0.06)', border: '2px solid rgba(184,134,11,0.45)' }}>
                <img src={irLogo} alt="IR" className="w-full h-full object-contain rounded-full" />
              </div>
            </div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#B8860B' }}>
              Indian Railways — AMS
            </p>
            <h1 className="text-xl font-bold text-white">Password Recovery</h1>
            <p className="text-xs mt-1" style={{ color: 'rgba(140,160,185,0.85)' }}>{STEPS[step]}</p>
          </div>

          <StepDot current={step} total={3} />

          <div className="rounded-xl overflow-hidden"
               style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', backdropFilter: 'blur(16px)', boxShadow: '0 25px 50px rgba(0,0,0,0.4)' }}>
            <div className="h-1" style={{ background: 'linear-gradient(90deg, #8B0000, #B8860B, #8B0000)' }} />
            <div className="p-7 space-y-5">

              {/* Step 0 — Email */}
              {step === 0 && (
                <form onSubmit={hs1(onEmail)} className="space-y-5">
                  <p className="text-sm text-center" style={{ color: 'rgba(160,178,200,0.85)' }}>
                    Enter your registered email address. We will send a one-time password to reset your account access.
                  </p>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: 'rgba(160,178,200,0.9)' }}>
                      Registered Email Address
                    </label>
                    <div className="relative">
                      <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(140,160,185,0.55)' }} />
                      <input id="fp-email" type="email" placeholder="employee@indianrailways.gov.in"
                        {...r1('email', { required: 'Email is required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' } })}
                        className="w-full pl-9 pr-3 py-2.5 rounded-md text-sm outline-none transition-all"
                        style={{ background: 'rgba(255,255,255,0.07)', border: `1px solid ${e1.email ? '#b91c1c' : 'rgba(255,255,255,0.12)'}`, color: '#fff' }} />
                    </div>
                    {e1.email && <p className="mt-1 text-xs text-red-400">{e1.email.message}</p>}
                  </div>
                  <button id="fp-send-otp" type="submit" disabled={sendMut.isLoading}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-md font-semibold text-sm text-white transition-all disabled:opacity-60"
                    style={{ background: 'linear-gradient(135deg, #8B0000, #A52A2A)', boxShadow: '0 4px 14px rgba(139,0,0,0.4)', border: '1px solid rgba(139,0,0,0.5)' }}>
                    {sendMut.isLoading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Sending...</> : <>Send OTP <ArrowRight size={15} /></>}
                  </button>
                </form>
              )}

              {/* Step 1 — OTP */}
              {step === 1 && (
                <div className="space-y-5">
                  <p className="text-sm text-center" style={{ color: 'rgba(160,178,200,0.85)' }}>
                    Enter the 6-digit OTP sent to <strong className="text-white">{email}</strong>
                  </p>
                  <OtpInput value={otp} onChange={setOtp} hasError={!!otpError} />
                  {otpError && (
                    <div className="flex items-center gap-2 p-3 rounded-md"
                         style={{ background: 'rgba(185,28,28,0.12)', border: '1px solid rgba(185,28,28,0.25)' }}>
                      <AlertCircle size={14} className="text-red-400 flex-shrink-0" />
                      <p className="text-xs text-red-400">{otpError}</p>
                    </div>
                  )}
                  <button id="fp-verify-otp" onClick={onVerify} disabled={verifyMut.isLoading || otp.length < 6}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-md font-semibold text-sm text-white transition-all disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg, #8B0000, #A52A2A)', boxShadow: '0 4px 14px rgba(139,0,0,0.4)', border: '1px solid rgba(139,0,0,0.5)' }}>
                    {verifyMut.isLoading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Verifying...</> : <>Verify OTP <ArrowRight size={15} /></>}
                  </button>
                  <div className="flex items-center justify-between text-xs" style={{ color: 'rgba(140,160,185,0.75)' }}>
                    <button onClick={() => setStep(0)} className="flex items-center gap-1 hover:text-white transition-colors"><ArrowLeft size={13} /> Change email</button>
                    <button id="fp-resend" onClick={() => { if (!remaining) sendMut.mutate(email) }}
                      disabled={remaining > 0 || sendMut.isLoading}
                      className="flex items-center gap-1 transition-colors disabled:opacity-40"
                      style={{ color: remaining > 0 ? 'rgba(140,160,185,0.45)' : '#B8860B' }}>
                      <RefreshCw size={12} /> {remaining > 0 ? `Resend in ${remaining}s` : 'Resend OTP'}
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2 — New Password */}
              {step === 2 && (
                <form onSubmit={hs3(d => resetMut.mutate(d))} className="space-y-4">
                  <div className="flex items-center gap-2 p-3 rounded-md"
                       style={{ background: 'rgba(21,128,61,0.12)', border: '1px solid rgba(21,128,61,0.25)' }}>
                    <CheckCircle2 size={14} className="text-green-400 flex-shrink-0" />
                    <p className="text-xs text-green-400">Identity verified. Set your new password below.</p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: 'rgba(160,178,200,0.9)' }}>New Password</label>
                    <div className="relative">
                      <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(140,160,185,0.55)' }} />
                      <input id="fp-new-password" type={showPass ? 'text' : 'password'} placeholder="Minimum 8 characters"
                        {...r3('password', { required: 'Required', minLength: { value: 8, message: 'Min 8 characters' }, pattern: { value: /^(?=.*[A-Z])(?=.*[0-9])/, message: 'Must include uppercase & number' } })}
                        className="w-full pl-9 pr-10 py-2.5 rounded-md text-sm outline-none transition-all"
                        style={{ background: 'rgba(255,255,255,0.07)', border: `1px solid ${e3.password ? '#b91c1c' : 'rgba(255,255,255,0.12)'}`, color: '#fff' }} />
                      <button type="button" onClick={() => setShowPass(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors" style={{ color: 'rgba(140,160,185,0.6)' }}>
                        {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                    {e3.password && <p className="mt-1 text-xs text-red-400">{e3.password.message}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: 'rgba(160,178,200,0.9)' }}>Confirm Password</label>
                    <div className="relative">
                      <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(140,160,185,0.55)' }} />
                      <input id="fp-confirm-password" type={showConfirm ? 'text' : 'password'} placeholder="Re-enter password"
                        {...r3('confirmPassword', { required: 'Required', validate: v => v === watch('password') || 'Passwords do not match' })}
                        className="w-full pl-9 pr-10 py-2.5 rounded-md text-sm outline-none transition-all"
                        style={{ background: 'rgba(255,255,255,0.07)', border: `1px solid ${e3.confirmPassword ? '#b91c1c' : 'rgba(255,255,255,0.12)'}`, color: '#fff' }} />
                      <button type="button" onClick={() => setShowConfirm(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors" style={{ color: 'rgba(140,160,185,0.6)' }}>
                        {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                    {e3.confirmPassword && <p className="mt-1 text-xs text-red-400">{e3.confirmPassword.message}</p>}
                  </div>
                  <button id="fp-reset" type="submit" disabled={resetMut.isLoading}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-md font-semibold text-sm text-white transition-all disabled:opacity-60"
                    style={{ background: 'linear-gradient(135deg, #8B0000, #A52A2A)', boxShadow: '0 4px 14px rgba(139,0,0,0.4)', border: '1px solid rgba(139,0,0,0.5)' }}>
                    {resetMut.isLoading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Resetting...</> : <>Reset Password <CheckCircle2 size={15} /></>}
                  </button>
                </form>
              )}
            </div>
          </div>

          <p className="text-center text-xs mt-5" style={{ color: 'rgba(100,120,145,0.7)' }}>
            <Link to="/login" className="flex items-center justify-center gap-1 hover:text-white transition-colors" style={{ color: '#B8860B' }}>
              <ArrowLeft size={12} /> Return to Sign In
            </Link>
          </p>
          <p className="text-center text-xs mt-2" style={{ color: 'rgba(80,100,125,0.5)' }}>
            Indian Railways AMS &copy; {new Date().getFullYear()} | Government of India
          </p>
        </div>
      </div>

      <div className="flex-shrink-0 px-6 py-2 text-center"
           style={{ background: 'rgba(10,22,40,0.8)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <p className="text-xs" style={{ color: 'rgba(100,120,145,0.6)' }}>
          If you do not receive the OTP, contact your department administrator.
        </p>
      </div>
    </div>
  )
}
