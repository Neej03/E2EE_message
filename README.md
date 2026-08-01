# 🔐 CipherPulse — Enterprise End-to-End Encrypted (E2EE) Messaging SaaS

CipherPulse is a production-ready, zero-knowledge SaaS messaging platform designed with **true End-to-End Encryption (E2EE)** based on the Signal Protocol standard (X25519, Ed25519, Double Ratchet, AES-256-GCM), WebRTC audio/video calls, AI assistant integration, SaaS billing, and real-time telemetry.

---

## 🌟 Key Features

* **True End-to-End Encryption (E2EE)**: Zero-knowledge server architecture. Only client devices possess decryption keys.
* **Double Ratchet Algorithm**: Perfect Forward Secrecy & Future Secrecy using HKDF-SHA256 & AES-256-GCM.
* **Multi-Device Session Keys**: Key vaults with 60-digit safety number fingerprint QR verification.
* **Encrypted Group Chats (Megolm Sender Keys)**: Re-keying on member rotation or departure.
* **WebRTC Voice & Video Calls**: Encrypted audio/video streaming, screen sharing, AI background blur, live captions.
* **Cipher AI Companion**: In-memory zero-knowledge assistant for thread summaries, key checks, and smart replies.
* **SaaS Subscription Engine**: Free, Pro ($12/mo), Business ($49/mo), and Enterprise ($199/mo) tiers with usage limit enforcement.
* **Admin Security Console**: Immutable security audit log stream, server health telemetry, user role governance.

---

## 🚀 Quick Start Guide

### Prerequisites
* Node.js v20+
* npm or yarn
* Docker & Docker Compose (optional for production database)

### Running Locally

1. **Install Dependencies**
   ```bash
   # From root directory
   npm run install:all
   ```

2. **Start Backend Server (Port 5000)**
   ```bash
   cd server
   npm run dev
   ```

3. **Start Next.js Frontend (Port 3000)**
   ```bash
   cd client
   npm run dev
   ```

4. Open `http://localhost:3000` in your browser.

---

## 🐳 Docker Deployment

To launch full stack with PostgreSQL, Redis, Express Backend, and Next.js Frontend:
```bash
docker-compose up --build -d
```

---

## 📄 Documentation

* [Cryptographic E2EE Protocol Spec](file:///C:/Users/neejb/.gemini/antigravity/scratch/e2ee-messaging-saas/docs/E2EE_PROTOCOL_SPEC.md)
* [Implementation Plan](file:///C:/Users/neejb/.gemini/antigravity/brain/e02ab179-232f-42f4-86df-4a9cbf3f9e7d/implementation_plan.md)
