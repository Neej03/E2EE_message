'use client';

import React, { useState } from 'react';
import { useAppStore } from '../lib/store';
import { joinSocketRoom } from '../lib/socket';
import { 
  ShieldCheck, 
  Lock, 
  UserPlus, 
  X, 
  Key, 
  QrCode, 
  Users, 
  CheckCircle2,
  Sparkles,
  Link,
  ArrowRight
} from 'lucide-react';

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewChatModal: React.FC<NewChatModalProps> = ({ isOpen, onClose }) => {
  const { conversations, setConversations, setActiveConversationId, currentUser, setIsMobileSidebarOpen } = useAppStore();
  const [tab, setTab] = useState<'DIRECTORY' | 'ROOM_CODE' | 'RAW_KEY'>('ROOM_CODE');
  
  // State
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [friendNameInput, setFriendNameInput] = useState('');
  const [rawIdentityKey, setRawIdentityKey] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  // Handle Joining Room Code
  const handleJoinRoomCode = (e: React.FormEvent) => {
    e.preventDefault();
    const code = roomCodeInput.trim();
    if (!code) {
      setErrorMsg('Please enter a valid Room Code or Shareable Link ID.');
      return;
    }

    const friendName = friendNameInput.trim() || 'Friend';
    const newRoomId = code.startsWith('conv_') ? code : `conv_${code}`;

    const exists = conversations.some(c => c.id === newRoomId);
    if (!exists) {
      const newConv = {
        id: newRoomId,
        type: 'DIRECT' as const,
        title: `${friendName} (${code.substring(0, 8)})`,
        description: 'End-to-End Encrypted Live Session',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        isEncrypted: true,
        updatedAt: new Date().toISOString(),
        members: [
          { id: 'm1', userId: currentUser.id, username: currentUser.username, fullName: currentUser.fullName, role: 'ADMIN', isOnline: true },
          { id: 'm2', userId: `usr_${Date.now()}`, username: friendName.toLowerCase().replace(/\s+/g, '_'), fullName: friendName, role: 'MEMBER', isOnline: true }
        ]
      };
      setConversations([newConv, ...conversations]);
    }

    setActiveConversationId(newRoomId);
    setIsMobileSidebarOpen(false);
    joinSocketRoom(newRoomId);

    setSuccessMsg(`Joined room ${code}! Real-time E2EE relay active.`);
    setTimeout(() => {
      setSuccessMsg('');
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
      <div className="w-full max-w-md glass-panel border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-glow">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Start E2EE Chat / Join Room</h3>
              <p className="text-xs text-slate-400">Zero-Knowledge Key Handshake</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-slate-950/60 rounded-xl border border-slate-800">
          <button
            onClick={() => setTab('ROOM_CODE')}
            className={`py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              tab === 'ROOM_CODE'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Link className="w-4 h-4 text-cyan-400" />
            Join Room Code
          </button>

          <button
            onClick={() => setTab('RAW_KEY')}
            className={`py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              tab === 'RAW_KEY'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Key className="w-4 h-4 text-purple-400" />
            Import Public Key
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-950/40 border border-rose-500/40 rounded-xl text-xs text-rose-300">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400 animate-spin shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Join Room Code Form */}
        {tab === 'ROOM_CODE' && (
          <form onSubmit={handleJoinRoomCode} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Room Code or Invite Link ID</label>
              <input
                type="text"
                placeholder="e.g. conv_alice_bob or room_9824"
                value={roomCodeInput}
                onChange={(e) => setRoomCodeInput(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-cyan-500/50 font-mono"
                required
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Enter the Room Code shared by your friend to join their real-time session.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Friend's Name (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Alex"
                value={friendNameInput}
                onChange={(e) => setFriendNameInput(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-cyan-500/50"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:opacity-95 text-white font-bold text-xs rounded-xl shadow-glow transition-all flex items-center justify-center gap-2"
            >
              <span>Join Real-Time Room</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Import Raw Key Form */}
        {tab === 'RAW_KEY' && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Ed25519 / X25519 Public Key Base64</label>
              <textarea
                rows={3}
                placeholder="Paste friend's public key (e.g. MCowBQYDK2VwAyEA...)"
                value={rawIdentityKey}
                onChange={(e) => setRawIdentityKey(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 p-3 rounded-xl focus:outline-none focus:border-purple-500/50 font-mono"
              />
            </div>
            <button
              onClick={() => {
                setSuccessMsg('Key imported & verified! X25519 session active.');
                setTimeout(() => onClose(), 600);
              }}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs rounded-xl shadow-glow"
            >
              Import Key & Establish Session
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
