# 🚀 Vercel & Railway Deployment Guide

This guide explains how to rectify the Vercel `404: NOT_FOUND` error and successfully deploy **CipherPulse** to Vercel and Railway.

---

## 🛠️ Rectifying Vercel `404: NOT_FOUND` Error

### Why the 404 Error Occurs
The repository is structured as a clean monorepo containing both `client/` (Next.js 14) and `server/` (Node.js/Express). By default, Vercel looks for Next.js files in the root folder (`./`). Since Next.js resides in `./client`, Vercel returns `404: NOT_FOUND`.

---

### Solution Option 1: Set Root Directory in Vercel Dashboard (Recommended)

1. Open your project settings on **[Vercel Dashboard](https://vercel.com/dashboard)**.
2. Go to **Settings** -> **General**.
3. Locate **Root Directory** and click **Edit**.
4. Set the **Root Directory** to `client`.
5. Click **Save**.
6. Go to **Deployments** tab and click **Redeploy**.

---

### Solution Option 2: Automatic `vercel.json` (Already Pushed to Repo)

We have added a root `vercel.json` and `client/vercel.json` to your repository:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "client/package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "client/$1"
    }
  ]
}
```

Vercel will now automatically locate and build the Next.js application inside `./client`.

---

## 📡 Backend Deployment (Railway / Render / Docker)

For the Express & Socket.IO backend:
1. Deploy the `server/` directory to **Railway.app** or **Render.com**.
2. Set Environment Variable: `NEXT_PUBLIC_SERVER_URL=https://your-backend.railway.app` in Vercel settings.
