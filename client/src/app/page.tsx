'use client';

import React, { useEffect, useState } from 'react';
import { useAppStore, Conversation } from '../lib/store';
import { Sidebar } from '../components/Sidebar';
import { ChatCanvas } from '../components/ChatCanvas';
import { CallModal } from '../components/CallModal';
import { SecurityVaultModal } from '../components/SecurityVaultModal';
import { PricingModal } from '../components/PricingModal';
import { AdminConsole } from '../components/AdminConsole';
import { AiAssistantDrawer } from '../components/AiAssistantDrawer';
import { getSocket, joinSocketRoom } from '../lib/socket';
import { Lock, ArrowRight, UserCheck } from 'lucide-react';

export default function Home() {
  const { 
    currentUser, 
    conversations,
    setConversations, 
    activeTab, 
    activeCall,
    safetyNumberModal,
    closeSafetyNumberModal,
    isMobileSidebarOpen,
    setActiveConversationId,
    setIsMobileSidebarOpen,
    setCurrentUser
  } = useAppStore();

  const [guestPromptModal, setGuestPromptModal] = useState<{ roomId: string; friendName: string } | null>(null);

  useEffect(() => {
    // Initial mock conversations
    const initialConvs: Conversation[] = [
      {
        id: 'conv_alice_bob',
        type: 'DIRECT',
        title: 'Bob Sterling (Lead Architect)',
        description: 'Double Ratchet Session Active • X25519 Verified',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        isEncrypted: true,
        unreadCount: 0,
        updatedAt: new Date().toISOString(),
        members: [
          { id: 'm1', userId: 'usr_alice', username: 'alice_sec', fullName: 'Alice Vance', role: 'ADMIN', isOnline: true },
          { id: 'm2', userId: 'usr_bob', username: 'bob_builder', fullName: 'Bob Sterling', role: 'MEMBER', isOnline: true }
        ]
      },
      {
        id: 'conv_alice_carol',
        type: 'DIRECT',
        title: 'Carol Zhang (Security Auditor)',
        description: 'Zero-Knowledge Vault Handshake Complete',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        isEncrypted: true,
        unreadCount: 1,
        updatedAt: new Date().toISOString(),
        members: [
          { id: 'm1', userId: 'usr_alice', username: 'alice_sec', fullName: 'Alice Vance', role: 'ADMIN', isOnline: true },
          { id: 'm3', userId: 'usr_carol', username: 'carol_crypto', fullName: 'Carol Zhang', role: 'MEMBER', isOnline: false }
        ]
      },
      {
        id: 'conv_group_sec',
        type: 'GROUP',
        title: '🛡️ Core Security Taskforce',
        description: 'Megolm Group Sender Key Session • 8 Devices',
        avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&auto=format&fit=crop&q=80',
        isEncrypted: true,
        unreadCount: 3,
        updatedAt: new Date().toISOString(),
        members: [
          { id: 'm1', userId: 'usr_alice', username: 'alice_sec', fullName: 'Alice Vance', role: 'ADMIN', isOnline: true },
          { id: 'm2', userId: 'usr_bob', username: 'bob_builder', fullName: 'Bob Sterling', role: 'MEMBER', isOnline: true },
          { id: 'm3', userId: 'usr_carol', username: 'carol_crypto', fullName: 'Carol Zhang', role: 'MEMBER', isOnline: false }
        ]
      }
    ];

    // Detect Shareable Room URL Parameter (?room=... or ?invite=...)
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const sharedRoomId = urlParams.get('room') || urlParams.get('invite');

      if (sharedRoomId) {
        const roomExists = initialConvs.some(c => c.id === sharedRoomId);
        if (!roomExists) {
          initialConvs.unshift({
            id: sharedRoomId,
            type: 'DIRECT',
            title: `Shared Session (${sharedRoomId.substring(0, 10)})`,
            description: 'Joined via Shareable Link • E2EE Active',
            avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
            isEncrypted: true,
            updatedAt: new Date().toISOString(),
            members: [
              { id: 'm_guest', userId: currentUser.id, username: currentUser.username, fullName: currentUser.fullName, role: 'MEMBER', isOnline: true }
            ]
          });
        }

        // Show prompt to set friend's handle if new guest
        setGuestPromptModal({
          roomId: sharedRoomId,
          friendName: ''
        });

        setActiveConversationId(sharedRoomId);
        setIsMobileSidebarOpen(false);
        joinSocketRoom(sharedRoomId);
      }
    }

    setConversations(initialConvs);

    // Socket.IO Connection
    if (currentUser?.id) {
      getSocket(currentUser.id);
    }
  }, [currentUser?.id, setConversations, setActiveConversationId, setIsMobileSidebarOpen]);

  const handleConfirmGuestName = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestPromptModal) return;

    const name = guestPromptModal.friendName.trim() || `Friend_${Math.floor(Math.random() * 1000)}`;
    setCurrentUser({
      ...currentUser,
      id: `usr_${Date.now()}`,
      fullName: name,
      username: name.toLowerCase().replace(/\s+/g, '_')
    });

    setGuestPromptModal(null);
  };

  return (
    <main className="h-screen w-screen bg-slate-950 text-slate-100 flex overflow-hidden font-sans relative">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div 
        className={`flex-1 h-screen flex flex-col min-w-0 ${
          isMobileSidebarOpen ? 'hidden md:flex' : 'flex'
        }`}
      >
        {activeTab === 'CHAT' && <ChatCanvas />}
        {activeTab === 'SECURITY' && <SecurityVaultModal />}
        {activeTab === 'PRICING' && <PricingModal />}
        {activeTab === 'ADMIN' && <AdminConsole />}
      </div>

      {/* AI Assistant Drawer */}
      <AiAssistantDrawer />

      {/* WebRTC Video / Voice Call Modal */}
      {activeCall && <CallModal />}

      {/* Guest Name Setup Modal when joining via shared link */}
      {guestPromptModal && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <form onSubmit={handleConfirmGuestName} className="max-w-md w-full glass-panel border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-glow">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Join Encrypted Session</h3>
                <p className="text-xs text-slate-400">Enter your name to start chatting live</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Your Display Name</label>
              <input
                type="text"
                placeholder="e.g. Alex"
                value={guestPromptModal.friendName}
                onChange={(e) => setGuestPromptModal({ ...guestPromptModal, friendName: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-cyan-500/50"
                autoFocus
              />
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setGuestPromptModal(null)}
                className="flex-1 py-2.5 bg-slate-900 border border-slate-800 text-slate-400 font-semibold text-xs rounded-xl"
              >
                Skip as Guest
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold text-xs rounded-xl shadow-glow flex items-center justify-center gap-1.5"
              >
                <span>Join Chat Room</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Safety Number Verification Dialog */}
      {safetyNumberModal.isOpen && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full glass-panel border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <span className="text-cyan-400">🔑</span>
              Verify Safety Numbers (60-Digit Fingerprint)
            </h3>
            <p className="text-xs text-slate-400">
              Compare this numeric fingerprint with {safetyNumberModal.peerUser?.fullName || 'the recipient'} in person or via an out-of-band channel to confirm End-to-End Encryption integrity.
            </p>
            <div className="p-4 bg-slate-950 border border-cyan-500/30 rounded-2xl font-mono text-xs text-cyan-300 text-center tracking-widest break-all">
              3901 8492 1049 5820 9104 2948 1048 5920 1940 5829 1049 4820
            </div>
            <button
              onClick={closeSafetyNumberModal}
              className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold text-xs rounded-xl shadow-glow"
            >
              Verify & Match Safety Number
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
