import type {
  AgentContext,
  AgentSessionStorage,
  AgentCompleteResult,
  init,
  ReactGrabAPI,
} from "react-grab/core";
import {
  CONNECTION_CHECK_TTL_MS,
  createCachedConnectionChecker,
  streamAgentStatusFromServer,
} from "@react-grab/utils/client";

export type { AgentCompleteResult };
import { DEFAULT_PORT, COMPLETED_STATUS } from "./constants.js";

const DEFAULT_SERVER_URL = `http://localhost:${DEFAULT_PORT}`;

interface CopilotAgentOptions {
  model?: string;
}

type CopilotAgentContext = AgentContext<CopilotAgentOptions>;

interface CopilotAgentProviderOptions {
  serverUrl?: string;
  getOptions?: () => Partial<CopilotAgentOptions>;
}

const isReactGrabApi = (value: unknown): value is ReactGrabAPI =>
  typeof value === "object" && value !== null && "setAgent" in value;

export const createCopilotAgentProvider = (
  providerOptions: CopilotAgentProviderOptions = {},
) => {
  const { serverUrl = DEFAULT_SERVER_URL, getOptions } = providerOptions;

  const mergeOptions = (
    contextOptions?: CopilotAgentOptions,
  ): CopilotAgentOptions => ({
    ...(getOptions?.() ?? {}),
    ...(contextOptions ?? {}),
  });

  const checkConnection = createCachedConnectionChecker(
    async () => {
      const response = await fetch(`${serverUrl}/health`, { method: "GET" });
      return response.ok;
    },
    CONNECTION_CHECK_TTL_MS,
  );

  return {
    send: async function* (context: CopilotAgentContext, signal: AbortSignal) {
      const mergedContext = {
        ...context,
        options: mergeOptions(context.options),
      };
      yield* streamAgentStatusFromServer(
        { serverUrl, completedStatus: COMPLETED_STATUS },
        mergedContext,
        signal,
      );
    },

    supportsResume: false,
    supportsFollowUp: false,

    checkConnection,

    abort: async (sessionId: string) => {
      try {
        await fetch(`${serverUrl}/abort/${sessionId}`, { method: "POST" });
      } catch {}
    },
  };
};

declare global {
  interface Window {
    __REACT_GRAB__?: ReturnType<typeof init>;
  }
}

export const attachAgent = async () => {
  if (typeof window === "undefined") return;

  const provider = createCopilotAgentProvider();

  const attach = (api: ReactGrabAPI) => {
    api.setAgent({ provider, storage: sessionStorage });
  };

  const existingApi = window.__REACT_GRAB__;
  if (isReactGrabApi(existingApi)) {
    attach(existingApi);
    return;
  }

  window.addEventListener(
    "react-grab:init",
    (event: Event) => {
      if (!(event instanceof CustomEvent)) return;
      if (!isReactGrabApi(event.detail)) return;
      attach(event.detail);
    },
    { once: true },
  );

  // HACK: Check again after adding listener in case of race condition
  const apiAfterListener = window.__REACT_GRAB__;
  if (isReactGrabApi(apiAfterListener)) {
    attach(apiAfterListener);
  }
};

attachAgent();
