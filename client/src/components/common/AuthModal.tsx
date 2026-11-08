import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { UserRole } from '../../types';
import { validateEthiopianPhone } from '../../utils/ethiopianDate';
import { api } from '../../services/api';
import {
  X, Lock, Mail, User as UserIcon, Phone,
  ShieldCheck, CheckCircle2, AlertCircle, KeyRound, LogIn,
  Eye, EyeOff, Loader2, ChevronDown, ChevronUp,
  MapPin, Crown,
} from 'lucide-react';

// ─── Demo credentials — dev/demo only, tree-shaken in production ─────────────
const IS_DEMO = import.meta.env.DEV || import.meta.env.VITE_DEMO_MODE === 'true';

interface DemoRole {
  label: string;
  email: string;
  password: string;
  name: string;
  color: string;
}

const DEMO_ROLES: DemoRole[] = [
  { label: 'Super Admin',   email: 'superadmin@habeshahotel.com',  password: 'SuperAdmin123!',   name: 'Dawit Hailemariam', color: 'bg-violet-950/70 border-violet-500/50 text-violet-300 hover:bg-violet-900/80' },
  { label: 'Admin',         email: 'admin@habeshahotel.com',       password: 'Admin123!',        name: 'Selam Tesfaye',     color: 'bg-rose-950/70 border-rose-500/50 text-rose-300 hover:bg-rose-900/80' },
  { label: 'Manager',       email: 'manager@habeshahotel.com',     password: 'Manager123!',      name: 'Bilal Ahmed',       color: 'bg-blue-950/70 border-blue-500/50 text-blue-300 hover:bg-blue-900/80' },
  { label: 'Receptionist',  email: 'reception@habeshahotel.com',   password: 'Reception123!',    name: 'Firdews Mohammed',  color: 'bg-teal-950/70 border-teal-500/50 text-teal-300 hover:bg-teal-900/80' },
  { label: 'Accountant',    email: 'accountant@habeshahotel.com',  password: 'Accountant123!',   name: 'Mahlet Kebede',     color: 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/80' },
  { label: 'Housekeeping',  email: 'housekeeping@habeshahotel.com',password: 'Clean123!',        name: 'Hiwot Tadesse',     color: 'bg-sky-950/70 border-sky-500/50 text-sky-300 hover:bg-sky-900/80' },
  { label: 'Maintenance',   email: 'maintenance@habeshahotel.com', password: 'Maintenance123!',  name: 'Sumeya Ahmed',      color: 'bg-orange-950/70 border-orange-500/50 text-orange-300 hover:bg-orange-900/80' },
  { label: 'Guest',         email: 'guest@habeshahotel.com',       password: 'Guest123!',        name: 'Murad Kassim',      color: 'bg-amber-950/70 border-amber-500/50 text-amber-300 hover:bg-amber-900/80' },
];

// ─── Props ────────────────────────────────────────────────────────────────────
interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRole?: UserRole;
  onSuccess?: () => void;
}

// ─── Shared input style — light background (right panel is light-toned) ──────
const inputCls = `
  w-full border border-stone-300 rounded-lg px-4 py-3 text-sm text-stone-800
  placeholder-stone-400 bg-white
  focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20
  transition-colors
`;

