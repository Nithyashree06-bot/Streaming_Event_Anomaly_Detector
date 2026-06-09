/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Brain, FileText, BarChart3, TrendingUp, AlertTriangle, Cpu, Sparkles, AlertOctagon, RefreshCw } from 'lucide-react';
import { User, Anomaly, StreamEvent, MetricType } from '../types.js';

interface AnalyticsProps {
  currentUser: User;
  anomalies: Anomaly[];
  events: StreamEvent[];
  geminiApiKeyConfigured: boolean;
}

export default function AnalyticsView({
  currentUser,
  anomalies,
  events,
  geminiApiKeyConfigured
}: AnalyticsProps) {
  const [reportText, setReportText] = useState<string>('');
  const [generating, setGenerating] = useState<boolean>(false);

  const activeAnoms = anomalies.filter(a => a.status === 'Active' || a.status === 'Investigating');
  const criticalCount = anomalies.filter(a => a.severity === 'Critical').length;
  const highCount = anomalies.filter(a => a.severity === 'High').length;

  const handleGenerateReport = async () => {
    setGenerating(true);
    setReportText('');

    try {
      const token = localStorage.getItem('anomaly_secure_token');
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          summaryType: 'overall_report'
        })
      });

      const data = await response.json();
      setReportText(data.summary || 'Summary could not be established.');
    } catch (e: any) {
      setReportText(`Operational failure during neural analysis: ${e.message}`);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div id="analytics-view-container" className="flex-1 p-6 overflow-y-auto bg-slate-950 font-sans flex flex-col space-y-6">
      
      {/* Title */}
      <div className="border-b border-slate-900 pb-5">
        <h2 className="text-xl font-bold tracking-tight text-white flex items-center space-x-2">
          <span>Neural AI Analytics</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Deep diagnostic insights. Generate server-wide reports using our integrated Gemini AI Copilot.
        </p>
      </div>

      {/* Advanced performance KPI cards row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="bg-slate-900 border border-slate-850 p-4 rounded-lg font-mono">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">ANOMALY DENSITY FRACTION</span>
          <div className="flex items-baseline space-x-1.5 mt-2">
            <span className="text-2xl font-bold text-red-400">
              {events.length > 0 ? ((anomalies.length / events.length) * 100).toFixed(2) : '0.00'} %
            </span>
            <span className="text-xs text-slate-500 font-normal">of metrics flag anomaly</span>
          </div>
          <div className="w-full bg-slate-950 h-1.5 rounded mt-3.5">
            <div 
              className="bg-red-500 h-full duration-500" 
              style={{ width: `${events.length > 0 ? (anomalies.length / events.length) * 100 : 0}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-850 p-4 rounded-lg font-mono">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">MEAN TIME TO DEVIATE (MTTD)</span>
          <div className="flex items-baseline space-x-1.5 mt-2">
            <span className="text-2xl font-bold text-slate-100">~ 18.5 sec</span>
            <span className="text-xs text-slate-500 font-normal">frequency window</span>
          </div>
          <div className="w-full bg-slate-950 h-1.5 rounded mt-3.5">
            <div className="bg-indigo-500 h-full" style={{ width: '65%' }}></div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-850 p-4 rounded-lg font-mono">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">CLUSTER THREAT SEVENTIES LEVEL</span>
          <div className="flex items-baseline space-x-1.5 mt-2">
            <span className={`text-2xl font-bold ${criticalCount > 0 ? 'text-red-500' : 'text-emerald-400'}`}>
              {criticalCount > 0 ? 'CRITICAL RISK' : 'STABLE BASELINE'}
            </span>
          </div>
          <div className="w-full bg-slate-950 h-1.5 rounded mt-3.5 flex overflow-hidden">
            <div className="bg-red-500 h-full" style={{ width: `${criticalCount * 10}%` }}></div>
            <div className="bg-orange-500 h-full" style={{ width: `${highCount * 10}%` }}></div>
            <div className="bg-emerald-500 h-full flex-1"></div>
          </div>
        </div>

      </div>

      {/* Report generation panel */}
      <div className="bg-slate-900 border border-slate-850 p-5 rounded-lg flex flex-col justify-between space-y-4">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-850 pb-4">
          <div className="space-y-1">
            <h3 className="text-xs font-semibold text-slate-100 tracking-wider font-mono uppercase flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>GEMINI ANALYTICS COPILOT & AUDIT REPORT GENERATOR</span>
            </h3>
            <p className="text-xs text-slate-500">
              Summarize system baseline telemetry, identify cross-stream correlations, and compile remediation protocols automatically.
            </p>
          </div>

          <button
            id="btn-generate-ai-report"
            onClick={handleGenerateReport}
            disabled={generating}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-xs rounded duration-200 shadow shadow-indigo-950 flex items-center space-x-2 cursor-pointer uppercase select-none"
          >
            <Brain className="w-4 h-4 text-emerald-300" />
            <span>{generating ? 'CONSULTING NEURAL CORES...' : 'COMPILE SYSTEM AI REPORT'}</span>
          </button>
        </div>

        {/* Output window representing full audit report */}
        <div className="flex-1 min-h-[300px] bg-slate-950/70 border border-slate-900 rounded-lg p-5 flex flex-col justify-start relative select-text">
          {reportText ? (
            <div className="space-y-4 font-mono text-xs text-slate-300 leading-relaxed max-w-none prose prose-invert overflow-y-auto max-h-[450px] pr-2 select-text text-left markdown-body">
              {reportText}
            </div>
          ) : generating ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
              <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin"></div>
              <p className="text-xs text-indigo-400 font-mono tracking-widest animate-pulse uppercase">Ingesting sliding windows metrics...</p>
            </div>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3.5 text-center px-4">
              <FileText className="w-8 h-8 text-slate-700 animate-pulse" />
              <div>
                <p className="text-xs text-slate-400 font-bold font-mono">REPORT BUFFER STABLE</p>
                <p className="text-[11px] text-slate-600 font-mono mt-1 max-w-md">
                  Click 'COMPILE SYSTEM AI REPORT' to assemble deep multi-thread analytics. Report parses recent deviations, threat severities, and assigns priority SOP mitigation workflows.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Report parameters metadata */}
        <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 pt-2 flex-wrap gap-2">
          <span>AI Engine: Gemini 3.5 Flash via Server Proxy</span>
          <span>Security Context: Role Authority {currentUser.role} Linked</span>
        </div>

      </div>

    </div>
  );
}
export type { StreamEvent };
