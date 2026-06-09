/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Sliders, Shield, BookOpen, Trash2, Key, Server, Cpu, Database, Info } from 'lucide-react';
import { User, SystemSettings } from '../types.js';

interface SettingsProps {
  currentUser: User;
  settings: SystemSettings;
  onUpdateSimulationSettings: (speed: number, sensitivity: number) => void;
  onResetDatabase: () => void;
}

export default function SettingsView({
  currentUser,
  settings,
  onUpdateSimulationSettings,
  onResetDatabase
}: SettingsProps) {
  const [sensitivityZ, setSensitivityZ] = useState<number>(settings.detectionSensitiveZScore);
  const [rollingWindow, setRollingWindow] = useState<number>(settings.rollingWindowSize);
  const [speedInterval, setSpeedInterval] = useState<number>(settings.streamIntervalMs);
  const [actionStatus, setActionStatus] = useState<string>('');

  const handleSaveSettings = () => {
    if (currentUser.role === 'Viewer') {
      alert('Security Policy Error: Viewers do not have roles permission to modify system constants.');
      return;
    }
    if (sensitivityZ < 1.5 || sensitivityZ > 8.0) {
      alert('Sensitivity standard coefficient must be inside [1.5, 8.0].');
      return;
    }
    onUpdateSimulationSettings(speedInterval, sensitivityZ);
    setActionStatus('System settings synchronized successfully.');
    setTimeout(() => setActionStatus(''), 4000);
  };

  const handleWipeData = () => {
    if (currentUser.role !== 'Admin') {
      alert('Forbidden: Master wipes can only be executed by Chief Administrators.');
      return;
    }
    if (confirm('Are you absolutely sure you want to perform a hard data purge? Historical metrics and logs will be permanently deleted.')) {
      onResetDatabase();
      setActionStatus('Historical data buffers purged completely.');
      setTimeout(() => setActionStatus(''), 4000);
    }
  };

  return (
    <div id="settings-view-container" className="flex-1 p-6 overflow-y-auto bg-slate-950 font-sans flex flex-col space-y-6">
      
      {/* Title */}
      <div className="border-b border-slate-900 pb-5">
        <h2 className="text-xl font-bold tracking-tight text-white flex items-center space-x-2.5">
          <Sliders className="w-5 h-5 text-indigo-400" />
          <span>System Settings</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Adjust statistical anomaly coefficients, review database security policies, and browse detection equations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Settings Form */}
        <div className="space-y-6">
          
          {/* Statistical coefficients */}
          <div className="bg-slate-900 border border-slate-850 p-5 rounded-lg space-y-4">
            <h3 className="text-xs font-bold font-mono tracking-wider text-slate-100 uppercase border-b border-slate-850 pb-2 flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-indigo-400" />
              <span>STATISTICAL CO-EFFICIENT ADJUSTERS</span>
            </h3>

            {actionStatus && (
              <div className="p-2.5 bg-emerald-900/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono rounded animate-pulse text-center">
                {actionStatus}
              </div>
            )}

            <div className="space-y-4">
              
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[10px] font-mono select-none">
                  <label className="text-slate-400 font-bold uppercase">Anomaly Z-Score Threshold: {sensitivityZ} σ</label>
                  <span className="text-slate-500">Normal Range: 2.5 - 3.5</span>
                </div>
                <input
                  id="range-settings-sensitivity"
                  type="range"
                  min="1.5"
                  max="5.5"
                  step="0.1"
                  value={sensitivityZ}
                  onChange={(e) => setSensitivityZ(parseFloat(e.target.value))}
                  disabled={currentUser.role === 'Viewer'}
                  className="w-full accent-red-500 bg-slate-950 h-1 rounded cursor-pointer"
                />
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                  Lower limits increase alerts sensitivity (more false positives). High values limit triggers to massive spikes.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 font-bold uppercase font-mono block">Sliding History Sample Window</label>
                <input
                  id="num-settings-window"
                  type="number"
                  min="20"
                  max="150"
                  value={rollingWindow}
                  onChange={(e) => setRollingWindow(parseInt(e.target.value) || 50)}
                  disabled={true} // Fixed for model consistency
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-400 font-mono focus:outline-none focus:border-red-500 opacity-60"
                />
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                  Size of previous events sample to compute baseline Mean (μ) and Standard Deviation (σ). (LOCKED: {settings.rollingWindowSize} logs)
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 font-bold uppercase font-mono block">Streaming Ingestion Interval (ms)</label>
                <input
                  id="num-settings-speed"
                  type="number"
                  min="100"
                  max="10000"
                  value={speedInterval}
                  onChange={(e) => setSpeedInterval(parseInt(e.target.value) || 1000)}
                  disabled={currentUser.role === 'Viewer'}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-red-500"
                />
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                  Simulated telemetry generation tick rate. Lower values speed up incoming logs (e.g., 200ms).
                </p>
              </div>

              <button
                id="btn-settings-save"
                onClick={handleSaveSettings}
                disabled={currentUser.role === 'Viewer'}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded duration-150 cursor-pointer uppercase font-mono tracking-wide mt-2"
              >
                Sync constants state
              </button>

            </div>

          </div>

          {/* Database management and hard purging */}
          <div className="bg-slate-900 border border-slate-850 p-5 rounded-lg space-y-4">
            <h3 className="text-xs font-bold font-mono tracking-wider text-slate-100 uppercase border-b border-slate-850 pb-2 flex items-center space-x-2">
              <Database className="w-4 h-4 text-red-500" />
              <span>ADMIN DATA PURGES / HARD WIPINGS</span>
            </h3>

            <p className="text-xs text-slate-400">
              Clear all historical tracking anomaly logs and stream telemetry buffers. This reverts the monitoring console back to normal, fresh baselines.
            </p>

            <button
              id="btn-settings-wipe-data"
              onClick={handleWipeData}
              disabled={currentUser.role !== 'Admin'}
              className="px-4 py-2 bg-red-950/30 hover:bg-red-900/30 text-red-400 border border-red-500/15 hover:border-red-500/30 font-bold text-xs rounded duration-150 cursor-pointer uppercase select-none w-full"
            >
              <Trash2 className="w-4 h-4 inline mr-1.5 text-red-400" />
              <span>Hard Purge Historical logs</span>
            </button>
            <p className="text-[10px] text-slate-500 font-mono text-center">
              * This is a critical security action and requires **Admin** account authority signature logs.
            </p>
          </div>

        </div>

        {/* Math explanation & Documentation block */}
        <div className="space-y-6">
          
          {/* Rule documentation */}
          <div className="bg-slate-900 border border-slate-850 p-5 rounded-lg space-y-4">
            <h3 className="text-xs font-bold font-mono tracking-wider text-slate-100 uppercase border-b border-slate-850 pb-2 flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <span>DETECTION EQUATION MATHEMATICS SOP SHEET</span>
            </h3>

            <div className="space-y-4 font-mono text-xs text-slate-400 leading-relaxed">
              
              <div>
                <h4 className="text-xs font-bold text-slate-200 border-l-2 border-indigo-500 pl-2 uppercase">1. Z-Score Formulation</h4>
                <div className="bg-slate-950 border border-slate-900 p-2.5 rounded-md text-slate-350 select-all my-1.5 flex justify-center text-sm font-bold">
                  Z = | x - μ | / σ
                </div>
                <p className="text-[11px] text-slate-500">
                  Where <span className="font-bold text-slate-300">x</span> is the latest telemetry value, <span className="font-bold text-slate-300">μ (mean)</span> is the rolling baseline average, and <span className="font-bold text-slate-300 font-serif">σ (sigma)</span> represents standard deviation. Values beyond the threshold (e.g. Z &gt; 2.8) represent an anomaly.
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-200 border-l-2 border-indigo-500 pl-2 uppercase">2. Dispersion Sigma standard deviation formula</h4>
                <div className="bg-slate-950 border border-slate-900 p-2.5 rounded-md text-slate-350 select-all my-1.5 flex justify-center text-xs">
                  σ = Math.sqrt( Σ(xi - μ)² / (N - 1) )
                </div>
                <p className="text-[11px] text-slate-500">
                  Calculates baseline dispersion depth over <span className="font-bold text-slate-300">N (Window Size {settings.rollingWindowSize})</span> periods. An expanded dispersion factor prevents false classifications during volatile clusters.
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-200 border-l-2 border-indigo-500 pl-2 uppercase">3. Alarm confidence scoring</h4>
                <div className="p-2.5 bg-slate-950 rounded-md border border-slate-900 text-[11px] text-slate-500 space-y-1">
                  <p>• <span className="text-slate-300 font-bold">Z-Score &lt; 2.8:</span> 0% alarm threshold index (Normal)</p>
                  <p>• <span className="text-amber-400 font-bold">Z-Score ≈ 2.8:</span> 60% confidence baseline alarm (Medium)</p>
                  <p>• <span className="text-red-400 font-bold">Z-Score &gt; 4.0:</span> 95%+ high confidence threat (Critical / High)</p>
                </div>
              </div>

            </div>
          </div>

          {/* Security policy compliance display */}
          <div className="bg-slate-900 border border-slate-850 p-5 rounded-lg space-y-4">
            <h3 className="text-xs font-bold font-mono tracking-wider text-slate-100 uppercase border-b border-slate-850 pb-2 flex items-center space-x-2">
              <Shield className="w-4 h-4 text-indigo-400" />
              <span>SECURITY & ENFORCEMENT POLICIES</span>
            </h3>
            
            <div className="font-mono text-[11px] text-slate-500 space-y-2.5">
              <div className="flex justify-between border-b border-slate-850/40 pb-2">
                <span>PASSWORD STORAGE POLICY</span>
                <span className="text-emerald-400 font-bold">PBKDF2-SHA512 CRYPTO</span>
              </div>
              <div className="flex justify-between border-b border-slate-850/40 pb-2">
                <span>SESSION SECURITY</span>
                <span className="text-emerald-400 font-bold">64-CHAR HEX ACCESS TICKETS</span>
              </div>
              <div className="flex justify-between border-b border-slate-850/40 pb-2">
                <span>ROLE-BASED AUTHORIZATION</span>
                <span className="text-slate-300 font-bold">ENFORCED ENTIRE ENDPOINTS</span>
              </div>
              <div className="flex justify-between pb-1">
                <span>IDLE SESSION LOCKS</span>
                <span className="text-amber-400 font-bold">10 MINS (MAX_IDLE)</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
export type { SystemSettings };
