# @hiraoku/react-grab-ami

> **Note:** This is an **experimental fork** of [React Grab](https://github.com/aidenybai/react-grab) for testing and verification purposes. For production use, please refer to the original repository.

Ami agent provider for React Grab. This is a client-only provider that connects directly to [ami.dev](https://ami.dev).

## Installation

```bash
npm install @hiraoku/react-grab-ami
# or
pnpm add @hiraoku/react-grab-ami
# or
bun add @hiraoku/react-grab-ami
# or
yarn add @hiraoku/react-grab-ami
```

## Client Usage

### Script Tag

```html
<script src="//unpkg.com/react-grab/dist/index.global.js"></script>
<script src="//unpkg.com/@hiraoku/react-grab-ami/dist/client.global.js"></script>
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
              src="//unpkg.com/react-grab/dist/index.global.js"
              strategy="beforeInteractive"
            />
            <Script
              src="//unpkg.com/@hiraoku/react-grab-ami/dist/client.global.js"
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
import { attachAgent } from "@hiraoku/react-grab-ami/client";

attachAgent();
```

## How It Works

```
┌─────────────────┐      HTTPS      ┌─────────────────┐
│                 │                 │                 │
│   React Grab    │ ──────────────► │     ami.dev     │
│    (Browser)    │ ◄────────────── │     (Cloud)     │
│                 │                 │                 │
└─────────────────┘                 └─────────────────┘
      Client                              Agent
```

1. **React Grab** sends the selected element context directly to ami.dev
2. **Ami** processes the request using the configured AI model
3. **Ami** streams status updates back to the client

**Note:** No local server required - Ami runs entirely in the cloud.
