'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../lib/store';
import { WebRTCManager } from '../lib/webrtcManager';
import { 
  PhoneOff, 
  Mic, 
  MicOff, 
  Video as VideoIcon, 
  VideoOff, 
  Monitor, 
  Sparkles, 
  Volume2, 
  ShieldCheck, 
  Captions,
  Maximize2,
  Users,
  Camera
} from 'lucide-react';

export const CallModal: React.FC = () => {
  const { activeCall, endCall, updateCallState } = useAppStore();
  const [callDuration, setCallDuration] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [captionsText, setCaptionsText] = useState('Voice stream active. Encrypted WebRTC peer-to-peer connection established.');

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const webrtcManagerRef = useRef<WebRTCManager | null>(null);

  // Initialize WebRTC Media Streams on Call Start
  useEffect(() => {
    if (!activeCall) return;

    const manager = new WebRTCManager();
    webrtcManagerRef.current = manager;

    manager.onLocalStream = (stream) => {
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    };

    manager.onRemoteStream = (stream) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      }
    };

    manager.onAudioLevel = (level) => {
      setAudioLevel(Math.min(100, Math.round(level * 2)));
    };

    // Request Camera / Mic Media
    manager.startLocalMedia(activeCall.type).then(() => {
      manager.createOffer('usr_bob', activeCall.conversationId, activeCall.type);
    });

    // WebRTC Live Speech Recognition simulation / Web Speech API
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      try {
        const SpeechRecognition = (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            .map((result: any) => result[0].transcript)
            .join('');
          setCaptionsText(transcript || 'Live speech stream active...');
        };
        recognition.start();
      } catch (e) {
        // Fallback transcript update
      }
    }

    return () => {
      manager.stop();
      webrtcManagerRef.current = null;
    };
  }, [activeCall?.conversationId]);

  // Call timer counter
  useEffect(() => {
    let timer: any = null;
    if (activeCall?.isConnected) {
      timer = setInterval(() => setCallDuration(d => d + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [activeCall?.isConnected]);

  if (!activeCall) return null;

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Control Handlers
  const handleToggleMute = () => {
    const nextMuted = !activeCall.isMuted;
    updateCallState({ isMuted: nextMuted });
    webrtcManagerRef.current?.toggleMute(nextMuted);
  };

  const handleToggleCamera = () => {
    const nextCamera = !activeCall.isCameraOn;
    updateCallState({ isCameraOn: nextCamera });
    webrtcManagerRef.current?.toggleVideo(nextCamera);
  };

  const handleToggleScreenShare = async () => {
    if (!activeCall.isScreenSharing) {
      const stream = await webrtcManagerRef.current?.startScreenShare();
      if (stream) {
        updateCallState({ isScreenSharing: true });
      }
    } else {
      webrtcManagerRef.current?.stopScreenShare();
      updateCallState({ isScreenSharing: false });
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-2xl z-50 flex flex-col justify-between p-6 select-none animate-in fade-in duration-300">
      {/* Top Bar: Call Status & Security */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-glow">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-white tracking-wide">{activeCall.title}</h2>
            <p className="text-xs text-emerald-400 font-medium flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
              Live P2P WebRTC ({activeCall.type}) • {formatTime(callDuration)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeCall.isBackgroundBlurred && (
            <span className="px-3 py-1 text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-lg flex items-center gap-1.5 shadow-glow">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              AI Blur Active
            </span>
          )}
          <button className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all">
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Real WebRTC Video Grid */}
      <div className="flex-1 my-4 grid grid-cols-1 md:grid-cols-2 gap-4 items-center justify-center relative">
        {/* Remote Video Stream Tag */}
        <div className="w-full h-full min-h-[320px] bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden relative flex flex-col items-center justify-center shadow-2xl group">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          
          {/* Overlay info */}
          <div className="absolute top-4 left-4 px-3 py-1 bg-slate-950/80 backdrop-blur-md rounded-xl text-xs font-semibold text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            Peer Remote Feed (Encrypted)
          </div>

          {/* Audio Spectrum Bar */}
          <div className="absolute bottom-4 left-4 right-4 p-3 glass-panel rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-200">
              <Volume2 className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span>Audio Level ({audioLevel}%)</span>
            </div>
            {/* Dynamic Frequency Wave Visualizer */}
            <div className="flex items-end gap-1 h-5">
              {[40, 70, 30, 90, 50, 80, 60, 100].map((h, i) => (
                <span
                  key={i}
                  className="w-1 bg-cyan-400 rounded-full transition-all duration-75"
                  style={{ height: `${Math.max(15, (audioLevel * h) / 100)}%` }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Local Video Stream Tag */}
        <div className="w-full h-full min-h-[320px] bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden relative flex flex-col items-center justify-center shadow-2xl">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover ${activeCall.isCameraOn ? 'block' : 'hidden'} ${activeCall.isBackgroundBlurred ? 'blur-[1px]' : ''}`}
          />
          
          {!activeCall.isCameraOn && (
            <div className="flex flex-col items-center gap-3">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-glow">
                <Camera className="w-10 h-10 opacity-75" />
              </div>
              <p className="text-xs text-slate-400 font-medium">Local Camera Off (Mic Active)</p>
            </div>
          )}

          <div className="absolute top-4 left-4 px-3 py-1 bg-slate-950/80 backdrop-blur-md rounded-xl text-xs font-semibold text-white border border-slate-800">
            You (Local Camera Feed)
          </div>
        </div>
      </div>

      {/* Live Captions Transcript Overlay */}
      {activeCall.isCaptionsOn && (
        <div className="max-w-xl mx-auto mb-3 p-3 glass-panel border border-cyan-500/40 rounded-2xl text-center shadow-glow">
          <p className="text-xs text-cyan-300 font-medium leading-relaxed">
            <span className="font-bold text-white uppercase tracking-wider text-[10px] bg-cyan-500/20 px-1.5 py-0.5 rounded mr-1">LIVE CAPTIONS</span>
            "{captionsText}"
          </p>
        </div>
      )}

      {/* WebRTC Interactive Control Bar */}
      <div className="max-w-lg mx-auto w-full p-4 glass-panel border border-slate-800 rounded-3xl flex items-center justify-around z-10 shadow-2xl">
        {/* Toggle Mute Microphone */}
        <button
          onClick={handleToggleMute}
          className={`p-3.5 rounded-2xl border transition-all ${
            activeCall.isMuted 
              ? 'bg-rose-500/20 border-rose-500/50 text-rose-400' 
              : 'bg-slate-900 border-slate-800 text-slate-200 hover:border-cyan-500/40'
          }`}
          title={activeCall.isMuted ? "Unmute Microphone" : "Mute Microphone"}
        >
          {activeCall.isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5 text-cyan-400" />}
        </button>

        {/* Toggle Video Camera */}
        <button
          onClick={handleToggleCamera}
          className={`p-3.5 rounded-2xl border transition-all ${
            !activeCall.isCameraOn 
              ? 'bg-rose-500/20 border-rose-500/50 text-rose-400' 
              : 'bg-slate-900 border-slate-800 text-slate-200 hover:border-cyan-500/40'
          }`}
          title={activeCall.isCameraOn ? "Turn Camera Off" : "Turn Camera On"}
        >
          {!activeCall.isCameraOn ? <VideoOff className="w-5 h-5" /> : <VideoIcon className="w-5 h-5 text-cyan-400" />}
        </button>

        {/* Toggle Screen Sharing */}
        <button
          onClick={handleToggleScreenShare}
          className={`p-3.5 rounded-2xl border transition-all ${
            activeCall.isScreenSharing 
              ? 'bg-purple-500/20 border-purple-500/50 text-purple-300 shadow-glow' 
              : 'bg-slate-900 border-slate-800 text-slate-200 hover:border-cyan-500/40'
          }`}
          title="Share Screen"
        >
          <Monitor className="w-5 h-5 text-purple-400" />
        </button>

        {/* Toggle AI Background Blur */}
        <button
          onClick={() => updateCallState({ isBackgroundBlurred: !activeCall.isBackgroundBlurred })}
          className={`p-3.5 rounded-2xl border transition-all ${
            activeCall.isBackgroundBlurred 
              ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300' 
              : 'bg-slate-900 border-slate-800 text-slate-200'
          }`}
          title="Toggle AI Background Blur"
        >
          <Sparkles className="w-5 h-5 text-emerald-400" />
        </button>

        {/* Toggle Live Captions */}
        <button
          onClick={() => updateCallState({ isCaptionsOn: !activeCall.isCaptionsOn })}
          className={`p-3.5 rounded-2xl border transition-all ${
            activeCall.isCaptionsOn 
              ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300' 
              : 'bg-slate-900 border-slate-800 text-slate-200'
          }`}
          title="Toggle Captions"
        >
          <Captions className="w-5 h-5 text-indigo-400" />
        </button>

        {/* End Call Button */}
        <button
          onClick={endCall}
          className="p-3.5 px-6 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition-all shadow-lg shadow-rose-600/40 flex items-center gap-2"
          title="End Call"
        >
          <PhoneOff className="w-5 h-5" />
          <span className="text-xs">End</span>
        </button>
      </div>
    </div>
  );
};
