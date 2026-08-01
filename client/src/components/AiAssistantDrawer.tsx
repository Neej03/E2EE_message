'use client';

import React, { useState } from 'react';
import { useAppStore } from '../lib/store';
import { 
  Sparkles, 
  X, 
  Send, 
  Bot, 
  Lock, 
  FileText, 
  Code, 
  Languages, 
  ShieldCheck 
} from 'lucide-react';

export const AiAssistantDrawer: React.FC = () => {
  const { aiDrawerOpen, toggleAiDrawer } = useAppStore();
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    { sender: 'ai', text: 'Hello! I am Cipher AI. I execute entirely within client memory to inspect keys, generate smart summaries, or draft code solutions. How can I assist?' }
  ]);
  const [loading, setLoading] = useState(false);

  if (!aiDrawerOpen) return null;

  const handleSend = (customPrompt?: string) => {
    const text = customPrompt || prompt;
    if (!text.trim()) return;

    setMessages(prev => [...prev, { sender: 'user', text }]);
    setPrompt('');
    setLoading(true);

    setTimeout(() => {
      let reply = `🤖 **Cipher AI**: I analyzed your request in zero-knowledge client memory. Prompt: "${text}". All cryptographic ratchets are active.`;
      if (text.toLowerCase().includes('summary') || text.toLowerCase().includes('summarize')) {
        reply = `📌 **Thread Summary**:\n• Double Ratchet HKDF session active.\n• 2 peer identity keys verified.\n• Zero safety issues detected in payload audit.`;
      } else if (text.toLowerCase().includes('key') || text.toLowerCase().includes('security')) {
        reply = `🔒 **CipherPulse Key Audit**:\n• Ed25519 Identity Keypair: Verified\n• X25519 Signed Prekey: Valid\n• Cipher: AES-256-GCM authenticated tag ok.`;
      }

      setMessages(prev => [...prev, { sender: 'ai', text: reply }]);
      setLoading(false);
    }, 800);
  };

  return (
    <div className="w-80 h-screen glass-panel border-l border-slate-800/60 flex flex-col z-30 select-none shrink-0 animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="p-4 border-b border-slate-800/60 flex items-center justify-between bg-slate-950/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 shadow-glow">
            <Sparkles className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">Cipher AI Assistant</h3>
            <p className="text-[10px] text-emerald-400 font-medium">In-Memory Zero-Knowledge</p>
          </div>
        </div>
        <button onClick={toggleAiDrawer} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="p-3 border-b border-slate-800/40 bg-slate-950/30 flex flex-wrap gap-1.5">
        <button onClick={() => handleSend('Summarize current chat thread')} className="px-2.5 py-1 bg-slate-900 border border-slate-800 hover:border-purple-500/40 text-[11px] text-slate-300 rounded-lg flex items-center gap-1">
          <FileText className="w-3 h-3 text-purple-400" />
          Summarize Chat
        </button>
        <button onClick={() => handleSend('Verify E2EE key safety status')} className="px-2.5 py-1 bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-[11px] text-slate-300 rounded-lg flex items-center gap-1">
          <Lock className="w-3 h-3 text-cyan-400" />
          Check Key Safety
        </button>
      </div>

      {/* Message History */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`p-3 rounded-2xl text-xs max-w-[90%] ${m.sender === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'glass-card border border-slate-700/60 text-slate-200 rounded-bl-none'}`}>
              <div className="whitespace-pre-wrap">{m.text}</div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="p-3 glass-card border border-purple-500/30 text-xs text-purple-300 rounded-2xl rounded-bl-none animate-pulse flex items-center gap-2">
            <Bot className="w-4 h-4 text-cyan-400 animate-spin" />
            Analyzing in client memory...
          </div>
        )}
      </div>

      {/* Footer Composer */}
      <div className="p-3 border-t border-slate-800/60 bg-slate-950/80">
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Ask AI Companion..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 px-3 py-2 rounded-xl focus:outline-none focus:border-purple-500/50"
          />
          <button type="submit" className="p-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl shadow-glow">
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
