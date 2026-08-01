'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAppStore, Message } from '../lib/store';
import { encryptMessage } from '../lib/crypto/e2eeEngine';
import { 
  ShieldCheck, 
  Lock, 
  Phone, 
  Video, 
  Clock, 
  Paperclip, 
  Mic, 
  Send, 
  Smile, 
  Sparkles, 
  CheckCheck, 
  FileText, 
  Play, 
  Pause,
  QrCode,
  X,
  Download,
  File,
  Film,
  Music,
  ChevronLeft
} from 'lucide-react';

export const ChatCanvas: React.FC = () => {
  const { 
    conversations, 
    activeConversationId, 
    messages, 
    addMessage, 
    currentUser,
    startCall,
    openSafetyNumberModal,
    setIsMobileSidebarOpen
  } = useAppStore();

  const [inputMessage, setInputMessage] = useState('');
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [voiceTimer, setVoiceTimer] = useState(0);
  const [disappearingSec, setDisappearingSec] = useState<number>(0);
  const [showSmartReplies, setShowSmartReplies] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachedFile, setAttachedFile] = useState<{ name: string; size: string; type: string; url?: string } | null>(null);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [previewDocumentModal, setPreviewDocumentModal] = useState<{ name: string; url?: string; type: string } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeConv = conversations.find(c => c.id === activeConversationId);
  const currentMessages = activeConversationId ? (messages[activeConversationId] || []) : [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages.length]);

  useEffect(() => {
    let interval: any = null;
    if (isRecordingVoice) {
      interval = setInterval(() => setVoiceTimer(t => t + 1), 1000);
    } else {
      setVoiceTimer(0);
    }
    return () => clearInterval(interval);
  }, [isRecordingVoice]);

  if (!activeConv) {
    return (
      <div className="flex-1 h-[100dvh] flex flex-col items-center justify-center text-center p-6 bg-slate-950">
        <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4 shadow-glow">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Select an Encrypted Chat</h2>
        <p className="text-xs md:text-sm text-slate-400 max-w-md">
          All messaging sessions use client-side X25519 Double Ratchet encryption.
        </p>
        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="mt-6 px-6 py-3 bg-gradient-to-r from-cyan-500 to-indigo-600 text-white border border-cyan-400/40 rounded-xl text-xs font-bold shadow-glow md:hidden active:scale-95"
        >
          ← Open Conversations Menu
        </button>
      </div>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeMb = (file.size / 1024 / 1024).toFixed(2);
    const formattedSize = file.size > 1024 * 1024 ? `${sizeMb} MB` : `${Math.round(file.size / 1024)} KB`;
    const objectUrl = URL.createObjectURL(file);

    setAttachedFile({
      name: file.name,
      size: formattedSize,
      type: file.type || 'application/octet-stream',
      url: objectUrl
    });
  };

  const handleInsertEmoji = (emoji: string) => {
    setInputMessage(prev => prev + emoji);
  };

  const handleSendMessage = async (e?: React.FormEvent, customContent?: string) => {
    if (e) e.preventDefault();
    const content = customContent || inputMessage;

    if (!content.trim() && !isRecordingVoice && !attachedFile) return;

    let plaintext = content.trim();
    let msgType: Message['messageType'] = 'TEXT';

    if (isRecordingVoice) {
      plaintext = `🎙️ Voice Note (${voiceTimer}s)`;
      msgType = 'VOICE_NOTE';
    } else if (attachedFile) {
      if (attachedFile.type.startsWith('image/')) msgType = 'IMAGE';
      else if (attachedFile.type.startsWith('video/')) msgType = 'VIDEO';
      else if (attachedFile.type.startsWith('audio/')) msgType = 'AUDIO';
      else msgType = 'DOCUMENT';
      plaintext = attachedFile.name;
    }

    const encrypted = await encryptMessage(plaintext);

    const newMsg: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      conversationId: activeConv.id,
      senderId: currentUser.id,
      messageType: msgType,
      ciphertext: encrypted.ciphertext,
      iv: encrypted.iv,
      ephemeralPublicKey: encrypted.ephemeralPublicKey,
      disappearingDuration: disappearingSec,
      createdAt: new Date().toISOString(),
      isDecrypted: true,
      decryptedText: plaintext
    };

    if (attachedFile?.url) {
      (newMsg as any).fileUrl = attachedFile.url;
      (newMsg as any).fileName = attachedFile.name;
      (newMsg as any).fileSize = attachedFile.size;
    }

    addMessage(activeConv.id, newMsg);
    setInputMessage('');
    setIsRecordingVoice(false);
    setAttachedFile(null);
    setShowEmojiPicker(false);
  };

  const peerMember = activeConv.members.find(m => m.userId !== currentUser.id) || activeConv.members[0];

  const emojiCategories = [
    { label: 'Security & Tech', emojis: ['🔒', '🔑', '🛡️', '⚡', '💻', '📱', '📡', '🌐', '🚀', '💯'] },
    { label: 'Expressions & Smileys', emojis: ['😀', '😂', '😍', '😎', '🥳', '🤔', '😴', '😇', '🤖', '🤯'] },
    { label: 'Gestures & Reactions', emojis: ['👍', '👎', '👏', '🙌', '🙏', '❤️', '🔥', '✨', '📌', '🎯'] }
  ];

  return (
    <div className="flex-1 h-[100dvh] flex flex-col glass-panel relative overflow-hidden bg-slate-950">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
      />

      {/* Mobile-Friendly Top Navigation Header */}
      <header className="p-3 px-3 md:px-6 border-b border-slate-800/80 bg-slate-950/90 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-2 md:gap-3.5 min-w-0">
          {/* Prominent Back to Chats Button on Mobile */}
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="p-1.5 px-2.5 rounded-xl bg-slate-900 border border-slate-800 text-cyan-400 hover:text-white md:hidden flex items-center gap-1 text-xs font-bold shrink-0 active:scale-95"
            title="Back to Conversations"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Chats</span>
          </button>

          <img 
            src={activeConv.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'} 
            alt={activeConv.title} 
            className="w-9 h-9 rounded-full object-cover ring-2 ring-cyan-500/40 shrink-0"
          />

          <div className="min-w-0">
            <h2 className="font-bold text-sm md:text-base text-white tracking-wide truncate">{activeConv.title}</h2>
            <p className="text-[10px] md:text-xs text-slate-400 flex items-center gap-1.5 truncate">
              <span className="text-emerald-400 font-medium truncate">Session Active (E2EE)</span>
            </p>
          </div>
        </div>

        {/* Header Action Icons */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => openSafetyNumberModal(peerMember)}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-300"
            title="Verify Safety Numbers"
          >
            <QrCode className="w-4 h-4 text-cyan-400" />
          </button>

          <button
            onClick={() => startCall(activeConv.id, activeConv.title, 'AUDIO')}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-emerald-400"
            title="Start Encrypted Voice Call"
          >
            <Phone className="w-4 h-4 text-emerald-400" />
          </button>

          <button
            onClick={() => startCall(activeConv.id, activeConv.title, 'VIDEO')}
            className="p-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-medium shadow-glow active:scale-95"
            title="Start Encrypted Video Call"
          >
            <Video className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto p-3 md:p-6 space-y-3.5">
        <div className="max-w-md mx-auto p-2.5 rounded-2xl glass-card border border-cyan-500/20 text-center">
          <div className="flex items-center justify-center gap-1.5 text-cyan-400 font-semibold text-xs mb-0.5">
            <Lock className="w-3.5 h-3.5" />
            End-to-End Encryption Active
          </div>
          <p className="text-[10px] text-slate-400">
            Messages are encrypted using X25519 Double Ratchet & AES-256-GCM.
          </p>
        </div>

        {currentMessages.map((msg) => {
          const isMe = msg.senderId === currentUser.id;
          const fileUrl = (msg as any).fileUrl;
          const fileName = (msg as any).fileName || msg.decryptedText || 'Encrypted File';
          const fileSize = (msg as any).fileSize || '2.4 MB';

          return (
            <div 
              key={msg.id} 
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group`}
            >
              <div className="flex items-start gap-2 max-w-[92%] md:max-w-[70%]">
                {!isMe && (
                  <img 
                    src={activeConv.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'} 
                    alt="Sender" 
                    className="w-7 h-7 rounded-full object-cover mt-1 shrink-0"
                  />
                )}

                <div 
                  className={`p-3 rounded-2xl shadow-lg relative ${
                    isMe 
                      ? 'bg-gradient-to-r from-cyan-600/90 to-indigo-600/90 text-white rounded-br-none border border-cyan-400/30' 
                      : 'glass-card text-slate-100 rounded-bl-none border border-slate-700/60'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] opacity-75 mb-1 gap-2">
                    <span className="font-semibold">{isMe ? 'You' : (peerMember?.fullName || 'Sender')}</span>
                    <span className="flex items-center gap-1 text-cyan-300 font-mono">
                      <Lock className="w-2.5 h-2.5" />
                      AES-256
                    </span>
                  </div>

                  {/* Playable Voice Note / Audio Player */}
                  {(msg.messageType === 'VOICE_NOTE' || msg.messageType === 'AUDIO') && (
                    <div className="p-2.5 bg-slate-950/70 border border-cyan-500/30 rounded-xl space-y-2 min-w-[180px] sm:min-w-[240px]">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Music className="w-4 h-4 text-cyan-400" />
                          <span className="text-xs font-semibold text-white truncate max-w-[120px]">
                            {msg.messageType === 'VOICE_NOTE' ? 'Voice Note' : fileName}
                          </span>
                        </div>
                        <span className="text-[10px] text-cyan-300 font-mono">Playable</span>
                      </div>

                      {fileUrl ? (
                        <audio controls src={fileUrl} className="w-full h-8 rounded-lg" />
                      ) : (
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => setPlayingAudioId(playingAudioId === msg.id ? null : msg.id)}
                            className="w-8 h-8 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center font-bold shrink-0 shadow-glow"
                          >
                            {playingAudioId === msg.id ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                          </button>
                          <div className="flex-1 flex items-end gap-1 h-5">
                            {[40, 80, 50, 100, 70, 90, 60, 30, 85, 45].map((h, i) => (
                              <span 
                                key={i} 
                                className={`w-1 rounded-full transition-all ${playingAudioId === msg.id ? 'bg-cyan-400 animate-pulse' : 'bg-slate-700'}`} 
                                style={{ height: `${h}%` }}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Playable Video Player */}
                  {msg.messageType === 'VIDEO' && (
                    <div className="rounded-xl overflow-hidden border border-slate-700/80 bg-slate-950 max-w-xs space-y-1">
                      {fileUrl ? (
                        <video controls src={fileUrl} className="w-full max-h-56 object-cover" />
                      ) : (
                        <div className="w-full h-36 bg-slate-900 flex flex-col items-center justify-center text-slate-400 gap-2">
                          <Film className="w-8 h-8 text-cyan-400" />
                          <span className="text-xs font-semibold">Playable Video</span>
                        </div>
                      )}
                      <p className="p-2 text-xs font-semibold text-slate-200 truncate">{fileName}</p>
                    </div>
                  )}

                  {/* Document Preview Card */}
                  {msg.messageType === 'DOCUMENT' && (
                    <div className="p-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl flex items-center justify-between gap-3 min-w-[180px] max-w-xs">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-white truncate">{fileName}</h4>
                          <p className="text-[10px] text-slate-400">{fileSize}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {fileUrl && (
                          <button
                            onClick={() => setPreviewDocumentModal({ name: fileName, url: fileUrl, type: 'document' })}
                            className="p-1 rounded-lg bg-slate-900 border border-slate-800 text-cyan-400"
                            title="Preview Document"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {fileUrl && (
                          <a
                            href={fileUrl}
                            download={fileName}
                            className="p-1 rounded-lg bg-slate-900 border border-slate-800 text-purple-400"
                            title="Download Document"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Image Viewport */}
                  {msg.messageType === 'IMAGE' && (
                    <div className="rounded-xl overflow-hidden border border-slate-700/80 bg-slate-950 max-w-xs space-y-1">
                      <img 
                        src={fileUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80'} 
                        alt="Image Attachment" 
                        className="w-full max-h-56 object-cover cursor-pointer"
                        onClick={() => setPreviewDocumentModal({ name: fileName, url: fileUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80', type: 'image' })}
                      />
                      <div className="p-2 flex items-center justify-between text-xs text-slate-300">
                        <span className="truncate">{fileName}</span>
                        {fileUrl && (
                          <a href={fileUrl} download={fileName} className="text-cyan-400">
                            <Download className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Plaintext Message */}
                  {msg.messageType === 'TEXT' && (
                    <div className="text-xs md:text-sm leading-relaxed whitespace-pre-wrap font-sans">
                      {msg.decryptedText || msg.ciphertext}
                    </div>
                  )}

                  {/* Message Footer */}
                  <div className="flex items-center justify-end gap-1 text-[10px] opacity-70 mt-1">
                    <span>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {isMe && <CheckCheck className="w-3.5 h-3.5 text-cyan-300" />}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Interactive Lightbox Modal */}
      {previewDocumentModal && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none">
          <div className="max-w-2xl w-full glass-panel border border-slate-800 rounded-3xl p-4 shadow-2xl relative space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="font-bold text-xs text-white truncate">{previewDocumentModal.name}</h3>
              <button onClick={() => setPreviewDocumentModal(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-[50vh] overflow-auto flex items-center justify-center bg-slate-950 p-2 rounded-xl">
              {previewDocumentModal.type === 'image' ? (
                <img src={previewDocumentModal.url} alt="Document View" className="max-h-[45vh] object-contain rounded-lg" />
              ) : (
                <iframe src={previewDocumentModal.url} className="w-full h-[40vh] rounded-lg border border-slate-800" />
              )}
            </div>

            <div className="flex items-center justify-end pt-1">
              <a
                href={previewDocumentModal.url}
                download={previewDocumentModal.name}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold text-xs rounded-xl shadow-glow"
              >
                Download File
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Emoji Picker Popover */}
      {showEmojiPicker && (
        <div className="absolute bottom-16 left-2 right-2 md:left-4 md:w-72 z-50 glass-panel border border-slate-800 rounded-2xl p-3 shadow-2xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Smile className="w-4 h-4 text-cyan-400" />
              Emoji Picker
            </span>
            <button onClick={() => setShowEmojiPicker(false)} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2 max-h-44 overflow-y-auto">
            {emojiCategories.map((cat, idx) => (
              <div key={idx}>
                <div className="text-[10px] font-semibold text-slate-400 mb-1">{cat.label}</div>
                <div className="grid grid-cols-5 gap-1">
                  {cat.emojis.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => handleInsertEmoji(emoji)}
                      className="p-1.5 rounded-lg hover:bg-slate-800 text-lg text-center active:scale-95"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Attachment Preview Chip */}
      {attachedFile && (
        <div className="px-4 py-2 bg-slate-950 border-t border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              <File className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-semibold text-white truncate">{attachedFile.name}</h4>
              <p className="text-[10px] text-cyan-300 font-mono">{attachedFile.size}</p>
            </div>
          </div>

          <button onClick={() => setAttachedFile(null)} className="text-slate-400 hover:text-rose-400 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* AI Smart Replies Bar */}
      {showSmartReplies && !attachedFile && (
        <div className="px-3 py-1.5 bg-slate-950/80 border-t border-slate-800/60 flex items-center gap-2 overflow-x-auto shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          {["Got it! 🔐", "Join video call 📹", "Audit log verified 👍"].map((reply, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(undefined, reply)}
              className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-slate-300 hover:text-cyan-300 shrink-0 active:scale-95"
            >
              {reply}
            </button>
          ))}
        </div>
      )}

      {/* Mobile-Optimized Fixed Bottom Composer Area */}
      <div className="p-2.5 md:p-4 border-t border-slate-800 bg-slate-950 sticky bottom-0 z-20 shrink-0">
        <form onSubmit={handleSendMessage} className="flex items-center gap-1.5">
          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-400 shrink-0 active:scale-95"
            title="Attach File"
          >
            <Paperclip className="w-4 h-4 md:w-5 md:h-5" />
          </button>

          <button 
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className={`p-2.5 rounded-xl border transition-all shrink-0 active:scale-95 ${
              showEmojiPicker 
                ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300' 
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
            title="Emoji Picker"
          >
            <Smile className="w-4 h-4 md:w-5 md:h-5" />
          </button>

          <button 
            type="button"
            onClick={() => setIsRecordingVoice(!isRecordingVoice)}
            className={`p-2.5 rounded-xl border transition-all shrink-0 active:scale-95 ${
              isRecordingVoice 
                ? 'bg-rose-500/20 border-rose-500/50 text-rose-400 animate-pulse' 
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
            title="Record Voice Note"
          >
            <Mic className="w-4 h-4 md:w-5 md:h-5" />
          </button>

          {isRecordingVoice ? (
            <div className="flex-1 p-2 px-3 bg-rose-950/40 border border-rose-500/40 rounded-xl flex items-center justify-between text-xs text-rose-300 min-w-0">
              <span className="flex items-center gap-1.5 font-medium truncate">
                <span className="w-2 h-2 bg-rose-500 rounded-full animate-ping shrink-0"></span>
                Recording ({voiceTimer}s)
              </span>
              <button 
                type="button" 
                onClick={() => setIsRecordingVoice(false)}
                className="text-rose-400 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <input
              type="text"
              placeholder="Type encrypted message..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-800 text-xs md:text-sm text-white placeholder-slate-500 px-3 py-2.5 rounded-xl focus:outline-none focus:border-cyan-500/60 min-w-0"
            />
          )}

          <button
            type="submit"
            className="p-2.5 px-3.5 md:px-5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-medium shadow-glow active:scale-95 flex items-center gap-1.5 shrink-0"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline text-xs font-semibold">Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
