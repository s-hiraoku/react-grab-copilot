# @hiraoku/react-grab-codex

> **Note:** This is an **experimental fork** of [React Grab](https://github.com/aidenybai/react-grab) for testing and verification purposes. For production use, please refer to the original repository.

OpenAI Codex provider for React Grab.

## Installation

```bash
npm install @hiraoku/react-grab-codex
```

## Usage

### Server

The server runs on port `7567` and interfaces with the Codex SDK. Add to your `package.json`:

```json
{
  "scripts": {
    "dev": "npx @hiraoku/react-grab-codex@latest && next dev"
  }
}
```

> **Note:** You must have [Codex](https://github.com/openai/codex) installed (`npm i -g @openai/codex`).

### Client

Add the client script to your HTML:

```html
<script src="//unpkg.com/@hiraoku/react-grab-codex/dist/client.global.js"></script>
```

Or import programmatically:

```ts
import "@hiraoku/react-grab-codex/client";
```

## Features

- **Follow-ups**: Continue conversations with the same thread
- **Undo**: Undo the last change made by Codex
- **Streaming**: Real-time status updates during execution
