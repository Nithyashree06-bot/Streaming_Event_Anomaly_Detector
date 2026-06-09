/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { 
  AlertOctagon, 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  Brain, 
  MessageSquare, 
  User, 
  Layers, 
  FileText,
  Activity,
  Cpu,
  Database,
  ShieldCheck,
  TrendingUp,
  X
} from 'lucide-react';
import { Anomaly, UserRole, MetricType, AnomalyStatus } from '../types.js';

interface ExplorerProps {
  currentUser: { name: string; role: UserRole };
  anomalies: Anomaly[];
  onUpdateStatus: (id: string, status: AnomalyStatus, note: string) => void;
  geminiApiKeyConfigured: boolean;
}

export default function ExplorerView({
  currentUser,
  anomalies,
  onUpdateStatus,
  geminiApiKeyConfigured
}: ExplorerProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<MetricType | 'all'>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Modal / Drawer state for AI analysis
  const [aiReportModelOpen, setAiReportModelOpen] = useState(false);
  const [targetAnomId, setTargetAnomId] = useState<string>('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiText, setAiText] = useState('');

  // Troubleshooting form note state
  const [customNote, setCustomNote] = useState('');
  const [revisedStatus, setRevisedStatus] = useState<AnomalyStatus>('Active');

  const metricsInfo: Record<MetricType, { name: string; icon: any; color: string; unit: string }> = {
    api_latency: { name: 'API Latency', icon: Activity, color: 'text-sky-400', unit: 'ms' },
    auth_failures: { name: 'Auth Failure Rates', icon: ShieldCheck, color: 'text-amber-400', unit: '/s' },
    db_connections: { name: 'DB Connection Load', icon: Database, color: 'text-indigo-400', unit: '%' },
    cpu_usage: { name: 'Cluster CPU Cores', icon: Cpu, color: 'text-emerald-400', unit: '%' },
    payment_volume: { name: 'Transaction Velocity', icon: TrendingUp, color: 'text-rose-400', unit: 'rps' }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'High': return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
      case 'Medium': return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'Low': return 'bg-sky-500/10 text-sky-400 border-sky-500/30';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    }
  };

  const getStatusColor = (status: AnomalyStatus) => {
    switch (status) {
      case 'Active': return 'bg-red-500/10 text-red-500 border-red-500/50';
      case 'Investigating': return 'bg-amber-500/10 text-amber-550 text-amber-400 border-amber-500/50';
      case 'Resolved': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/50';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/50';
    }
  };

  // Launch Gemini to Analyze specific anomaly
  const triggerAiExplain = async (anom: Anomaly) => {
    setAiLoading(true);
    setAiText('');
    setTargetAnomId(anom.id);
    setAiReportModelOpen(true);

    try {
      const token = localStorage.getItem('anomaly_secure_token');
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          detailedAnomaly: anom
        })
      });

      const data = await response.json();
      setAiText(data.summary || 'Failed to retreive explanation.');
    } catch (e: any) {
      setAiText(`Failed to interface with neural engine: ${e.message}`);
    } finally {
      setAiLoading(false);
    }
  };

  // Action status revisions (Save note + change state)
  const handleSubmitRevision = (id: string) => {
    if (currentUser.role === 'Viewer') {
      alert('Security Policy Alert: Viewers do not have roles authorization to modify trace records.');
      return;
    }
    onUpdateStatus(id, revisedStatus, customNote);
    setCustomNote('');
    setExpandedId(null);
  };

  // Filter List anomalies
  const filteredAnoms = anomalies.filter(a => {
    const matchesMetric = selectedMetric === 'all' || a.metricType === selectedMetric;
    const matchesSeverity = selectedSeverity === 'all' || a.severity === selectedSeverity;
    const matchesStatus = selectedStatus === 'all' || a.status === selectedStatus;

    return matchesMetric && matchesSeverity && matchesStatus;
  });

  return (
    <div id="explorer-view-container" className="flex-1 p-6 overflow-y-auto bg-slate-950 font-sans flex flex-col space-y-6">
      
      {/* Title */}
      <div className="border-b border-slate-900 pb-5">
        <h2 className="text-xl font-bold tracking-tight text-white flex items-center space-x-2">
          <span>Anomaly Explorer Console</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Review, analyze, and resolve statistical deviation events. Use our AI Copilot to immediately explain root causes.
        </p>
      </div>

      {/* Advanced filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-900/40 p-4 rounded-lg border border-slate-900">
        
        {/* Metric selection thread */}
        <div className="space-y-1.5">
          <label className="text-[10px] text-slate-500 font-mono font-bold tracking-wider uppercase">THREAD VECTOR</label>
          <select
            id="select-explorer-metric"
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value as any)}
            className="w-full bg-slate-950 border border-slate-800 p-2 text-xs text-slate-300 font-mono rounded cursor-pointer"
          >
            <option value="all">ALL TELEMETRY THREADS</option>
            {Object.entries(metricsInfo).map(([key, info]) => (
              <option key={key} value={key}>{info.name}</option>
            ))}
          </select>
        </div>

        {/* Severity selection */}
        <div className="space-y-1.5">
          <label className="text-[10px] text-slate-500 font-mono font-bold tracking-wider uppercase">ALARMS SEVERITY</label>
          <select
            id="select-explorer-severity"
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 p-2 text-xs text-slate-300 font-mono rounded cursor-pointer"
          >
            <option value="all">ALL SEVERITY LEVELS</option>
            <option value="Critical">Critical Threats</option>
            <option value="High">High Deviations</option>
            <option value="Medium">Medium Fluctuations</option>
            <option value="Low">Low Spikes</option>
          </select>
        </div>

        {/* Status filtration */}
        <div className="space-y-1.5">
          <label className="text-[10px] text-slate-500 font-mono font-bold tracking-wider uppercase">ALARM STATUS</label>
          <select
            id="select-explorer-status"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 p-2 text-xs text-slate-300 font-mono rounded cursor-pointer"
          >
            <option value="all">ALL STATES</option>
            <option value="Active">Active Alms</option>
            <option value="Investigating">Investigating Traces</option>
            <option value="Resolved">Resolved Issues</option>
            <option value="False Positive">False Positives</option>
          </select>
        </div>

      </div>

      {/* Anomalies List */}
      <div className="space-y-3">
        {filteredAnoms.length > 0 ? (
          filteredAnoms.map((anom) => {
            const isExpanded = expandedId === anom.id;
            const info = metricsInfo[anom.metricType] || { name: anom.metricType, icon: AlertOctagon, color: 'text-slate-400', unit: '' };
            const Icon = info.icon;

            return (
              <div 
                key={anom.id}
                id={`anomaly-card-${anom.id}`}
                className={`bg-slate-900 border ${
                  isExpanded ? 'border-indigo-500/40 bg-slate-900/60' : 'border-slate-800 hover:border-slate-700'
                } rounded-lg duration-150 overflow-hidden shadow-sm`}
              >
                {/* Header section */}
                <div 
                  onClick={() => {
                    setExpandedId(isExpanded ? null : anom.id);
                    if (!isExpanded) {
                      setRevisedStatus(anom.status);
                    }
                  }}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none"
                >
                  <div className="flex items-center space-x-3.5">
                    <div className="p-2 bg-slate-950 border border-slate-800 rounded">
                      <Icon className={`w-4 h-4 ${info.color}`} />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold font-mono text-slate-100">{info.name} Spike</span>
                        <span className={`px-2 py-0.5 text-[9px] font-bold font-mono rounded border ${getSeverityBadge(anom.severity)}`}>
                          {anom.severity}
                        </span>
                        <span className={`px-2 py-0.5 text-[9px] font-bold font-mono rounded border ${getStatusColor(anom.status)}`}>
                          {anom.status}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-[10px] text-slate-500 font-mono mt-1">
                        <Clock className="w-3 h-3 text-slate-600" />
                        <span>{new Date(anom.timestamp).toLocaleString()}</span>
                        <span>•</span>
                        <span>ID: {anom.id}</span>
                      </div>
                    </div>
                  </div>

                  {/* Math deviation counters */}
                  <div className="flex items-center space-x-6">
                    <div className="text-right font-mono">
                      <p className="text-[10px] text-slate-500 uppercase tracking-wide">MEASURED</p>
                      <h4 className="text-sm font-bold text-slate-200">
                        {anom.value}
                        <span className="text-[10px] text-slate-400 font-normal ml-0.5">{info.unit}</span>
                      </h4>
                    </div>

                    <div className="text-right font-mono hidden md:block">
                      <p className="text-[10px] text-slate-500 uppercase tracking-wide">DEVIATION</p>
                      <h4 className={`text-sm font-bold ${anom.deviationPercentage > 0 ? 'text-red-400' : 'text-sky-400'}`}>
                        {anom.deviationPercentage > 0 ? `+${anom.deviationPercentage}` : anom.deviationPercentage}%
                      </h4>
                    </div>

                    <div className="p-1 rounded hover:bg-slate-850">
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Detailed view */}
                {isExpanded && (
                  <div className="border-t border-slate-800 bg-slate-950/40 p-5 space-y-6">
                    
                    {/* Deep Statistics Math Matrix */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      
                      <div className="p-3 bg-slate-950 border border-slate-900 rounded">
                        <span className="text-[10px] text-slate-600 font-mono font-semibold uppercase tracking-wider block">Expected Rolling Baseline</span>
                        <span className="text-sm font-mono font-bold text-slate-300 mt-1 block">
                          {anom.expectedValue} <span className="text-[11px] font-normal text-slate-500">{info.unit}</span>
                        </span>
                        <p className="text-[9px] text-slate-500 font-mono mt-1">Calculated rolling mean (μ) of previous sliding logs.</p>
                      </div>

                      <div className="p-3 bg-slate-950 border border-slate-900 rounded">
                        <span className="text-[10px] text-slate-600 font-mono font-semibold uppercase tracking-wider block">Standard Deviation Width</span>
                        <span className="text-sm font-mono font-bold text-slate-300 mt-1 block">
                          ± {anom.metricsAtTime.std} <span className="text-[11px] font-normal text-slate-500">{info.unit}</span>
                        </span>
                        <p className="text-[9px] text-slate-500 font-mono mt-1">Dispersion sigma index (σ) of rolling baseline sample size.</p>
                      </div>

                      <div className="p-3 bg-slate-950 border border-slate-900 rounded">
                        <span className="text-[10px] text-slate-600 font-mono font-semibold uppercase tracking-wider block">Triggering Z-Score Gauge</span>
                        <span className="text-sm font-mono font-bold text-red-400 mt-1 block">
                          {anom.metricsAtTime.zScore} σ-units
                        </span>
                        <p className="text-[9px] text-slate-500 font-mono mt-1">Number of standard deviations from normal. Alarm threshold: 2.8.</p>
                      </div>

                    </div>

                    {/* Operational controls and timeline log */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
                      
                      {/* Interactive form to revise status */}
                      <div className="space-y-4">
                        <h4 className="text-xs font-bold font-mono tracking-wider text-slate-300 uppercase border-b border-slate-900 pb-1.5 flex items-center space-x-1.5">
                          <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                          <span>INVESTIGATION LOG & AUDIT LOG ACTIONS</span>
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-semibold block">REVISE STATE</label>
                            <select
                              id={`select-status-${anom.id}`}
                              value={revisedStatus}
                              onChange={(e) => setRevisedStatus(e.target.value as AnomalyStatus)}
                              disabled={currentUser.role === 'Viewer'}
                              className="w-full bg-slate-950 border border-slate-800 p-2 text-xs text-slate-300 font-mono rounded focus:border-red-500 focus:outline-none select-none cursor-pointer"
                            >
                              <option value="Active">Active (Unresolved Alert)</option>
                              <option value="Investigating">Under Investigation</option>
                              <option value="Resolved">Resolved Issues</option>
                              <option value="False Positive">False Positive Flare</option>
                            </select>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-semibold block">ASSIGNED OPERATOR</label>
                            <span className="w-full bg-slate-950/60 border border-slate-900 px-3 py-2 text-xs text-slate-400 font-mono rounded block truncate">
                              @operator-01 (Lead Operative)
                            </span>
                          </div>
                        </div>

                        {/* Mitigation description note */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-semibold block">SOP MITIGATION NOTES</label>
                          <textarea
                            id={`textarea-notes-${anom.id}`}
                            value={customNote}
                            onChange={(e) => setCustomNote(e.target.value)}
                            disabled={currentUser.role === 'Viewer'}
                            placeholder="Detail underlying causes or cluster resolution logs..."
                            className="w-full h-16 bg-slate-900 border border-slate-800 p-2 text-xs text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-red-500 rounded font-mono"
                          />
                        </div>

                        <div className="flex justify-between items-center flex-wrap pt-1 gap-2">
                          
                          {/* Brain Gemini trigger button */}
                          <button
                            id={`btn-gemini-analyze-${anom.id}`}
                            onClick={() => triggerAiExplain(anom)}
                            className="bg-indigo-600 hover:bg-indigo-500 hover:shadow-indigo-900/10 text-white font-bold text-xs px-4 py-2 rounded duration-200 shadow-md flex items-center space-x-2 cursor-pointer uppercase"
                          >
                            <Brain className="w-3.5 h-3.5" />
                            <span>CO-PILOT AI TRACE ANALYSIS</span>
                          </button>

                          <button
                            id={`btn-submit-revision-${anom.id}`}
                            onClick={() => handleSubmitRevision(anom.id)}
                            disabled={currentUser.role === 'Viewer'}
                            className="bg-slate-100 hover:bg-white text-slate-950 font-bold text-xs px-4 py-2 rounded duration-150 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed uppercase"
                          >
                            Submit logs
                          </button>
                        </div>
                      </div>

                      {/* Notes Logs chronological panel */}
                      <div className="space-y-3 flex flex-col justify-between">
                        <div className="space-y-2">
                          <h4 className="text-xs font-bold font-mono tracking-wider text-slate-300 uppercase border-b border-slate-900 pb-1.5 flex items-center space-x-1.5">
                            <Clock className="w-3.5 h-3.5 text-emerald-400" />
                            <span>CHRONOLOGICAL AUDIT TIMELINE</span>
                          </h4>
                          <div className="space-y-2 overflow-y-auto max-h-[160px] pr-1 scrollbar-thin">
                            {anom.notes.map((note, index) => (
                              <div key={index} className="text-[11px] font-mono text-slate-400 bg-slate-950/75 p-2 rounded border border-slate-900">
                                {note}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="p-2.5 rounded bg-slate-950 border border-slate-900 flex justify-between items-center text-[10px] font-mono text-slate-500">
                          <span>ALM CONFIDENCE: {anom.confidenceScore}%</span>
                          <span>THRESHOLD SIGMA: {anom.metricsAtTime.zScore}z</span>
                        </div>
                      </div>

                    </div>

                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-lg text-center text-slate-500 text-xs font-mono">
            No statistical anomaly registers found matching of the selected dashboard parameters.
          </div>
        )}
      </div>

      {/* AI Explain Modal */}
      {aiReportModelOpen && (
        <div id="ai-modal-overlay" className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div id="ai-modal-box" className="w-full max-w-2xl bg-slate-900 border border-slate-850 rounded-lg overflow-hidden flex flex-col max-h-[80vh] shadow-2xl animate-in fade-in zoom-in duration-205">
            
            {/* Header */}
            <div className="p-4 border-b border-slate-850 flex items-center justify-between bg-slate-950/50">
              <div className="flex items-center space-x-2 text-indigo-400">
                <Brain className="w-5 h-5" />
                <h3 className="text-xs font-bold tracking-wider font-mono uppercase">NEURAL CO-PILOT AI FORENSIC ANALYSIS</h3>
              </div>
              <button 
                onClick={() => setAiReportModelOpen(false)}
                className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Markdown Text Body */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4 font-mono text-xs select-text">
              {aiLoading ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-3">
                  <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin"></div>
                  <p className="text-xs text-indigo-400 font-mono tracking-wider animate-pulse">Consulting Gemini Neural Core logs...</p>
                </div>
              ) : (
                <div className="text-slate-300 leading-relaxed whitespace-pre-wrap select-text markdown-body">
                  {aiText}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-slate-850 bg-slate-950/50 flex justify-between items-center text-[10px] font-mono text-slate-500">
              <span>MODEL ID: {geminiApiKeyConfigured ? 'gemini-3.5-flash / Telemetry' : 'Heuristic Engine (Offline Key fallback)'}</span>
              <button 
                onClick={() => setAiReportModelOpen(false)}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-705 text-slate-200 hover:text-white rounded border border-slate-700 duration-150 cursor-pointer uppercase text-[10px] font-bold"
              >
                Close Trace Report
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
export type { AnomalyStatus };
