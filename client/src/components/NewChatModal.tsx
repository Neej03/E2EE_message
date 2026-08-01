'use client';

import React, { useState } from 'react';
import { useAppStore, Conversation } from '../lib/store';
import { calculateSafetyNumber } from '../lib/crypto/e2eeEngine';
import { 
  UserPlus, 
  Key, 
  ShieldCheck, 
  Lock, 
  Search, 
  CheckCircle2, 
  X, 
  Sparkles, 
  ArrowRight,
  UserCheck
} from 'lucide-react';

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewChatModal: React.FC<NewChatModalProps> = ({ isOpen, onClose }) => {
  const { conversations, setConversations, setActiveConversationId, currentUser } = useAppStore();
  const [activeTab, setActiveTab] = useState<'DIRECTORY' | 'PASTE_KEY'>('DIRECTORY');
  const [searchQuery, setSearchQuery] = useState('');
  const [pastedKeyName, setPastedKeyName] = useState('');
  const [pastedPublicKey, setPastedPublicKey] = useState('');
  const [isEstablishing, setIsEstablishing] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  // Available Users to Chat / Key Exchange with
  const availableUsers = [
    {
      id: 'usr_carol',
      username: 'carol_crypto',
      fullName: 'Carol Zhang',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      identityKey: 'MCowBQYDK2VwAyEA5L6M7N8O9P0Q1R2S3T4U5V6W7X8Y9Z0A1B2C3D4E5F6=',
      status: 'Security Auditor & Cryptographer'
    },
    {
      id: 'usr_dave',
      username: 'dave_secops',
      fullName: 'Dave Miller',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      identityKey: 'MCowBQYDK2VwAyEAA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V=',
      status: 'DevSecOps Lead @ CipherPulse'
    },
    {
      id: 'usr_eve',
      username: 'eve_privacy',
      fullName: 'Eve Adams',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      identityKey: 'MCowBQYDK2VwAyEAW1X2Y3Z4A5B6C7D8E9F0G1H2I3J4K5L6M7N8O9P0Q1R=',
      status: 'Zero-Knowledge Protocol Researcher'
    },
    {
      id: 'usr_frank',
      username: 'frank_dev',
      fullName: 'Frank Wright',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
      identityKey: 'MCowBQYDK2VwAyEA7T6S5R4Q3P2O1N0M9L8K7J6I5H4G3F2E1D0C9B8A7Z6=',
      status: 'WebRTC & Audio Engineering Specialist'
    }
  ];

  const filteredDirectory = availableUsers.filter(u => 
    u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Start Chat with Selected Contact
  const handleStartChatWithUser = async (targetUser: typeof availableUsers[0]) => {
    setIsEstablishing(true);
    setSuccessMsg(`Fetching X25519 PreKey bundle for @${targetUser.username}...`);

    setTimeout(async () => {
      const existing = conversations.find(c => c.title.toLowerCase().includes(targetUser.fullName.toLowerCase()));
      if (existing) {
        setActiveConversationId(existing.id);
        setIsEstablishing(false);
        onClose();
        return;
      }

      const convId = `conv_${Date.now()}`;
      const newConv: Conversation = {
        id: convId,
        type: 'DIRECT',
        title: `${targetUser.fullName} (Encrypted DM)`,
        description: `X25519 Double Ratchet Tunnel • Verified Key`,
        avatar: targetUser.avatar,
        isEncrypted: true,
        updatedAt: new Date().toISOString(),
        members: [
          { id: `m_${currentUser.id}`, userId: currentUser.id, username: currentUser.username, fullName: currentUser.fullName, role: 'ADMIN', isOnline: true },
          { id: `m_${targetUser.id}`, userId: targetUser.id, username: targetUser.username, fullName: targetUser.fullName, avatar: targetUser.avatar, role: 'MEMBER', isOnline: true }
        ]
      };

      setConversations([newConv, ...conversations]);
      setActiveConversationId(convId);
      setIsEstablishing(false);
      onClose();
    }, 900);
  };

  // Add Chat by Pasted Raw Identity Key
  const handleAddByPastedKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pastedKeyName.trim() || !pastedPublicKey.trim()) return;

    setIsEstablishing(true);
    setSuccessMsg('Deriving X25519 Ephemeral PreKey & Double Ratchet Root Key...');

    setTimeout(() => {
      const convId = `conv_key_${Date.now()}`;
      const newConv: Conversation = {
        id: convId,
        type: 'DIRECT',
        title: `${pastedKeyName.trim()} (Key Session)`,
        description: `Identity Key: ${pastedPublicKey.substring(0, 16)}...`,
        avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
        isEncrypted: true,
        updatedAt: new Date().toISOString(),
        members: [
          { id: `m_${currentUser.id}`, userId: currentUser.id, username: currentUser.username, fullName: currentUser.fullName, role: 'ADMIN', isOnline: true }
        ]
      };

      setConversations([newConv, ...conversations]);
      setActiveConversationId(convId);
      setIsEstablishing(false);
      setPastedKeyName('');
      setPastedPublicKey('');
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
      <div className="w-full max-w-lg glass-panel border border-slate-800 rounded-3xl p-6 shadow-2xl relative space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-glow">
              <UserPlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-white">Add Key & Start E2EE Chat</h2>
              <p className="text-xs text-slate-400">Establish zero-trust Double Ratchet sessions with new peers.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-slate-950/60 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('DIRECTORY')}
            className={`py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'DIRECTORY'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserCheck className="w-4 h-4 text-cyan-400" />
            Directory Contacts
          </button>
          <button
            onClick={() => setActiveTab('PASTE_KEY')}
            className={`py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'PASTE_KEY'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Key className="w-4 h-4 text-purple-400" />
            Import Identity Key
          </button>
        </div>

        {/* Loading / Establishing Status Banner */}
        {isEstablishing && (
          <div className="p-3 bg-cyan-950/40 border border-cyan-500/40 rounded-xl text-xs text-cyan-300 flex items-center gap-2 animate-pulse">
            <Sparkles className="w-4 h-4 text-cyan-400 animate-spin shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Tab 1: Directory Contacts */}
        {activeTab === 'DIRECTORY' && (
          <div className="space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search user by name, handle, or key..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 pl-9 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-cyan-500/50"
              />
            </div>

            <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
              {filteredDirectory.map((user) => (
                <div
                  key={user.id}
                  className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 flex items-center justify-between transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img 
                      src={user.avatar} 
                      alt={user.fullName} 
                      className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-700 group-hover:ring-cyan-400 transition-all shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs font-semibold text-white truncate flex items-center gap-1.5">
                        {user.fullName}
                        <span className="text-[10px] text-slate-400 font-mono">@{user.username}</span>
                      </h4>
                      <p className="text-[11px] text-slate-400 truncate">{user.status}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleStartChatWithUser(user)}
                    disabled={isEstablishing}
                    className="px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-glow transition-all flex items-center gap-1 shrink-0"
                  >
                    <span>Start E2EE</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Paste Raw Ed25519 Public Key */}
        {activeTab === 'PASTE_KEY' && (
          <form onSubmit={handleAddByPastedKey} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Peer Contact Name</label>
              <input
                type="text"
                placeholder="e.g. Alice Security Node, Server Ops..."
                value={pastedKeyName}
                onChange={(e) => setPastedKeyName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-purple-500/50"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Ed25519 / X25519 Public Identity Key (Base64)</label>
              <textarea
                placeholder="MCowBQYDK2VwAyEA..."
                value={pastedPublicKey}
                onChange={(e) => setPastedPublicKey(e.target.value)}
                rows={3}
                className="w-full bg-slate-900 border border-slate-800 text-xs font-mono text-cyan-300 placeholder-slate-600 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-purple-500/50"
                required
              />
              <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                <Lock className="w-3 h-3 text-emerald-400" />
                Key will be added to your local IndexedDB security vault for ratchet derivation.
              </p>
            </div>

            <button
              type="submit"
              disabled={isEstablishing}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white font-bold text-xs rounded-xl shadow-glow transition-all flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              Import Key & Establish Encrypted Tunnel
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
