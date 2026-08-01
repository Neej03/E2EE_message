'use client';

import React, { useState, useEffect } from 'react';
import { useAppStore } from '../lib/store';
import { calculateSafetyNumber } from '../lib/crypto/e2eeEngine';
import { NewChatModal } from './NewChatModal';
import { 
  ShieldCheck, 
  Lock, 
  Key, 
  Smartphone, 
  QrCode, 
  RefreshCw, 
  CheckCircle2, 
  Copy, 
  Download, 
  Trash2,
  FileKey,
  UserPlus,
  Plus
} from 'lucide-react';

export const SecurityVaultModal: React.FC = () => {
  const { safetyNumberModal, closeSafetyNumberModal, currentUser } = useAppStore();
  const [safetyDigits, setSafetyDigits] = useState('12894 09182 34910 82716 49201 39102');
  const [copied, setCopied] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [showAddKeyModal, setShowAddKeyModal] = useState(false);

  const peerUser = safetyNumberModal.peerUser || {
    fullName: 'Bob Sterling',
    username: 'bob_builder',
    identityKey: 'MCowBQYDK2VwAyEA9Z8Y7X6W5V4U3T2S1R0Q9P8O7N6M5L4K3J2I1H0G9F8='
  };

  useEffect(() => {
    calculateSafetyNumber(
      'MCowBQYDK2VwAyEAX5b7k8zL9P0Q1R2S3T4U5V6W7X8Y9Z0A1B2C3D4E5F6=',
      peerUser.identityKey || 'MCowBQYDK2VwAyEA9Z8Y7X6W5V4U3T2S1R0Q9P8O7N6M5L4K3J2I1H0G9F8='
    ).then(digits => setSafetyDigits(digits));
  }, [peerUser]);

  const handleCopy = () => {
    navigator.clipboard.writeText(safetyDigits);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <div className="flex-1 h-screen overflow-y-auto p-8 glass-panel select-none">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-6">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-glow">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  Security & Identity Key Vault
                  <span className="px-2 py-0.5 text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-md">
                    Active Zero-Trust
                  </span>
                </h1>
                <p className="text-sm text-slate-400">
                  Manage Ed25519 Identity Keys, X25519 PreKey Pools & Verify Peer Fingerprints.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAddKeyModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold text-xs rounded-xl shadow-glow hover:opacity-95 transition-all flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Add Peer Key
              </button>

              <button className="px-4 py-2 bg-slate-900 border border-slate-800 hover:border-emerald-500/40 text-slate-300 hover:text-white font-semibold text-xs rounded-xl transition-all flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-emerald-400" />
                Rotate Keys
              </button>
            </div>
          </div>

          {/* Grid 1: Safety Numbers & Fingerprint Verification */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Fingerprint Card */}
            <div className="lg:col-span-2 glass-card p-6 rounded-3xl border border-slate-800 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-cyan-400" />
                  Safety Number Fingerprint Verification
                </h3>
                <span className="text-xs font-mono text-slate-400">SHA-256 Protocol</span>
              </div>

              <p className="text-xs text-slate-400">
                Verify this 60-digit number against <strong className="text-slate-200">{peerUser.fullName}</strong>'s device to guarantee Man-in-the-Middle protection.
              </p>

              {/* 60-Digit Code Blocks */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 font-mono text-cyan-300 text-sm md:text-base tracking-widest text-center leading-relaxed font-bold shadow-inner">
                {safetyDigits}
              </div>

              {/* Verification Controls */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={handleCopy}
                  className="px-4 py-2 bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-all flex items-center gap-2"
                >
                  <Copy className="w-4 h-4 text-cyan-400" />
                  {copied ? 'Copied to Clipboard!' : 'Copy Safety Number'}
                </button>

                <button
                  onClick={() => setIsVerified(!isVerified)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 ${
                    isVerified 
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50' 
                      : 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white border-transparent shadow-glow'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {isVerified ? 'Marked as Verified' : 'Verify Safety Number'}
                </button>
              </div>
            </div>

            {/* QR Code Visual Matrix */}
            <div className="glass-card p-6 rounded-3xl border border-slate-800 flex flex-col items-center justify-center text-center space-y-4">
              <h4 className="font-semibold text-xs text-slate-300 uppercase tracking-wider">Identity QR Matrix</h4>
              <div className="w-36 h-36 bg-white p-3 rounded-2xl shadow-xl flex items-center justify-center">
                {/* Simulated High-Res QR Pattern */}
                <div className="w-full h-full border-4 border-slate-900 grid grid-cols-6 gap-1 p-1">
                  {Array.from({ length: 36 }).map((_, i) => (
                    <div key={i} className={`${i % 2 === 0 || i % 5 === 0 ? 'bg-slate-900' : 'bg-white'} rounded-xs`} />
                  ))}
                </div>
              </div>
              <p className="text-[11px] text-slate-400">Scan with mobile app to auto-verify identity keypair.</p>
            </div>
          </div>

          {/* Section 2: Active Registered Devices */}
          <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-purple-400" />
                Trusted Multi-Device E2EE Sessions
              </h3>
              <span className="text-xs text-slate-400 font-semibold">3 Active Sessions</span>
            </div>

            <div className="space-y-3">
              {[
                { id: '1', name: 'MacBook Pro M3 Max (Current Device)', client: 'Desktop Client v1.4.2', lastActive: 'Active Now', primary: true },
                { id: '2', name: 'iPhone 15 Pro', client: 'iOS Native App v1.4.1', lastActive: '2 hours ago', primary: false },
                { id: '3', name: 'ThinkPad X1 Carbon', client: 'Web Client v1.4.0', lastActive: 'Yesterday', primary: false }
              ].map(dev => (
                <div key={dev.id} className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${dev.primary ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-slate-900 text-slate-400 border border-slate-800'}`}>
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-white flex items-center gap-2">
                        {dev.name}
                        {dev.primary && <span className="px-2 py-0.5 text-[9px] font-bold bg-cyan-500 text-slate-950 rounded-md">THIS DEVICE</span>}
                      </h4>
                      <p className="text-[11px] text-slate-400">{dev.client} • {dev.lastActive}</p>
                    </div>
                  </div>

                  {!dev.primary && (
                    <button className="px-3 py-1.5 bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 text-rose-400 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5">
                      <Trash2 className="w-3.5 h-3.5" />
                      Revoke Key
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Key Vault Backup */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-950/60 border border-indigo-500/30 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300 shrink-0 shadow-glow">
                <FileKey className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Export Encrypted Backup Key Vault</h4>
                <p className="text-xs text-slate-400">Download passphrase-protected seed backup of identity & prekeys.</p>
              </div>
            </div>
            <button className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 shrink-0">
              <Download className="w-4 h-4" />
              Download Backup (.asc)
            </button>
          </div>
        </div>
      </div>

      <NewChatModal 
        isOpen={showAddKeyModal} 
        onClose={() => setShowAddKeyModal(false)} 
      />
    </>
  );
};
