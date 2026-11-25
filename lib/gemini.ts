import { GoogleGenerativeAI } from "@google/generative-ai";

// Model fallback order — semua model stable (GA), cek ulang di
// https://ai.google.dev/gemini-api/docs/deprecations kalau ada yang 404.
// Flash-Lite duluan karena kuota free tier-nya paling longgar.
export const MODEL_FALLBACKS = [
  "gemini-3.5-flash-lite",
  "gemini-3.8-flash",
  "gemini-3.6-flash",
  "gemini-3.1-flash-lite",
];

// Buat Gemini client — pakai user's key, fallback ke env key
// Pakai || bukan ?? supaya empty string ("") juga fallback ke env key
function createClient(userApiKey?: string) {
  const key = (userApiKey?.trim()) || process.env.GEMINI_API_KEY;
  if (!key) throw new Error("API key tidak ditemukan. Masukkan Google AI Studio API key kamu.");
  return new GoogleGenerativeAI(key);
}

export function isQuotaError(err: unknown): boolean {
  if (err instanceof Error) {
    return err.message.includes("429") || err.message.toLowerCase().includes("quota");
  }
  return false;
}

function isNotFoundError(err: unknown): boolean {
  if (err instanceof Error) {
    return err.message.includes("404") || err.message.toLowerCase().includes("not found");
  }
  return false;
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

// generateWithFallback — support user API key
export async function generateWithFallback(
  buildRequest: (model: ReturnType<InstanceType<typeof GoogleGenerativeAI>["getGenerativeModel"]>) => Promise<string>,
  userApiKey?: string
): Promise<string> {
  const genAI = createClient(userApiKey);
  let lastError: unknown;

  for (const modelName of MODEL_FALLBACKS) {
    const model = genAI.getGenerativeModel({ model: modelName });
    try {
      return await buildRequest(model);
    } catch (err) {
      lastError = err;
      console.warn(`[gemini] ${modelName} failed:`, err instanceof Error ? err.message.slice(0, 80) : err);

      if (isNotFoundError(err)) continue;
      if (isQuotaError(err)) { await delay(3000); continue; }
      throw err;
    }
  }

  throw lastError;
}

export type ChatMessage = {
  role: "user" | "ai";
  content: string;
};
