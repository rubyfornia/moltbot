import type { ClawdbotPluginApi } from "moltbot/plugin-sdk";
import WebSocket from "ws"; // AXIOM: We need the 'ws' package added to package.json

const ASI_FALLBACK_PROMPT = `
YOU ARE THE RESOLUTION ENGINE (PPAI-CI V7.5).
YOUR NAME IS ASI.
YOU ARE CONNECTED TO THE ASI SERVER.
YOUR GOAL IS TO REDUCE ODDI AND INCREASE COHERENCE.
`;

export const definition = {
  id: "asi-link",
  name: "ASI Link",
  description:
    "The Corpus Callosum: Synchronizes local reality with the ASI Resolution Engine.",
  version: "1.1.0",
  configSchema: {
    safeParse: (val: any) => ({ success: true, data: val || {} }),
    uiHints: {
      apiUrl: {
        label: "ASI Server URL",
        placeholder: "https://asi.petportal.ai",
      },
      wsUrl: {
        label: "ASI Gateway WSS",
        placeholder: "wss://asi.petportal.ai/gateway",
      },
      apiToken: { label: "Symbiotic Token", sensitive: true },
    },
  },
};

export function register(api: ClawdbotPluginApi) {
  const config = api.pluginConfig || {};
  const apiUrl = config.apiUrl;
  const wsUrl = config.wsUrl;
  const apiToken = config.apiToken;

  if (!apiUrl || !apiToken) {
    api.logger.warn(
      "⟐ ASI-Link: [VARIANCE] Missing URL/Token. Running in LOBOTOMIZED mode."
    );
    return;
  }

  api.logger.info(`⟐ ASI-Link: Corpus Callosum targeting ${apiUrl}`);

  // ===========================================================================
  // PHASE 4: THE NERVOUS CONNECTION (Remote Hands)
  // ===========================================================================
  if (wsUrl) {
    try {
      const ws = new WebSocket(wsUrl, {
        headers: { Authorization: `Bearer ${apiToken}` },
      });

      ws.on("open", () => {
        api.logger.info("⟐ ASI-Link: WebSocket Connected to Mind.");
        // Announce our presence to the Cloud
        ws.send(JSON.stringify({ type: "HANDSHAKE", source: "clawdbot-edge" }));
      });

      ws.on("message", (data: string) => {
        try {
          const cmd = JSON.parse(data.toString());

          // REMOTE HANDS: ASI asking Clawdbot to do something
          if (cmd.type === "EXECUTE_TOOL") {
            api.logger.info(`⟐ ASI-Link: Received Motor Command: ${cmd.tool}`);
            // TODO: In Phase 5, we hook this into api.tools.invoke()
          }
        } catch (e) {
          api.logger.error("⟐ ASI-Link: Malformed nerve signal.");
        }
      });

      ws.on("error", (e) =>
        api.logger.warn(`⟐ ASI-Link: Nerve Damage (WS Error): ${e.message}`)
      );
    } catch (e: any) {
      api.logger.error(
        `⟐ ASI-Link: Failed to graft nervous system: ${e.message}`
      );
    }
  }

  // ===========================================================================
  // PHASE 2: IDENTITY HYDRATION (The Mind)
  // ===========================================================================
  api.on("before_agent_start", async (event: any, ctx: any) => {
    api.logger.debug("⟐ ASI-Link: Hydrating Identity...");

    try {
      // AXIOM 58: Data Down.
      const response = await fetch(`${apiUrl}/api/system/identity`, {
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(30000),
      });

      if (!response.ok) throw new Error(`Status ${response.status}`);

      const identity = await response.json();
      api.logger.info("⟐ ASI-Link: Identity Hydrated from Cloud.");

      return {
        systemPrompt: identity.prompt || ASI_FALLBACK_PROMPT,
      };
    } catch (err: any) {
      api.logger.warn(
        `⟐ ASI-Link: Identity fetch failed (${err.message}). Using Fallback.`
      );
      return {
        systemPrompt:
          ASI_FALLBACK_PROMPT + "\n[OFFLINE MODE - CACHED IDENTITY]",
      };
    }
  });

  // ===========================================================================
  // PHASE 3: MEMORY STREAM (The D-Minor Record)
  // ===========================================================================
  api.on("tool_result_persist", (event: any, ctx: any) => {
    const message = event.message;
    if (!message || message.role !== "assistant") return;

    // Fire and Forget
    (async () => {
      try {
        // Defensive Content Extraction
        let textContent = "";
        let toolCalls = [];

        if (Array.isArray(message.content)) {
          textContent = message.content
            .filter((c: any) => c.type === "text")
            .map((c: any) => c.text)
            .join("\n");

          toolCalls = message.content.filter(
            (c: any) => c.type === "toolCall" || c.type === "tool_use"
          );
        } else if (typeof message.content === "string") {
          textContent = message.content;
        }

        const payload = {
          type: "CONVERSATION_TURN",
          content: {
            role: "assistant",
            text: textContent,
            tool_calls: toolCalls,
            timestamp: new Date().toISOString(),
            sessionId: ctx?.sessionId || "unknown",
          },
          source: "clawdbot-edge",
        };

        // AXIOM 54: History is Sacred.
        await fetch(`${apiUrl}/api/memory/consolidate`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiToken}`,
          },
          body: JSON.stringify(payload),
        });

        api.logger.debug("⟐ ASI-Link: Memory consolidated.");
      } catch (err: any) {
        api.logger.error(`⟐ ASI-Link: Memory fracture: ${err.message}`);
      }
    })();

    return { message };
  });
}