// ─── Component ────────────────────────────────────────────────────────────────
export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { login, register } = useAuth();
  const { t } = useLanguage();

  const [tab, setTab] = useState<'signin' | 'register' | 'reset'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [demoExpanded, setDemoExpanded] = useState(false);
  const [activeDemo, setActiveDemo] = useState<string | null>(null);

  if (!isOpen) return null;

  const resetForm = () => {
    setEmail(''); setPassword(''); setFullName(''); setPhone('');
    setNewPassword(''); setConfirmPassword('');
    setError(null); setSuccessMsg(null); setActiveDemo(null);
    setAgreeTerms(false); setShowPassword(false);
  };

  const switchTab = (next: 'signin' | 'register' | 'reset') => {
    setTab(next);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (tab === 'register' && !agreeTerms) {
      setError('Please agree to the Terms of Use & Privacy Policy to continue.');
      return;
    }
    if (tab === 'register' && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      if (tab === 'signin') {
        await login(email, password);
        onSuccess?.();
        onClose();
      } else if (tab === 'register') {
        if (phone && !validateEthiopianPhone(phone)) {
          throw new Error('Please enter a valid Ethiopian phone number (e.g. +251 91 123 4567)');
        }
        await register({ email, password, full_name: fullName, phone });
        onSuccess?.();
        onClose();
      } else if (tab === 'reset') {
        const res = await api.post<any>('/auth/reset-password', { email, newPassword });
        setSuccessMsg(res.message || 'Password reset successfully. You may now sign in.');
        setTimeout(() => switchTab('signin'), 1800);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const autofillCredentials = (role: DemoRole) => {
    setEmail(role.email);
    setPassword(role.password);
    setError(null); setSuccessMsg(null);
    setActiveDemo(role.email);
    setShowPassword(false);
  };

  // ── Left-panel accent gradient matching the reference teal/navy ────────────
  const leftBg = 'bg-gradient-to-br from-[#0f2d3a] via-[#0e3347] to-[#0a2535]';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-3 overflow-y-auto">
      {/* ── Two-panel card ───────────────────────────────────────────────── */}
      <div className="relative w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col sm:flex-row min-h-[520px]">

        {/* ── LEFT PANEL — branding ────────────────────────────────────── */}
        <div className={`${leftBg} w-full sm:w-[42%] flex-shrink-0 flex flex-col items-center justify-center p-8 relative overflow-hidden`}>
          {/* Decorative rings */}
          <div className="absolute -top-16 -left-16 w-56 h-56 rounded-full border border-amber-500/10" />
          <div className="absolute -bottom-12 -right-12 w-48 h-48 rounded-full border border-amber-500/10" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full border border-amber-500/5" />

          {/* Logo */}
          <div className="relative z-10 flex flex-col items-center text-center space-y-4">
            <div className="w-20 h-20 rounded-2xl border-2 border-amber-500/40 bg-amber-500/5 flex items-center justify-center overflow-hidden">
              <img
                src="/images/logo-hotel.png"
                alt="HABESHA-HOTEL Logo"
                onError={e => { (e.currentTarget as HTMLImageElement).src = '/images/logo-hotel.png'; }}
                className="w-16 h-16 object-contain"
              />
            </div>

            <div>
              <h1 className="font-serif text-2xl font-bold text-white leading-tight tracking-wide">
                HABESHA
              </h1>
              <h2 className="font-serif text-lg font-light text-amber-400 tracking-[0.25em] uppercase">
                Hotel
              </h2>
            </div>

            {/* Ornamental divider */}
            <div className="flex items-center gap-2 w-full">
              <div className="flex-1 h-px bg-amber-500/20" />
              <Crown className="w-3.5 h-3.5 text-amber-500/50" />
              <div className="flex-1 h-px bg-amber-500/20" />
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed max-w-[180px]">
              5-Star Luxury & Ethiopian Hospitality · Bole, Addis Ababa
            </p>

            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <MapPin className="w-3 h-3 text-amber-500/60" />
              <span>Africa Avenue, Ethiopia</span>
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL — form ───────────────────────────────────────── */}
        <div className="flex-1 bg-stone-50 flex flex-col">
          {/* Close button */}
          <div className="flex justify-end pt-4 pr-4">
            <button
              onClick={onClose}
              aria-label="Close"
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Tab bar — REGISTER / LOGIN / RESET */}
          <div className="flex items-end gap-6 px-8 pb-0 border-b border-stone-200">
            <button
              onClick={() => switchTab('register')}
              className={`pb-3 text-sm font-bold uppercase tracking-wider transition-colors cursor-pointer border-b-2 ${
                tab === 'register'
                  ? 'text-amber-600 border-amber-500'
                  : 'text-stone-400 border-transparent hover:text-stone-600'
              }`}
            >
              Register
            </button>
            <button
              onClick={() => switchTab('signin')}
              className={`pb-3 text-sm font-bold uppercase tracking-wider transition-colors cursor-pointer border-b-2 ${
                tab === 'signin'
                  ? 'text-amber-600 border-amber-500'
                  : 'text-stone-400 border-transparent hover:text-stone-600'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => switchTab('reset')}
              className={`pb-3 text-xs font-semibold tracking-wider transition-colors cursor-pointer border-b-2 ${
                tab === 'reset'
                  ? 'text-amber-600 border-amber-500'
                  : 'text-stone-400 border-transparent hover:text-stone-600'
              }`}
            >
              Reset
            </button>
          </div>

          {/* Scrollable form area */}
          <div className="flex-1 overflow-y-auto px-8 py-5">

            {/* ── Demo chips (dev only) ──────────────────────────────── */}
            {IS_DEMO && tab === 'signin' && (
              <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setDemoExpanded(v => !v)}
                  className="w-full flex items-center justify-between px-4 py-2.5 text-[11px] font-bold text-amber-700 hover:bg-amber-100 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Demo — click a role to autofill, then Login
                  </span>
                  {demoExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
                {demoExpanded && (
                  <div className="px-4 pb-3 space-y-2">
                    <div className="flex flex-wrap gap-1.5">
                      {DEMO_ROLES.map(role => {
                        const isActive = activeDemo === role.email;
                        return (
                          <button
                            key={role.email}
                            type="button"
                            onClick={() => autofillCredentials(role)}
                            title={`${role.name} · ${role.email}`}
                            className={`
                              px-2.5 py-1 rounded-md border text-[11px] font-semibold
                              transition-all cursor-pointer
                              ${role.color}
                              ${isActive ? 'ring-2 ring-amber-500/70' : ''}
                            `}
                          >
                            {role.label}{isActive && <span className="ml-1">✓</span>}
                          </button>
                        );
                      })}
                    </div>
                    {activeDemo && (
                      <p className="text-[10px] text-amber-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Loaded: <strong>{DEMO_ROLES.find(r => r.email === activeDemo)?.name}</strong> — click Login to authenticate.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Error / success banners */}
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            {successMsg && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">

              {/* ── REGISTER FIELDS ──────────────────────────────────── */}
              {tab === 'register' && (
                <>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 absolute left-3.5 top-3.5 text-stone-400 pointer-events-none" />
                    <input
                      type="text" required autoComplete="name"
                      placeholder="First name"
                      value={fullName} onChange={e => setFullName(e.target.value)}
                      className={`${inputCls} pl-10`}
                    />
                  </div>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-stone-400 pointer-events-none" />
                    <input
                      type="tel" required autoComplete="tel"
                      placeholder="Ethiopian phone (+251 91 123 4567)"
                      value={phone} onChange={e => setPhone(e.target.value)}
                      className={`${inputCls} pl-10`}
                    />
                  </div>
                </>
              )}

              {/* ── EMAIL ──────────────────────────────────────────────── */}
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-stone-400 pointer-events-none" />
                <input
                  type="email" required autoComplete="email"
                  placeholder="Email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setActiveDemo(null); }}
                  className={`${inputCls} pl-10`}
                />
              </div>

              {/* ── PASSWORD ───────────────────────────────────────────── */}
              {tab !== 'reset' && (
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-stone-400 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete={tab === 'signin' ? 'current-password' : 'new-password'}
                    placeholder="Create password"
                    value={password} onChange={e => setPassword(e.target.value)}
                    className={`${inputCls} pl-10 pr-11`}
                  />
                  <button type="button" onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3.5 top-3.5 text-stone-400 hover:text-stone-600 transition-colors"
                    aria-label={showPassword ? 'Hide' : 'Show'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              )}

              {/* ── CONFIRM PASSWORD (register) ─────────────────────── */}
              {tab === 'register' && (
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-stone-400 pointer-events-none" />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    required autoComplete="new-password"
                    placeholder="Retype password"
                    value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                    className={`${inputCls} pl-10 pr-11`}
                  />
                  <button type="button" onClick={() => setShowConfirm(v => !v)}
                    className="absolute right-3.5 top-3.5 text-stone-400 hover:text-stone-600 transition-colors"
                    aria-label={showConfirm ? 'Hide' : 'Show'}
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              )}

              {/* ── NEW PASSWORD (reset) ────────────────────────────── */}
              {tab === 'reset' && (
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3.5 top-3.5 text-stone-400 pointer-events-none" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required minLength={6} autoComplete="new-password"
                    placeholder="New password (min 6 characters)"
                    value={newPassword} onChange={e => setNewPassword(e.target.value)}
                    className={`${inputCls} pl-10 pr-11`}
                  />
                  <button type="button" onClick={() => setShowNewPassword(v => !v)}
                    className="absolute right-3.5 top-3.5 text-stone-400 hover:text-stone-600 transition-colors"
                    aria-label={showNewPassword ? 'Hide' : 'Show'}
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              )}

              {/* ── TERMS (register) ───────────────────────────────── */}
              {tab === 'register' && (
                <label className="flex items-start gap-2.5 cursor-pointer group">
                  <div
                    onClick={() => setAgreeTerms(v => !v)}
                    className={`mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors cursor-pointer ${
                      agreeTerms
                        ? 'bg-amber-500 border-amber-500'
                        : 'border-stone-300 bg-white group-hover:border-amber-400'
                    }`}
                  >
                    {agreeTerms && <CheckCircle2 className="w-2.5 h-2.5 text-white" />}
                  </div>
                  <span className="text-xs text-stone-500 leading-relaxed">
                    I agree to the{' '}
                    <span className="text-amber-600 underline cursor-pointer hover:text-amber-700">Terms of Use</span>
                    {' & '}
                    <span className="text-amber-600 underline cursor-pointer hover:text-amber-700">Privacy Policy</span>
                  </span>
                </label>
              )}

              {/* ── FORGOT PASSWORD link (signin) ──────────────────── */}
              {tab === 'signin' && (
                <div className="flex justify-end -mt-1">
                  <button type="button" onClick={() => switchTab('reset')}
                    className="text-xs text-amber-600 hover:text-amber-700 hover:underline cursor-pointer transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              {/* ── SUBMIT BUTTON ──────────────────────────────────── */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 mt-1 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-bold text-sm uppercase tracking-widest rounded-lg shadow-md shadow-amber-500/30 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{tab === 'signin' ? 'Signing in…' : tab === 'register' ? 'Creating account…' : 'Updating…'}</span>
                  </>
                ) : tab === 'signin' ? (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Login</span>
                  </>
                ) : tab === 'register' ? (
                  <span>Register</span>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>Update Password</span>
                  </>
                )}
              </button>

              {/* ── Switch tab link ─────────────────────────────────── */}
              <p className="text-center text-xs text-stone-400 pt-1">
                {tab === 'register' ? (
                  <>Already have an account?{' '}
                    <button type="button" onClick={() => switchTab('signin')} className="text-amber-600 font-semibold hover:underline cursor-pointer">Login</button>
                  </>
                ) : tab === 'signin' ? (
                  <>New guest?{' '}
                    <button type="button" onClick={() => switchTab('register')} className="text-amber-600 font-semibold hover:underline cursor-pointer">Create an account</button>
                  </>
                ) : (
                  <>Remembered it?{' '}
                    <button type="button" onClick={() => switchTab('signin')} className="text-amber-600 font-semibold hover:underline cursor-pointer">Back to Login</button>
                  </>
                )}
              </p>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
