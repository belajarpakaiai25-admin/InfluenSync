import { NextRequest, NextResponse } from "next/server";
import { generateWithFallback, isQuotaError, type ChatMessage } from "@/lib/gemini";

// ─── Step 1: Extract user requirements ───────────────────────────────────────

const EXTRACT_PROMPT = `You are a requirements extractor and translator. Read this conversation, extract ONLY what the USER explicitly requested, and translate everything into English.

Output in EXACTLY this format:
OUTFIT: [user's outfit request translated to English, or "not specified"]
BACKGROUND: [user's background/setting translated to English, or "not specified"]
POSE: [user's pose translated to English, or "not specified"]
PROPS: [user's props/items translated to English, or "not specified"]
EXPRESSION: [user's expression translated to English, or "not specified"]
VIBE: [user's mood/style/theme translated to English, or "not specified"]
OTHER: [any other request translated to English, or "not specified"]

Rules:
- Translate faithfully — keep the exact meaning, just switch language to English
  Examples: "blazer hitam" → "black blazer", "background sawah" → "rice field background", "pose duduk" → "sitting pose"
- Only extract from USER messages, completely ignore AI responses
- If user mentioned the same thing multiple times, use the LATEST version
- Do NOT add anything the user did not say
- ALL output values must be in English`;

// ─── Step 2: Build locked template from user requirements ────────────────────
// Key insight: lock user's words into the template BEFORE asking Gemini to write
// This prevents Gemini from substituting user's choices with its own

function parseRequirements(raw: string): Record<string, string> {
  const result: Record<string, string> = {};
  const lines = raw.split("\n");
  for (const line of lines) {
    const match = line.match(/^([A-Z_]+):\s*(.+)$/);
    if (match) {
      const key = match[1].trim();
      const val = match[2].trim();
      result[key] = val === "not specified" ? "" : val;
    }
  }
  return result;
}

function buildLockedTemplate(
  photoDescription: string,
  reqs: Record<string, string>
): string {
  // Build a partial prompt with user's EXACT elements already locked in
  // Gemini only fills in: lighting, camera style, quality tags, seed
  const parts: string[] = [];

  // Subject (always from photo)
  parts.push(`SUBJECT: ${photoDescription}`);

  // Lock user's specified elements
  if (reqs.OUTFIT) parts.push(`OUTFIT (LOCKED — do not change): ${reqs.OUTFIT}`);
  if (reqs.BACKGROUND) parts.push(`BACKGROUND (LOCKED — do not change): ${reqs.BACKGROUND}`);
  if (reqs.POSE) parts.push(`POSE (LOCKED — do not change): ${reqs.POSE}`);
  if (reqs.PROPS) parts.push(`PROPS (LOCKED — do not change): ${reqs.PROPS}`);
  if (reqs.EXPRESSION) parts.push(`EXPRESSION (LOCKED — do not change): ${reqs.EXPRESSION}`);
  if (reqs.VIBE) parts.push(`VIBE (LOCKED — do not change): ${reqs.VIBE}`);
  if (reqs.OTHER) parts.push(`OTHER REQUIREMENTS (LOCKED): ${reqs.OTHER}`);

  // Fields Gemini needs to fill
  parts.push(`LIGHTING: [you fill this — must match the background and vibe above]`);
  parts.push(`CAMERA STYLE: [you fill this — e.g. 85mm portrait, shallow depth of field]`);
  parts.push(`PHOTOGRAPHY STYLE: [you fill this — e.g. lifestyle, editorial, commercial]`);

  return parts.join("\n");
}

// ─── Step 3: Generate final prompt ───────────────────────────────────────────

const GENERATE_SYSTEM = `You are a NanoBanana Pro/2 image generation prompt writer.

Your job: Take the structured brief below and write it as ONE flowing English prompt paragraph.

ABSOLUTE RULES:
1. Every field marked "LOCKED" MUST appear in the prompt exactly as written — they are already in English
2. You ONLY fill in the fields marked [you fill this]
3. Output ONLY the final prompt text — no labels, no explanation, no markdown, no quotes
4. THE ENTIRE OUTPUT MUST BE IN ENGLISH — not a single word in Indonesian or any other language
5. End with --seed [random 2-digit number] --ar 4:5
6. If you change ANY locked element or write in Indonesian, the output is considered WRONG`;

function formatHistory(history: ChatMessage[]): string {
  return history
    .map((m) => `${m.role === "user" ? "User" : "AI"}: ${m.content}`)
    .join("\n");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { photoDescription, history } = body as {
      photoDescription: string;
      history: ChatMessage[];
    };

    if (!photoDescription) {
      return NextResponse.json(
        { error: "photoDescription wajib diisi" },
        { status: 400 }
      );
    }

    const conversationText = formatHistory(history ?? []);

    // ── Step 1: Extract user's exact requests ─────────────────────────────────
    const extractionInput = `${EXTRACT_PROMPT}

CONVERSATION:
${conversationText}

Extract now:`;

    const rawRequirements = await generateWithFallback(async (model) => {
      const result = await model.generateContent(extractionInput);
      return result.response.text().trim();
    });

    // ── Step 2: Parse & build locked template ─────────────────────────────────
    const reqs = parseRequirements(rawRequirements);
    const lockedTemplate = buildLockedTemplate(photoDescription, reqs);

    // ── Step 3: Generate prompt with locked elements ──────────────────────────
    const generationInput = `${GENERATE_SYSTEM}

---

BRIEF (follow exactly — locked elements cannot be changed):
${lockedTemplate}

---

Write the NanoBanana prompt now:`;

    const prompt = await generateWithFallback(async (model) => {
      const result = await model.generateContent(generationInput);
      return result.response.text().trim();
    });

    return NextResponse.json({ prompt, userRequirements: rawRequirements });
  } catch (err) {
    console.error("[generate-prompt] Error:", err);

    if (isQuotaError(err)) {
      return NextResponse.json(
        { error: "Kuota API habis sementara. Coba lagi dalam beberapa menit." },
        { status: 429 }
      );
    }

    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
