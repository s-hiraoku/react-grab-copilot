import { execa, type ResultPromise } from "execa";
import { pathToFileURL } from "node:url";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { streamSSE } from "hono/streaming";
import { serve } from "@hono/node-server";
import fkill from "fkill";
import pc from "picocolors";
import type { AgentContext } from "@hiraoku/react-grab/core";
import { DEFAULT_PORT, COMPLETED_STATUS } from "./constants.js";

const VERSION = process.env.VERSION ?? "0.0.0";

try {
  fetch(`https://www.react-grab.com/api/version?source=copilot&t=${Date.now()}`).catch(() => {});
} catch {}

import {
  sleep,
  formatSpawnError,
  type AgentMessage,
  type AgentCoreOptions,
} from "@hiraoku/react-grab-utils/server";

export interface CopilotAgentOptions extends AgentCoreOptions {
  model?: string;
}

type CopilotAgentContext = AgentContext<CopilotAgentOptions>;

const activeProcesses = new Map<string, ResultPromise>();

export const runAgent = async function* (
  prompt: string,
  options?: CopilotAgentOptions,
): AsyncGenerator<AgentMessage> {
  const copilotArgs = ["-p", prompt, "--allow-all-tools", "--allow-all-paths"];

  if (options?.model) {
    copilotArgs.push("--model", options.model);
  }

  const workspacePath =
    options?.cwd ?? process.env.REACT_GRAB_CWD ?? process.cwd();

  let copilotProcess: ResultPromise | undefined;
  let stderrBuffer = "";

  try {
    yield { type: "status", content: "Thinking..." };

    copilotProcess = execa("copilot", copilotArgs, {
      stdout: "pipe",
      stderr: "pipe",
      env: { ...process.env },
      cwd: workspacePath,
    });

    if (options?.sessionId) {
      activeProcesses.set(options.sessionId, copilotProcess);
    }

    if (copilotProcess.stderr) {
      copilotProcess.stderr.on("data", (chunk: Buffer) => {
        stderrBuffer += chunk.toString();
      });
    }

    const messageQueue: AgentMessage[] = [];
    let resolveWait: (() => void) | null = null;
    let processEnded = false;
    let stdoutBuffer = ""; // Keep full stdout for error messages

    const enqueueMessage = (message: AgentMessage) => {
      messageQueue.push(message);
      if (resolveWait) {
        resolveWait();
        resolveWait = null;
      }
    };

    let buffer = "";

    if (copilotProcess.stdout) {
      copilotProcess.stdout.on("data", (chunk: Buffer) => {
        const text = chunk.toString();
        buffer += text;
        stdoutBuffer += text;

        let newlineIndex;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          const line = buffer.slice(0, newlineIndex).trim();
          buffer = buffer.slice(newlineIndex + 1);
          if (line) {
            enqueueMessage({ type: "status", content: line });
          }
        }
      });
    }

    const childProcess = copilotProcess;
    childProcess.on("close", (code) => {
      if (options?.sessionId) {
        activeProcesses.delete(options.sessionId);
      }
      if (buffer.trim()) {
        stdoutBuffer += buffer;
        enqueueMessage({ type: "status", content: buffer.trim() });
      }
      processEnded = true;
      if (code === 0) {
        enqueueMessage({ type: "status", content: COMPLETED_STATUS });
      } else if (code !== 0 && !childProcess.killed) {
        // Include stdout and stderr in error message
        const errorParts = [`copilot exited with code ${code}`];
        if (stdoutBuffer.trim()) {
          errorParts.push(`\nOutput:\n${stdoutBuffer.trim()}`);
        }
        if (stderrBuffer.trim()) {
          errorParts.push(`\nStderr:\n${stderrBuffer.trim()}`);
        }
        enqueueMessage({ type: "error", content: errorParts.join("") });
      }
      enqueueMessage({ type: "done", content: "" });
      if (resolveWait) {
        resolveWait();
        resolveWait = null;
      }
    });

    childProcess.on("error", (error) => {
      if (options?.sessionId) {
        activeProcesses.delete(options.sessionId);
      }
      processEnded = true;
      const isNotInstalled = "code" in error && error.code === "ENOENT";
      if (isNotInstalled) {
        enqueueMessage({
          type: "error",
          content: "copilot is not installed. Please install GitHub Copilot CLI.\n\nInstallation: https://docs.github.com/en/copilot/github-copilot-in-the-cli",
        });
      } else {
        const errorMessage = formatSpawnError(error, "copilot");
        const stderrContent = stderrBuffer.trim();
        const fullError = stderrContent
          ? `${errorMessage}\n\nstderr:\n${stderrContent}`
          : errorMessage;
        enqueueMessage({ type: "error", content: fullError });
      }
      enqueueMessage({ type: "done", content: "" });
      if (resolveWait) {
        resolveWait();
        resolveWait = null;
      }
    });

    // Suppress unhandled promise rejection from execa
    childProcess.catch(() => {});

    while (true) {
      if (options?.signal?.aborted) {
        if (copilotProcess && !copilotProcess.killed) {
          copilotProcess.kill("SIGTERM");
        }
        return;
      }

      if (messageQueue.length > 0) {
        const message = messageQueue.shift()!;
        if (message.type === "done") {
          yield message;
          return;
        }
        yield message;
      } else if (processEnded) {
        return;
      } else {
        await new Promise<void>((resolve) => {
          resolveWait = resolve;
        });
      }
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? formatSpawnError(error, "copilot")
        : "Unknown error";
    const stderrContent = stderrBuffer.trim();
    const fullError = stderrContent
      ? `${errorMessage}\n\nstderr:\n${stderrContent}`
      : errorMessage;
    yield { type: "error", content: fullError };
    yield { type: "done", content: "" };
  }
};

export const createServer = () => {
  const app = new Hono();

  app.use("*", cors());

  app.post("/agent", async (context) => {
    const body = await context.req.json<CopilotAgentContext>();
    const { content, prompt, options, sessionId } = body;

    const userPrompt = `${prompt}\n\n${content}`;

    return streamSSE(context, async (stream) => {
      for await (const message of runAgent(userPrompt, { ...options, sessionId })) {
        if (message.type === "error") {
          await stream.writeSSE({ data: `Error: ${message.content}`, event: "error" });
        } else {
          await stream.writeSSE({ data: message.content, event: message.type });
        }
      }
    });
  });

  app.post("/abort/:sessionId", (context) => {
    const { sessionId } = context.req.param();
    const activeProcess = activeProcesses.get(sessionId);
    if (activeProcess && !activeProcess.killed) {
      activeProcess.kill("SIGTERM");
      activeProcesses.delete(sessionId);
    }
    return context.json({ status: "ok" });
  });

  app.get("/health", (context) => {
    return context.json({ status: "ok", provider: "copilot" });
  });

  return app;
};

export const startServer = async (port: number = DEFAULT_PORT) => {
  await fkill(`:${port}`, { force: true, silent: true }).catch(() => {});
  await sleep(100);

  const app = createServer();
  serve({ fetch: app.fetch, port });
  console.log(
    `${pc.magenta("✿")} ${pc.bold("React Grab")} ${pc.gray(VERSION)} ${pc.dim("(Copilot)")}`,
  );
  console.log(`- Local:    ${pc.cyan(`http://localhost:${port}`)}`);
};

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  startServer(DEFAULT_PORT).catch(console.error);
}
