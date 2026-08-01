import { create } from 'zustand';

export interface User {
  id: string;
  email: string;
  username: string;
  fullName: string;
  avatar: string;
  statusMessage?: string;
  role: 'USER' | 'ADMIN' | 'SUPERADMIN';
  plan: 'FREE' | 'PRO' | 'BUSINESS' | 'ENTERPRISE';
  isMfaEnabled: boolean;
}

export interface Conversation {
  id: string;
  type: 'DIRECT' | 'GROUP' | 'CHANNEL' | 'COMMUNITY';
  title: string;
  description?: string;
  avatar?: string;
  isEncrypted: boolean;
  unreadCount?: number;
  updatedAt: string;
  members: Array<{
    id: string;
    userId: string;
    username: string;
    fullName: string;
    avatar?: string;
    role: string;
    isOnline: boolean;
  }>;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderDeviceId?: string;
  messageType: 'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT' | 'VOICE_NOTE' | 'POLL';
  ciphertext: string;
  iv: string;
  authTag?: string;
  ephemeralPublicKey?: string;
  disappearingDuration?: number;
  replyToMessageId?: string;
  reactions?: Array<{ id: string; userId: string; emoji: string }>;
  createdAt: string;
  isDecrypted?: boolean;
  decryptedText?: string;
}

export interface CallState {
  conversationId: string;
  title: string;
  type: 'AUDIO' | 'VIDEO';
  isConnected: boolean;
  isMuted: boolean;
  isCameraOn: boolean;
  isScreenSharing: boolean;
  isBackgroundBlurred: boolean;
  isCaptionsOn: boolean;
}

interface AppState {
  currentUser: User;
  conversations: Conversation[];
  activeConversationId: string | null;
  messages: Record<string, Message[]>;
  activeTab: 'CHAT' | 'SECURITY' | 'PRICING' | 'ADMIN';
  aiDrawerOpen: boolean;
  activeCall: CallState | null;
  safetyNumberModal: { isOpen: boolean; peerUser: any | null };
  
  // Actions
  setCurrentUser: (user: User) => void;
  setConversations: (conversations: Conversation[]) => void;
  setActiveConversationId: (id: string | null) => void;
  setMessages: (conversationId: string, messages: Message[]) => void;
  addMessage: (conversationId: string, message: Message) => void;
  setActiveTab: (tab: 'CHAT' | 'SECURITY' | 'PRICING' | 'ADMIN') => void;
  toggleAiDrawer: () => void;
  startCall: (conversationId: string, title: string, type: 'AUDIO' | 'VIDEO') => void;
  endCall: () => void;
  updateCallState: (updates: Partial<CallState>) => void;
  openSafetyNumberModal: (peerUser: any) => void;
  closeSafetyNumberModal: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentUser: {
    id: 'usr_alice',
    email: 'alice@cipherpulse.io',
    username: 'alice_sec',
    fullName: 'Alice Vance',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    statusMessage: '🔐 Verified Identity Key | E2EE Active',
    role: 'ADMIN',
    plan: 'ENTERPRISE',
    isMfaEnabled: true
  },
  conversations: [],
  activeConversationId: 'conv_alice_bob',
  messages: {},
  activeTab: 'CHAT',
  aiDrawerOpen: false,
  activeCall: null,
  safetyNumberModal: { isOpen: false, peerUser: null },

  setCurrentUser: (user) => set({ currentUser: user }),
  setConversations: (conversations) => set({ conversations }),
  setActiveConversationId: (id) => set({ activeConversationId: id }),
  setMessages: (conversationId, msgs) => 
    set((state) => ({ messages: { ...state.messages, [conversationId]: msgs } })),
  addMessage: (conversationId, msg) =>
    set((state) => {
      const existing = state.messages[conversationId] || [];
      return {
        messages: {
          ...state.messages,
          [conversationId]: [...existing, msg]
        }
      };
    }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  toggleAiDrawer: () => set((state) => ({ aiDrawerOpen: !state.aiDrawerOpen })),
  startCall: (conversationId, title, type) =>
    set({
      activeCall: {
        conversationId,
        title,
        type,
        isConnected: true,
        isMuted: false,
        isCameraOn: type === 'VIDEO',
        isScreenSharing: false,
        isBackgroundBlurred: true,
        isCaptionsOn: false
      }
    }),
  endCall: () => set({ activeCall: null }),
  updateCallState: (updates) =>
    set((state) => (state.activeCall ? { activeCall: { ...state.activeCall, ...updates } } : {})),
  openSafetyNumberModal: (peerUser) => set({ safetyNumberModal: { isOpen: true, peerUser } }),
  closeSafetyNumberModal: () => set({ safetyNumberModal: { isOpen: false, peerUser: null } })
}));
