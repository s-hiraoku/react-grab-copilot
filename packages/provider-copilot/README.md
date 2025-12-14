# @hiraoku/react-grab-copilot

> **Note:** This is an **experimental fork** of [React Grab](https://github.com/aidenybai/react-grab) for testing and verification purposes. For production use, please refer to the original repository.

GitHub Copilot CLI provider for React Grab. Requires running a local server that interfaces with the GitHub Copilot CLI.

## Prerequisites

You must have the [GitHub Copilot CLI](https://docs.github.com/en/copilot/github-copilot-in-the-cli) installed and authenticated:

```bash
# Install GitHub Copilot CLI
gh extension install github/gh-copilot

# Authenticate
copilot /login
```

## Installation

```bash
npm install @hiraoku/react-grab-copilot
# or
pnpm add @hiraoku/react-grab-copilot
# or
bun add @hiraoku/react-grab-copilot
# or
yarn add @hiraoku/react-grab-copilot
```

## Server Setup

The server runs on port `11567` by default.

### Quick Start (CLI)

Start the server in the background before running your dev server:

```bash
npx @hiraoku/react-grab-copilot@latest && pnpm run dev
```

The server will run as a detached background process. **Note:** Stopping your dev server (Ctrl+C) won't stop the React Grab server. To stop it:

```bash
pkill -f "react-grab.*server"
```

### Recommended: Config File (Automatic Lifecycle)

For better lifecycle management, start the server from your config file. This ensures the server stops when your dev server stops:

### Vite

```ts
// vite.config.ts
import { startServer } from "@hiraoku/react-grab-copilot/server";

if (process.env.NODE_ENV === "development") {
  startServer();
}
```

### Next.js

```ts
// next.config.ts
import { startServer } from "@hiraoku/react-grab-copilot/server";

if (process.env.NODE_ENV === "development") {
  startServer();
}
```

## Client Usage

### Script Tag

```html
<script src="//unpkg.com/@hiraoku/react-grab/dist/index.global.js"></script>
<script src="//unpkg.com/@hiraoku/react-grab-copilot/dist/client.global.js"></script>
```

### Next.js

Using the `Script` component in your `app/layout.tsx`:

```jsx
import Script from "next/script";

export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        {process.env.NODE_ENV === "development" && (
          <>
            <Script
              src="//unpkg.com/@hiraoku/react-grab/dist/index.global.js"
              strategy="beforeInteractive"
            />
            <Script
              src="//unpkg.com/@hiraoku/react-grab-copilot/dist/client.global.js"
              strategy="lazyOnload"
            />
          </>
        )}
      </head>
      <body>{children}</body>
    </html>
  );
}
```

### ES Module

```tsx
import { attachAgent } from "@hiraoku/react-grab-copilot/client";

attachAgent();
```

## How It Works

```
┌─────────────────┐      HTTP        ┌─────────────────┐     args       ┌─────────────────┐
│                 │  localhost:11567 │                 │                │                 │
│   React Grab    │ ────────────────►│     Server      │ ──────────────►│     copilot     │
│    (Browser)    │ ◄────────────────│   (Node.js)     │ ◄──────────────│      (CLI)      │
│                 │       SSE        │                 │     stdout     │                 │
└─────────────────┘                  └─────────────────┘                └─────────────────┘
      Client                              Server                            Agent
```

1. **React Grab** sends the selected element context to the server via HTTP POST
2. **Server** receives the request and spawns the `copilot` CLI process with `-p` argument
3. **copilot** processes the request and streams text responses to stdout
4. **Server** relays status updates to the client via Server-Sent Events (SSE)
