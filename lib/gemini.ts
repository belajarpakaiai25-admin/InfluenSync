import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY belum diset di .env.local");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Urutan model fallback — dicoba satu per satu jika yang sebelumnya gagal
const MODEL_FALLBACKS = [
  "gemini-3.1-flash-lite-preview", // ✅ primary — user selected
  "gemini-2.5-flash",              // fallback 1
  "gemini-2.5-flash-lite",         // fallback 2
  "gemini-2.0-flash-001",          // fallback 3
];

// Helper: parse apakah error adalah quota/rate-limit (429)
export function isQuotaError(err: unknown): boolean {
  if (err instanceof Error) {
    return err.message.includes("429") || err.message.toLowerCase().includes("quota");
  }
  return false;
}

// Helper: parse apakah error adalah model not found (404)
function isNotFoundError(err: unknown): boolean {
  if (err instanceof Error) {
    return err.message.includes("404") || err.message.toLowerCase().includes("not found");
  }
  return false;
}

// Delay helper
function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

// getModel — coba model list sampai ada yang berhasil
export function getModel(modelName?: string) {
  return genAI.getGenerativeModel({ model: modelName ?? MODEL_FALLBACKS[0] });
}

// generateWithFallback — coba setiap model dalam fallback list
export async function generateWithFallback(
  buildRequest: (model: ReturnType<typeof getModel>) => Promise<string>
): Promise<string> {
  let lastError: unknown;

  for (const modelName of MODEL_FALLBACKS) {
    const model = getModel(modelName);
    try {
      const result = await buildRequest(model);
      return result;
    } catch (err) {
      lastError = err;
      console.warn(`[gemini] Model ${modelName} failed:`, err instanceof Error ? err.message.slice(0, 100) : err);

      if (isNotFoundError(err)) {
        // Model tidak tersedia di API ini — langsung coba next
        continue;
      }

      if (isQuotaError(err)) {
        // Quota hit — tunggu 3 detik lalu coba model berikutnya
        await delay(3000);
        continue;
      }

      // Error lain (e.g. invalid request) — langsung lempar
      throw err;
    }
  }

  // Semua model gagal
  throw lastError;
}

export type ChatMessage = {
  role: "user" | "ai";
  content: string;
};

// Legacy export untuk backward compat (dipakai di chat route)
export const geminiModel = getModel(MODEL_FALLBACKS[0]);
