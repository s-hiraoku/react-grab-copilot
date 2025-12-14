# React Grab

> This is a fork of [react-grab](https://github.com/aidenybai/react-grab) by [Aiden Bai](https://github.com/aidenybai) for personal testing and experimentation with additional AI provider integrations.

Select context for coding agents directly from your website. Point at any element and it'll send the file name, React component, and HTML source code to your AI coding agent.

## Supported AI Agents

| Agent | Package | Port |
|-------|---------|------|
| Claude Code | `@hiraoku/react-grab-claude-code` | 4567 |
| Cursor | `@hiraoku/react-grab-cursor` | 5567 |
| OpenCode | `@hiraoku/react-grab-opencode` | 6567 |
| Codex | `@hiraoku/react-grab-codex` | 7567 |
| Gemini | `@hiraoku/react-grab-gemini` | 8567 |
| Amp | `@hiraoku/react-grab-amp` | 9567 |
| Factory Droid | `@hiraoku/react-grab-droid` | 10567 |
| GitHub Copilot | `@hiraoku/react-grab-copilot` | 11567 |

## Install

```bash
npx @hiraoku/grab@latest init
```

## Quick Start

### 1. Server Setup

Add the agent server to your dev script in `package.json`:

```json
{
  "scripts": {
    "dev": "npx @hiraoku/react-grab-copilot@latest && next dev"
  }
}
```

### 2. Client Setup

Add these scripts to your HTML `<head>`:

```html
<script src="//unpkg.com/@hiraoku/react-grab/dist/index.global.js"></script>
<script src="//unpkg.com/@hiraoku/react-grab-copilot/dist/client.global.js"></script>
```

Or with Next.js:

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

## Usage

1. Start your dev server
2. Hold `Option` (Mac) / `Alt` (Windows) and hover over elements
3. Click to select, then the context is sent to your AI agent

## Upstream

This project is based on [react-grab](https://github.com/aidenybai/react-grab) by [Aiden Bai](https://github.com/aidenybai).

- [Original Repository](https://github.com/aidenybai/react-grab)
- [Discord Community](https://discord.com/invite/G7zxfUzkm7)

## License

MIT License - Copyright (c) 2025 Aiden Bai

This fork is maintained by [@s-hiraoku](https://github.com/s-hiraoku).
