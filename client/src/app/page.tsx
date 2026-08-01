'use client';

import React, { useEffect } from 'react';
import { useAppStore } from '../lib/store';
import { getSocket } from '../lib/socket';
import { Sidebar } from '../components/Sidebar';
import { ChatCanvas } from '../components/ChatCanvas';
import { CallModal } from '../components/CallModal';
import { SecurityVaultModal } from '../components/SecurityVaultModal';
import { PricingModal } from '../components/PricingModal';
import { AdminConsole } from '../components/AdminConsole';
import { AiAssistantDrawer } from '../components/AiAssistantDrawer';

export default function Home() {
  const { 
    currentUser, 
    setConversations, 
    setMessages, 
    addMessage, 
    activeTab, 
    activeConversationId,
    startCall
  } = useAppStore();

  useEffect(() => {
    // Fetch initial conversations from backend API with fallback
    const API_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000';
    
    fetch(`${API_URL}/api/v1/conversations`, {
      headers: { 'Authorization': 'Bearer demo-token' }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setConversations(data);
        } else {
          // Fallback mock conversations
          const defaultConvs = [
            {
              id: 'conv_alice_bob',
              type: 'DIRECT' as const,
              title: 'Bob Sterling (Encrypted DM)',
              description: 'X25519 Double Ratchet Tunnel',
              avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
              isEncrypted: true,
              updatedAt: new Date().toISOString(),
              members: [
                { id: 'm1', userId: 'usr_alice', username: 'alice_sec', fullName: 'Alice Vance', role: 'ADMIN', isOnline: true },
                { id: 'm2', userId: 'usr_bob', username: 'bob_builder', fullName: 'Bob Sterling', role: 'MEMBER', isOnline: true }
              ]
            },
            {
              id: 'conv_sec_team',
              type: 'GROUP' as const,
              title: '🛡️ Core Security Architecture',
              description: 'Zero-trust group key management',
              avatar: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=150&auto=format&fit=crop&q=80',
              isEncrypted: true,
              updatedAt: new Date().toISOString(),
              members: [
                { id: 'm3', userId: 'usr_alice', username: 'alice_sec', fullName: 'Alice Vance', role: 'OWNER', isOnline: true },
                { id: 'm4', userId: 'usr_bob', username: 'bob_builder', fullName: 'Bob Sterling', role: 'ADMIN', isOnline: true },
                { id: 'm5', userId: 'usr_carol', username: 'carol_crypto', fullName: 'Carol Zhang', role: 'MEMBER', isOnline: false }
              ]
            },
            {
              id: 'conv_announcements',
              type: 'CHANNEL' as const,
              title: '📢 System Announcements',
              description: 'Platform updates & protocol releases',
              avatar: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=150&auto=format&fit=crop&q=80',
              isEncrypted: false,
              updatedAt: new Date().toISOString(),
              members: []
            },
            {
              id: 'conv_ai_direct',
              type: 'DIRECT' as const,
              title: '🤖 Cipher AI Assistant',
              description: 'Autonomous E2EE Companion',
              avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
              isEncrypted: true,
              updatedAt: new Date().toISOString(),
              members: [
                { id: 'm9', userId: 'usr_alice', username: 'alice_sec', fullName: 'Alice Vance', role: 'OWNER', isOnline: true },
                { id: 'm10', userId: 'usr_ai_assistant', username: 'cipher_ai', fullName: 'Cipher AI Assistant', role: 'MEMBER', isOnline: true }
              ]
            }
          ];
          setConversations(defaultConvs);
        }
      })
      .catch(() => {
        // Network fallback
        setConversations([
          {
            id: 'conv_alice_bob',
            type: 'DIRECT',
            title: 'Bob Sterling (Encrypted DM)',
            description: 'X25519 Double Ratchet Tunnel',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
            isEncrypted: true,
            updatedAt: new Date().toISOString(),
            members: [
              { id: 'm1', userId: 'usr_alice', username: 'alice_sec', fullName: 'Alice Vance', role: 'ADMIN', isOnline: true },
              { id: 'm2', userId: 'usr_bob', username: 'bob_builder', fullName: 'Bob Sterling', role: 'MEMBER', isOnline: true }
            ]
          }
        ]);
      });

    // Seed Initial Messages for conv_alice_bob
    setMessages('conv_alice_bob', [
      {
        id: 'msg_1',
        conversationId: 'conv_alice_bob',
        senderId: 'usr_alice',
        messageType: 'TEXT',
        ciphertext: 'EncryptedPayload_Alice_Bob_1_X25519_DoubleRatchet_PayloadString==',
        iv: 'a1b2c3d4e5f67890',
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        isDecrypted: true,
        decryptedText: 'Hey Bob! The X25519 identity key rotation and Double Ratchet algorithm are fully verified on our client.'
      },
      {
        id: 'msg_2',
        conversationId: 'conv_alice_bob',
        senderId: 'usr_bob',
        messageType: 'TEXT',
        ciphertext: 'EncryptedPayload_Bob_Alice_2_RatchetStep_AES256GCM_OK==',
        iv: 'b2c3d4e5f67890a1',
        createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
        isDecrypted: true,
        decryptedText: 'Awesome Alice! AES-256-GCM authenticated tags match. Let\'s test a WebRTC video call.'
      }
    ]);

    // Connect to Real-time Socket.IO Server
    const socket = getSocket(currentUser.id, 'dev_alice_1');

    socket.on('new_e2ee_message', (msg: any) => {
      addMessage(msg.conversationId, {
        ...msg,
        isDecrypted: true,
        decryptedText: msg.ciphertext
      });
    });

    socket.on('call_offer_received', (data: any) => {
      startCall(data.conversationId, 'Incoming Encrypted WebRTC Call', data.type || 'VIDEO');
    });

    return () => {
      socket.off('new_e2ee_message');
      socket.off('call_offer_received');
    };
  }, []);

  return (
    <main className="flex h-screen w-screen overflow-hidden bg-[#090d16] text-slate-100">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area based on Active Tab */}
      <div className="flex-1 h-screen flex flex-col min-w-0">
        {activeTab === 'CHAT' && <ChatCanvas />}
        {activeTab === 'SECURITY' && <SecurityVaultModal />}
        {activeTab === 'PRICING' && <PricingModal />}
        {activeTab === 'ADMIN' && <AdminConsole />}
      </div>

      {/* Slide-out AI Companion Drawer */}
      <AiAssistantDrawer />

      {/* WebRTC Audio/Video Fullscreen Call Modal */}
      <CallModal />
    </main>
  );
}
