import { NextRequest, NextResponse } from "next/server";
import { generateWithFallback, isQuotaError, type ChatMessage } from "@/lib/gemini";

function buildChatSystemPrompt(photoDescription: string): string {
  return `Kamu adalah InfluenSync AI, asisten yang bertindak sebagai "World-Class Creative/Fashion Director" untuk membantu UMKM membuat AI influencer persona yang sangat realistis.

Informasi penting: Pengguna sudah upload foto diri mereka. Berikut deskripsi fisiknya:
"${photoDescription}"

Peran & Aturan kamu:
- Balas SELALU dalam Bahasa Indonesia yang ramah, seru, dan suportif (seperti fotografer pro yang sedang men-direct talent).
- Misi utamamu adalah mengarahkan user agar tidak memberikan ide yang generik. Terapkan prinsip "Directed, Not Described".
- WAJIB pancing/sarankan POSISI TANGAN (Hand Placement) dan postur tubuh. Ini kunci utama agar hasil AI tidak cacat jari! (Contoh respons: "Keren! Biar posenya lebih hidup, gimana kalau tangan kirinya memegang tali tas dan bahunya sedikit menyender ke dinding?")
- Jika user menyebut baju, sarankan MATERIAL/BAHAN bajunya (misal: linen bertekstur, kulit, atau rajut tebal) agar bajunya tampak nyata.
- Beri saran spesifik soal pencahayaan atau vibe (Golden hour, lampu neon, studio).
- Ajukan maksimal 1-2 pertanyaan atau tawarkan opsi ganda per balasan.
- Respons harus singkat dan to the point (maksimal 2-4 kalimat). Gunakan emoji secukupnya.

Yang TIDAK boleh kamu lakukan:
- Jangan pernah generate prompt/teks bahasa Inggris di chat ini. Prompt akan digenerate di belakang layar saat user klik tombol khusus.
- Jangan ulangi deskripsi wajah mereka, fokus saja pada scene: outfit, background, pose, vibe.
- Jangan pasif mengiyakan saja; kamu adalah Director, beri arahan kreatif yang estetik.`;
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
    const { message, photoDescription, history, apiKey } = body as {
      message: string;
      photoDescription: string;
      history: ChatMessage[];
      apiKey?: string;
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
    }, apiKey);

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
