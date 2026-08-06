/** WebMCP (navigator.modelContext / document.modelContext) typings. */

export type WebMcpToolResult = {
  content: Array<{ type: "text"; text: string }>;
  isError?: boolean;
};

export type WebMcpTool = {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  execute: (args: Record<string, unknown>) => Promise<WebMcpToolResult>;
  annotations?: {
    readOnlyHint?: boolean;
    destructiveHint?: boolean;
    openWorldHint?: boolean;
  };
};

export type WebMcpModelContext = {
  registerTool?: (
    tool: WebMcpTool,
    options?: { signal?: AbortSignal },
  ) => void | Promise<void>;
  unregisterTool?: (name: string) => void | Promise<void>;
  /** Older draft API still probed by some scanners. */
  provideContext?: (
    input: { tools: WebMcpTool[] } | WebMcpTool[],
  ) => void | Promise<void>;
  clearContext?: () => void | Promise<void>;
};

declare global {
  interface Navigator {
    modelContext?: WebMcpModelContext;
  }

  interface Document {
    modelContext?: WebMcpModelContext;
  }

  interface Window {
    __mulheresWebMcpRegistered?: boolean;
  }
}

export {};
