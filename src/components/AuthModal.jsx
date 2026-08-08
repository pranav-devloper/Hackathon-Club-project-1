import React, { useState } from 'react';
import { X, Lock, Mail, User, ShieldCheck, Boxes } from 'lucide-react';

export const AuthModal = ({
  isOpen,
  onClose,
  onLoginSuccess,
  usersList,
}) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Production Manager');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSignUp) {
      const newUser = {
        id: `usr-${Date.now()}`,
        email,
        displayName: displayName || email.split('@')[0],
        role,
        workerId: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
      };
      onLoginSuccess(newUser);
    } else {
      const matched = usersList.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (matched) {
        onLoginSuccess(matched);
      } else {
        onLoginSuccess({
          id: `usr-${Date.now()}`,
          email: email || 'operator@manufactory.com',
          displayName: displayName || 'Shopfloor Operator',
          role: 'Assembly Operator',
          workerId: 'EMP-9001',
        });
      }
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={onClose} />

      {/* Modal Window */}
      <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 z-10 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-black text-slate-900 text-base">
                {isSignUp ? 'Worker Registration' : 'Shopfloor Authentication'}
              </h2>
              <p className="text-[11px] text-slate-400 font-medium">Manufactory ERP</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your name"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-9 pr-3 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required={isSignUp}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1.5">
              Email / Worker Login ID
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="manager@manufactory.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-9 pr-3 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-9 pr-3 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {isSignUp && (
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1.5">
                Assign System Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-2xl text-xs uppercase tracking-wider transition-colors shadow-md shadow-blue-500/20"
          >
            {isSignUp ? 'Register Account' : 'Authenticate & Sign In'}
          </button>
        </form>

        <div className="text-center pt-2">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-xs font-bold text-blue-600 hover:underline"
          >
            {isSignUp ? 'Already registered? Login here' : "Need a new account? Register here"}
          </button>
        </div>
      </div>
    </div>
  );
};
