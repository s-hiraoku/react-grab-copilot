# @hiraoku/react-grab-amp

> **Note:** This is an **experimental fork** of [React Grab](https://github.com/aidenybai/react-grab) for testing and verification purposes. For production use, please refer to the original repository.

[Amp](https://ampcode.com) provider for React Grab.

## Installation

```bash
npm install @hiraoku/react-grab-amp
```

## Usage

### Server

The server runs on port `9567` and interfaces with the Amp SDK. Add to your `package.json`:

```json
{
  "scripts": {
    "dev": "npx @hiraoku/react-grab-amp@latest && next dev"
  }
}
```

> **Note:** You must have an [Amp API key](https://ampcode.com/settings) set via `AMP_API_KEY` environment variable.

### Client

Add the client script to your HTML:

```html
<script src="//unpkg.com/@hiraoku/react-grab-amp/dist/client.global.js"></script>
```

Or import programmatically:

```ts
import "@hiraoku/react-grab-amp/client";
```

## Features

- **Follow-ups**: Continue conversations with thread continuity
- **Undo**: Undo the last change made by Amp
- **Streaming**: Real-time status updates during execution
- **Tool calls**: See tool usage as it happens


