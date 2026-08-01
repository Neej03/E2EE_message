'use client';

import React, { useState } from 'react';
import { useAppStore } from '../lib/store';
import { 
  ShieldCheck, 
  Check, 
  Zap, 
  Sparkles, 
  CreditCard, 
  Building2, 
  Crown, 
  ArrowRight,
  Lock
} from 'lucide-react';

export const PricingModal: React.FC = () => {
  const { currentUser, setCurrentUser } = useAppStore();
  const [selectedBillingCycle, setSelectedBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const handleUpgrade = (planId: 'FREE' | 'PRO' | 'BUSINESS' | 'ENTERPRISE') => {
    setIsProcessing(planId);
    setTimeout(() => {
      setCurrentUser({ ...currentUser, plan: planId });
      setIsProcessing(null);
    }, 1200);
  };

  const plans = [
    {
      id: 'FREE',
      name: 'Free Security',
      priceMonthly: 0,
      priceAnnual: 0,
      description: 'Zero-knowledge 1-on-1 chats for personal privacy.',
      features: [
        'End-to-End Encryption (X25519)',
        '500 MB Encrypted Attachment Vault',
        'Up to 10 Group Chat Members',
        'WebRTC 1-on-1 Voice & Video',
        'Standard Push Notifications'
      ],
      popular: false,
      color: 'slate'
    },
    {
      id: 'PRO',
      name: 'Pro Security',
      priceMonthly: 15,
      priceAnnual: 12,
      description: 'Ideal for security professionals & power users.',
      features: [
        'Everything in Free Plan',
        '25 GB Encrypted Attachment Storage',
        'Up to 100 Group Key Ratchet Members',
        'Cipher AI Assistant & Summarizer',
        'Cryptographic Disappearing Timers',
        'Priority WebRTC Voice & Video'
      ],
      popular: true,
      color: 'cyan'
    },
    {
      id: 'BUSINESS',
      name: 'Business Enterprise',
      priceMonthly: 59,
      priceAnnual: 49,
      description: 'Complete security stack for privacy-first teams.',
      features: [
        'Everything in Pro Plan',
        '250 GB Encrypted Storage Vault',
        'Up to 500 Group & Channel Members',
        'Immutable Security Audit Logs',
        'Admin Telemetry & Compliance Control',
        'Custom E2EE Group Key Rotation'
      ],
      popular: false,
      color: 'purple'
    },
    {
      id: 'ENTERPRISE',
      name: 'Enterprise Custom',
      priceMonthly: 249,
      priceAnnual: 199,
      description: 'Dedicated infrastructure with zero-trust SLA.',
      features: [
        'Unlimited Encrypted Vault Storage',
        'Up to 5,000 Community Members',
        'Dedicated TURN/STUN Relay Nodes',
        'Custom SSO (SAML, Okta, OIDC)',
        '24/7 Dedicated Security Engineer Support',
        'Custom Branding & Domain CNAME'
      ],
      popular: false,
      color: 'indigo'
    }
  ];

  return (
    <div className="flex-1 h-screen overflow-y-auto p-8 glass-panel select-none">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <span className="px-3 py-1 text-xs font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 rounded-full inline-flex items-center gap-1.5 shadow-glow">
            <Sparkles className="w-3.5 h-3.5" />
            CipherPulse SaaS Tier Engine
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Enterprise Security Plans for Teams & Orgs
          </h1>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Upgrade your plan for expanded encrypted vault storage, AI thread summaries, security audit streaming, and dedicated WebRTC relay servers.
          </p>

          {/* Monthly / Annual Billing Toggle */}
          <div className="pt-4 flex items-center justify-center gap-3">
            <span className={`text-xs font-semibold ${selectedBillingCycle === 'monthly' ? 'text-white' : 'text-slate-400'}`}>Monthly</span>
            <button
              onClick={() => setSelectedBillingCycle(s => s === 'monthly' ? 'annual' : 'monthly')}
              className="w-12 h-6 rounded-full bg-slate-900 border border-slate-800 p-1 relative transition-all"
            >
              <div className={`w-4 h-4 rounded-full bg-cyan-400 transition-all ${selectedBillingCycle === 'annual' ? 'translate-x-6 bg-purple-400' : 'translate-x-0'}`} />
            </button>
            <span className={`text-xs font-semibold flex items-center gap-1.5 ${selectedBillingCycle === 'annual' ? 'text-white' : 'text-slate-400'}`}>
              Annual
              <span className="px-2 py-0.5 text-[9px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-md">
                SAVE 20%
              </span>
            </span>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => {
            const isCurrentPlan = currentUser.plan === plan.id;
            const price = selectedBillingCycle === 'annual' ? plan.priceAnnual : plan.priceMonthly;

            return (
              <div
                key={plan.id}
                className={`glass-card p-6 rounded-3xl border flex flex-col justify-between relative transition-all duration-300 hover:scale-[1.02] ${
                  plan.popular 
                    ? 'border-cyan-500/60 bg-gradient-to-b from-cyan-950/40 to-slate-950/80 shadow-glow' 
                    : 'border-slate-800/80 hover:border-slate-700'
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 text-[10px] font-extrabold bg-gradient-to-r from-cyan-500 to-indigo-600 text-white rounded-full uppercase tracking-wider shadow-lg">
                    MOST POPULAR
                  </span>
                )}

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg text-white">{plan.name}</h3>
                    {plan.id === 'ENTERPRISE' && <Crown className="w-5 h-5 text-amber-400" />}
                  </div>

                  <p className="text-xs text-slate-400 min-h-[36px]">{plan.description}</p>

                  <div className="pt-2">
                    <span className="text-3xl font-extrabold text-white">${price}</span>
                    <span className="text-xs text-slate-400 font-medium">/month</span>
                  </div>

                  <div className="border-t border-slate-800/80 pt-4 space-y-2.5">
                    {plan.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                        <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    onClick={() => handleUpgrade(plan.id as any)}
                    disabled={isCurrentPlan || isProcessing === plan.id}
                    className={`w-full py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                      isCurrentPlan
                        ? 'bg-slate-800 text-slate-400 border border-slate-700 cursor-default'
                        : plan.popular
                          ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 hover:opacity-95 text-white shadow-glow'
                          : 'bg-slate-900 hover:bg-slate-800 text-white border border-slate-800'
                    }`}
                  >
                    {isProcessing === plan.id ? (
                      <span>Processing Stripe Checkout...</span>
                    ) : isCurrentPlan ? (
                      <span className="flex items-center gap-1">
                        <Check className="w-4 h-4 text-emerald-400" />
                        Current Active Plan
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        Upgrade to {plan.name}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Enterprise SLA Banner */}
        <div className="p-6 rounded-3xl bg-slate-950/80 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">Need On-Premise E2EE Deployment?</h4>
              <p className="text-xs text-slate-400">Custom HSM key modules, air-gapped deployment, and HIPAA/SOC2 compliance.</p>
            </div>
          </div>
          <button className="px-5 py-2.5 bg-slate-900 border border-slate-700 hover:border-purple-500/50 text-white font-bold text-xs rounded-xl transition-all shrink-0">
            Contact Security Engineering
          </button>
        </div>
      </div>
    </div>
  );
};
