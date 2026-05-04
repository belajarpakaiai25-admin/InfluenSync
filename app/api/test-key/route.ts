import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  try {
    const { apiKey } = await req.json();

    if (!apiKey) {
      return NextResponse.json({ error: "API key tidak boleh kosong." }, { status: 400 });
    }

    // Quick test generate
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite-preview" });
    await model.generateContent("hi");

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);

    if (msg.includes("API_KEY_INVALID") || msg.includes("400")) {
      return NextResponse.json({ error: "API key tidak valid. Cek kembali ya." }, { status: 401 });
    }
    if (msg.includes("429")) {
      // Key valid tapi kena quota — tetap diterima
      return NextResponse.json({ ok: true });
    }
    if (msg.includes("403")) {
      return NextResponse.json({ error: "API key tidak punya akses ke Gemini. Pastikan Gemini API sudah diaktifkan di Google AI Studio." }, { status: 403 });
    }

    return NextResponse.json({ error: "Gagal memverifikasi. Coba lagi." }, { status: 500 });
  }
}
