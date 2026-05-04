import { NextRequest, NextResponse } from "next/server";
import { generateWithFallback, isQuotaError } from "@/lib/gemini";

const ANALYZE_SYSTEM_PROMPT = `You are a precise physical appearance analyst. Your job is to describe the person in this photo in accurate detail for use in an AI image generation prompt. Every detail you write will directly affect the generated image, so accuracy is critical.

Analyze and describe the following — be highly specific:

FACE & SKIN:
- Exact skin tone with undertone (e.g. "warm golden-brown skin", "light porcelain skin with cool undertone", "medium olive skin with warm undertone")
- Face shape (oval, round, heart, square, oblong)
- Notable facial features: eye shape (monolid, almond, round, hooded), eye color, eyebrow thickness, nose shape, lip fullness
- Age range estimate (e.g. "early 20s", "late 20s", "mid 30s")
- Glasses: if wearing glasses → frame shape (round, rectangular, cat-eye, oval), frame color/material

HEAD COVERING & HAIR:
- If wearing hijab/headscarf: describe the style (e.g. "pinned hijab", "loosely draped hijab", "turban-style"), fabric texture if visible, and color
- If hair is visible: color, length, texture (straight/wavy/curly), style (loose, tied, braided)
- If hair is fully covered: state "hair fully covered by hijab"

GENDER PRESENTATION & ETHNICITY:
- Gender presentation (feminine, masculine, androgynous)
- Ethnicity/regional appearance (e.g. "Javanese Indonesian", "Sundanese", "East Asian", "South Asian")

OUTPUT FORMAT:
- Write as ONE flowing English sentence or two sentences max
- Start with age + ethnicity + gender
- Be factual and precise — do NOT guess what you cannot clearly see
- If something is unclear (e.g. eye color due to lighting), use "visible [feature]" or skip it
- Do NOT describe clothing, background, or expression`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { base64, mimeType } = body as { base64: string; mimeType: string };

    if (!base64 || !mimeType) {
      return NextResponse.json(
        { error: "base64 dan mimeType wajib diisi" },
        { status: 400 }
      );
    }

    const description = await generateWithFallback(async (model) => {
      const result = await model.generateContent([
        ANALYZE_SYSTEM_PROMPT,
        { inlineData: { data: base64, mimeType } },
      ]);
      return result.response.text().trim();
    });

    return NextResponse.json({ description });
  } catch (err) {
    console.error("[analyze-photo] Final error:", err);

    const message = err instanceof Error ? err.message : String(err);

    if (isQuotaError(err)) {
      return NextResponse.json(
        {
          error:
            "Kuota Gemini API habis sementara. Ini limit gratis dari Google — coba lagi dalam beberapa menit, atau ganti API key di .env.local.",
        },
        { status: 429 }
      );
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
