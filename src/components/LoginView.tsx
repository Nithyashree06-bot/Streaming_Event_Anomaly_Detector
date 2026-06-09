/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Shield, Eye, EyeOff, Lock, Mail, UserPlus, FileWarning, ArrowRight, CheckCircle2, Link2, Wifi, Save } from 'lucide-react';
import { UserRole } from '../types.js';
import { secureFetch, getBackendUrl, setBackendUrl } from '../utils/api.js';

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
  
  // Operational backend bridge configuration states
  const [backendInput, setBackendInput] = useState(getBackendUrl());
  const [showBridgeConfig, setShowBridgeConfig] = useState(getBackendUrl() !== '');
  const [bridgeSavedMsg, setBridgeSavedMsg] = useState('');

  const handleSaveBridge = (e: React.FormEvent) => {
    e.preventDefault();
    setBackendUrl(backendInput);
    setBridgeSavedMsg('Secure tunnel endpoint updated successfully!');
    setTimeout(() => setBridgeSavedMsg(''), 3000);
    setErrorMessage('');
  };

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
      const response = await secureFetch('/api/auth/login', {
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
      console.error(err);
      if (err.message.includes('TUNNEL_HTML_ERROR') || err.message.includes('Unexpected token') || err.message.includes('is not valid JSON')) {
        setErrorMessage(`Tunnel connection error: Your static runner (Vercel) cannot reach the Express API. Please configure your live Container Backend Tunnel at the bottom of this page.`);
        setShowBridgeConfig(true);
      } else {
        setErrorMessage(`Tunnel connection error: ${err.message}`);
      }
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
      const response = await secureFetch('/api/auth/register', {
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
            const loginRes = await secureFetch('/api/auth/login', {
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
      console.error(err);
      if (err.message.includes('TUNNEL_HTML_ERROR') || err.message.includes('Unexpected token') || err.message.includes('is not valid JSON')) {
        setErrorMessage(`Tunnel connection error: Your static runner (Vercel) cannot reach the Express API. Please configure your live Container Backend Tunnel at the bottom of this page.`);
        setShowBridgeConfig(true);
      } else {
        setErrorMessage(`Tunnel connection error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="login-container" className="min-h-screen bg-[#f3f4f6]/60 flex flex-col items-center justify-center p-4 font-sans relative">
      
      {/* Main card */}
      <div className="w-full max-w-md bg-white border border-gray-250/90 p-6 sm:p-8 rounded-xl shadow-xl relative overflow-hidden">
        
        {/* Header decoration logo and security banner */}
        <div className="flex flex-col items-center space-y-2 mb-6 text-center">
          <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-lg shadow-sm">
            <Shield className="w-6 h-6 text-indigo-600 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">
              Telemetry Monitor Portal
            </h1>
            <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">
              Live Service Observability Platform
            </p>
          </div>
        </div>

        {/* Dynamic error/success banner alerts */}
        {errorMessage && (
          <div id="banner-login-error" className="mb-4 p-3 rounded bg-red-50 text-red-700 border border-red-200/60 text-xs font-sans flex items-start space-x-2 animate-in slide-in-from-top-1 duration-150">
            <FileWarning className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
            <span>{errorMessage}</span>
          </div>
        )}
        {successMsg && (
          <div id="banner-login-success" className="mb-4 p-3 rounded bg-emerald-50 text-emerald-800 border border-emerald-200/60 text-xs font-sans flex items-start space-x-2 animate-in slide-in-from-top-1 duration-150">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form elements */}
        <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-4">
          
          {isRegistering && (
            <div className="space-y-1">
              <label htmlFor="reg-name-input" className="text-[11px] text-slate-700 font-semibold tracking-wide uppercase block">Full Name</label>
              <input
                id="reg-name-input"
                type="text"
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white border border-gray-200 text-slate-800 placeholder:text-gray-400 p-2.5 rounded text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 font-sans"
              />
            </div>
          )}

          <div className="space-y-1">
            <label htmlFor="auth-email-input" className="text-[11px] text-slate-700 font-semibold tracking-wide uppercase block">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                id="auth-email-input"
                type="email"
                placeholder="developer@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border border-gray-200 pl-9 pr-3 py-3 text-slate-800 placeholder:text-gray-400 rounded text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 font-sans animate-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="auth-pass-input" className="text-[11px] text-slate-700 font-semibold tracking-wide uppercase block">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                id="auth-pass-input"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white border border-gray-200 pl-9 pr-10 py-3 text-slate-800 placeholder:text-gray-400 rounded text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 font-sans"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 px-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {isRegistering && (
            <div className="space-y-1">
              <label htmlFor="select-reg-role" className="text-[11px] text-slate-700 font-semibold tracking-wide uppercase block">Assigned Account Role</label>
              <select
                id="select-reg-role"
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full bg-white border border-gray-200 text-slate-800 p-2.5 rounded text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 font-sans select-none cursor-pointer"
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
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 font-semibold text-white duration-150 rounded text-xs uppercase flex items-center justify-center space-x-2 tracking-wider cursor-pointer mt-2 disabled:opacity-40"
          >
            <span>{loading ? 'Verifying authentication...' : isRegistering ? 'Register Account' : 'Authenticate Credentials'}</span>
            {!loading && <ArrowRight className="w-4 h-4 text-white" />}
          </button>

        </form>

        {/* Pivot button to register/login */}
        <div className="mt-5 text-center text-xs flex flex-col items-center space-y-3">
          <button
            type="button"
            onClick={() => {
              setIsRegistering(!isRegistering);
              setErrorMessage('');
              setSuccessMsg('');
            }}
            className="text-slate-550 text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer duration-150"
          >
            {isRegistering ? 'Have account credentials? Sign In' : 'Request Security Credentials'}
          </button>

          <button
            type="button"
            onClick={() => setShowBridgeConfig(!showBridgeConfig)}
            className="text-[11px] text-slate-400 hover:text-slate-600 font-medium flex items-center space-x-1 duration-150 cursor-pointer"
          >
            <Link2 className="w-3.5 h-3.5" />
            <span>{showBridgeConfig ? 'Hide Backend Tunnel settings' : 'Configure Backend Tunnel'}</span>
          </button>
        </div>

        {/* Operational Bridge Settings Card */}
        {showBridgeConfig && (
          <div className="mt-6 pt-5 border-t border-gray-200 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="rounded-lg bg-slate-50 border border-gray-200 p-3.5 space-y-3">
              <div className="flex items-center space-x-2 text-indigo-700">
                <Wifi className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
                <h4 className="text-[11px] uppercase font-bold tracking-wider text-indigo-700">
                  Backend Link Tunnel
                </h4>
              </div>
              
              <p className="text-[10px] text-slate-550 leading-relaxed font-sans">
                Enter your <strong>Live Container URL</strong> (Development or Shared play view URL) from AI Studio below to bind this interface directly with your mock-free Express telemetry backend.
              </p>

              {bridgeSavedMsg && (
                <div className="p-1 px-2 rounded bg-emerald-50 border border-emerald-200 text-[10px] text-emerald-800 text-center">
                  {bridgeSavedMsg}
                </div>
              )}

              <form onSubmit={handleSaveBridge} className="space-y-2">
                <div className="space-y-1">
                  <label htmlFor="input-backend-url" className="text-[9px] font-bold text-slate-500 block uppercase">
                    Active Container URL
                  </label>
                  <input
                    id="input-backend-url"
                    type="url"
                    placeholder="https://ais-pre-...asia-southeast1.run.app"
                    value={backendInput}
                    onChange={(e) => setBackendInput(e.target.value)}
                    className="w-full bg-white border border-gray-250 rounded p-2 text-[10px] text-slate-700 placeholder:text-gray-300 font-sans focus:outline-none focus:border-indigo-500"
                  />
                  <div className="text-[9px] text-slate-500 font-sans flex flex-col space-y-0.5 mt-1 leading-normal select-text">
                    <span>Example: Go to AI Studio, copy your Development or Shared App URL and paste it here.</span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-1.5 border-t border-gray-150">
                  <button
                    type="button"
                    onClick={() => {
                      setBackendUrl('');
                      setBackendInput('');
                      setBridgeSavedMsg('Reset to relative origin endpoints.');
                      setTimeout(() => setBridgeSavedMsg(''), 3000);
                    }}
                    className="text-[10px] text-slate-400 hover:text-red-600 duration-150 cursor-pointer"
                  >
                    Clear Override
                  </button>
                  <button
                    type="submit"
                    className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[10px] font-sans flex items-center space-x-1 duration-150 cursor-pointer"
                  >
                    <Save className="w-3" />
                    <span>Save Endpoint</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
export type { UserRole };
