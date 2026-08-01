'use client';

import React, { useState } from 'react';
import { useAppStore } from '../lib/store';
import { NewChatModal } from './NewChatModal';
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
  UserPlus
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { 
    currentUser, 
    conversations, 
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

  const filteredConversations = conversations.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const directMsgs = filteredConversations.filter(c => c.type === 'DIRECT');
  const groupChats = filteredConversations.filter(c => c.type === 'GROUP');
  const channels = filteredConversations.filter(c => c.type === 'CHANNEL' || c.type === 'COMMUNITY');

  return (
    <>
      <aside 
        className={`w-full md:w-80 h-screen glass-panel flex flex-col border-r border-slate-800/60 select-none z-20 shrink-0 ${
          isMobileSidebarOpen ? 'block' : 'hidden md:flex'
        }`}
      >
        {/* Brand & Top Header */}
        <div className="p-4 border-b border-slate-800/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-white tracking-wide flex items-center gap-1.5">
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
                : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-white hover:border-slate-600'
            }`}
            title="Toggle AI Companion"
          >
            <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
          </button>
        </div>

        {/* Main Navigation Tabs */}
        <div className="p-2 border-b border-slate-800/60 grid grid-cols-4 gap-1 bg-slate-950/40">
          <button
            onClick={() => { setActiveTab('CHAT'); setIsMobileSidebarOpen(true); }}
            className={`flex flex-col items-center gap-1 py-2 px-1 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'CHAT'
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Chats
          </button>

          <button
            onClick={() => { setActiveTab('SECURITY'); setIsMobileSidebarOpen(false); }}
            className={`flex flex-col items-center gap-1 py-2 px-1 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'SECURITY'
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Lock className="w-4 h-4" />
            Vault
          </button>

          <button
            onClick={() => { setActiveTab('PRICING'); setIsMobileSidebarOpen(false); }}
            className={`flex flex-col items-center gap-1 py-2 px-1 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'PRICING'
                ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            Billing
          </button>

          <button
            onClick={() => { setActiveTab('ADMIN'); setIsMobileSidebarOpen(false); }}
            className={`flex flex-col items-center gap-1 py-2 px-1 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'ADMIN'
                ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Admin
          </button>
        </div>

        {/* Search & Add Key Button Bar */}
        <div className="p-3 space-y-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search chats, keys or channels..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/80 border border-slate-800 text-sm text-slate-200 placeholder-slate-500 pl-9 pr-8 py-2 rounded-xl focus:outline-none focus:border-cyan-500/50 transition-all"
            />
          </div>

          <button
            onClick={() => setShowNewChatModal(true)}
            className="w-full py-2.5 px-3 bg-gradient-to-r from-cyan-500/20 via-indigo-500/20 to-purple-500/20 hover:from-cyan-500/30 hover:to-purple-500/30 border border-cyan-500/40 text-cyan-300 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-glow"
          >
            <UserPlus className="w-4 h-4 text-cyan-400" />
            Add Key / Start E2EE Chat
          </button>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto px-2 space-y-4">
          {/* Direct Messages Section */}
          <div>
            <div className="flex items-center justify-between px-3 py-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
                Private Encrypted ({directMsgs.length})
              </span>
            </div>
            <div className="space-y-0.5 mt-1">
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
                    className={`w-full p-2.5 rounded-xl flex items-center gap-3 transition-all text-left group ${
                      isActive 
                        ? 'bg-gradient-to-r from-cyan-500/20 to-indigo-500/10 border border-cyan-500/30 text-white' 
                        : 'hover:bg-slate-800/40 text-slate-300 border border-transparent'
                    }`}
                  >
                    <div className="relative">
                      <img 
                        src={conv.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'} 
                        alt={conv.title} 
                        className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-700 group-hover:ring-cyan-400 transition-all"
                      />
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-slate-900"></span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-medium text-slate-100 truncate group-hover:text-cyan-300">
                          {conv.title}
                        </h4>
                        <Lock className="w-3 h-3 text-cyan-400 opacity-75 shrink-0" />
                      </div>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {conv.description || 'X25519 Double Ratchet Tunnel'}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Encrypted Groups Section */}
          <div>
            <div className="flex items-center justify-between px-3 py-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-purple-400" />
                Group Key Ratchets ({groupChats.length})
              </span>
            </div>
            <div className="space-y-0.5 mt-1">
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
                    className={`w-full p-2.5 rounded-xl flex items-center gap-3 transition-all text-left group ${
                      isActive 
                        ? 'bg-gradient-to-r from-purple-500/20 to-indigo-500/10 border border-purple-500/30 text-white' 
                        : 'hover:bg-slate-800/40 text-slate-300 border border-transparent'
                    }`}
                  >
                    <img 
                      src={conv.avatar || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&auto=format&fit=crop&q=80'} 
                      alt={conv.title} 
                      className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-700 group-hover:ring-purple-400 transition-all"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-medium text-slate-100 truncate group-hover:text-purple-300">
                          {conv.title}
                        </h4>
                        {conv.unreadCount ? (
                          <span className="px-1.5 py-0.5 text-[10px] font-bold bg-purple-500 text-white rounded-full">
                            {conv.unreadCount}
                          </span>
                        ) : null}
                      </div>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {conv.description || 'Megolm Group Sender Key'}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Public Channels Section */}
          <div>
            <div className="flex items-center justify-between px-3 py-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-emerald-400" />
                Channels & Broadcasts ({channels.length})
              </span>
            </div>
            <div className="space-y-0.5 mt-1">
              {channels.map((conv) => {
                const isActive = activeConversationId === conv.id && activeTab === 'CHAT';
                return (
                  <button
                    key={conv.id}
                    onClick={() => {
                      setActiveConversationId(conv.id);
                      setActiveTab('CHAT');
                      setIsMobileSidebarOpen(false);
                    }}
                    className={`w-full p-2.5 rounded-xl flex items-center gap-3 transition-all text-left group ${
                      isActive 
                        ? 'bg-gradient-to-r from-emerald-500/20 to-cyan-500/10 border border-emerald-500/30 text-white' 
                        : 'hover:bg-slate-800/40 text-slate-300 border border-transparent'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs shrink-0">
                      #
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-medium text-slate-100 truncate group-hover:text-emerald-300">
                        {conv.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {conv.description || 'Broadcast Channel'}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* User Footer Active Profile Badge */}
        <div className="p-3 border-t border-slate-800/60 bg-slate-950/60 flex items-center justify-between">
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
            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-800/60 transition-all"
            title="Key Security Settings"
          >
            <Lock className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* New Chat Modal */}
      <NewChatModal 
        isOpen={showNewChatModal} 
        onClose={() => setShowNewChatModal(false)} 
      />
    </>
  );
};
