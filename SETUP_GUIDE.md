# 🌐 DecentralWatch — Complete Setup & Presentation Guide

> **Who this is for:** Someone who knows nothing about this project and wants to set it up, run it, and explain it to college judges.
> **Time to complete setup:** ~45 minutes (most of it is downloading things)

---

## 📋 Table of Contents

1. [What Is This Project? (Plain English)](#1-what-is-this-project-plain-english)
2. [How It Works (Architecture)](#2-how-it-works-architecture)
3. [Tech Stack](#3-tech-stack)
4. [Prerequisites — What to Install First](#4-prerequisites--what-to-install-first)
5. [Set Up Free Cloud Database (Neon DB)](#5-set-up-free-cloud-database-neon-db)
6. [Set Up All Environment Variables](#6-set-up-all-environment-variables)
7. [Install All Dependencies](#7-install-all-dependencies)
8. [Set Up Database Tables](#8-set-up-database-tables)
9. [Run All Services](#9-run-all-services)
10. [Test the Full Flow](#10-test-the-full-flow)
11. [Desktop Validator App (Electron)](#11-desktop-validator-app-electron)
12. [Troubleshooting](#12-troubleshooting)
13. [Judge Presentation Script](#13-judge-presentation-script)
14. [Quick Reference](#14-quick-reference)

---

## 1. What Is This Project? (Plain English)

Imagine you have a website. You want to know: **"Is my website online right now?"**

Services like UptimeRobot do this — but they check from **one central server**. If that server lies or goes down, you'd never know. You also have to blindly **trust** them.

**DecentralWatch** solves this by being **decentralized**:

- 🌍 **Hundreds of independent validators** (people's computers & cloud bots) all over the world check your website every 60 seconds
- 🔐 Each check is **cryptographically signed** using a Solana blockchain wallet — like a digital fingerprint that cannot be faked
- 💰 Validators who honestly check websites **earn SOL cryptocurrency** as a reward — this incentivizes participation
- 📊 Website owners see a **real-time dashboard** with uptime charts, latency graphs, and instant downtime alerts

**Think of it as: Cloudflare + Crypto + Uptime Monitoring = DecentralWatch**

No single point of failure. No single authority to trust. Trustless, transparent, and global.

---

## 2. How It Works (Architecture)

```
┌──────────────────────────────────────────────────────────────┐
│                    USER (Website Owner)                       │
│               Next.js Frontend (port 3000)                   │
│         - Adds websites to monitor                           │
│         - Views uptime charts & stats                        │
└──────────────────────┬───────────────────────────────────────┘
                       │ HTTP REST calls
                       ▼
┌──────────────────────────────────────────────────────────────┐
│                  API Server (port 8080)                       │
│            Express + Bun + JWT Authentication                 │
│  - Manages users, websites, validators in PostgreSQL          │
│  - Cron jobs: auto-disable expired sites, send alerts        │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                  HUB Server (port 8081)                       │
│              WebSocket Server built with Bun                  │
│  - The "brain" — dispatches validation tasks every 60s       │
│  - Verifies cryptographic signatures from validators          │
│  - Records results in DB, credits validator wallets           │
└──────────┬───────────────────────────────┬───────────────────┘
           │ WebSocket                     │ WebSocket
           ▼                               ▼
┌──────────────────────┐     ┌─────────────────────────────────┐
│  Server Validator    │     │     Desktop Validator App        │
│  (apps/validator)    │     │   (Electron — apps/desktop_     │
│  - Cloud/EC2 bot     │     │    validator_app)                │
│  - Pings websites    │     │  - Runs on your laptop           │
│  - Signs responses   │     │  - GUI app with Phantom wallet   │
│    with Solana key   │     │  - Same signing logic            │
└──────────────────────┘     └─────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────────────────┐
│              PostgreSQL Database (Neon DB — cloud)            │
│                     via Prisma ORM                            │
│  Tables: Users, Websites, WebsiteTicks, Validators,          │
│          Notifications, Payouts, WebsiteStates               │
└──────────────────────────────────────────────────────────────┘
```

### Services at a Glance

| Service | Folder | Port | What It Does |
|---|---|---|---|
| **Frontend** | `apps/frontend` | 3000 | User-facing dashboard (Next.js) |
| **API** | `apps/api` | 8080 | REST API backend (Express + Bun) |
| **Hub** | `apps/hub` | 8081 | WebSocket coordinator (Bun) |
| **Validator** | `apps/validator` | — | Cloud uptime-checking bot |
| **Desktop App** | `apps/desktop_validator_app` | — | Electron GUI validator |
| **DB Package** | `packages/db` | — | Shared Prisma ORM DB layer |

### The Validation Flow (Step by Step)

1. Hub fetches all active websites from DB every 60 seconds
2. Hub sends a `validate` message over WebSocket to each connected validator
3. Validator pings the website URL, measures response time and status
4. Validator **signs** the result with its private Solana key using NaCl Ed25519
5. Validator sends signed result back to Hub
6. Hub **verifies** the signature — reject if invalid (prevents cheating!)
7. Hub records the tick in DB (`WebsiteTick` table)
8. Hub increments validator's `pendingPayouts` by 100 lamports
9. Dashboard updates with the new data point in real time

---

## 3. Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 15, Tailwind CSS, TypeScript |
| **Backend API** | Node.js, Express, Bun runtime |
| **Hub (Real-Time)** | Bun WebSockets |
| **Database** | PostgreSQL (Neon DB), Prisma ORM |
| **Blockchain** | Solana, NaCl (TweetNaCl) for Ed25519 signing |
| **Desktop App** | Electron + Vite + React |
| **Monorepo** | Turborepo + Bun Workspaces |
| **Auth** | JWT (JSON Web Tokens) |
| **Emails/Alerts** | Resend API |

---

## 4. Prerequisites — What to Install First

> Install these **in order**. Don't skip any.

### 4.1 — Node.js (v18+)

**What it is:** Lets you run JavaScript outside the browser.

1. Go to **[nodejs.org](https://nodejs.org)** → Download the **LTS** version
2. Run the installer, click Next through everything
3. Open **PowerShell** and verify:
```powershell
node --version
# Expected: v18.x.x or higher

npm --version
# Expected: any version number
```

### 4.2 — Bun

**What it is:** A faster JS runtime + package manager. The Hub and API use it.

In PowerShell **(run as Administrator)**:
```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```
**Close PowerShell completely, open a new one**, then verify:
```powershell
bun --version
# Expected: 1.x.x
```
> ⚠️ If "bun is not recognized" after reopening — restart your PC and try again.

### 4.3 — Git

**What it is:** Tool to download code from GitHub.

1. Go to **[git-scm.com/download/win](https://git-scm.com/download/win)**
2. Download and install (keep all defaults)
3. Verify:
```powershell
git --version
# Expected: git version 2.x.x
```

---

## 5. Set Up Free Cloud Database (Neon DB)

> No local PostgreSQL or Docker needed. Neon gives you a free cloud database in 2 minutes.

1. Go to **[neon.tech](https://neon.tech)** → Click **"Start for Free"**
2. Sign up with GitHub or Google
3. Click **"Create a Project"** → name it `decentralwatch` → click **Create**
4. On the project page, find the **Connection String** — it looks like:
   ```
   postgresql://user:password@ep-cool-name-123.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```
5. **Copy this entire string** — you need it in the next step.

> 💡 Can't find it? Click your project → **"Connection Details"** tab → copy **"Connection string"**

---

## 6. Set Up All Environment Variables

> `.env` files hold secret config values your app needs. You must create these manually.
> **Create all 4 files before moving on.**

### 📁 File 1: `packages/db/.env`

```powershell
cd C:\Users\Prati\PkCodes\DecentralWatch\packages\db
notepad .env
```
Click **Yes** when asked to create a new file. Paste this (replace with YOUR Neon URL):
```env
DATABASE_URL="postgresql://user:password@ep-xxxx.us-east-1.aws.neon.tech/neondb?sslmode=require"
```
Save (`Ctrl+S`) and close.

---

### 📁 File 2: `apps/api/.env`

```powershell
cd C:\Users\Prati\PkCodes\DecentralWatch\apps\api
notepad .env
```
Paste this **exactly**:
```env
JWT_PUBLIC_KEY=-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAte49JHXysDRHgSa08wIR
5Ra4DJOOXqWIB6pikO5Ce8+XyrTtiVmCYRs8QUmlgQ7KG2se/PBvwV7+yGU58GBh
ON+jviakedtFxFCpjzoGVy8owxO+xrUuuP6JDa7Z84BsfeeJGZVB03BvVJW6z4Uq
nY8KyCFPQkemFuqa7z1O2bkH3TNHfvKxaJJsXVM97ru3ZgWDAEgMQA8TY8//8voJ
4reTt+sx5tkozxB7q/wFX2dtHTzrlm8+I9Pr4elx/08MA7ALg4FBPCEVOq18idje
PbgFtVpEqcBuDYJsa+rcLsoWl9j0VtWcPyRjVmbkU4JRLuF9gtbebXvFV5ibY3UG
qwIDAQAB
-----END PUBLIC KEY-----
RESEND_API_KEY=skip_for_now
PARENT_PRIVATE_KEY=skip_for_now
```

> **What are these?**
> - `JWT_PUBLIC_KEY` — verifies user login tokens. This is the project's own demo key — fine for local use.
> - `RESEND_API_KEY` — sends email downtime alerts. Not needed for demo.
> - `PARENT_PRIVATE_KEY` — the platform's Solana wallet that sends SOL payouts to validators. Not needed for demo (payout cron is commented out in code).

---

### 📁 File 3: `apps/validator/.env`

First, **generate a temporary Solana keypair** (validator's crypto wallet). Run this in PowerShell:
```powershell
cd C:\Users\Prati\PkCodes\DecentralWatch
node -e "const {Keypair} = require('@solana/web3.js'); const kp = Keypair.generate(); console.log('PRIVATE_KEY=' + JSON.stringify(Array.from(kp.secretKey)));"
```
This prints something like:
```
PRIVATE_KEY=[24,171,88,3,201,...]
```
Copy that full line. Then:
```powershell
cd C:\Users\Prati\PkCodes\DecentralWatch\apps\validator
notepad .env
```
Paste (replacing the array with YOUR generated array):
```env
PRIVATE_KEY=[24,171,88,3,201,...]
HUB_URL=ws://localhost:8081
```

> **What are these?**
> - `PRIVATE_KEY` — the validator's Solana wallet private key. Used to cryptographically sign every uptime report.
> - `HUB_URL` — the WebSocket address of the Hub server the validator connects to.

---

### 📁 File 4: `apps/frontend/.env.local`

```powershell
cd C:\Users\Prati\PkCodes\DecentralWatch\apps\frontend
notepad .env.local
```
Paste:
```env
NEXT_PUBLIC_API_BACKEND_URL=http://localhost:8080
NEXT_PUBLIC_PSI_API_KEY=skip_for_now
```

> **What are these?**
> - `NEXT_PUBLIC_API_BACKEND_URL` — tells the frontend where the API server is running
> - `NEXT_PUBLIC_PSI_API_KEY` — Google PageSpeed Insights key (optional feature). Skip for demo.

---

### ✅ Env Var Checklist

| File | Variable | Required for Demo? |
|---|---|---|
| `packages/db/.env` | `DATABASE_URL` | ✅ YES — use your Neon URL |
| `apps/api/.env` | `JWT_PUBLIC_KEY` | ✅ YES — copy-paste from above |
| `apps/api/.env` | `RESEND_API_KEY` | ❌ No — use `skip_for_now` |
| `apps/api/.env` | `PARENT_PRIVATE_KEY` | ❌ No — use `skip_for_now` |
| `apps/validator/.env` | `PRIVATE_KEY` | ✅ YES — generate with the command above |
| `apps/validator/.env` | `HUB_URL` | ✅ YES — `ws://localhost:8081` |
| `apps/frontend/.env.local` | `NEXT_PUBLIC_API_BACKEND_URL` | ✅ YES — `http://localhost:8080` |
| `apps/frontend/.env.local` | `NEXT_PUBLIC_PSI_API_KEY` | ❌ No — use `skip_for_now` |

---

## 7. Install All Dependencies

From the **root** of the project, install everything at once:
```powershell
cd C:\Users\Prati\PkCodes\DecentralWatch
bun install
```
Takes 3–5 minutes. Lots of text scrolling — that's normal. Wait until the prompt returns with no red errors.

---

## 8. Set Up Database Tables

This creates all the tables in your Neon DB:
```powershell
cd C:\Users\Prati\PkCodes\DecentralWatch\packages\db
bun run prisma migrate deploy
```
✅ Expected output:
```
Applying migration `20250329180525_init`...
...
All migrations have been applied successfully.
```

> 💡 **Want to visually browse your database?**
> ```powershell
> bun run prisma studio
> ```
> Opens http://localhost:5555 in your browser. Press `Ctrl+C` when done.

---

## 9. Run All Services

Open **4 separate PowerShell windows** and run one command in each. Start them **in this order**.

### 🟢 Terminal 1 — API Server (start first)
```powershell
cd C:\Users\Prati\PkCodes\DecentralWatch\apps\api
bun run dev
```
✅ Ready when you see: `Server running on port 8080`

---

### 🟢 Terminal 2 — Hub Server (start second)
```powershell
cd C:\Users\Prati\PkCodes\DecentralWatch\apps\hub
bun run dev
```
✅ Ready when you see: `[HUB] Hub server started { port: 8081 ... }`

---

### 🟢 Terminal 3 — Frontend (start third)
```powershell
cd C:\Users\Prati\PkCodes\DecentralWatch\apps\frontend
bun run dev
```
✅ Ready when you see: `✓ Ready` and `Local: http://localhost:3000`

Open your browser → **http://localhost:3000** 🎉

---

### 🟢 Terminal 4 — Validator (start last)
```powershell
cd C:\Users\Prati\PkCodes\DecentralWatch\apps\validator
bun run dev
```
✅ Ready when you see:
```
[VALIDATOR] Connection established with hub
[VALIDATOR] Validator registered with hub { validatorId: "..." }
```

---

## 10. Test the Full Flow

1. Go to **http://localhost:3000** → Sign up / Log in
2. Click **"Add Website"** → Enter `https://google.com` → Add
3. **Wait 60 seconds** (Hub checks every minute)
4. Watch **Terminal 2 (Hub)**:
   ```
   [HUB] Sending validation request { websiteUrl: "https://google.com" }
   [HUB] Validation recorded and payment incremented { payment: 100 }
   ```
5. Watch **Terminal 4 (Validator)**:
   ```
   [VALIDATOR] Website validation completed { statusText: "UP", latency: "120ms" }
   ```
6. Refresh your dashboard → The uptime chart updates with the new tick ✅

---

## 11. Desktop Validator App (Electron)

This is a **GUI desktop app** — regular users run this instead of a terminal to become validators and earn crypto.

```powershell
cd C:\Users\Prati\PkCodes\DecentralWatch\apps\desktop_validator_app
npm install
npm run dev
```
A native desktop window opens. This connects to the Hub exactly like the server validator, but with a graphical interface — great to show judges.

---

## 12. Troubleshooting

| Error Message | Fix |
|---|---|
| `bun: command not found` | Restart PC, open fresh PowerShell |
| `Cannot connect to database` | Double-check `packages/db/.env` — paste fresh Neon URL |
| `Port 3000 already in use` | `netstat -ano \| findstr :3000` → `taskkill /PID <number> /F` |
| `Prisma Client not generated` | `cd packages/db && bun run prisma generate` |
| `HUB_URL is not set` | Make sure `apps/validator/.env` has `HUB_URL=ws://localhost:8081` |
| `PRIVATE_KEY not valid` | Regenerate the key using the node command in Step 6 |
| Frontend shows API errors | Make sure API (Terminal 1) is running BEFORE starting frontend |
| Validator won't connect | Make sure Hub (Terminal 2) is running BEFORE starting validator |

---

## 13. Judge Presentation Script

### 🎤 Opening (30 seconds)
> *"We built DecentralWatch — a decentralized uptime monitoring platform. The problem: services like UptimeRobot use a single central server you have to blindly trust. If it fails or lies, you'd never know. We solve this using blockchain cryptography and a global network of independent validators — making uptime monitoring trustless, transparent, and fraud-proof."*

### 🏗️ Architecture Explanation (1–2 minutes)
> *"There are four main components:*
>
> *One — the **Frontend**, built in Next.js. Website owners log in, add their site URLs, and view real-time uptime charts.*
>
> *Two — the **REST API**, built with Express and Bun. It handles authentication, stores data in PostgreSQL via Prisma ORM, and runs cron jobs for auto-disabling expired sites and sending downtime email alerts.*
>
> *Three — the **Validation Hub**. This is the heart of the system — a WebSocket server that acts as a coordinator. Every 60 seconds, it fetches all monitored websites and sends 'ping this URL' tasks to every connected validator. When results come back, it cryptographically verifies each signature before accepting any data.*
>
> *Four — the **Validators**. These are either cloud bots running on EC2, or our Electron desktop app that regular users can install. Each validator pings the assigned website, measures latency, and most importantly — signs the result using their private Solana wallet key with NaCl Ed25519 cryptography. This signature proves the result came from that specific validator and hasn't been tampered with.*
>
> *Together this creates a trustless, verifiable record of every uptime check — no single authority, no single failure point."*

### 🔑 Technical Highlights (45 seconds)
> *"A few things that make this technically interesting:*
>
> **Cryptographic verification** — Every validation uses NaCl Ed25519 signing with Solana keypairs. The Hub rejects any response with an invalid signature, making fraud provably impossible.*
>
> **Incentive design** — Validators earn 100 lamports per honest check. This economic incentive is what drives global participation without central coordination.*
>
> **Monorepo architecture** — The entire project is a Turborepo monorepo. All five apps share typed Prisma database clients and TypeScript types from shared packages — zero code duplication.*
>
> **Real-time WebSockets** — Validators stay persistently connected to the Hub. Dispatching tasks and receiving results happens in milliseconds."*

### 🖥️ Live Demo Steps
1. Open `http://localhost:3000` — show the dashboard
2. Sign in and add a website (e.g., `https://example.com`)
3. Switch to the Hub terminal — show the validation task being dispatched
4. Switch to the Validator terminal — show it pinging and signing the result
5. Back to the Hub — show the result being verified and recorded
6. Refresh the dashboard — show the uptime tick appearing live
7. Open the Electron app — *"This is how a regular person becomes a validator and earns crypto from their laptop"*

### ❓ Common Judge Questions

| Judge Asks | Your Answer |
|---|---|
| *"Why use blockchain?"* | "Blockchain keypairs create unforgeable Ed25519 digital signatures. Without this, validators could report fake 'UP' statuses and still collect rewards. Cryptographic signing makes this provably impossible." |
| *"How is this different from UptimeRobot?"* | "UptimeRobot checks from one central server you must trust. We use hundreds of independent validators globally. If 3/5 say the site is down — it's down. Majority consensus, no single authority." |
| *"Can validators cheat?"* | "No. Every response must be signed with their registered private key. Invalid signatures are rejected by the Hub. We can also implement stake-slashing for repeat bad actors." |
| *"What's the business model?"* | "Website owners pay a subscription in SOL to monitor their sites. That revenue funds validator rewards. We take a small platform fee." |
| *"What's the tech stack?"* | "Next.js frontend, Express+Bun API, Bun WebSockets for Hub, Prisma+PostgreSQL (Neon) for database, Electron for desktop app, Solana+TweetNaCl for cryptographic signing." |
| *"Is it deployed?"* | "Yes — live at [watch.kalehub.com](https://watch.kalehub.com) with validators running on AWS EC2 across multiple regions." |

### 🏁 Closing (20 seconds)
> *"DecentralWatch demonstrates that blockchain isn't just for currency — it can add trust and verifiability to any system that depends on honest reporting. We've built something production-ready, economically incentivized, and globally distributed. Thank you."*

---

## 14. Quick Reference

| What | Value |
|---|---|
| **Frontend** | http://localhost:3000 |
| **API** | http://localhost:8080 |
| **Hub WebSocket** | ws://localhost:8081 |
| **Prisma DB Viewer** | http://localhost:5555 |
| **DB env file** | `packages/db/.env` |
| **API env file** | `apps/api/.env` |
| **Validator env file** | `apps/validator/.env` |
| **Frontend env file** | `apps/frontend/.env.local` |

---

*Built with ❤️ by Pratik Kale — [watch.kalehub.com](https://watch.kalehub.com)*
