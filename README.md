# Sound Stage — Frontend

Web client for **Sound Stage** — a scalable, real-time **live audio rooms** platform.
Connects to a WebRTC **SFU** backend for low-latency audio, with WebSocket-driven presence, chat, and room events — all rendered with a modern, animated UI.

## Features

- 🎙️ **Live audio rooms** — speak & listen over WebRTC (Opus) against a custom SFU
- 🚪 **Room discovery** — browse, filter by category/tags/type, create public & private rooms
- ✋ **Stage controls** — raise hand, mute/unmute, role changes, kick & block (moderation)
- 💬 **Realtime chat** — room chat with pinned messages over WebSocket
- 🟢 **Live presence** — online participants update in real time, no refetching
- 🔐 **Passwordless auth** — email OTP sign-in with JWT session handling

## Tech Stack

**Next.js 16** (App Router) · **React 19** · TypeScript · Tailwind CSS 4 · shadcn/ui + Radix · Zustand · React Hook Form + Zod · Framer Motion · native WebRTC + WebSocket APIs

## Getting Started

**Prerequisites:** Node.js 20+, [pnpm](https://pnpm.io), and a running [backend](../sound-stage-backend)

```bash
# 1. Install dependencies
pnpm install

# 2. Configure environment — create .env.local (see below)

# 3. Start the dev server
pnpm dev
```

App runs at [http://localhost:3000](http://localhost:3000).

### Environment

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_WS_BASE_URL=ws://localhost:8000

NEXT_PUBLIC_STUN_URL=stun:stun.l.google.com:19302
NEXT_PUBLIC_TURN_URL=          # optional, for restrictive networks
NEXT_PUBLIC_TURN_USERNAME=
NEXT_PUBLIC_TURN_CREDENTIAL=
```

```bash
pnpm build                    # production build
pnpm lint                     # eslint
```

## Project Structure

```
src/
├─ app/            routes — landing, auth, profile, rooms (list / create / [id] / edit)
├─ components/     room cards, chat panel, drawers, participant UI, shadcn ui/
├─ hooks/          useWebSocket, useWebRTC, useRoomUsers, useAuthGuard
├─ lib/api/        typed REST client + WS event protocol
├─ store/          Zustand stores (auth, room, connection)
└─ assets/         static assets
```
