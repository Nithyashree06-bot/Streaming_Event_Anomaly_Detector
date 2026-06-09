/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  Database, 
  Activity, 
  AlertTriangle, 
  TrendingUp, 
  Zap, 
  ShieldCheck, 
  HelpCircle,
  Play,
  Pause,
  Server,
  Network,
  Cpu
} from 'lucide-react';
import { User, DashboardMetrics, Anomaly, MetricType, StreamEvent } from '../types.js';

interface DashboardViewProps {
  token: string;
  currentUser: User;
  stats: DashboardMetrics;
  streamRunning: boolean;
  onToggleStream: () => void;
  recentAnomalies: Anomaly[];
  events: StreamEvent[];
  onInjectAnomaly: (metricType: MetricType, type: 'spike' | 'drop' | 'drift' | 'burst', multiplier: number) => void;
}

export default function DashboardView({
  token,
  currentUser,
  stats,
  streamRunning,
  onToggleStream,
  recentAnomalies,
  events,
  onInjectAnomaly
}: DashboardViewProps) {
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('cpu_usage');
  const [selectedInjectType, setSelectedInjectType] = useState<'spike' | 'drop' | 'drift' | 'burst'>('spike');
  const [multiplier, setMultiplier] = useState<number>(5);
  const [injectingStatus, setInjectingStatus] = useState<string>('');

  const metricsInfo: Record<MetricType, { name: string; icon: any; color: string; unit: string }> = {
    api_latency: { name: 'API Latency', icon: Activity, color: 'text-sky-400 bg-sky-500/10', unit: 'ms' },
    auth_failures: { name: 'Auth Failure Rates', icon: ShieldCheck, color: 'text-amber-400 bg-amber-500/10', unit: '/s' },
    db_connections: { name: 'DB Connection Load', icon: Database, color: 'text-indigo-400 bg-indigo-500/10', unit: '%' },
    cpu_usage: { name: 'Cluster CPU Cores', icon: Cpu, color: 'text-emerald-400 bg-emerald-500/10', unit: '%' },
    payment_volume: { name: 'Transaction Velocity', icon: TrendingUp, color: 'text-rose-400 bg-rose-500/10', unit: 'rps' }
  };

  const handleInject = async () => {
    if (currentUser.role === 'Viewer') {
      alert('Security Policy Error: Viewers do not have security roles permissions to modify stream states.');
      return;
    }
    setInjectingStatus('Triggering injection pipeline...');
    onInjectAnomaly(selectedMetric, selectedInjectType, multiplier);
    setTimeout(() => {
      setInjectingStatus(`Successfully injected artificial ${selectedInjectType.toUpperCase()} stress on ${metricsInfo[selectedMetric].name}!`);
      setTimeout(() => setInjectingStatus(''), 4000);
    }, 800);
  };

  // Build high-performance SVG path for events timeline widget
  const getTimelinePoints = () => {
    const sorted = [...events].slice(-50); // Get latest 50 events
    if (sorted.length < 2) return '';

    const width = 600;
    const height = 110;
    const maxVal = Math.max(...sorted.map(e => e.value), 10);
    const minVal = Math.min(...sorted.map(e => e.value), 0);
    const range = maxVal - minVal || 1;

    return sorted.map((e, index) => {
      const x = (index / (sorted.length - 1)) * (width - 20) + 10;
      const y = height - ((e.value - minVal) / range) * (height - 20) - 10;
      return `${x},${y}`;
    }).join(' ');
  };

  // Severity Distribution Calculator
  const getSeverityCounts = () => {
    const counts = { Critical: 0, High: 0, Medium: 0, Low: 0 };
    recentAnomalies.forEach(a => {
      if (a.severity in counts) {
        counts[a.severity as keyof typeof counts]++;
      }
    });
    return counts;
  };

  const severityCounts = getSeverityCounts();
  const totalAnomaliesCount = recentAnomalies.length;

  return (
    <div id="dashboard-view-container" className="flex-1 p-6 overflow-y-auto bg-slate-950 font-sans space-y-6">
      
      {/* Title section with quick controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-900 pb-5">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center space-x-2">
            <span>Operational Center</span>
            <span className="text-xs bg-slate-900 text-slate-400 border border-slate-800 px-2 py-0.5 rounded font-mono font-normal">
              SECURE SEED ACTIVE
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Standard mathematical standard-deviation tracking of real-time server streams and alert notifications.
          </p>
        </div>

        {/* Real-Time Control Node */}
        <div className="flex items-center space-x-3 bg-slate-900 border border-slate-800 p-2 rounded-lg">
          <div className="flex flex-col text-right">
            <span className="text-[10px] text-slate-500 font-mono font-bold tracking-wider">TELEMETRY LOOP</span>
            <span className="text-xs font-mono font-medium text-slate-300">
              {streamRunning ? 'RUNNING (ACTIVE)' : 'HALTED (PAUSED)'}
            </span>
          </div>
          <button
            id="btn-stream-toggle"
            onClick={onToggleStream}
            disabled={currentUser.role === 'Viewer'}
            className={`cursor-pointer w-10 h-10 rounded duration-200 flex items-center justify-center ${
              streamRunning 
                ? 'bg-amber-600/20 text-amber-400 border border-amber-500/30 hover:bg-amber-600/30' 
                : 'bg-emerald-600 border border-emerald-500 hover:bg-emerald-500 text-white'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            title={currentUser.role === 'Viewer' ? 'Viewer access restricted' : ''}
          >
            {streamRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 pointer-events-none" />}
          </button>
        </div>
      </div>

      {/* Primary KPI Grid Dashboard Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1 */}
        <div id="widget-total-processed" className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-lg relative overflow-hidden flex flex-col justify-between h-28">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-[11px] font-mono font-medium tracking-wider text-slate-500 uppercase">TELEMETRY INGESTED</p>
              <h4 className="text-2xl font-bold font-mono text-slate-100">{stats.totalEventsProcessed}</h4>
            </div>
            <div className="p-2 rounded bg-slate-800/50 text-slate-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center space-x-1.5 text-[10px] font-mono text-emerald-400 border-t border-slate-900/60 pt-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Rate: {stats.ingestionRate} metrics / sec</span>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-[40px] pointer-events-none"></div>
        </div>

        {/* KPI 2 */}
        <div id="widget-active-streams" className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-lg relative overflow-hidden flex flex-col justify-between h-28">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-[11px] font-mono font-medium tracking-wider text-slate-500 uppercase">ACTIVE LOG CHANNELS</p>
              <h4 className="text-2xl font-bold font-mono text-slate-100">{stats.activeStreamsCount}</h4>
            </div>
            <div className="p-2 rounded bg-slate-800/50 text-slate-400">
              <Network className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center space-x-1.5 text-[10px] font-mono text-indigo-400 border-t border-slate-900/60 pt-2">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
            <span>Cluster threads tracking OK</span>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-[40px] pointer-events-none"></div>
        </div>

        {/* KPI 3 */}
        <div id="widget-detected-anomalies" className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-lg relative overflow-hidden flex flex-col justify-between h-28">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-[11px] font-mono font-medium tracking-wider text-slate-500 uppercase">DETECTED DEVIATIONS</p>
              <h4 className="text-2xl font-bold font-mono text-red-400">{stats.detectedAnomaliesCount}</h4>
            </div>
            <div className="p-2 rounded bg-red-500/10 text-red-400 border border-red-500/20">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center space-x-1.5 text-[10px] font-mono text-red-400 border-t border-slate-900/60 pt-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
            <span>Active Alerts: {stats.activeAlertsCount} flags</span>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-[40px] pointer-events-none"></div>
        </div>

        {/* KPI 4 */}
        <div id="widget-avg-confidence" className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-lg relative overflow-hidden flex flex-col justify-between h-28">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-[11px] font-mono font-medium tracking-wider text-slate-500 uppercase">AVG ALARM CONFIDENCE</p>
              <h4 className="text-2xl font-bold font-mono text-amber-400">{stats.avgConfidence}%</h4>
            </div>
            <div className="p-2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center space-x-1.5 text-[10px] font-mono text-amber-400 border-t border-slate-900/60 pt-2">
            <span>Threshold: 2.8z Sigma</span>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-[40px] pointer-events-none"></div>
        </div>

      </div>

      {/* Main Panel grid: Timeline & Severity Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Event Timeline (Custom Line Path SVG Widget) */}
        <div id="widget-event-timeline" className="lg:col-span-2 bg-slate-900 border border-slate-800 p-5 rounded-lg flex flex-col justify-between h-72">
          <div className="flex justify-between items-center border-b border-slate-800/60 pb-3">
            <div>
              <h3 className="text-xs font-semibold text-slate-100 tracking-wider font-mono uppercase">REAL-TIME TELEMETRY STREAM</h3>
              <p className="text-[10px] text-slate-500 mt-0.5">Aggregated latest 50 metric incoming events line visualization.</p>
            </div>
            <span className="text-[10px] bg-slate-950 px-2 py-0.5 border border-slate-800 text-emerald-400 font-mono rounded">
              AUTO-SCALING WINDOW
            </span>
          </div>

          {/* Canvas SVG representing interactive timeline */}
          <div className="flex-1 py-4 flex items-center justify-center relative">
            {events.length > 1 ? (
              <svg className="w-full h-full max-h-[140px]" viewBox="0 0 600 110" preserveAspectRatio="none">
                {/* Gradient Definition */}
                <defs>
                  <linearGradient id="gradient-line" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {/* Background Grid Horizontal Lines */}
                <line x1="0" y1="18" x2="600" y2="18" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="4 2" />
                <line x1="0" y1="45" x2="600" y2="45" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="4 2" />
                <line x1="0" y1="72" x2="600" y2="72" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="4 2" />
                <line x1="0" y1="100" x2="600" y2="100" stroke="#1e293b" strokeWidth="0.5" />

                {/* Line Path */}
                <polyline
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="1.5"
                  points={getTimelinePoints()}
                />
              </svg>
            ) : (
              <div className="text-xs font-mono text-slate-500">Collecting live tracking logs...</div>
            )}
          </div>

          <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 border-t border-slate-800/60 pt-2.5">
            <span>{events.length > 50 ? 't-50 periods' : 't-0'}</span>
            <span>Real-time continuous standard Z-analysis</span>
            <span>Now</span>
          </div>
        </div>

        {/* Severity Distribution Donut Widget */}
        <div id="widget-severity-distribution" className="bg-slate-900 border border-slate-800 p-5 rounded-lg flex flex-col justify-between h-72">
          <div className="border-b border-slate-800/60 pb-3">
            <h3 className="text-xs font-semibold text-slate-100 tracking-wider font-mono uppercase">ALARM SEVERITY PILE</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Summary of alarms triggered by type matrix.</p>
          </div>

          <div className="flex-1 py-2 flex items-center justify-around gap-2">
            
            {/* Visual breakdown bars representation */}
            <div className="space-y-2 flex-1 max-w-[140px]">
              <div className="flex justify-between items-center text-[11px] font-mono">
                <span className="text-red-400">Critical</span>
                <span className="text-slate-300 font-bold">{severityCounts.Critical}</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded overflow-hidden">
                <div className="bg-red-500 h-full duration-500" style={{ width: `${totalAnomaliesCount > 0 ? (severityCounts.Critical / totalAnomaliesCount) * 100 : 0}%` }}></div>
              </div>

              <div className="flex justify-between items-center text-[11px] font-mono">
                <span className="text-orange-400">High</span>
                <span className="text-slate-300 font-bold">{severityCounts.High}</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded overflow-hidden">
                <div className="bg-orange-500 h-full duration-500" style={{ width: `${totalAnomaliesCount > 0 ? (severityCounts.High / totalAnomaliesCount) * 100 : 0}%` }}></div>
              </div>

              <div className="flex justify-between items-center text-[11px] font-mono">
                <span className="text-amber-400">Medium</span>
                <span className="text-slate-300 font-bold">{severityCounts.Medium}</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded overflow-hidden">
                <div className="bg-amber-500 h-full duration-500" style={{ width: `${totalAnomaliesCount > 0 ? (severityCounts.Medium / totalAnomaliesCount) * 100 : 0}%` }}></div>
              </div>

              <div className="flex justify-between items-center text-[11px] font-mono">
                <span className="text-blue-400">Low</span>
                <span className="text-slate-300 font-bold">{severityCounts.Low}</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded overflow-hidden">
                <div className="bg-sky-500 h-full duration-500" style={{ width: `${totalAnomaliesCount > 0 ? (severityCounts.Low / totalAnomaliesCount) * 100 : 0}%` }}></div>
              </div>
            </div>

            {/* Circular summary container */}
            <div className="w-24 h-24 rounded-full border-[3px] border-slate-800 flex flex-col items-center justify-center bg-slate-950/40 relative">
              <span className="text-2xl font-bold font-mono text-white">{totalAnomaliesCount}</span>
              <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest mt-0.5">TOTALS</span>
            </div>

          </div>

          <p className="text-[10px] text-slate-500 font-mono text-center border-t border-slate-800/60 pt-2">
            Realtime security threshold alarm indexes
          </p>
        </div>

      </div>

      {/* Playability & Simulated Anomaly Injector Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Stream Simulator Cockpit widget */}
        <div id="simulated-stress-injector" className="lg:col-span-2 bg-slate-900 border border-slate-800 p-5 rounded-lg flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-semibold text-slate-100 tracking-wider font-mono uppercase flex items-center space-x-2">
              <Zap className="w-4 h-4 text-red-500 animate-pulse" />
              <span>STRESS SIMULATOR COCKPIT (INTERACTIVE)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Select any live telemetry thread below to force-inject an artificial system anomaly event. Click 'Trigger Injection Pipeline' to stream it live and watch how the alarm metrics react immediately.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
            
            {/* Thread selector */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-slate-400 font-semibold uppercase">1. SELECT TARGET METRIC THREAD</label>
              <select
                id="select-inject-metric"
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value as MetricType)}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-200 focus:outline-none focus:border-red-500 font-mono"
              >
                {Object.entries(metricsInfo).map(([key, info]) => (
                  <option key={key} value={key}>{info.name} ({info.unit})</option>
                ))}
              </select>
            </div>

            {/* Injection type */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-slate-400 font-semibold uppercase">2. CHOOSE STRESS STYLE</label>
              <select
                id="select-inject-type"
                value={selectedInjectType}
                onChange={(e) => setSelectedInjectType(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-200 focus:outline-none focus:border-red-500 font-mono"
              >
                <option value="spike">Spike Event Surge (Z-Score &gt; 4.5)</option>
                <option value="drop">System Blackout / Zero-Drop (Offline)</option>
                <option value="drift">Steady Drift Pattern (5 ticks escalation)</option>
                <option value="burst">Rapid Volatility Noise Burst (Volatile)</option>
              </select>
            </div>

            {/* Severity multiplier */}
            <div className="space-y-1.5 col-span-1 sm:col-span-2">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-mono text-slate-400 font-semibold uppercase">3. STRESS INTENSITY COEFFICIENT: {multiplier}x</label>
                <span className="text-[10px] text-red-400 font-mono">WARNING: HIGHER SETTING INITIATES CRITICAL LOGS</span>
              </div>
              <input
                id="range-inject-multiplier"
                type="range"
                min="2.5"
                max="8.0"
                step="0.5"
                value={multiplier}
                onChange={(e) => setMultiplier(parseFloat(e.target.value))}
                className="w-full accent-red-500 bg-slate-950 h-1 rounded cursor-pointer"
              />
            </div>

          </div>

          <div className="flex items-center justify-between gap-4 border-t border-slate-800/60 pt-3 flex-wrap">
            <span className="text-[11px] font-mono text-amber-400 font-medium">
              {injectingStatus || 'Standby. Awaiting command.'}
            </span>
            <button
              id="btn-trigger-inject"
              onClick={handleInject}
              disabled={currentUser.role === 'Viewer'}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded duration-200 shadow-md shadow-red-900/10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed uppercase"
            >
              Trigger Injection Pipeline
            </button>
          </div>
        </div>

        {/* Microservices Board widget */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-lg flex flex-col justify-between">
          <div className="border-b border-slate-800/60 pb-3">
            <h3 className="text-xs font-semibold text-slate-100 tracking-wider font-mono uppercase">CLUSTER MICROSERVICES STATUS</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Connected microservices state directories.</p>
          </div>

          <div className="space-y-3 flex-1 py-4 flex flex-col justify-center">
            
            <div className="flex justify-between items-center bg-slate-950/50 p-2 border border-slate-800/40 rounded-md">
              <div className="flex items-center space-x-2 text-xs font-mono text-slate-300">
                <Server className="w-3.5 h-3.5 text-slate-400" />
                <span>api-gateway-service</span>
              </div>
              <span className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full col bg-emerald-500 animate-pulse"></span>
                <span className="text-[10px] font-mono text-slate-400">ACTIVE</span>
              </span>
            </div>

            <div className="flex justify-between items-center bg-slate-950/50 p-2 border border-slate-800/40 rounded-md">
              <div className="flex items-center space-x-2 text-xs font-mono text-slate-300">
                <Server className="w-3.5 h-3.5 text-slate-400" />
                <span>database-pool-manager</span>
              </div>
              <span className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full col bg-emerald-500 animate-pulse"></span>
                <span className="text-[10px] font-mono text-slate-400">ACTIVE</span>
              </span>
            </div>

            <div className="flex justify-between items-center bg-slate-950/50 p-2 border border-slate-800/40 rounded-md">
              <div className="flex items-center space-x-2 text-xs font-mono text-slate-300">
                <Server className="w-3.5 h-3.5 text-slate-400" />
                <span>neural-gemini-bridge</span>
              </div>
              <span className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full col bg-emerald-500 animate-pulse"></span>
                <span className="text-[10px] font-mono text-slate-400">ONLINE</span>
              </span>
            </div>

          </div>

          <div className="bg-slate-950/40 border border-slate-800/50 p-2 rounded text-center text-[10px] font-mono text-indigo-400">
            Node authority validation: ENFORCED
          </div>
        </div>

      </div>

    </div>
  );
}
export type { MetricType };
