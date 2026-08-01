'use client';

import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  ShieldCheck, 
  Activity, 
  Server, 
  FileText, 
  Lock, 
  Search,
  CheckCircle2,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';

export const AdminConsole: React.FC = () => {
  const [metrics, setMetrics] = useState<any>({
    totalUsers: 4,
    onlineUsers: 3,
    totalDevices: 3,
    totalPreKeyBundles: 2,
    totalConversations: 4,
    totalMessagesCount: 142,
    activeSocketsCount: 7,
    serverMemoryMb: 42.8,
    uptimeSeconds: 3420,
    e2eeIntegrityStatus: 'HEALTHY_ALL_KEYS_VALIDATED'
  });

  const [auditLogs, setAuditLogs] = useState<any[]>([
    { id: '1', action: 'E2EE_KEY_BUNDLE_PUBLISHED', userId: 'usr_alice', ipAddress: '127.0.0.1', metadata: '{"oneTimeKeyCount":2}', createdAt: new Date().toISOString() },
    { id: '2', action: 'USER_REGISTERED', userId: 'usr_bob', ipAddress: '127.0.0.1', metadata: '{"deviceName":"ThinkPad X1"}', createdAt: new Date(Date.now() - 3600000).toISOString() },
    { id: '3', action: 'E2EE_MESSAGE_SENT', userId: 'usr_carol', ipAddress: '127.0.0.1', metadata: '{"messageType":"TEXT"}', createdAt: new Date(Date.now() - 7200000).toISOString() },
    { id: '4', action: 'SUBSCRIPTION_PLAN_UPGRADED', userId: 'usr_alice', ipAddress: '127.0.0.1', metadata: '{"plan":"ENTERPRISE"}', createdAt: new Date(Date.now() - 14400000).toISOString() }
  ]);

  return (
    <div className="flex-1 h-screen overflow-y-auto p-8 glass-panel select-none">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-6">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-glow">
              <LayoutDashboard className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                Admin Control & Security Console
                <span className="px-2 py-0.5 text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-md">
                  Superadmin Access
                </span>
              </h1>
              <p className="text-sm text-slate-400">
                Monitor zero-knowledge server telemetry, key exchange metrics, and audit logs.
              </p>
            </div>
          </div>

          <button className="px-4 py-2 bg-slate-900 border border-slate-800 hover:border-indigo-500/40 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-all flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-indigo-400" />
            Refresh Telemetry
          </button>
        </div>

        {/* Telemetry Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card p-5 rounded-2xl border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Total Platform Users</span>
              <Users className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-extrabold text-white">{metrics.totalUsers}</div>
            <div className="text-[11px] text-emerald-400 font-semibold">{metrics.onlineUsers} Active Online</div>
          </div>

          <div className="glass-card p-5 rounded-2xl border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>E2EE Message Throughput</span>
              <Lock className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-extrabold text-white">{metrics.totalMessagesCount}</div>
            <div className="text-[11px] text-purple-300 font-semibold">100% Ciphertext Storage</div>
          </div>

          <div className="glass-card p-5 rounded-2xl border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Active Socket Connections</span>
              <Activity className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-extrabold text-white">{metrics.activeSocketsCount}</div>
            <div className="text-[11px] text-emerald-400 font-semibold">Real-Time Gateway Healthy</div>
          </div>

          <div className="glass-card p-5 rounded-2xl border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Server Heap Usage</span>
              <Server className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-extrabold text-white">{metrics.serverMemoryMb} MB</div>
            <div className="text-[11px] text-amber-300 font-semibold">Node.js Memory Normal</div>
          </div>
        </div>

        {/* Section 2: Security Audit Log Stream */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-400" />
              Immutable Security Audit Trail
            </h3>
            <span className="text-xs text-slate-400 font-mono">Zero-Knowledge Compliance Engine</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="p-3">Event Action</th>
                  <th className="p-3">User ID</th>
                  <th className="p-3">IP Address</th>
                  <th className="p-3">Metadata</th>
                  <th className="p-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-900/40 transition-all">
                    <td className="p-3 font-semibold text-cyan-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      {log.action}
                    </td>
                    <td className="p-3 text-slate-300">{log.userId}</td>
                    <td className="p-3 text-slate-400">{log.ipAddress}</td>
                    <td className="p-3 text-slate-400 truncate max-w-xs">{log.metadata}</td>
                    <td className="p-3 text-slate-500">{new Date(log.createdAt).toLocaleTimeString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
