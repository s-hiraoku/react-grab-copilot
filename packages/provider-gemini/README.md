# @hiraoku/react-grab-gemini

> **Note:** This is an **experimental fork** of [React Grab](https://github.com/aidenybai/react-grab) for testing and verification purposes. For production use, please refer to the original repository.

Google Gemini CLI provider for React Grab.

## Installation

```bash
npm install @hiraoku/react-grab-gemini
```

## Usage

### Server

The server runs on port `8567` and interfaces with the Gemini CLI. Add to your `package.json`:

```json
{
  "scripts": {
    "dev": "npx @hiraoku/react-grab-gemini@latest && next dev"
  }
}
```

> **Note:** You must have [Gemini CLI](https://github.com/google-gemini/gemini-cli) installed (`npm i -g @anthropic-ai/gemini-cli`).

### Client

Add the client script to your HTML:

```html
<script src="//unpkg.com/@hiraoku/react-grab-gemini/dist/client.global.js"></script>
```

Or import programmatically:

```ts
import "@hiraoku/react-grab-gemini/client";
```

## Features

- **Follow-ups**: Continue conversations with the same session
- **Streaming**: Real-time status updates during execution
- **Tool calls**: See tool usage as it happens
