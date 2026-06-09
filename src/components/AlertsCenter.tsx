/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle, HelpCircle, Activity, Cpu, Database, ShieldCheck, TrendingUp, Clock, FileWarning } from 'lucide-react';
import { Anomaly, UserRole, MetricType, AnomalyStatus } from '../types.js';

interface AlertsCenterProps {
  currentUser: { name: string; role: UserRole };
  anomalies: Anomaly[];
  onUpdateStatus: (id: string, status: AnomalyStatus, note: string) => void;
}

export default function AlertsCenter({
  currentUser,
  anomalies,
  onUpdateStatus
}: AlertsCenterProps) {
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedChannel, setSelectedChannel] = useState<MetricType | 'all'>('all');
  const [quickResolutionNote, setQuickResolutionNote] = useState<Record<string, string>>({});

  const metricsInfo: Record<MetricType, { name: string; icon: any; color: string; unit: string }> = {
    api_latency: { name: 'API Latency', icon: Activity, color: 'text-sky-400', unit: 'ms' },
    auth_failures: { name: 'Auth Failure Rates', icon: ShieldCheck, color: 'text-amber-400', unit: '/s' },
    db_connections: { name: 'DB Connection Load', icon: Database, color: 'text-indigo-400', unit: '%' },
    cpu_usage: { name: 'Cluster CPU Cores', icon: Cpu, color: 'text-emerald-400', unit: '%' },
    payment_volume: { name: 'Transaction Velocity', icon: TrendingUp, color: 'text-rose-400', unit: 'rps' }
  };

  const activeAlerts = anomalies.filter(a => a.status === 'Active' || a.status === 'Investigating');

  const getSeverityColor = (sev: string) => {
    switch (sev) {
      case 'Critical': return 'text-red-500 bg-red-500/10 border-red-500/25';
      case 'High': return 'text-orange-500 bg-orange-500/10 border-orange-500/25';
      case 'Medium': return 'text-amber-400 bg-amber-500/10 border-amber-500/25';
      default: return 'text-sky-400 bg-sky-500/10 border-sky-500/25';
    }
  };

  const handleAction = (id: string, status: AnomalyStatus) => {
    if (currentUser.role === 'Viewer') {
      alert('Security Policy Alert: Viewers do not have security roles permissions to alter alarm status.');
      return;
    }
    const note = quickResolutionNote[id] || '';
    onUpdateStatus(id, status, note || `Toggled state to ${status}.`);
    // Clear form notes
    setQuickResolutionNote(prev => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  // Filter Active alarms
  const filteredAlerts = activeAlerts.filter(a => {
    const matchesSeverity = selectedSeverity === 'all' || a.severity === selectedSeverity;
    const matchesChannel = selectedChannel === 'all' || a.metricType === selectedChannel;
    return matchesSeverity && matchesChannel;
  });

  return (
    <div id="alerts-center-container" className="flex-1 p-6 overflow-y-auto bg-slate-950 font-sans flex flex-col space-y-6">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-900 pb-5">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <span>Operational Alerts Center</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time critical threat monitors. Operator intervention triage board.
          </p>
        </div>

        {/* Dynamic Unresolved alarm counters */}
        <div className="flex items-center space-x-3 text-xs bg-slate-900 border border-slate-800 px-3 py-2 rounded-lg">
          <span className="flex items-center space-x-1.5 font-mono text-red-400 font-bold">
            <ShieldAlert className="w-4 h-4" />
            <span>{activeAlerts.length} UNRESOLVED ALARMS</span>
          </span>
        </div>
      </div>

      {/* Advanced Filters ROW */}
      <div className="flex flex-col sm:flex-row items-center gap-4 justify-between bg-slate-900/40 p-4 rounded-lg border border-slate-900">
        
        {/* Severity selection */}
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <label className="text-xs font-mono text-slate-500 font-semibold uppercase">SEVERITY LEVEL:</label>
          <select
            id="select-alert-severity"
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="bg-slate-950 border border-slate-800 p-2 text-xs text-slate-300 font-mono rounded select-none cursor-pointer"
          >
            <option value="all">ALL DEVIATIONS</option>
            <option value="Critical">Critical Threats</option>
            <option value="High">High Priorities</option>
            <option value="Medium">Medium Alarms</option>
            <option value="Low">Low Fluctuations</option>
          </select>
        </div>

        {/* Metric selection channels */}
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <label className="text-xs font-mono text-slate-500 font-semibold uppercase">METRIC STREAM:</label>
          <select
            id="select-alert-channel"
            value={selectedChannel}
            onChange={(e) => setSelectedChannel(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 p-2 text-xs text-slate-300 font-mono rounded select-none cursor-pointer"
          >
            <option value="all">ALL VECTORS</option>
            {Object.entries(metricsInfo).map(([key, info]) => (
              <option key={key} value={key}>{info.name}</option>
            ))}
          </select>
        </div>

      </div>

      {/* Unresolved Alarm List Card board */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map((alert) => {
            const info = metricsInfo[alert.metricType] || { name: alert.metricType, icon: AlertTriangle, unit: '' };
            const Icon = info.icon;

            return (
              <div 
                key={alert.id}
                id={`alert-board-card-${alert.id}`}
                className="bg-slate-900 border border-slate-850 p-4 rounded-lg flex flex-col justify-between space-y-4 shadow-sm relative overflow-hidden"
              >
                {/* Color flash glow strip on left side inside critical limits */}
                <div className={`absolute top-0 bottom-0 left-0 w-1.5 ${
                  alert.severity === 'Critical' ? 'bg-red-500 shadow-[0_0_8px_#ef4444]' : 
                  alert.severity === 'High' ? 'bg-orange-500 shadow-[0_0_8px_#f97316]' : 
                  alert.severity === 'Medium' ? 'bg-amber-400' : 'bg-sky-500'
                }`}></div>

                {/* Header */}
                <div className="flex justify-between items-start pl-2">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-slate-950 border border-slate-850 rounded">
                      <Icon className="w-4 h-4 text-slate-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-100 flex items-center space-x-1.5">
                        <span>{info.name}</span>
                        <span className={`px-2 py-0.5 text-[8px] font-bold font-mono rounded border ${getSeverityColor(alert.severity)}`}>
                          {alert.severity}
                        </span>
                      </h4>
                      <p className="text-[10px] text-slate-500 font-mono mt-1 flex items-center space-x-1.5">
                        <Clock className="w-3 h-3 text-slate-600" />
                        <span>{new Date(alert.timestamp).toLocaleString()}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right font-mono">
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">STATE</span>
                    <span className={`text-[10px] uppercase font-bold font-mono ${alert.status === 'Investigating' ? 'text-amber-400' : 'text-red-400'}`}>
                      • {alert.status}
                    </span>
                  </div>
                </div>

                {/* Middle Math block */}
                <div className="bg-slate-950 border border-slate-850/60 p-3 rounded-md grid grid-cols-3 gap-2 text-center pl-4">
                  <div className="font-mono">
                    <span className="text-[8px] text-slate-500 uppercase font-semibold">Live Value</span>
                    <span className="text-xs font-bold text-slate-200 block mt-0.5">{alert.value}{info.unit}</span>
                  </div>
                  <div className="font-mono border-x border-slate-900">
                    <span className="text-[8px] text-slate-500 uppercase font-semibold">Normal Baseline</span>
                    <span className="text-xs font-bold text-slate-400 block mt-0.5">{alert.expectedValue}{info.unit}</span>
                  </div>
                  <div className="font-mono">
                    <span className="text-[8px] text-slate-500 uppercase font-semibold">Z-Score</span>
                    <span className="text-xs font-bold text-red-400 block mt-0.5">{alert.metricsAtTime.zScore}z</span>
                  </div>
                </div>

                {/* Mitigation Forms notes */}
                <div className="space-y-2 pl-2">
                  <input
                    id={`input-alert-note-${alert.id}`}
                    type="text"
                    placeholder="Enter quick triage logs / mitigation steps..."
                    value={quickResolutionNote[alert.id] || ''}
                    onChange={(e) => setQuickResolutionNote(prev => ({ ...prev, [alert.id]: e.target.value }))}
                    disabled={currentUser.role === 'Viewer'}
                    className="w-full bg-slate-950 border border-slate-800 p-2 text-xs placeholder:text-slate-600 focus:outline-none focus:border-red-500 rounded font-mono text-slate-300"
                  />

                  {/* Operational triage button triggers */}
                  <div className="flex gap-2 justify-end pt-1 flex-wrap">
                    {alert.status === 'Active' && (
                      <button
                        id={`btn-ack-alert-${alert.id}`}
                        onClick={() => handleAction(alert.id, 'Investigating')}
                        disabled={currentUser.role === 'Viewer'}
                        className="px-3 py-1.5 bg-amber-600/20 hover:bg-amber-600/35 border border-amber-500/30 text-amber-400 font-bold text-[10px] font-mono rounded duration-150 cursor-pointer uppercase"
                      >
                        Acknowledge
                      </button>
                    )}
                    <button
                      id={`btn-resolve-alert-${alert.id}`}
                      onClick={() => handleAction(alert.id, 'Resolved')}
                      disabled={currentUser.role === 'Viewer'}
                      className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/35 border border-emerald-500/30 text-emerald-400 font-bold text-[10px] font-mono rounded duration-150 cursor-pointer uppercase"
                    >
                      Resolve Alarm
                    </button>
                    <button
                      id={`btn-dismiss-alert-${alert.id}`}
                      onClick={() => handleAction(alert.id, 'False Positive')}
                      disabled={currentUser.role === 'Viewer'}
                      className="px-3 py-1.5 bg-slate-950 hover:bg-slate-850 text-slate-400 font-bold text-[10px] font-mono rounded duration-150 border border-slate-800 cursor-pointer uppercase"
                    >
                      False Positive
                    </button>
                  </div>
                </div>

              </div>
            );
          })
        ) : (
          <div className="col-span-1 lg:col-span-2 bg-slate-900 border border-slate-850 p-8 rounded-lg text-center text-slate-500 text-xs font-mono">
            Awesome! All alarm queues resolved. No active operational alert alerts.
          </div>
        )}
      </div>

    </div>
  );
}
export type { Anomaly };
