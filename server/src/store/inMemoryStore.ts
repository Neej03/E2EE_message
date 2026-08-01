export interface UserRecord {
  id: string;
  email: string;
  username: string;
  fullName: string;
  avatar: string;
  statusMessage: string;
  passwordHash: string;
  role: 'USER' | 'ADMIN' | 'SUPERADMIN';
  plan: 'FREE' | 'PRO' | 'BUSINESS' | 'ENTERPRISE';
  isMfaEnabled: boolean;
  isOnline: boolean;
  lastSeen: string;
  createdAt: string;
}

export interface DeviceRecord {
  id: string;
  userId: string;
  deviceName: string;
  registrationId: number;
  clientVersion: string;
  lastActive: string;
}

export interface KeyBundleRecord {
  deviceId: string;
  identityPublicKey: string; // Ed25519
  signedPreKey: {
    keyId: number;
    publicKey: string; // X25519
    signature: string;
  };
  oneTimePreKeys: Array<{
    keyId: number;
    publicKey: string;
    used: boolean;
  }>;
}

export interface ConversationRecord {
  id: string;
  type: 'DIRECT' | 'GROUP' | 'CHANNEL' | 'COMMUNITY';
  title: string;
  description?: string;
  avatar?: string;
  isEncrypted: boolean;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface MemberRecord {
  id: string;
  conversationId: string;
  userId: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
  joinedAt: string;
}

export interface MessageRecord {
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
  expiresAt?: string;
  isEdited?: boolean;
  isDeleted?: boolean;
  replyToMessageId?: string;
  reactions?: Array<{ id: string; userId: string; emoji: string }>;
  createdAt: string;
}

export interface CallRecord {
  id: string;
  conversationId: string;
  initiatorId: string;
  type: 'AUDIO' | 'VIDEO';
  status: 'ONGOING' | 'COMPLETED' | 'MISSED' | 'DECLINED';
  durationSec: number;
  startedAt: string;
}

export interface SubscriptionRecord {
  id: string;
  userId: string;
  plan: 'FREE' | 'PRO' | 'BUSINESS' | 'ENTERPRISE';
  stripeCustomerId?: string;
  status: string;
  currentPeriodEnd: string;
}

export interface AuditLogRecord {
  id: string;
  userId?: string;
  action: string;
  ipAddress?: string;
  metadata?: string;
  createdAt: string;
}

// Initial Mock Seed Data
export const usersStore: Map<string, UserRecord> = new Map();
export const devicesStore: Map<string, DeviceRecord> = new Map();
export const keyBundlesStore: Map<string, KeyBundleRecord> = new Map(); // key = deviceId
export const conversationsStore: Map<string, ConversationRecord> = new Map();
export const membersStore: Map<string, MemberRecord> = new Map();
export const messagesStore: Map<string, MessageRecord[]> = new Map(); // key = conversationId
export const callsStore: Map<string, CallRecord> = new Map();
export const subscriptionsStore: Map<string, SubscriptionRecord> = new Map();
export const auditLogsStore: AuditLogRecord[] = [];

// Seed Default Data
const initialUsers: UserRecord[] = [
  {
    id: 'usr_alice',
    email: 'alice@cipherpulse.io',
    username: 'alice_sec',
    fullName: 'Alice Vance',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    statusMessage: '🔐 Verified Identity Key | E2EE Active',
    passwordHash: '$2a$10$wT8Kj6A5y7z9X1aB2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0',
    role: 'ADMIN',
    plan: 'ENTERPRISE',
    isMfaEnabled: true,
    isOnline: true,
    lastSeen: new Date().toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
  },
  {
    id: 'usr_bob',
    email: 'bob@cipherpulse.io',
    username: 'bob_builder',
    fullName: 'Bob Sterling',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    statusMessage: '⚡ Building Zero-Knowledge Systems',
    passwordHash: '$2a$10$wT8Kj6A5y7z9X1aB2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0',
    role: 'USER',
    plan: 'PRO',
    isMfaEnabled: false,
    isOnline: true,
    lastSeen: new Date().toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
  },
  {
    id: 'usr_carol',
    email: 'carol@cipherpulse.io',
    username: 'carol_crypto',
    fullName: 'Carol Zhang',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    statusMessage: '🛡️ Audit Lead & Security Analyst',
    passwordHash: '$2a$10$wT8Kj6A5y7z9X1aB2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0',
    role: 'USER',
    plan: 'BUSINESS',
    isMfaEnabled: true,
    isOnline: false,
    lastSeen: new Date(Date.now() - 3600000 * 2).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
  {
    id: 'usr_ai_assistant',
    email: 'ai@cipherpulse.io',
    username: 'cipher_ai',
    fullName: 'Cipher AI Assistant',
    avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
    statusMessage: '🤖 Autonomous E2EE AI Companion',
    passwordHash: 'AI_BOT_NO_PASSWORD',
    role: 'USER',
    plan: 'ENTERPRISE',
    isMfaEnabled: false,
    isOnline: true,
    lastSeen: new Date().toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 100).toISOString(),
  }
];

initialUsers.forEach(u => usersStore.set(u.id, u));

// Seed Default Devices & PreKey Bundles
const initialDevices: DeviceRecord[] = [
  { id: 'dev_alice_1', userId: 'usr_alice', deviceName: 'MacBook Pro M3 Max', registrationId: 1001, clientVersion: '1.4.2', lastActive: new Date().toISOString() },
  { id: 'dev_bob_1', userId: 'usr_bob', deviceName: 'ThinkPad X1 Carbon', registrationId: 2002, clientVersion: '1.4.0', lastActive: new Date().toISOString() },
  { id: 'dev_carol_1', userId: 'usr_carol', deviceName: 'iPhone 15 Pro', registrationId: 3003, clientVersion: '1.4.1', lastActive: new Date().toISOString() },
];
initialDevices.forEach(d => devicesStore.set(d.id, d));

// Seed Key Bundles (Base64 Web Crypto Compatible)
keyBundlesStore.set('dev_alice_1', {
  deviceId: 'dev_alice_1',
  identityPublicKey: 'MCowBQYDK2VwAyEAX5b7k8zL9P0Q1R2S3T4U5V6W7X8Y9Z0A1B2C3D4E5F6=',
  signedPreKey: {
    keyId: 1,
    publicKey: 'MCowBQYDK2VuAyEA8A9B0C1D2E3F4G5H6I7J8K9L0M1N2O3P4Q5R6S7T8U9=',
    signature: 'MEQCIG1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890abcdef=='
  },
  oneTimePreKeys: [
    { keyId: 101, publicKey: 'MCowBQYDK2VuAyEAA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V=', used: false },
    { keyId: 102, publicKey: 'MCowBQYDK2VuAyEAW1X2Y3Z4A5B6C7D8E9F0G1H2I3J4K5L6M7N8O9P0Q1R=', used: false }
  ]
});

keyBundlesStore.set('dev_bob_1', {
  deviceId: 'dev_bob_1',
  identityPublicKey: 'MCowBQYDK2VwAyEA9Z8Y7X6W5V4U3T2S1R0Q9P8O7N6M5L4K3J2I1H0G9F8=',
  signedPreKey: {
    keyId: 1,
    publicKey: 'MCowBQYDK2VuAyEA7T6S5R4Q3P2O1N0M9L8K7J6I5H4G3F2E1D0C9B8A7Z6=',
    signature: 'MEQCIH0987654321zyxwvutsrqponmlkjihgfedcbaZYXWVUTSRQPONMLKJIHGFEDCBA0987654321zyx=='
  },
  oneTimePreKeys: [
    { keyId: 201, publicKey: 'MCowBQYDK2VuAyEAU1V2W3X4Y5Z6A7B8C9D0E1F2G3H4I5J6K7L8M9N0O1P=', used: false }
  ]
});

// Seed Conversations
const initialConversations: ConversationRecord[] = [
  {
    id: 'conv_alice_bob',
    type: 'DIRECT',
    title: 'Alice & Bob (Encrypted Direct)',
    description: 'Private 1-on-1 X25519 Double Ratchet Tunnel',
    isEncrypted: true,
    createdById: 'usr_alice',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'conv_sec_team',
    type: 'GROUP',
    title: '🛡️ Core Security Architecture',
    description: 'Encrypted group chat for zero-trust key management & audits',
    avatar: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=150&auto=format&fit=crop&q=80',
    isEncrypted: true,
    createdById: 'usr_alice',
    createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'conv_announcements',
    type: 'CHANNEL',
    title: '📢 System Announcements',
    description: 'Official platform news, key rotations, and protocol releases',
    avatar: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=150&auto=format&fit=crop&q=80',
    isEncrypted: false,
    createdById: 'usr_alice',
    createdAt: new Date(Date.now() - 86400000 * 40).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'conv_ai_direct',
    type: 'DIRECT',
    title: '🤖 Cipher AI Assistant',
    description: 'Smart replies, document summaries, translation & cryptographic audit agent',
    avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
    isEncrypted: true,
    createdById: 'usr_alice',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

initialConversations.forEach(c => conversationsStore.set(c.id, c));

// Seed Memberships
const initialMembers: MemberRecord[] = [
  { id: 'm1', conversationId: 'conv_alice_bob', userId: 'usr_alice', role: 'ADMIN', joinedAt: new Date().toISOString() },
  { id: 'm2', conversationId: 'conv_alice_bob', userId: 'usr_bob', role: 'MEMBER', joinedAt: new Date().toISOString() },
  { id: 'm3', conversationId: 'conv_sec_team', userId: 'usr_alice', role: 'OWNER', joinedAt: new Date().toISOString() },
  { id: 'm4', conversationId: 'conv_sec_team', userId: 'usr_bob', role: 'ADMIN', joinedAt: new Date().toISOString() },
  { id: 'm5', conversationId: 'conv_sec_team', userId: 'usr_carol', role: 'MEMBER', joinedAt: new Date().toISOString() },
  { id: 'm6', conversationId: 'conv_announcements', userId: 'usr_alice', role: 'OWNER', joinedAt: new Date().toISOString() },
  { id: 'm7', conversationId: 'conv_announcements', userId: 'usr_bob', role: 'MEMBER', joinedAt: new Date().toISOString() },
  { id: 'm8', conversationId: 'conv_announcements', userId: 'usr_carol', role: 'MEMBER', joinedAt: new Date().toISOString() },
  { id: 'm9', conversationId: 'conv_ai_direct', userId: 'usr_alice', role: 'OWNER', joinedAt: new Date().toISOString() },
  { id: 'm10', conversationId: 'conv_ai_direct', userId: 'usr_ai_assistant', role: 'MEMBER', joinedAt: new Date().toISOString() },
];
initialMembers.forEach(m => membersStore.set(m.id, m));

// Seed Ciphertext Messages
messagesStore.set('conv_alice_bob', [
  {
    id: 'msg_1',
    conversationId: 'conv_alice_bob',
    senderId: 'usr_alice',
    senderDeviceId: 'dev_alice_1',
    messageType: 'TEXT',
    ciphertext: 'EncryptedPayload_Alice_Bob_1_X25519_DoubleRatchet_PayloadString==',
    iv: 'a1b2c3d4e5f67890',
    authTag: 'tag_12345678',
    reactions: [{ id: 'r1', userId: 'usr_bob', emoji: '🔒' }],
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: 'msg_2',
    conversationId: 'conv_alice_bob',
    senderId: 'usr_bob',
    senderDeviceId: 'dev_bob_1',
    messageType: 'TEXT',
    ciphertext: 'EncryptedPayload_Bob_Alice_2_RatchetStep_AES256GCM_OK==',
    iv: 'b2c3d4e5f67890a1',
    authTag: 'tag_87654321',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  }
]);

messagesStore.set('conv_sec_team', [
  {
    id: 'msg_sec_1',
    conversationId: 'conv_sec_team',
    senderId: 'usr_alice',
    messageType: 'TEXT',
    ciphertext: 'EncryptedGroupMessage_MegolmSenderKeyRatchet_SecurityAuditPassed==',
    iv: 'c3d4e5f67890a1b2',
    reactions: [{ id: 'r2', userId: 'usr_carol', emoji: '💯' }],
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  }
]);

messagesStore.set('conv_ai_direct', [
  {
    id: 'msg_ai_1',
    conversationId: 'conv_ai_direct',
    senderId: 'usr_ai_assistant',
    messageType: 'TEXT',
    ciphertext: 'Hello! I am Cipher AI. I operate entirely within client-side decrypted memory. How can I assist with summaries, key checks, or coding today?',
    iv: 'd4e5f67890a1b2c3',
    createdAt: new Date(Date.now() - 1800000).toISOString(),
  }
]);

// Seed Subscriptions
subscriptionsStore.set('sub_alice', {
  id: 'sub_alice',
  userId: 'usr_alice',
  plan: 'ENTERPRISE',
  stripeCustomerId: 'cus_N123456789',
  status: 'active',
  currentPeriodEnd: new Date(Date.now() + 86400000 * 365).toISOString()
});

subscriptionsStore.set('sub_bob', {
  id: 'sub_bob',
  userId: 'usr_bob',
  plan: 'PRO',
  stripeCustomerId: 'cus_N987654321',
  status: 'active',
  currentPeriodEnd: new Date(Date.now() + 86400000 * 30).toISOString()
});

// Helper functions for Store
export const logSecurityEvent = (userId: string | undefined, action: string, metadata?: object, ipAddress?: string) => {
  const entry: AuditLogRecord = {
    id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    userId,
    action,
    ipAddress: ipAddress || '127.0.0.1',
    metadata: metadata ? JSON.stringify(metadata) : undefined,
    createdAt: new Date().toISOString()
  };
  auditLogsStore.unshift(entry);
  if (auditLogsStore.length > 500) auditLogsStore.pop();
};
