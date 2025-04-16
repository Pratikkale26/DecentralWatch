# Uptora API

This is the backend API for Uptora, built using **Bun**, **Express**, and **Prisma** with modular architecture and JWT authentication.

---

## 🛠️ Setup

### Install dependencies

```bash
bun install
```

---

## 🚀 Run the server

```bash
bun run src/server.ts
```

> Make sure you’ve generated the Prisma client before running:

```bash
cd packages/db && bunx prisma generate
```

---

## 📁 Project Structure

```
.
├── prisma/
│   └── schema.prisma           # Root-level Prisma schema (if needed)
├── src/
│   ├── server.ts               # Entry point of the server
│   ├── routes/
│   │   └── website.ts          # Website-related route definitions
│   ├── controllers/
│   │   └── website.ts          # Business logic for website APIs
│   └── middleware/
│       └── auth.ts             # JWT authentication middleware
├── packages/
│   └── db/                     # Shared Prisma client setup
│       ├── src/
│       │   └── index.ts        # Exports initialized Prisma client
│       └── prisma/
│           └── schema.prisma   # Centralized database schema
```

---

## 🔐 Auth Middleware

JWT-based authentication middleware is applied to all protected routes. It verifies the token and extracts the user ID.

Set your `JWT_PUBLIC_KEY` in `src/config.ts`.

---

## 📦 Prisma

To set up the Prisma client:

```bash
cd packages/db
bunx prisma generate
```

To push schema to your database (optional):

```bash
bunx prisma db push
```

---

## 🧪 API Endpoints

| Method | Endpoint                     | Description                       |
|--------|------------------------------|-----------------------------------|
| POST   | `/api/v1/website`            | Create a new website entry        |
| GET    | `/api/v1/websites`           | Get all websites for the user     |
| GET    | `/api/v1/website/status`     | Get website status and tick data  |
| DELETE | `/api/v1/website/:websiteId` | Disable a specific website        |

---

## 🧠 About

This project was initialized using `bun init` in **Bun v1.2.3**.  
[Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
