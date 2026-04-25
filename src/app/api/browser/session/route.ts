import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const BROWSERBASE_API_KEY = process.env.BROWSERBASE_API_KEY;
const BROWSERBASE_PROJECT_ID = process.env.BROWSERBASE_PROJECT_ID;
const BB_BASE = "https://www.browserbase.com/v1";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { action, sessionId, url, command, selector, text, scrollY } = await req.json();

    if (!BROWSERBASE_API_KEY || !BROWSERBASE_PROJECT_ID) {
      return NextResponse.json({ error: "Browserbase not configured" }, { status: 503 });
    }

    // ── CREATE session ────────────────────────────────────────────────────
    if (action === "create") {
      const res = await fetch(`${BB_BASE}/sessions`, {
        method: "POST",
        headers: {
          "X-BB-API-Key": BROWSERBASE_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId: BROWSERBASE_PROJECT_ID,
          browserSettings: { viewport: { width: 1280, height: 800 } },
        }),
      });
      const data = await res.json();
      if (!data.id) return NextResponse.json({ error: "Failed to create session" }, { status: 500 });

      // Navigate to URL if provided
      if (url && data.id) {
        await fetch(`${BB_BASE}/sessions/${data.id}/navigate`, {
          method: "POST",
          headers: { "X-BB-API-Key": BROWSERBASE_API_KEY, "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        });
      }

      return NextResponse.json({
        sessionId: data.id,
        liveViewUrl: data.liveViewUrl || null,
        debugViewUrl: data.debugViewUrl || null,
        status: "created",
      });
    }

    // ── SCREENSHOT ────────────────────────────────────────────────────────
    if (action === "screenshot" && sessionId) {
      const res = await fetch(`${BB_BASE}/sessions/${sessionId}/screenshot`, {
        headers: { "X-BB-API-Key": BROWSERBASE_API_KEY },
      });
      if (!res.ok) return NextResponse.json({ error: "Screenshot failed" }, { status: 500 });
      const buffer = await res.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");
      return NextResponse.json({ screenshot: `data:image/png;base64,${base64}` });
    }

    // ── NAVIGATE ──────────────────────────────────────────────────────────
    if (action === "navigate" && sessionId && url) {
      await fetch(`${BB_BASE}/sessions/${sessionId}/navigate`, {
        method: "POST",
        headers: { "X-BB-API-Key": BROWSERBASE_API_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      return NextResponse.json({ status: "navigated" });
    }

    // ── COMMAND (click/type/scroll) ───────────────────────────────────────
    if (action === "command" && sessionId && command) {
      const cdpBody: Record<string, unknown> = {};

      if (command === "click" && selector) {
        cdpBody.method = "Runtime.evaluate";
        cdpBody.params = { expression: `document.querySelector(${JSON.stringify(selector)})?.click()` };
      } else if (command === "type" && selector && text !== undefined) {
        cdpBody.method = "Runtime.evaluate";
        cdpBody.params = {
          expression: `(function(){const el=document.querySelector(${JSON.stringify(selector)});if(el){el.focus();el.value=${JSON.stringify(text)};el.dispatchEvent(new Event('input',{bubbles:true}));}})()`,
        };
      } else if (command === "scroll") {
        cdpBody.method = "Runtime.evaluate";
        cdpBody.params = { expression: `window.scrollBy(0, ${scrollY || 400})` };
      } else if (command === "back") {
        cdpBody.method = "Runtime.evaluate";
        cdpBody.params = { expression: "history.back()" };
      }

      if (cdpBody.method) {
        await fetch(`${BB_BASE}/sessions/${sessionId}/cdp`, {
          method: "POST",
          headers: { "X-BB-API-Key": BROWSERBASE_API_KEY, "Content-Type": "application/json" },
          body: JSON.stringify(cdpBody),
        });
      }
      return NextResponse.json({ status: "command_sent" });
    }

    // ── CLOSE session ─────────────────────────────────────────────────────
    if (action === "close" && sessionId) {
      await fetch(`${BB_BASE}/sessions/${sessionId}`, {
        method: "DELETE",
        headers: { "X-BB-API-Key": BROWSERBASE_API_KEY },
      });
      return NextResponse.json({ status: "closed" });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    console.error("Browser session error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
