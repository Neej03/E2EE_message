'use client';

import React, { useState } from 'react';
import { useAppStore } from '../lib/store';
import { NewChatModal } from './NewChatModal';
import { joinSocketRoom } from '../lib/socket';
import { 
  ShieldCheck, 
  MessageSquare, 
  Lock, 
  Sparkles, 
  CreditCard, 
  LayoutDashboard, 
  Search, 
  Users, 
  Radio, 
  UserCheck,
  UserPlus,
  Share2,
  Copy,
  Check,
  X,
  QrCode
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { 
    currentUser, 
    conversations, 
    setConversations,
    activeConversationId, 
    setActiveConversationId,
    activeTab, 
    setActiveTab, 
    toggleAiDrawer,
    aiDrawerOpen,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen
  } = useAppStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [shareModal, setShareModal] = useState<{ roomCode: string; inviteUrl: string } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const filteredConversations = conversations.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const directMsgs = filteredConversations.filter(c => c.type === 'DIRECT');
  const groupChats = filteredConversations.filter(c => c.type === 'GROUP');
  const channels = filteredConversations.filter(c => c.type === 'CHANNEL' || c.type === 'COMMUNITY');

  // 1-Click Instant Room Creation for Friends
  const handleCreateInstantFriendRoom = () => {
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const roomId = `room_${randomCode}`;
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    const inviteUrl = `${origin}/?room=${roomId}`;

    const newConv = {
      id: roomId,
      type: 'DIRECT' as const,
      title: `Live Room #${randomCode}`,
      description: 'End-to-End Encrypted Friend Session',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      isEncrypted: true,
      updatedAt: new Date().toISOString(),
      members: [
        { id: 'm1', userId: currentUser.id, username: currentUser.username, fullName: currentUser.fullName, role: 'ADMIN', isOnline: true },
        { id: 'm2', userId: `usr_friend_${randomCode}`, username: 'friend', fullName: 'Friend', role: 'MEMBER', isOnline: true }
      ]
    };

    setConversations([newConv, ...conversations]);
    setActiveConversationId(roomId);
    setIsMobileSidebarOpen(false);
    joinSocketRoom(roomId);

    setShareModal({
      roomCode: `room_${randomCode}`,
      inviteUrl
    });
  };

  const handleCopyLink = (url: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
    }
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  return (
    <>
      <aside 
        className={`w-full md:w-80 h-[100dvh] glass-panel flex flex-col border-r border-slate-800/60 select-none z-30 shrink-0 ${
          isMobileSidebarOpen ? 'fixed inset-0 md:relative' : 'hidden md:flex'
        }`}
      >
        {/* Brand Header */}
        <div className="p-3.5 md:p-4 border-b border-slate-800/60 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-base md:text-lg text-white tracking-wide flex items-center gap-1.5">
                CipherPulse
                <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-md">
                  E2EE
                </span>
              </h1>
              <p className="text-xs text-slate-400">Zero-Knowledge SaaS</p>
            </div>
          </div>

          <button 
            onClick={toggleAiDrawer}
            className={`p-2 rounded-xl border transition-all ${
              aiDrawerOpen 
                ? 'bg-purple-500/20 border-purple-500/40 text-purple-300 shadow-glow' 
                : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-white'
            }`}
            title="Toggle AI Companion"
          >
            <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="p-2 border-b border-slate-800/60 grid grid-cols-4 gap-1 bg-slate-950/60">
          <button
            onClick={() => { setActiveTab('CHAT'); setIsMobileSidebarOpen(true); }}
            className={`flex flex-col items-center gap-1 py-2 px-1 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'CHAT'
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Chats
          </button>

          <button
            onClick={() => { setActiveTab('SECURITY'); setIsMobileSidebarOpen(false); }}
            className={`flex flex-col items-center gap-1 py-2 px-1 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'SECURITY'
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lock className="w-4 h-4" />
            Vault
          </button>

          <button
            onClick={() => { setActiveTab('PRICING'); setIsMobileSidebarOpen(false); }}
            className={`flex flex-col items-center gap-1 py-2 px-1 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'PRICING'
                ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            Billing
          </button>

          <button
            onClick={() => { setActiveTab('ADMIN'); setIsMobileSidebarOpen(false); }}
            className={`flex flex-col items-center gap-1 py-2 px-1 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'ADMIN'
                ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Admin
          </button>
        </div>

        {/* 1-Click Action Buttons */}
        <div className="p-3 space-y-2">
          {/* Big Glowing "Create Room for Friends" Button */}
          <button
            onClick={handleCreateInstantFriendRoom}
            className="w-full py-3 px-4 bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:opacity-95 text-white rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 shadow-glow active:scale-95 tracking-wide"
          >
            <Share2 className="w-4 h-4 text-cyan-200" />
            <span>🚀 Create Room & Invite Friend</span>
          </button>

          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 pl-9 pr-3 py-2 rounded-xl focus:outline-none focus:border-cyan-500/50"
              />
            </div>

            <button
              onClick={() => setShowNewChatModal(true)}
              className="p-2 bg-slate-900 border border-slate-800 text-cyan-400 hover:text-white rounded-xl text-xs font-semibold shrink-0"
              title="Join Room Code"
            >
              <UserPlus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto px-2 space-y-4 pb-20 md:pb-4">
          {/* Direct Messages */}
          <div>
            <div className="flex items-center justify-between px-3 py-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
                Active Sessions ({directMsgs.length})
              </span>
            </div>
            <div className="space-y-1 mt-1">
              {directMsgs.map((conv) => {
                const isActive = activeConversationId === conv.id && activeTab === 'CHAT';
                return (
                  <button
                    key={conv.id}
                    onClick={() => {
                      setActiveConversationId(conv.id);
                      setActiveTab('CHAT');
                      setIsMobileSidebarOpen(false);
                    }}
                    className={`w-full p-3 rounded-xl flex items-center gap-3 transition-all text-left active:scale-[0.98] ${
                      isActive 
                        ? 'bg-cyan-500/20 border border-cyan-500/40 text-white' 
                        : 'bg-slate-900/40 hover:bg-slate-800/60 text-slate-300 border border-slate-800/60'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <img 
                        src={conv.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'} 
                        alt={conv.title} 
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-700"
                      />
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-slate-900"></span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-slate-100 truncate">
                          {conv.title}
                        </h4>
                        <Lock className="w-3 h-3 text-cyan-400 shrink-0" />
                      </div>
                      <p className="text-xs text-slate-400 truncate mt-0.5">
                        {conv.description || 'Live Encrypted Session'}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Groups */}
          <div>
            <div className="flex items-center justify-between px-3 py-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-purple-400" />
                Group Key Ratchets ({groupChats.length})
              </span>
            </div>
            <div className="space-y-1 mt-1">
              {groupChats.map((conv) => {
                const isActive = activeConversationId === conv.id && activeTab === 'CHAT';
                return (
                  <button
                    key={conv.id}
                    onClick={() => {
                      setActiveConversationId(conv.id);
                      setActiveTab('CHAT');
                      setIsMobileSidebarOpen(false);
                    }}
                    className={`w-full p-3 rounded-xl flex items-center gap-3 transition-all text-left active:scale-[0.98] ${
                      isActive 
                        ? 'bg-purple-500/20 border border-purple-500/40 text-white' 
                        : 'bg-slate-900/40 hover:bg-slate-800/60 text-slate-300 border border-slate-800/60'
                    }`}
                  >
                    <img 
                      src={conv.avatar || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&auto=format&fit=crop&q=80'} 
                      alt={conv.title} 
                      className="w-10 h-10 rounded-xl object-cover ring-2 ring-slate-700 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-slate-100 truncate">
                        {conv.title}
                      </h4>
                      <p className="text-xs text-slate-400 truncate mt-0.5">
                        {conv.description || 'Megolm Group Key'}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* User Footer Active Profile Badge */}
        <div className="p-3 border-t border-slate-800/60 bg-slate-950/90 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative">
              <img 
                src={currentUser.avatar} 
                alt={currentUser.fullName} 
                className="w-9 h-9 rounded-full object-cover ring-2 ring-cyan-500/40"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-slate-950"></span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs font-semibold text-slate-100 truncate">{currentUser.fullName}</h4>
                <span className="px-1.5 py-0.5 text-[9px] font-extrabold bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-md tracking-wider">
                  {currentUser.plan}
                </span>
              </div>
              <p className="text-[11px] text-emerald-400 truncate font-mono">🔐 Session Active</p>
            </div>
          </div>

          <button 
            onClick={() => { setActiveTab('SECURITY'); setIsMobileSidebarOpen(false); }}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-emerald-400 transition-all"
            title="Key Security Settings"
          >
            <Lock className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Share Room Modal */}
      {shareModal && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full glass-panel border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 relative animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <span className="text-cyan-400">🚀</span>
                Room Created! Invite Your Friend
              </h3>
              <button onClick={() => setShareModal(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Send this share link or Room Code to your friend. When they open it, you will connect in real-time!
            </p>

            <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-cyan-500/30">
              <div>
                <label className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block mb-1">
                  1-Click Shareable Invitation Link
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={shareModal.inviteUrl}
                    className="flex-1 bg-slate-900 border border-slate-800 text-xs text-cyan-300 px-3 py-2 rounded-xl font-mono truncate"
                  />
                  <button
                    onClick={() => handleCopyLink(shareModal.inviteUrl)}
                    className="px-3 py-2 bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-bold rounded-xl hover:bg-cyan-500/30 shrink-0 flex items-center gap-1.5"
                  >
                    {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedLink ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              <div className="border-t border-slate-800 pt-2 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Or Room Code</span>
                  <span className="font-mono text-sm font-bold text-white tracking-widest">{shareModal.roomCode}</span>
                </div>
                <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  E2EE Active
                </span>
              </div>
            </div>

            <button
              onClick={() => setShareModal(null)}
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold text-xs rounded-xl shadow-glow"
            >
              Start Chatting Now
            </button>
          </div>
        </div>
      )}

      {/* New Chat Modal */}
      <NewChatModal 
        isOpen={showNewChatModal} 
        onClose={() => setShowNewChatModal(false)} 
      />
    </>
  );
};
