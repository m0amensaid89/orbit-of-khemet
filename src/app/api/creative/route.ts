import { NextRequest, NextResponse } from "next/server";

const EGYPTIAN_STYLE_SUFFIXES: Record<string, string> = {
  none: "",
  khemet: ", ancient Egyptian aesthetic, gold hieroglyphics, dark obsidian background, ankh symbols, scarab motifs, eye of Ra, Khemet empire visual style",
  pharaoh: ", hyper-realistic ancient Egyptian pharaoh, lapis lazuli and gold ceremonial regalia, desert pyramid backdrop, dramatic cinematic lighting",
  papyrus: ", papyrus manuscript style, aged ochre parchment, hieroglyphic illustrations, hand-drawn Egyptian art, sacred geometry borders",
  cosmos: ", Egyptian cosmic mythology, Nut goddess of the sky, stars and constellation maps, deep space nebula, gold and indigo palette, mystical sacred geometry",
  warrior: ", ancient Egyptian warrior, battle armor with falcon helmet, desert storm backdrop, god of war energy, cinematic dramatic lighting",
  oracle: ", ancient Egyptian oracle chamber, torchlight, smoke and incense, Thoth deity, wisdom scrolls, sacred ibis, deep mystical atmosphere",
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      prompt,
      model = "dall-e-3",
      egyptianPreset = "none",
      size = "1024x1024",
      quality = "standard",
    } = body;

    if (!prompt?.trim()) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const styleSuffix = EGYPTIAN_STYLE_SUFFIXES[egyptianPreset] || "";
    const enhancedPrompt = prompt.trim() + styleSuffix;

    // ── DALL-E 3 ────────────────────────────────────────────────────────────
    if (model === "dall-e-3") {
      const res = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt: enhancedPrompt,
          n: 1,
          size: size as "1024x1024" | "1792x1024" | "1024x1792",
          quality: quality as "standard" | "hd",
          response_format: "url",
        }),
      });
      const data = await res.json();
      if (!data?.data?.[0]?.url) {
        return NextResponse.json({ error: data?.error?.message || "Generation failed" }, { status: 500 });
      }
      return NextResponse.json({
        url: data.data[0].url,
        model: "DALL-E 3",
        prompt: enhancedPrompt,
        revisedPrompt: data.data[0].revised_prompt,
      });
    }

    // ── Grok Aurora (xAI) ───────────────────────────────────────────────────
    if (model === "grok-aurora") {
      const res = await fetch("https://api.x.ai/v1/images/generations", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.XAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "grok-2-image",
          prompt: enhancedPrompt,
          n: 1,
          response_format: "url",
        }),
      });
      const data = await res.json();
      const url = data?.data?.[0]?.url;
      if (!url) {
        return NextResponse.json({ error: data?.error?.message || "Grok Aurora failed" }, { status: 500 });
      }
      return NextResponse.json({ url, model: "Grok Aurora", prompt: enhancedPrompt });
    }

    // ── Fal.ai Flux ─────────────────────────────────────────────────────────
    if (model === "flux") {
      const res = await fetch("https://fal.run/fal-ai/flux/schnell", {
        method: "POST",
        headers: {
          Authorization: `Key ${process.env.FAL_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: enhancedPrompt,
          image_size: size === "1792x1024" ? "landscape_16_9"
                    : size === "1024x1792" ? "portrait_16_9"
                    : "square_hd",
          num_images: 1,
          output_format: "jpeg",
        }),
      });
      const data = await res.json();
      const url = data?.images?.[0]?.url;
      if (!url) {
        return NextResponse.json({ error: "Flux generation failed" }, { status: 500 });
      }
      return NextResponse.json({ url, model: "Flux Schnell", prompt: enhancedPrompt });
    }

    return NextResponse.json({ error: "Unknown model" }, { status: 400 });
  } catch (err) {
    console.error("Creative API error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
