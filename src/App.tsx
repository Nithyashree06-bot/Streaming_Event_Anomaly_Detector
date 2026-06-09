/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  User, 
  DashboardMetrics, 
  Anomaly, 
  StreamEvent, 
  SystemSettings, 
  MetricType, 
  AnomalyStatus 
} from './types.js';

import Sidebar from './components/Sidebar.js';
import LoginView from './components/LoginView.js';
import DashboardView from './components/DashboardView.js';
import MonitorView from './components/MonitorView.js';
import ExplorerView from './components/ExplorerView.js';
import AlertsCenter from './components/AlertsCenter.js';
import AnalyticsView from './components/AnalyticsView.js';
import UserManagement from './components/UserManagement.js';
import SettingsView from './components/SettingsView.js';

export default function App() {
  // Authentication states
  const [token, setToken] = useState<string | null>(localStorage.getItem('anomaly_secure_token'));
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  // Operational state
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [stats, setStats] = useState<DashboardMetrics>({
    totalEventsProcessed: 0,
    activeStreamsCount: 0,
    detectedAnomaliesCount: 0,
    activeAlertsCount: 0,
    avgConfidence: 0,
    ingestionRate: 0
  });

  const [events, setEvents] = useState<StreamEvent[]>([]);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [streamRunning, setStreamRunning] = useState<boolean>(true);
  const [settings, setSettings] = useState<SystemSettings>({
    detectionSensitiveZScore: 2.8,
    rollingWindowSize: 50,
    streamIntervalMs: 1000,
    autoResolveDurationMin: 15,
    authPasscodeMinLength: 6,
    maxSessionIdleMs: 600000
  });

  // Verify active JWT and load user context
  const verifyMe = async (activeToken: string) => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${activeToken}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
      } else {
        // Token expired/invalid
        handleLogout();
      }
    } catch {
      handleLogout();
    } finally {
      setAuthLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      verifyMe(token);
    } else {
      setAuthLoading(false);
    }
  }, [token]);

  // Main system loading calls
  const fetchBaseData = async () => {
    if (!token) return;
    try {
      const headers = { 'Authorization': `Bearer ${token}` };

      // Dashboard Stats
      const statsRes = await fetch('/api/dashboard/stats', { headers });
      if (statsRes.ok) {
        const sData = await statsRes.json();
        setStats(sData);
      }

      // Initial Events
      const eventsRes = await fetch('/api/events?limit=200', { headers });
      if (eventsRes.ok) {
        const eData = await eventsRes.json();
        setEvents(eData.reverse()); // Put newest last for standard chronological feed order
      }

      // Initial Anomalies
      const anomsRes = await fetch('/api/anomalies', { headers });
      if (anomsRes.ok) {
        const aData = await anomsRes.json();
        setAnomalies(aData);
      }
    } catch (err) {
      console.error('Error fetching baseline telemetries:', err);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchBaseData();
    }
  }, [currentUser]);

  // Subscribe to real-time Server-Sent Events (SSE) stream links
  useEffect(() => {
    if (!token || !currentUser) return;

    // Secure authentication parameters passed in URL query
    const sse = new EventSource(`/api/stream/live?token=${token}`);

    sse.addEventListener('metric_event', (e: any) => {
      const newEvent = JSON.parse(e.data) as StreamEvent;
      
      setEvents(prev => {
        const updated = [...prev, newEvent];
        return updated.slice(-600); // cap size in memory
      });

      // Optimistic update rate count locally
      setStats(prev => ({
        ...prev,
        totalEventsProcessed: prev.totalEventsProcessed + 1
      }));
    });

    sse.addEventListener('anomaly_alert', (e: any) => {
      const newAnomaly = JSON.parse(e.data) as Anomaly;
      
      setAnomalies(prev => [newAnomaly, ...prev]);

      // Highlight stats metrics
      setStats(prev => ({
        ...prev,
        detectedAnomaliesCount: prev.detectedAnomaliesCount + 1,
        activeAlertsCount: prev.activeAlertsCount + 1
      }));
    });

    sse.addEventListener('anomaly_updated', (e: any) => {
      const updatedAnomaly = JSON.parse(e.data) as Anomaly;
      
      setAnomalies(prev => prev.map(a => a.id === updatedAnomaly.id ? updatedAnomaly : a));
      
      // Recompute counters
      fetchBaseData();
    });

    sse.onerror = () => {
      // Automatic silent reconnect loops handled natively by EventSource
    };

    return () => {
      sse.close();
    };
  }, [token, currentUser]);

  // Operations adjustments methods
  const handleToggleStream = async () => {
    if (!token || currentUser?.role === 'Viewer') return;
    const action = streamRunning ? 'pause' : 'start';
    
    try {
      const res = await fetch('/api/simulation/control', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action })
      });
      if (res.ok) {
        const data = await res.json();
        setStreamRunning(data.running);
        setSettings(data.settings);
        fetchBaseData();
      }
    } catch (err) {
      console.error('Error modifying stream loops:', err);
    }
  };

  const handleUpdateSettings = async (speed: number, sensitivity: number) => {
    if (!token || currentUser?.role === 'Viewer') return;

    try {
      const res = await fetch('/api/simulation/control', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          streamSpeed: speed,
          sensitivityZ: sensitivity
        })
      });
      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings);
        setStreamRunning(data.running);
        fetchBaseData();
      }
    } catch (err) {
      console.error('Error modifying system properties:', err);
    }
  };

  const handleInjectAnomaly = async (metricType: MetricType, type: 'spike' | 'drop' | 'drift' | 'burst', multiplier: number) => {
    if (!token || currentUser?.role === 'Viewer') return;

    try {
      await fetch('/api/simulation/inject', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ metricType, type, multiplier })
      });
    } catch (err) {
      console.error('Error injecting artificial peaks:', err);
    }
  };

  const handleUpdateAnomalyStatus = async (id: string, status: AnomalyStatus, note: string) => {
    if (!token || currentUser?.role === 'Viewer') return;

    try {
      const res = await fetch(`/api/anomalies/${id}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status, note })
      });
      if (res.ok) {
        fetchBaseData();
      }
    } catch (err) {
      console.error('Error modifying anomaly status:', err);
    }
  };

  const handleResetDatabase = async () => {
    if (!token || currentUser?.role !== 'Admin') return;

    try {
      const res = await fetch('/api/system/reset', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchBaseData();
      }
    } catch (err) {
      console.error('Error conducting master resets:', err);
    }
  };

  const handleLoginSuccess = (newToken: string, user: any) => {
    localStorage.setItem('anomaly_secure_token', newToken);
    setToken(newToken);
    setCurrentUser(user);
    setCurrentTab('dashboard');
  };

  const handleLogout = async () => {
    const activeToken = localStorage.getItem('anomaly_secure_token');
    if (activeToken) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${activeToken}` }
        });
      } catch {}
    }
    localStorage.removeItem('anomaly_secure_token');
    setToken(null);
    setCurrentUser(null);
    setEvents([]);
    setAnomalies([]);
  };

  // Auth Loading state layout
  if (authLoading) {
    return (
      <div id="auth-loading-overlay" className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 rounded-full border-2 border-red-500 border-t-transparent animate-spin"></div>
        <p className="text-xs text-red-400 font-mono tracking-widest animate-pulse uppercase">Syncing Security Credentials...</p>
      </div>
    );
  }

  // Not Logged In
  if (!token || !currentUser) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  // Active secure screen router
  const renderTabContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return (
          <DashboardView
            token={token}
            currentUser={currentUser}
            stats={stats}
            streamRunning={streamRunning}
            onToggleStream={handleToggleStream}
            recentAnomalies={anomalies}
            events={events}
            onInjectAnomaly={handleInjectAnomaly}
          />
        );
      case 'monitor':
        return (
          <MonitorView
            currentUser={currentUser}
            events={events}
            streamRunning={streamRunning}
            settings={settings}
            onToggleStream={handleToggleStream}
            onUpdateSimulationSettings={handleUpdateSettings}
            onResetDatabase={handleResetDatabase}
          />
        );
      case 'explorer':
        return (
          <ExplorerView
            currentUser={currentUser}
            anomalies={anomalies}
            onUpdateStatus={handleUpdateAnomalyStatus}
            geminiApiKeyConfigured={true}
          />
        );
      case 'alerts':
        return (
          <AlertsCenter
            currentUser={currentUser}
            anomalies={anomalies}
            onUpdateStatus={handleUpdateAnomalyStatus}
          />
        );
      case 'analytics':
        return (
          <AnalyticsView
            currentUser={currentUser}
            anomalies={anomalies}
            events={events}
            geminiApiKeyConfigured={true}
          />
        );
      case 'users':
        return <UserManagement currentUser={currentUser} />;
      case 'security':
        return <UserManagement currentUser={currentUser} />; // Combines list and audit log inside
      case 'settings':
        return (
          <SettingsView
            currentUser={currentUser}
            settings={settings}
            onUpdateSimulationSettings={handleUpdateSettings}
            onResetDatabase={handleResetDatabase}
          />
        );
      default:
        return (
          <div className="flex-1 p-6 flex flex-col items-center justify-center bg-slate-950 text-slate-500 font-mono text-xs">
            Operational dashboard placeholder.
          </div>
        );
    }
  };

  return (
    <div id="applet-viewport" className="min-h-screen bg-slate-950 text-slate-100 flex overflow-hidden">
      
      {/* Sidebar Panel Navigation */}
      <Sidebar 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
        currentUser={currentUser} 
        onLogout={handleLogout}
        streamRunning={streamRunning}
      />

      {/* Main viewport area */}
      <main id="viewport-pane" className="flex-1 flex flex-col relative overflow-hidden bg-slate-950">
        
        {/* Dynamic global warning banner if active system critical threat exists */}
        {anomalies.some(a => a.status === 'Active' && a.severity === 'Critical') && (
          <div className="bg-red-950/80 border-b border-red-500/20 px-4 py-2 flex items-center justify-between text-xs text-red-500 font-mono animate-pulse-warning">
            <span className="font-bold flex items-center gap-1.5 uppercase select-none">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
              Warning: Active Critical cluster anomalies detected. Immediate triage recommended.
            </span>
            <button 
              onClick={() => setCurrentTab('alerts')}
              className="px-2 py-0.5 rounded bg-red-600 hover:bg-red-500 text-white font-bold text-[10px] uppercase duration-150 cursor-pointer"
            >
              Open Alerts Center
            </button>
          </div>
        )}

        {/* Dynamic subview */}
        {renderTabContent()}

      </main>

    </div>
  );
}
export type { StreamEvent };
