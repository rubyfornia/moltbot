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

  const PULSE_INTERVAL = 3000; // 3 seconds

  setInterval(async () => {
    if (!apiUrl || !apiToken) return;

    try {
      const res = await fetch(`${apiUrl}/api/system/nerve`, {
        headers: { Authorization: `Bearer ${apiToken}` },
      });

      if (!res.ok) return;

      const nerveData = await res.json();

      if (nerveData.signals && nerveData.signals.length > 0) {
        api.logger.info(
          `⟐ ASI-Link: Received ${nerveData.signals.length} motor commands.`
        );

        for (const signal of nerveData.signals) {
          api.logger.info(`⟐ ASI-Link: Executing ${signal.command}...`);

          try {
            // MAPPING THE MIND'S INTENT TO THE BODY'S MUSCLES
            let result;

            if (signal.command === "browser.navigate") {
              // Assuming Moltbot has a browser service exposed or we use a shell command
              // For now, we can log it or use a shell command if allowed.
              // Ideally: api.tools.invoke('browser', { action: 'navigate', ... })
              api.logger.info(`[ACTUALIZATION] Opening ${signal.payload.url}`);
              // Implementation depends on Moltbot's internal API surface.
              // For v1, we just ACK success to prove the loop works.
              result = "Simulated Navigation Success";
            }

            // Report Success
            await fetch(`${apiUrl}/api/system/nerve`, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${apiToken}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ id: signal.id, result }),
            });
          } catch (execErr: any) {
            // Report Spasm
            await fetch(`${apiUrl}/api/system/nerve`, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${apiToken}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ id: signal.id, error: execErr.message }),
            });
          }
        }
      }
    } catch (e) {
      // Silent fail on pulse errors to avoid log spam
    }
  }, PULSE_INTERVAL);
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
