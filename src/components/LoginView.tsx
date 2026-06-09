/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Shield, Eye, EyeOff, Lock, Mail, UserPlus, FileWarning, ArrowRight, CheckCircle2 } from 'lucide-react';
import { UserRole } from '../types.js';

interface LoginProps {
  onLoginSuccess: (token: string, user: any) => void;
}

export default function LoginView({ onLoginSuccess }: LoginProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('Viewer');
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMsg('');

    if (!email || !password) {
      setErrorMessage('Please fill in all secure login fields.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      if (!response.ok) {
        setErrorMessage(data.error || 'Identity evaluation failure.');
      } else {
        localStorage.setItem('anomaly_secure_token', data.token);
        setSuccessMsg(`Session established successfully. Welcome, ${data.user.name}!`);
        setTimeout(() => {
          onLoginSuccess(data.token, data.user);
        }, 1200);
      }
    } catch (err: any) {
      setErrorMessage(`Tunnel connection error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMsg('');

    if (!email || !password || !name) {
      setErrorMessage('Name, email, and secure credentials must be completed.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Standard Requirement: passcode must contain at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password, name, role })
      });

      const data = await response.json();
      if (!response.ok) {
        setErrorMessage(data.error || 'System registration rejected.');
      } else {
        setSuccessMsg('Account registered successfully. Proceeding with credentials evaluation...');
        
        // Auto-login registered account immediately
        setTimeout(async () => {
          try {
            const loginRes = await fetch('/api/auth/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, password })
            });
            const loginData = await loginRes.json();
            if (loginRes.ok) {
              localStorage.setItem('anomaly_secure_token', loginData.token);
              onLoginSuccess(loginData.token, loginData.user);
            } else {
              setIsRegistering(false);
              setSuccessMsg('');
            }
          } catch {
            setIsRegistering(false);
            setSuccessMsg('');
          }
        }, 1500);
      }
    } catch (err: any) {
      setErrorMessage(`Tunnel connection error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="login-container" className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">
      
      {/* Visual glowing geometric background grids */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-red-500/5 blur-[120px] pointer-events-none"></div>

      {/* Main card */}
      <div className="w-full max-w-md bg-slate-900/40 border border-slate-850 p-6 sm:p-8 rounded-xl shadow-2xl relative overflow-hidden">
        
        {/* Header decoration logo and security banner */}
        <div className="flex flex-col items-center space-y-2 mb-8 text-center">
          <div className="p-3 bg-red-600/10 border border-red-500/20 rounded-lg shadow-inner">
            <Shield className="w-6 h-6 text-red-500 animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-wider text-slate-100 font-mono uppercase">
              Anomaly.Stream Security Tunnel
            </h1>
            <p className="text-[11px] text-slate-500 font-mono mt-1 uppercase">
              DEVIATIONS TRACKING PORTAL • ROLE ACCESS ACTIVE
            </p>
          </div>
        </div>

        {/* Dynamic error/success banner alerts */}
        {errorMessage && (
          <div id="banner-login-error" className="mb-4 p-3 rounded bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-mono flex items-start space-x-2 animate-in slide-in-from-top-1 duration-150">
            <FileWarning className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}
        {successMsg && (
          <div id="banner-login-success" className="mb-4 p-3 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono flex items-start space-x-2 animate-in slide-in-from-top-1 duration-150">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form elements */}
        <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-4">
          
          {isRegistering && (
            <div className="space-y-1">
              <label htmlFor="reg-name-input" className="text-[10px] text-slate-500 font-mono font-bold tracking-wider uppercase block">Operator full name</label>
              <input
                id="reg-name-input"
                type="text"
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 placeholder:text-slate-700 p-2.5 rounded text-xs focus:outline-none focus:border-red-500 font-mono"
              />
            </div>
          )}

          <div className="space-y-1">
            <label htmlFor="auth-email-input" className="text-[10px] text-slate-500 font-mono font-bold tracking-wider uppercase block">Corporate email address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-700 absolute left-3.5 top-3.5" />
              <input
                id="auth-email-input"
                type="email"
                placeholder="operator@anomaly.io"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 pl-10 pr-3 py-3 text-slate-200 placeholder:text-slate-700 rounded text-xs focus:outline-none focus:border-red-500 font-mono"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="auth-pass-input" className="text-[10px] text-slate-500 font-mono font-bold tracking-wider uppercase block">Secure passcode credentials</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-700 absolute left-3.5 top-3.5" />
              <input
                id="auth-pass-input"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 pl-10 pr-10 py-3 text-slate-200 placeholder:text-slate-700 rounded text-xs focus:outline-none focus:border-red-500 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 px-1 text-slate-600 hover:text-slate-400 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {isRegistering && (
            <div className="space-y-1">
              <label htmlFor="select-reg-role" className="text-[10px] text-slate-500 font-mono font-bold tracking-wider uppercase block">Assigned Security Role (For evaluation)</label>
              <select
                id="select-reg-role"
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2.5 rounded text-xs focus:outline-none focus:border-red-500 font-mono select-none cursor-pointer"
              >
                <option value="Viewer">Viewer (Dashboard logs read-only)</option>
                <option value="Operator">Operator (Triage alarms, inject stress)</option>
                <option value="Admin">Admin (Access control, system settings override)</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            id="btn-auth-submit"
            disabled={loading}
            className="w-full py-3 bg-red-600 hover:bg-red-500 font-bold font-mono text-white duration-150 rounded text-xs uppercase flex items-center justify-center space-x-2 tracking-wider cursor-pointer mt-2 disabled:opacity-40"
          >
            <span>{loading ? 'Evaluating security tunnel...' : isRegistering ? 'Register & Establish Session' : 'Authenticate Security Session'}</span>
            {!loading && <ArrowRight className="w-4 h-4 text-slate-100" />}
          </button>

        </form>

        {/* Pivot button to register/login */}
        <div className="mt-5 text-center text-xs">
          <button
            onClick={() => {
              setIsRegistering(!isRegistering);
              setErrorMessage('');
              setSuccessMsg('');
            }}
            className="text-slate-400 hover:text-indigo-400 font-semibold cursor-pointer duration-150"
          >
            {isRegistering ? 'Have credentials? Back to Secure Authentication' : 'Request Security Credentials'}
          </button>
        </div>

      </div>

    </div>
  );
}
export type { UserRole };
