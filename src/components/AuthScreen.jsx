import React, { useState } from 'react';
import { Lock, Mail, User, Boxes, AlertCircle, Key, CheckCircle2, ArrowLeft, ShieldCheck, RefreshCw, Info, Send, Sparkles } from 'lucide-react';

export const AuthScreen = ({ onAuthSuccess }) => {
  // Mode: 'login' | 'signup' | 'forgot_email' | 'forgot_otp' | 'forgot_reset'
  const [mode, setMode] = useState('login');

  // Login/Signup state
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Production Manager');

  // Forgot password & OTP state
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Notifications & UI state
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const resetFormState = () => {
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(false);
  };

  const validateStrongPassword = (pwd) => {
    if (!pwd || pwd.length < 8) return 'Password must be at least 8 characters long.';
    if (!/[A-Z]/.test(pwd)) return 'Password must contain at least one uppercase letter (A-Z).';
    if (!/[a-z]/.test(pwd)) return 'Password must contain at least one lowercase letter (a-z).';
    if (!/[0-9]/.test(pwd)) return 'Password must contain at least one number (0-9).';
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) return 'Password must contain at least one special character (!@#$%^&*...).';
    return null;
  };

  const handleLoginOrSignup = async (e) => {
    e.preventDefault();
    resetFormState();
    setLoading(true);

    const isSignUp = mode === 'signup';
    if (isSignUp) {
      const pwdError = validateStrongPassword(password);
      if (pwdError) {
        setErrorMsg(pwdError);
        setLoading(false);
        return;
      }
    }

    const endpoint = isSignUp ? '/api/auth/signup' : '/api/auth/login';
    const payload = isSignUp
      ? { email, password, displayName, role }
      : { email, password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed. Please check your credentials.');
      }

      if (data.token && data.user) {
        localStorage.setItem('authToken', data.token);
        onAuthSuccess(data.user, data.token);
      } else {
        throw new Error('Authentication failed. Invalid response from server.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async (e) => {
    if (e) e.preventDefault();
    resetFormState();
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send OTP.');
      }

      if (data.method === 'smtp') {
        setSuccessMsg(`A 6-digit verification code has been sent to ${email}. Please check your inbox or spam folder.`);
      } else {
        setSuccessMsg(`SMTP is not configured, so the OTP is available in the simulated inbox for ${email}. Configure Gmail SMTP to send real email.`);
      }
      setMode('forgot_otp');
    } catch (err) {
      setErrorMsg(err.message || 'Error requesting OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    resetFormState();
    setLoading(true);

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'OTP verification failed.');
      }

      if (data.resetToken) {
        setResetToken(data.resetToken);
      }

      setSuccessMsg('OTP verified successfully! Cryptographic reset session initialized. Please set your new password.');
      setMode('forgot_reset');
    } catch (err) {
      setErrorMsg(err.message || 'Invalid or expired OTP code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    resetFormState();

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please recheck.');
      return;
    }

    const pwdError = validateStrongPassword(newPassword);
    if (pwdError) {
      setErrorMsg(pwdError);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, resetToken, otp, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to reset password.');
      }

      setPassword(newPassword);
      setSuccessMsg('Password updated securely with bcrypt encryption! You can now log in.');
      setMode('login');
      setOtp('');
      setResetToken('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-900 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md bg-white/95 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/20 z-10 space-y-6">
        
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-500/30 mb-1">
            <Boxes className="w-7 h-7" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Manufactory ERP
          </h1>
          <p className="text-xs text-slate-500 font-medium max-w-xs mx-auto">
            {mode === 'signup' && 'Create a new account to access the manufacturing portal.'}
            {mode === 'login' && 'Sign in with your email & password to access the platform.'}
            {mode === 'forgot_email' && 'Enter your registered email to receive a 6-digit OTP.'}
            {mode === 'forgot_otp' && 'Enter the 6-digit OTP code sent to your email.'}
            {mode === 'forgot_reset' && 'Create a new secure password for your account.'}
          </p>
        </div>

        {/* Notifications */}
        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2.5 text-red-700 text-xs font-semibold animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <div className="flex-1">{errorMsg}</div>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-2.5 text-emerald-800 text-xs font-semibold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1">{successMsg}</div>
          </div>
        )}

        {/* MODE: LOGIN OR SIGNUP */}
        {(mode === 'login' || mode === 'signup') && (
          <form onSubmit={handleLoginOrSignup} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your name"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-9 pr-3 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-900"
                    required={mode === 'signup'}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-9 pr-3 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-900"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700">
                  Password
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      resetFormState();
                      setMode('forgot_email');
                    }}
                    className="text-[11px] font-extrabold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-9 pr-3 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-900"
                  required
                />
              </div>
              {mode === 'signup' && (
                <p className="text-[10px] text-slate-500 mt-1 font-medium">
                  Password must be 8+ characters with uppercase (A-Z), lowercase (a-z), number (0-9), and special character (!@#$%^&*).
                </p>
              )}
            </div>

            {mode === 'signup' && (
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700 mb-1">
                  System Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-900"
                >
                  <option value="Production Manager">Production Manager</option>
                  <option value="Assembly Operator">Assembly Operator</option>
                  <option value="Inventory Specialist">Inventory Specialist</option>
                  <option value="Quality Inspector">Quality Inspector</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.99] disabled:opacity-50 text-white font-bold py-3 rounded-2xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {loading ? (
                <span className="inline-block animate-pulse">
                  {mode === 'signup' ? 'Creating Account...' : 'Signing In...'}
                </span>
              ) : mode === 'signup' ? (
                <>Sign Up</>
              ) : (
                <>Log In</>
              )}
            </button>
          </form>
        )}

        {/* MODE: FORGOT PASSWORD - STEP 1 (EMAIL) */}
        {mode === 'forgot_email' && (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700 mb-1">
                Enter Account Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                   placeholder="manager@manufactory.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-9 pr-3 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-900"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.99] disabled:opacity-50 text-white font-bold py-3 rounded-2xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? 'Generating OTP...' : 'Send 6-Digit Verification OTP'}
            </button>
          </form>
        )}

        {/* MODE: FORGOT PASSWORD - STEP 2 (VERIFY OTP) */}
        {mode === 'forgot_otp' && (
          <div className="space-y-4">
            {/* Clean Verification Prompt Card */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-slate-800 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
                <Mail className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Verification Code Sent</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Please check your email inbox at <strong className="text-slate-900 font-bold">{email}</strong> for the 6-digit verification code.
              </p>
            </div>

            {/* OTP Entry Form */}
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700 mb-1">
                  6-Digit Verification Code
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 6-digit OTP code"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-9 pr-3 py-3 text-base font-black tracking-widest text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-center"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading || !otp}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] disabled:opacity-50 text-white font-bold py-3 rounded-2xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? 'Verifying...' : 'Verify OTP Code'}
                </button>

                <button
                  type="button"
                  onClick={() => handleSendOTP()}
                  disabled={loading}
                  className="px-4 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold rounded-2xl text-xs transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
                  title="Resend OTP Email"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                  <span>Resend</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* MODE: FORGOT PASSWORD - STEP 3 (NEW PASSWORD) */}
        {mode === 'forgot_reset' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700 mb-1">
                New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-9 pr-3 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-900"
                  required
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1 font-medium">
                Password must be 8+ characters with uppercase (A-Z), lowercase (a-z), number (0-9), and special character (!@#$%^&*).
              </p>
            </div>

            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700 mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <ShieldCheck className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-9 pr-3 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-900"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.99] disabled:opacity-50 text-white font-bold py-3 rounded-2xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? 'Updating Password...' : 'Reset & Save Password'}
            </button>
          </form>
        )}

        {/* Navigation & Mode Toggles */}
        <div className="text-center pt-2 border-t border-slate-100 flex flex-col items-center gap-2">
          {mode === 'login' && (
            <button
              type="button"
              onClick={() => {
                resetFormState();
                setMode('signup');
              }}
              className="text-xs font-extrabold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
            >
              Don't have an account? Sign Up
            </button>
          )}

          {mode === 'signup' && (
            <button
              type="button"
              onClick={() => {
                resetFormState();
                setMode('login');
              }}
              className="text-xs font-extrabold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
            >
              Already have an account? Log In
            </button>
          )}

          {mode !== 'login' && mode !== 'signup' && (
            <button
              type="button"
              onClick={() => {
                resetFormState();
                setMode('login');
              }}
              className="inline-flex items-center gap-1.5 text-xs font-extrabold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Log In
            </button>
          )}
        </div>

      </div>
    </div>
  );
};


