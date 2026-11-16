import React, { useState } from 'react';
import { useAuth, DEMO_CREDENTIALS } from '../../contexts/AuthContext';
import { useTenant } from '../../contexts/TenantContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../contexts/ToastContext';
import { UserRole } from '../../types';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  Building2,
  ShieldCheck,
  Globe2,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Sun,
  Moon
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { allTenants, switchTenant, currentTenant } = useTenant();
  const { isDark, toggleColorMode } = useTheme();
  const { showToast } = useToast();

  const [email, setEmail] = useState('priya.nair@bluestone.com');
  const [password, setPassword] = useState('Password@123');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('HR_ADMIN');
  const [isLoading, setIsLoading] = useState(false);
  const [activeDemoRole, setActiveDemoRole] = useState<UserRole | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Auto-detect role whenever email changes
  const detectRoleFromEmail = (em: string): UserRole => {
    const lower = em.toLowerCase().trim();
    if (lower.includes('rohan') || lower.includes('emp') || lower.includes('deshmukh') || lower.includes('employee')) {
      return 'EMPLOYEE';
    } else if (lower.includes('priya') || lower.includes('hr') || lower.includes('nair')) {
      return 'HR_ADMIN';
    } else if (lower.includes('ceo') || lower.includes('aditya') || lower.includes('birla') || lower.includes('company') || lower.includes('admin') || lower.includes('owner')) {
      return 'COMPANY_ADMIN';
    } else if (lower.includes('arjun') || lower.includes('mgr') || lower.includes('manager') || lower.includes('mehta') || lower.includes('lead')) {
      return 'MANAGER';
    } else if (lower.includes('super')) {
      return 'SUPER_ADMIN';
    }
    return 'EMPLOYEE';
  };

  const handleEmailChange = (val: string) => {
    setEmail(val);
    setSelectedRole(detectRoleFromEmail(val));
    setErrorMsg('');
  };

  // Instant 1-Click Demo Login
  const handleInstantDemoLogin = async (role: UserRole) => {
    setSelectedRole(role);
    setActiveDemoRole(role);
    setEmail(DEMO_CREDENTIALS[role].email);
    setPassword('Password@123');
    setErrorMsg('');
    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 350));
      await login(DEMO_CREDENTIALS[role].email, 'Password@123', role);
    } catch (err) {
      setErrorMsg('Failed to log in with demo account.');
    } finally {
      setIsLoading(false);
      setActiveDemoRole(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !password) {
      setErrorMsg('Please enter your email and password.');
      return;
    }

    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 200));
      await login(email, password);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const ROLE_CONFIGS: {
    role: UserRole;
    label: string;
    portalName: string;
    icon: string;
    desc: string;
  }[] = [
    {
      role: 'COMPANY_ADMIN',
      label: 'Company Admin',
      portalName: 'Executive Company Portal',
      icon: '🏢',
      desc: 'P&L, company team, entities & spend'
    },
    {
      role: 'HR_ADMIN',
      label: 'HR Admin',
      portalName: 'HR Operations Portal',
      icon: '👥',
      desc: 'Bento workforce, attendance & payroll'
    },
    {
      role: 'MANAGER',
      label: 'Manager',
      portalName: 'Team Lead Portal',
      icon: '📊',
      desc: 'Squad attendance & leave approvals'
    },
    {
      role: 'EMPLOYEE',
      label: 'Employee',
      portalName: 'Employee ESS Portal',
      icon: '💻',
      desc: 'Personal punch, calendar & payslips'
    },
    {
      role: 'SUPER_ADMIN',
      label: 'Super Admin',
      portalName: 'SaaS Platform Console',
      icon: '👑',
      desc: 'Multi-tenant oversight & subscriptions'
    }
  ];

  const selectedConfig = ROLE_CONFIGS.find((c) => c.role === selectedRole) || ROLE_CONFIGS[0];

  return (
    <div className="min-h-screen w-full bg-[#f4f6f8] flex items-center justify-center p-4 md:p-8">
      {/* Container */}
      <div className="max-w-5xl w-full bg-white rounded-[36px] shadow-2xl border border-slate-200/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
        {/* ========================================================= */}
        {/* LEFT COLUMN: SIGN IN FORM (lg:col-span-7) */}
        {/* ========================================================= */}
        <div className="lg:col-span-7 p-8 md:p-12 flex flex-col justify-between">
          <div>
            {/* Brand Logo & SaaS Badge */}
            <div className="flex items-center justify-between gap-3 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#ff7a1a] flex items-center justify-center text-[#111318] shadow-sm">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="8" cy="8" r="3.5" />
                    <circle cx="16" cy="8" r="3.5" />
                    <circle cx="8" cy="16" r="3.5" />
                    <circle cx="16" cy="16" r="3.5" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-[#181a20] tracking-tight">
                    OmniHRMS <span className="text-[#ea580c]">SaaS</span>
                  </h2>
                  <p className="text-[11px] text-slate-400 font-medium">Enterprise HR & Payroll Platform</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleColorMode}
                  aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                  title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
                >
                  {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
                </button>
                <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-[#fff1e6] text-[#c2410c] border border-[#ff7a1a]/40 uppercase tracking-wider">
                  Release v1.0
                </span>
              </div>
            </div>

            {/* Title & Subtitle */}
            <div className="mb-6">
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                Sign in to your Workspace
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Access your role-specific dashboard, attendance, leaves, and international payroll.
              </p>
            </div>

            {/* Quick 1-Click Demo Role Switcher */}
            <div className="mb-6 p-4 bg-slate-50/90 rounded-2xl border border-slate-200/90 shadow-2xs">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Instant 1-Click Demo Login
                </span>
                <span className="text-[10px] text-[#c2410c] font-bold bg-[#fff1e6] px-2 py-0.5 rounded-full border border-[#ffd4b0]">
                  Click button to log in directly
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {ROLE_CONFIGS.map((item) => {
                  const isPending = isLoading && activeDemoRole === item.role;
                  const isSelected = selectedRole === item.role;
                  return (
                    <button
                      key={item.role}
                      type="button"
                      disabled={isLoading}
                      onClick={() => handleInstantDemoLogin(item.role)}
                      className={`text-left p-2.5 rounded-xl border transition-all cursor-pointer relative ${
                        isSelected
                          ? 'bg-[#181a20] text-white border-[#181a20] shadow-sm scale-102 ring-2 ring-[#ff7a1a]'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-100/70'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm">{item.icon}</span>
                        {isPending && (
                          <span className="w-3.5 h-3.5 border-2 border-[#ff7a1a] border-t-transparent rounded-full animate-spin" />
                        )}
                      </div>
                      <p className={`text-xs font-bold leading-tight ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                        {item.portalName}
                      </p>
                      <p className={`text-[10px] font-semibold mt-0.5 ${isSelected ? 'text-[#ff7a1a]' : 'text-slate-500'}`}>
                        {item.label}
                      </p>
                      <p className={`text-[10px] truncate mt-0.5 ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                        {item.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            {/* Sign In Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Tenant / Company Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tenant Organization
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <select
                    value={currentTenant.id}
                    onChange={(e) => switchTenant(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-300 font-medium text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#ff7a1a]"
                  >
                    {allTenants.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.countryId} • {t.currency})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Email Input */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Corporate Email Address
                  </label>
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                    Target Portal: <span className="text-[#c2410c]">{selectedConfig.portalName}</span>
                  </span>
                </div>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    placeholder="name@company.com"
                    required
                    className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-300 font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#ff7a1a]"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Password
                  </label>
                  <a
                    href="#forgot"
                    onClick={(e) => {
                      e.preventDefault();
                      showToast(
                        'Password Reset Instructions Sent',
                        'info',
                        `Check ${email || 'your corporate email'} for reset instructions.`
                      );
                    }}
                    className="text-[11px] font-semibold text-indigo-600 hover:underline"
                  >
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl border border-slate-300 font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#ff7a1a]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="remember"
                  defaultChecked
                  className="w-3.5 h-3.5 text-[#ea580c] rounded border-slate-300 focus:ring-[#ff7a1a]"
                />
                <label htmlFor="remember" className="text-xs text-slate-600 font-medium select-none cursor-pointer">
                  Keep me signed in for 30 days
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 bg-[#ff7a1a] hover:bg-[#e8670a] text-[#111318] rounded-2xl text-xs font-extrabold tracking-wide uppercase transition-all shadow-md active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-[#111318] border-t-transparent rounded-full animate-spin" />
                    Entering {selectedConfig.portalName}...
                  </span>
                ) : (
                  <>
                    <span>Enter {selectedConfig.portalName}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="pt-6 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-400">
              Protected by Enterprise Multi-Tenant JWT & Role-Based Access Control (RBAC).
            </p>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: ENTERPRISE OVERVIEW BANNER (lg:col-span-5) */}
        {/* ========================================================= */}
        <div className="lg:col-span-5 bg-[#181a20] p-8 md:p-10 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Subtle decorative circles */}
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-[#ff7a1a]/15 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-white/10 text-[#ff7a1a] border border-white/20 uppercase tracking-wider inline-block mb-4">
              Centralized Cloud Platform
            </span>
            <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white leading-tight">
              One System for People, Operations & Global Payroll.
            </h3>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Built from ground-up as a commercial multi-tenant SaaS architecture. First customer: Bluestone Group.
            </p>

            {/* Feature Highlights */}
            <div className="mt-8 space-y-4">
              <div className="flex items-start gap-3.5 bg-white/5 p-3.5 rounded-2xl border border-white/10">
                <div className="w-8 h-8 rounded-xl bg-[#ff7a1a]/20 text-[#ff7a1a] flex items-center justify-center shrink-0">
                  <Globe2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">International Payroll Engine</h4>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    Statutory tax & deduction rules for India (EPF/ESI/TDS), UAE (WPS), UK (PAYE), and Singapore (CPF).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 bg-white/5 p-3.5 rounded-2xl border border-white/10">
                <div className="w-8 h-8 rounded-xl bg-[#ff7a1a]/20 text-[#ff7a1a] flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">5-Tier Role-Based Security</h4>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    Super Admin, Company Admin, HR Admin, Manager, and Employee Self-Service.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 bg-white/5 p-3.5 rounded-2xl border border-white/10">
                <div className="w-8 h-8 rounded-xl bg-[#ff7a1a]/20 text-[#ff7a1a] flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">GPS Geofencing & Smart Calendar</h4>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    Automated work hours, missed punch regularization, and leave range approvals.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-6 mt-6 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
            <span>© 2026 Bluestone Group</span>
            <span className="text-[#ff7a1a] font-bold">24-Week MVP Roadmap</span>
          </div>
        </div>
      </div>
    </div>
  );
};

