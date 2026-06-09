/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  LayoutDashboard, 
  Activity, 
  AlertTriangle, 
  Database, 
  ShieldAlert, 
  Brain, 
  Users, 
  Settings, 
  LogOut,
  UserCheck
} from 'lucide-react';
import { User, UserRole } from '../types.js';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  currentUser: User;
  onLogout: () => void;
  streamRunning: boolean;
}

export default function Sidebar({ currentTab, setCurrentTab, currentUser, onLogout, streamRunning }: SidebarProps) {
  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'Admin': return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'Operator': return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      default: return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    }
  };

  const navItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, limit: [] },
    { id: 'monitor', name: 'Live Monitor', icon: Activity, limit: [] },
    { id: 'explorer', name: 'Anomaly Explorer', icon: Database, limit: [] },
    { id: 'alerts', name: 'Alerts Center', icon: AlertTriangle, limit: [] },
    { id: 'analytics', name: 'AI Analytics', icon: Brain, limit: [] },
    { id: 'users', name: 'Identity & Access', icon: Users, limit: ['Admin'] },
    { id: 'security', name: 'Security Audit', icon: ShieldAlert, limit: [] },
    { id: 'settings', name: 'Settings', icon: Settings, limit: [] },
  ];

  return (
    <aside id="sidebar-container" className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between select-none">
      <div className="flex flex-col flex-1">
        
        {/* Header Branding */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-3.5 h-3.5 rounded bg-red-500 shadow-[0_0_8px_#ef4444] animate-pulse"></span>
            <h1 className="text-sm font-bold tracking-wider text-slate-100 font-mono uppercase">
              Anomaly.Stream
            </h1>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className={`w-2 h-2 rounded-full ${streamRunning ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'}`}></span>
            <span className="text-[10px] text-slate-400 font-mono">
              {streamRunning ? 'LIVE' : 'HALT'}
            </span>
          </div>
        </div>

        {/* User Identity Banner */}
        <div className="p-4 border-b border-slate-900 bg-slate-900/20 flex flex-col items-center space-y-2">
          <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-bold border border-slate-700 uppercase">
            {currentUser.name.slice(0, 2)}
          </div>
          <div className="text-center">
            <h3 className="text-sm font-medium text-slate-200">{currentUser.name}</h3>
            <p className="text-[11px] text-slate-500 font-mono truncate max-w-[200px]">{currentUser.email}</p>
          </div>
          <span className={`px-2 py-0.5 text-[10px] font-bold font-mono rounded border ${getRoleBadgeColor(currentUser.role)}`}>
            {currentUser.role}
          </span>
        </div>

        {/* Navigation Elements */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const hasAccess = item.limit.length === 0 || item.limit.includes(currentUser.role);
            if (!hasAccess) return null;

            const Icon = item.icon;
            const isSelected = currentTab === item.id;

            return (
              <button
                key={item.id}
                id={`btn-nav-${item.id}`}
                onClick={() => setCurrentTab(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-md text-xs font-medium tracking-wide transition-all ${
                  isSelected 
                    ? 'bg-slate-900 text-white border-l-2 border-red-500' 
                    : 'text-slate-400 hover:bg-slate-900/50 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? 'text-red-500' : 'text-slate-500'}`} />
                <span className="flex-1 text-left">{item.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Secured Logout Section */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/80">
        <button
          id="btn-secure-logout"
          onClick={onLogout}
          className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-md text-xs font-semibold text-red-400 hover:bg-red-500/10 hover:text-red-300 border border-transparent hover:border-red-500/20 transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span className="flex-1 text-left">Secure Logout</span>
        </button>
        <p className="text-[9px] text-slate-600 font-mono text-center mt-3 tracking-wide">
          SESSION IDLE PROTECTED
        </p>
      </div>
    </aside>
  );
}
