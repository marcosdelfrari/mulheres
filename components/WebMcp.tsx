"use client";

import { useEffect } from "react";
import { registerWebMcpTools } from "@/lib/webmcp";

/**
 * Registers WebMCP tools on page load for browser AI agents.
 * Uses AbortController so tools are unregistered on unmount / navigation cleanup.
 */
export function WebMcp() {
  useEffect(() => {
    const controller = new AbortController();
    void registerWebMcpTools(controller.signal);
    return () => {
      controller.abort();
    };
  }, []);

  return null;
}
