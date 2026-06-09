/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Users, Shield, ShieldAlert, Key, UserMinus, ShieldCheck, Mail, Calendar, Eye, Activity } from 'lucide-react';
import { User, UserRole, SecurityLog } from '../types.js';

interface UserManagementProps {
  currentUser: User;
}

export default function UserManagement({ currentUser }: UserManagementProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [actionStatus, setActionStatus] = useState('');

  const fetchUsers = async () => {
    if (currentUser.role !== 'Admin') return;
    setLoadingUsers(true);
    try {
      const token = localStorage.getItem('anomaly_secure_token');
      const res = await fetch('/api/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(data);
      }
    } catch (e) {
      console.error('Error fetching registered keys:', e);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchLogs = async () => {
    setLoadingLogs(true);
    try {
      const token = localStorage.getItem('anomaly_secure_token');
      const res = await fetch('/api/security-logs', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setSecurityLogs(data);
      }
    } catch (e) {
      console.error('Error fetching audit logs:', e);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchLogs();
  }, []);

  const handleUpdateRole = async (userId: string, newRole: UserRole) => {
    if (currentUser.role !== 'Admin') return;
    try {
      const token = localStorage.getItem('anomaly_secure_token');
      const res = await fetch(`/api/users/${userId}/role`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });
      if (res.ok) {
        setActionStatus(`Privilege shifted for user to ${newRole}`);
        fetchUsers();
        fetchLogs();
        setTimeout(() => setActionStatus(''), 3000);
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to modify privileges.');
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (currentUser.role !== 'Admin') return;
    if (userId === currentUser.id) {
      alert('Self-Harm Protection: You cannot delete your own administrative session folder.');
      return;
    }
    if (!confirm('Are you certain you want to purge this user account? Access keys will be revoked immediately.')) return;
    
    try {
      const token = localStorage.getItem('anomaly_secure_token');
      const res = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setActionStatus('User purged completely.');
        fetchUsers();
        fetchLogs();
        setTimeout(() => setActionStatus(''), 3000);
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to purge account.');
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  const getLogSeverityColor = (sev: string) => {
    switch (sev) {
      case 'high': return 'text-red-400 font-bold bg-red-950/20 px-1.5 py-0.5 rounded border border-red-500/20';
      case 'medium': return 'text-amber-400 bg-amber-950/20 px-1.5 py-0.5 rounded border border-amber-500/10';
      default: return 'text-slate-400';
    }
  };

  return (
    <div id="user-management-view" className="flex-1 p-6 overflow-y-auto bg-slate-950 font-sans flex flex-col space-y-6">
      
      {/* Title */}
      <div className="border-b border-slate-900 pb-5">
        <h2 className="text-xl font-bold tracking-tight text-white flex items-center space-x-2.5">
          <ShieldCheck className="w-5 h-5 text-indigo-400" />
          <span>Identity Access & Audit Logs</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Review authentic access logs, switch user roles administratively, and monitor real-time system performance audits.
        </p>
      </div>

      {currentUser.role === 'Admin' ? (
        /* Admin Interactive Control Panel */
        <div className="bg-slate-900 border border-slate-850 p-5 rounded-lg space-y-4">
          <div className="flex justify-between items-center border-b border-slate-850 pb-3 flex-wrap gap-2">
            <div>
              <h3 className="text-xs font-semibold text-slate-100 tracking-wider font-mono uppercase flex items-center space-x-2">
                <Users className="w-4 h-4 text-indigo-400" />
                <span>REGISTERED ROLES AUTHORITY REGISTRY</span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Control operational credentials and shift roles permissions immediately in the system.</p>
            </div>
            {actionStatus && (
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-900/10 px-2 py-1 rounded border border-emerald-500/20 animate-pulse">
                {actionStatus}
              </span>
            )}
          </div>

          {loadingUsers ? (
            <div className="text-center py-8 text-xs font-mono text-slate-500">Querying credentials...</div>
          ) : (
            <div className="overflow-x-auto rounded border border-slate-850 bg-slate-950/50">
              <table className="w-full text-left font-mono text-xs border-collapse divide-y divide-slate-900">
                <thead className="bg-slate-950 font-bold text-slate-500 text-[10px] tracking-wider uppercase">
                  <tr>
                    <th className="p-3">OPERATOR DETAILS</th>
                    <th className="p-3">CREDENTIALS</th>
                    <th className="p-3">REGISTRY DATE</th>
                    <th className="p-3">ASSIGNED AUTHORITY</th>
                    <th className="p-3 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900 text-slate-300">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-slate-900/30">
                      <td className="p-3 flex items-center space-x-2.5">
                        <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center font-bold text-[10px] border border-slate-700">
                          {u.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-200">{u.name}</p>
                          <p className="text-[10px] text-slate-500">ID: {u.id}</p>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center space-x-1">
                          <Mail className="w-3.5 h-3.5 text-slate-500" />
                          <span>{u.email}</span>
                        </div>
                      </td>
                      <td className="p-3 text-slate-500">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-3">
                        <select
                          id={`select-user-role-${u.id}`}
                          value={u.role}
                          onChange={(e) => handleUpdateRole(u.id, e.target.value as UserRole)}
                          className="bg-slate-950 border border-slate-800 text-slate-200 rounded p-1.5 focus:outline-none focus:border-red-500 cursor-pointer text-xs"
                        >
                          <option value="Admin">Admin</option>
                          <option value="Operator">Operator</option>
                          <option value="Viewer">Viewer</option>
                        </select>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          id={`btn-purge-user-${u.id}`}
                          onClick={() => handleDeleteUser(u.id)}
                          className="p-1 px-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded border border-transparent hover:border-red-500/20 cursor-pointer transition-all duration-150"
                        >
                          <UserMinus className="w-3.5 h-3.5 inline mr-1" />
                          <span>Purge</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* Non-Admin Security Warning block */
        <div className="bg-slate-900/40 border border-slate-900 p-4 rounded-lg flex items-start space-x-3">
          <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold font-mono text-slate-200 uppercase tracking-wide">SECURED SUITE: IDENTITY REGISTRY RESTRICTED</h4>
            <p className="text-[11px] text-slate-500 font-mono mt-1">
              Your session authority is assigned as a **{currentUser.role}**. Registered keys and user pruning actions are strictly locked. Please contact our Chief Administrator if permissions edits are required.
            </p>
          </div>
        </div>
      )}

      {/* Security Audit logs window (Accessible to Operators & Admins in detail) */}
      <div className="bg-slate-900 border border-slate-850 p-5 rounded-lg flex flex-col justify-between space-y-4 max-h-[450px]">
        <div className="flex justify-between items-center border-b border-slate-850 pb-3">
          <div>
            <h3 className="text-xs font-semibold text-slate-100 tracking-wider font-mono uppercase flex items-center space-x-1.5">
              <Eye className="w-4 h-4 text-emerald-400" />
              <span>CHRONOLOGICAL IDENTITY AUDIT & SECURITY LOG</span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Chronological list of user authentications, role settings mutations, and system interventions.</p>
          </div>
          <button 
            onClick={fetchLogs}
            className="text-[10px] font-mono p-1 px-2.5 rounded bg-slate-950 border border-slate-800 text-slate-300 hover:text-slate-100 cursor-pointer duration-150 flex items-center space-x-1"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Sync Audit Logs</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto rounded border border-slate-850 bg-slate-950/40 divide-y divide-slate-900 font-mono text-xs max-h-[280px]">
          {loadingLogs ? (
            <div className="text-center py-8 text-slate-500">Parsing security buffers...</div>
          ) : securityLogs.length > 0 ? (
            securityLogs.map(log => (
              <div 
                key={log.id} 
                id={`security-log-${log.id}`}
                className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-900/30 text-[11px]"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2 flex-wrap gap-2">
                    <span className="text-slate-500 text-[10px]">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                    <span className="text-indigo-400 font-semibold">{log.userEmail}</span>
                    <span className="text-slate-600">({log.ipAddress})</span>
                  </div>
                  <p className="text-slate-300 font-medium tracking-wide">{log.action}</p>
                </div>
                <div>
                  <span className={getLogSeverityColor(log.severity)}>
                    {log.severity.toUpperCase()}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-slate-600">No security audit logs recorded.</div>
          )}
        </div>
      </div>

    </div>
  );
}
export type { SecurityLog };
