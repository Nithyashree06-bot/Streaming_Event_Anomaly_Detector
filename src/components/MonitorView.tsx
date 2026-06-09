/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Play, Pause, Search, SlidersHorizontal, Trash2, Cpu, Database, TrendingUp, Activity, ShieldCheck } from 'lucide-react';
import { User, StreamEvent, MetricType, SystemSettings } from '../types.js';

interface MonitorProps {
  currentUser: User;
  events: StreamEvent[];
  streamRunning: boolean;
  settings: SystemSettings;
  onToggleStream: () => void;
  onUpdateSimulationSettings: (speed: number, sensitivity: number) => void;
  onResetDatabase: () => void;
}

export default function MonitorView({
  currentUser,
  events,
  streamRunning,
  settings,
  onToggleStream,
  onUpdateSimulationSettings,
  onResetDatabase
}: MonitorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMetric, setSelectedMetric] = useState<MetricType | 'all'>('all');
  const [anomaliesOnly, setAnomaliesOnly] = useState(false);
  const [speedInput, setSpeedInput] = useState<number>(settings.streamIntervalMs);
  const [sensitivityInput, setSensitivityInput] = useState<number>(settings.detectionSensitiveZScore);
  const [saveStatus, setSaveStatus] = useState('');

  const metricsInfo: Record<MetricType, { name: string; icon: any; color: string; unit: string }> = {
    api_latency: { name: 'API Latency', icon: Activity, color: 'text-sky-400 border-sky-500/20 bg-sky-500/10', unit: 'ms' },
    auth_failures: { name: 'Auth Failure Rates', icon: ShieldCheck, color: 'text-amber-400 border-amber-500/20 bg-amber-500/10', unit: '/s' },
    db_connections: { name: 'DB Connection Load', icon: Database, color: 'text-indigo-400 border-indigo-500/20 bg-indigo-500/10', unit: '%' },
    cpu_usage: { name: 'Cluster CPU Cores', icon: Cpu, color: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10', unit: '%' },
    payment_volume: { name: 'Transaction Velocity', icon: TrendingUp, color: 'text-rose-400 border-rose-500/20 bg-rose-500/10', unit: 'rps' }
  };

  const handleUpdate = () => {
    if (currentUser.role === 'Viewer') {
      alert('Security Policy Alert: Viewers do not have roles authorization to modify streaming properties.');
      return;
    }
    if (speedInput < 100 || speedInput > 10000) {
      alert('Speed parameter must fall between 100ms and 10000ms.');
      return;
    }
    if (sensitivityInput < 1.5 || sensitivityInput > 8.0) {
      alert('Z-Score threshold limit must be inside [1.5, 8.0] boundaries.');
      return;
    }
    onUpdateSimulationSettings(speedInput, sensitivityInput);
    setSaveStatus('Streaming rules synchronized.');
    setTimeout(() => setSaveStatus(''), 3000);
  };

  const handleWipe = () => {
    if (currentUser.role !== 'Admin') {
      alert('Forbidden: Master data resets are restricted exclusively to Chief Administrators.');
      return;
    }
    if (confirm('Are you absolutely sure you want to perform a hard data purge? This action clears all historic telemetry logs.')) {
      onResetDatabase();
    }
  };

  // Filter Event Logs list
  const filteredEvents = events.filter(e => {
    const matchesSearch = e.metricType.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          e.value.toString().includes(searchTerm) ||
                          (e.anomalyScore && e.anomalyScore.toString().includes(searchTerm));
    const matchesMetric = selectedMetric === 'all' || e.metricType === selectedMetric;
    const matchesAnomaly = !anomaliesOnly || e.isAnomaly;

    return matchesSearch && matchesMetric && matchesAnomaly;
  });

  return (
    <div id="monitor-view-container" className="flex-1 p-6 overflow-y-auto bg-slate-950 font-sans flex flex-col space-y-6">
      
      {/* Title section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-900 pb-5">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center space-x-2.5">
            <span>Real-Time Stream Monitor</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Live falling telemetry tracking index of corporate operational nodes and statistical deviation alarms.
          </p>
        </div>

        {/* Administration quick actions */}
        {currentUser.role === 'Admin' && (
          <button
            id="btn-hard-reset-data"
            onClick={handleWipe}
            className="flex items-center space-x-2 px-3 py-1.5 rounded bg-red-950/40 text-red-400 hover:bg-red-900/30 border border-red-500/20 text-xs font-mono transition-all duration-150 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Master Reset History</span>
          </button>
        )}
      </div>

      {/* Controller Configuration Row */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 p-4 bg-slate-900/80 border border-slate-800 rounded-lg">
        
        {/* Toggle Stream */}
        <div className="flex flex-col justify-center space-y-1">
          <span className="text-[10px] text-slate-500 font-mono font-bold tracking-wider uppercase">STREAM ENGINE CONTROL</span>
          <button
            id="btn-monitor-stream-toggle"
            onClick={onToggleStream}
            disabled={currentUser.role === 'Viewer'}
            className={`w-full py-2.5 px-4 rounded font-bold text-xs flex items-center justify-center space-x-2 cursor-pointer duration-150 relative overflow-hidden ${
              streamRunning 
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20' 
                : 'bg-emerald-600 text-white hover:bg-emerald-500'
            } disabled:opacity-50`}
          >
            {streamRunning ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>PAUSE LIVE STREAM</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>COMMENCE STREAMING</span>
              </>
            )}
          </button>
        </div>

        {/* Dynamic interval configuration */}
        <div className="space-y-1">
          <label className="text-[10px] text-slate-500 font-mono font-bold tracking-wider uppercase">TELEMETRY LOOP TICK RATE</label>
          <div className="flex items-center space-x-2">
            <input
              id="num-stream-speed"
              type="number"
              min="100"
              max="10000"
              value={speedInput}
              onChange={(e) => setSpeedInput(parseInt(e.target.value) || 1000)}
              disabled={currentUser.role === 'Viewer'}
              className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-xs text-slate-200 focus:outline-none focus:border-red-500 font-mono"
            />
            <span className="text-xs text-slate-500 font-mono">ms</span>
          </div>
        </div>

        {/* Z-Score threshold customization */}
        <div className="space-y-1">
          <label className="text-[10px] text-slate-500 font-mono font-bold tracking-wider uppercase">ANOMALY TRIGGER COEFFICIENT (Z-SCORE)</label>
          <div className="flex items-center space-x-2">
            <input
              id="num-stream-sensitivity"
              type="number"
              min="1.5"
              max="8.0"
              step="0.1"
              value={sensitivityInput}
              onChange={(e) => setSensitivityInput(parseFloat(e.target.value) || 2.8)}
              disabled={currentUser.role === 'Viewer'}
              className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-xs text-slate-200 focus:outline-none focus:border-red-500 font-mono"
            />
            <span className="text-xs text-slate-500 font-mono">std</span>
          </div>
        </div>

        {/* Save/Sync triggers */}
        <div className="flex flex-col justify-end space-y-1">
          {saveStatus && <span className="text-[10px] text-center font-mono text-emerald-400 mb-1">{saveStatus}</span>}
          <button
            id="btn-sync-simulation"
            onClick={handleUpdate}
            disabled={currentUser.role === 'Viewer'}
            className="w-full py-2.5 px-4 bg-slate-950 border border-slate-800 rounded text-slate-300 hover:text-slate-100 hover:border-slate-700 font-bold text-xs duration-150 cursor-pointer uppercase flex items-center justify-center space-x-1.5"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Apply Loop Constants</span>
          </button>
        </div>

      </div>

      {/* Advanced search and filters */}
      <div className="flex flex-col md:flex-row items-center gap-4 justify-between bg-slate-900/40 p-4 rounded-lg border border-slate-900">
        
        {/* Metric channels selection */}
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <label className="text-xs font-mono text-slate-500 font-semibold">CHANNEL:</label>
          <select
            id="select-filter-channel"
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 p-1.5 text-xs text-slate-300 font-mono rounded select-none cursor-pointer"
          >
            <option value="all">ALL STREAMS</option>
            {Object.entries(metricsInfo).map(([key, info]) => (
              <option key={key} value={key}>{info.name}</option>
            ))}
          </select>
        </div>

        {/* Search bar */}
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-500" />
          <input
            id="search-monitor-logs"
            type="text"
            placeholder="Search payload metrics..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 pl-8 pr-3 py-1.5 text-xs rounded text-slate-300 font-mono placeholder:text-slate-600 focus:outline-none focus:border-red-500"
          />
        </div>

        {/* Anomaly only toggle */}
        <div className="flex items-center space-x-2">
          <input
            id="checkbox-filter-anomalies"
            type="checkbox"
            checked={anomaliesOnly}
            onChange={() => setAnomaliesOnly(!anomaliesOnly)}
            className="accent-red-500 w-4 h-4 cursor-pointer"
          />
          <label htmlFor="checkbox-filter-anomalies" className="text-xs font-mono text-slate-400 font-semibold cursor-pointer select-none">
            FILTER DEVIATIONS ONLY
          </label>
        </div>

      </div>

      {/* Terminal Dense Table Logs */}
      <div className="flex-1 bg-slate-950/80 border border-slate-900 rounded-lg overflow-hidden flex flex-col justify-between max-h-[500px]">
        
        {/* Table/Header */}
        <div className="border-b border-slate-900 bg-slate-950/40 p-3 flex justify-between items-center text-[10px] font-mono font-bold tracking-wider text-slate-500">
          <div className="w-[18%]">TIMESTAMP</div>
          <div className="w-[20%]">METRIC VECTOR</div>
          <div className="w-[15%] text-right">VALUE</div>
          <div className="w-[20%] text-center">DEVIATION RANGE</div>
          <div className="w-[15%] text-right">Z-SCORE</div>
          <div className="w-[12%] text-center">ALARM</div>
        </div>

        {/* Live List Stream */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-900 font-mono text-xs">
          {filteredEvents.length > 0 ? (
            filteredEvents.map((e) => {
              const info = metricsInfo[e.metricType] || { name: e.metricType, icon: Activity, color: 'text-slate-400', unit: '' };
              const Icon = info.icon;

              return (
                <div 
                  key={e.id} 
                  id={`log-entry-${e.id}`}
                  className={`p-3 flex justify-between items-center duration-100 ${
                    e.isAnomaly 
                      ? 'bg-red-500/5 hover:bg-red-500/10 border-l border-red-500/50 text-red-500' 
                      : 'hover:bg-slate-900/30 text-slate-300'
                  }`}
                >
                  <span className="w-[18%] text-[11px] text-slate-500">
                    {new Date(e.timestamp).toLocaleTimeString()}
                  </span>
                  <div className="w-[20%] flex items-center space-x-1.5">
                    <Icon className="w-3.5 h-3.5 opacity-60 text-slate-400" />
                    <span className="truncate">{info.name}</span>
                  </div>
                  <span className="w-[15%] text-right font-bold font-mono">
                    {e.value}
                    <span className="text-[10px] font-normal text-slate-500 ml-0.5">{info.unit}</span>
                  </span>
                  <div className="w-[20%] text-center text-[10px] text-slate-500 truncate">
                    {e.baselineMean ? `${e.baselineMean} ± ${e.baselineStd}` : 'Awaiting baseline...'}
                  </div>
                  <span className={`w-[15%] text-right font-bold font-mono ${e.isAnomaly ? 'text-red-400' : 'text-slate-500'}`}>
                    {e.anomalyScore ? `${e.anomalyScore}z` : '0.00z'}
                  </span>
                  <div className="w-[12%] flex items-center justify-center">
                    {e.isAnomaly ? (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-600/15 border border-red-500/30 text-red-400 animate-pulse">
                        ALARM
                      </span>
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-800"></span>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-slate-600 text-xs">
              No continuous stream data matched the current query criteria. Check active channels or start simulation.
            </div>
          )}
        </div>

        {/* Footer info counts */}
        <div className="p-3 bg-slate-950 border-t border-slate-900 text-[10px] font-mono text-slate-600 flex justify-between items-center rounded-b-lg">
          <span>Telemetry Record Pool: {filteredEvents.length} items parsed</span>
          <span>Simulation Buffer Status: STABLE</span>
        </div>

      </div>

    </div>
  );
}
