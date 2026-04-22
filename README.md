<div align="center">

# ⚡ ClipForge.ai

### AI Short Video & UGC Image Generator

**PERN Stack + Google Gemini SaaS**

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![Express](https://img.shields.io/badge/Express-5-000000?style=for-the-badge&logo=express)](https://expressjs.com)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io)
[![Clerk](https://img.shields.io/badge/Clerk-Auth-6C47FF?style=for-the-badge&logo=clerk)](https://clerk.com)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-Media-3448C5?style=for-the-badge&logo=cloudinary)](https://cloudinary.com)
[![Google Gemini](https://img.shields.io/badge/Gemini-AI-4285F4?style=for-the-badge&logo=google)](https://ai.google.dev)

---

*Upload a product photo + a model photo → AI generates professional lifestyle imagery & short-form UGC videos in seconds.*

🌐 **Live Demo:** [clipforge-ai.vercel.app](https://clipforge-ai-ikpy.onrender.com) &nbsp;|&nbsp; 🖥️ **API:** [clipforge-ai-ikpy.onrender.com](https://clipforge-ai-ikpy.onrender.com)

</div>

---

## ✨ Features

- 🖼️ **AI Image Generation** — Combines product + model images into professional lifestyle photos using Google Gemini
- 🎬 **AI Video Generation** — Generates short UGC-style videos from the AI-composed image using Google Veo
- 🔐 **Authentication** — Full sign-in/sign-up flow with Clerk (webhooks for user sync)
- 💳 **Credit System** — Users purchase credits to generate images (5 credits) and videos (10 credits)
- ☁️ **Cloud Storage** — All media stored and served via Cloudinary
- 🌍 **Community Feed** — Browse and explore published generations from other users
- 📊 **Error Tracking** — Production error monitoring via Sentry

---

## 🏗️ Architecture

### Clerk Auth & Webhook Controller
![Clerk Auth & Webhook Controller](docs/clerk-auth.png)

### User Controller
![User Controller](docs/user-controller.png)

### Image Generation Controller
![Image Generation Controller](docs/image-generation.png)

### Video Generation Controller
![Video Generation Controller](docs/video-generation.png)


### Request Flows

**Image Generation Flow**
```
Request → Auth Middleware → Check Credits → Deduct 5 Credits
→ Upload images to Cloudinary → Gemini Image Generation
→ Save result to Cloudinary → Update DB → Return projectId
```

**Video Generation Flow**
```
Request → Auth Middleware → Check Credits → Deduct 10 Credits
→ Fetch generated image → Veo Video Generation (polling)
→ Download video → Upload to Cloudinary → Update DB → Return videoUrl
```

---

## 🚀 Deployment

| Service | Platform | URL |
|---------|----------|-----|
| **Frontend** | Vercel | [clipforge-ai.vercel.app](https://clipforge-ai.vercel.app) |
| **Backend API** | Render | [clipforge-ai-ikpy.onrender.com](https://clipforge-ai-ikpy.onrender.com) |

> ⚠️ **Clerk Webhook Setup:** In your Clerk dashboard → Webhooks, set the endpoint URL to your **Render backend** URL:
> ```
> https://clipforge-ai-ikpy.onrender.com/api/clerk
> ```
> Do NOT point it to the Vercel frontend URL — Vercel only serves the React app.

> 💡 **Render Free Tier Note:** The free tier spins down after 15 min of inactivity. First request may take ~30s. Use [UptimeRobot](https://uptimerobot.com) to keep it alive.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, TailwindCSS |
| **Backend** | Node.js, Express 5, TypeScript, tsx |
| **Database** | Neon (PostgreSQL), Prisma ORM |
| **Authentication** | Clerk (JWT + Webhooks) |
| **AI — Images** | Google Gemini (`gemini-3.1-flash-image-preview`) |
| **AI — Videos** | Google Veo (`veo-3.1-generate-preview`) |
| **Media Storage** | Cloudinary |
| **File Uploads** | Multer |
| **Error Tracking** | Sentry |
| **Deployment** | Hostinger VPS |

---

## 📁 Project Structure

```
ugc-project/
├── client/                   # React frontend (Vite)
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Route pages
│   │   │   ├── Home.tsx
│   │   │   ├── Genetator.tsx # Image generation form
│   │   │   ├── Result.tsx    # View generated image/video
│   │   │   ├── MyGeneration.tsx
│   │   │   ├── Community.tsx
│   │   │   └── Plans.tsx
│   │   └── configs/
│   │       └── axios.ts      # Axios instance with base URL
│   └── .env.example
│
└── server/                   # Express backend
    ├── controllers/
    │   ├── clerk.ts          # Webhook handler (user sync)
    │   ├── projectController.ts  # Image & video generation
    │   └── userController.ts     # User data & credits
    ├── routes/
    │   ├── projectRoutes.ts
    │   └── userRoutes.ts
    ├── middlewares/
    │   └── auth.ts           # Clerk JWT protection
    ├── configs/
    │   ├── ai.ts             # Google GenAI client
    │   ├── multer.ts         # File upload config
    │   └── prisma.ts         # Prisma client
    ├── prisma/
    │   └── schema.prisma     # DB schema
    ├── server.ts             # Entry point
    └── .env.example
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A [Neon](https://neon.tech) PostgreSQL database
- A [Clerk](https://clerk.com) application
- A [Cloudinary](https://cloudinary.com) account
- A [Google AI Studio](https://aistudio.google.com) API key (paid tier required for image generation)

### 1. Clone the repository

```bash
git clone https://github.com/asoleshubham0125/CLIPFORGE.ai.git
cd CLIPFORGE.ai
```

### 2. Setup the Server

```bash
cd server
npm install
cp .env.example .env   # Fill in your actual values
npx prisma migrate dev # Run DB migrations
npm run server         # Start dev server with nodemon
```

### 3. Setup the Client

```bash
cd client
npm install
cp .env.example .env   # Fill in your actual values
npm run dev            # Start Vite dev server
```

---

## 🔑 Environment Variables

### Server (`server/.env`)

```env
# Database
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require

# Clerk Authentication
CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxx
CLERK_WEBHOOK_SIGNING_SECRET=whsec_xxxxxxxxxxxx

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Google Gemini AI (paid tier required)
GOOGLE_CLOUD_API_KEY=your_google_ai_api_key

# Server
PORT=5000
```

### Client (`client/.env`)

```env
VITE_BASEURL=http://localhost:5000
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxx
```

---

## 📡 API Reference

### Auth
All protected routes require `Authorization: Bearer <clerk_token>` header.

### Project Routes — `/api/project`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/create` | ✅ | Generate AI image from 2 uploaded photos |
| `POST` | `/video` | ✅ | Generate video from existing project |
| `GET` | `/published` | ❌ | Get all community-published projects |
| `DELETE` | `/:projectId` | ✅ | Delete a project |

### User Routes — `/api/user`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/credits` | ✅ | Fetch user credit balance |
| `GET` | `/generations` | ✅ | Fetch user's projects |
| `POST` | `/publish` | ✅ | Publish/unpublish a project |

### Webhook — `/api/clerk`
Handles Clerk webhook events (user created, updated, deleted, plan purchased).

---

## 💳 Credit System

| Action | Credits Required |
|--------|-----------------|
| Generate AI Image | 5 credits |
| Generate AI Video | 10 credits |

Credits are deducted before generation and **refunded automatically** if the AI generation fails.

---

## 🧑‍💻 Author

**Shubham Asole**
- GitHub: [@asoleshubham0125](https://github.com/asoleshubham0125)
- LinkedIn: [Shubham Asole](https://linkedin.com/in/shubham-asole)

---

<div align="center">

© 2026 Shubham Asole. All rights reserved.

⭐ If you found this project useful, please give it a star!

</div>
