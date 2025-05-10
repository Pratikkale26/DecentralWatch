# 🌐 DecentralWatch

**DecentralWatch** is a decentralized uptime monitoring platform where validators around the world check website availability and earn rewards for contributing real-time, verifiable data. We're building the **Cloudflare of Web3** - censorship-resistant, transparent, and community-owned.

Say goodbye to centralized failures — and hello to trustless internet uptime.

---

## 🚀 Features

- 🌍 **Global Validator Network** – Human and cloud validators check uptime from multiple geolocations.
- 🔐 **Wallet-Based Signing** – Phantom-authenticated reports, cryptographically signed using Solana keypairs.
- 💰 **Incentivized Monitoring** – Validators earn lamports for each accurate validation.
- 📊 **Real-Time Insights** – Dashboard with uptime stats, performance graphs, and alerts.
- ⚡ **EC2 + Electron Support** – Run validators on cloud or local machines.
- 🌓 **Dark/Light UI** – Clean, responsive interface with smooth user experience.

---

## 🎯 How It Works

1. 🖥️ **Run a Validator** – Via Electron app.
2. 🔍 **Validate Websites** – Periodically ping URLs, record status, sign with wallet.
3. ⛓️ **Send Proofs to Hub** – All checks are logged, verified, and stored on backend.
4. 💸 **Earn Rewards** – Honest validators are rewarded per validation.
5. 📈 **Monitor Websites** – Website owners view real-time uptime analytics on dashboard.

---

## 🧠 System Architecture

- **Human Validators:** Electron desktop app.
- **Server Validators:** Lightweight Node-based bots deployed across EC2 regions.
- **Validation Hub:** Express API that verifies, logs, and processes signed uptime proofs.
- **Frontend Dashboard:** Built with Next.js + Tailwind, live status updates via WebSockets.

---

## 🖼️ Screenshots

![Landing Page Preview](./preview.png)
<!-- Add more previews as needed -->

---

## 🛠️ Tech Stack

| Layer        | Tech                             |
|--------------|----------------------------------|
| Frontend     | Next.js, Tailwind CSS, TypeScript |
| Backend      | Node.js, Express, Bun             |
| DB & ORM     | PostgreSQL, Prisma                |
| Real-Time    | WebSockets                        |
| Blockchain   | Solana, Phantom Wallets           |
| Desktop App  | Electron                          |
| Infra        | Docker, AWS EC2                   |

---

## 📦 Monorepo Structure

```
apps/
├── api/          # Express backend API for validators & dashboard
├── frontend/     # User-facing uptime dashboard (Next.js)
├── hub/          # Admin dashboard / internal control panel
├── validator/    # Server-side EC2 validator logic
└── electron-app/ # Phantom-authenticated human validator app

packages/
├── db/           # Prisma ORM and DB access layer
└── common/       # Shared utils, types, constants
```

---

## 🔗 Useful Links

- 🌐 Website: [https://watch.kalehub.com](https://watch.kalehub.com)
- 🐙 GitHub: [https://github.com/pratikkale26/decentralwatch](https://github.com/pratik-kale/decentralwatch)
- 🐦 Twitter: [@PratikKale26](https://x.com/pratikkale26)
- 💼 LinkedIn: [Pratik Kale](https://www.linkedin.com/in/pratikkale26/)

---

**Empowering the Internet with Decentralization. Monitor. Validate. Earn.**  
Let's build the future of uptime monitoring — together.

---
