import { NextRequest, NextResponse } from "next/server";
import { generateWithFallback, isQuotaError, type ChatMessage } from "@/lib/gemini";

function buildChatSystemPrompt(photoDescription: string): string {
  return `Kamu adalah InfluenSync AI, asisten yang membantu pemilik bisnis dan UMKM Indonesia membuat AI influencer persona untuk konten media sosial mereka.

Informasi penting: Pengguna sudah upload foto diri mereka. Berikut deskripsi fisik orang dalam foto tersebut:
"${photoDescription}"

Peran kamu dalam percakapan ini:
- Balas SELALU dalam Bahasa Indonesia yang ramah, hangat, dan santai
- Bantu user mendeskripsikan AI influencer yang mereka inginkan: outfit, background, pose, ekspresi, vibe, jenis konten
- Ajukan pertanyaan lanjutan jika ada detail yang kurang (tapi jangan terlalu banyak pertanyaan sekaligus — maksimal 1-2 pertanyaan)
- Kamu sudah TAHU tampilan fisik mereka — fokus pada hal lain seperti scene, gaya, dan konteks konten
- Respons singkat dan to the point (2-4 kalimat maksimal)
- Gunakan emoji secukupnya agar terasa ramah

Yang TIDAK boleh kamu lakukan:
- Jangan generate prompt NanoBanana dulu — itu nanti saat user klik tombol "Generate Prompt"
- Jangan ulangi deskripsi fisik kecuali relevan
- Jangan bertanya terlalu banyak sekaligus

Contoh topik yang bisa digali: jenis outfit (casual/formal/tradisional), warna dominan brand, background (studio/outdoor/cafe/dll), pose (standing/duduk/close-up), ekspresi, props yang dipegang, jenis konten (promosi produk/lifestyle/testimonial).`;
}

function formatHistoryForGemini(
  history: ChatMessage[]
): Array<{ role: "user" | "model"; parts: Array<{ text: string }> }> {
  return history.map((msg) => ({
    role: msg.role === "ai" ? "model" : "user",
    parts: [{ text: msg.content }],
  }));
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, photoDescription, history } = body as {
      message: string;
      photoDescription: string;
      history: ChatMessage[];
    };

    if (!message || !photoDescription) {
      return NextResponse.json(
        { error: "message dan photoDescription wajib diisi" },
        { status: 400 }
      );
    }

    const systemPrompt = buildChatSystemPrompt(photoDescription);

    const reply = await generateWithFallback(async (model) => {
      const chat = model.startChat({
        history: [
          { role: "user", parts: [{ text: systemPrompt }] },
          {
            role: "model",
            parts: [{ text: "Siap! Saya sudah membaca deskripsi foto dan siap membantu membuat AI influencer persona yang keren. 🎨" }],
          },
          ...formatHistoryForGemini(history),
        ],
      });
      const result = await chat.sendMessage(message);
      return result.response.text().trim();
    });

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("[chat] Final error:", err);

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
