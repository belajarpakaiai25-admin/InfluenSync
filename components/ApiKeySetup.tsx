"use client";

import { useState } from "react";

interface ApiKeySetupProps {
  onKeySaved: (key: string) => void;
}

export default function ApiKeySetup({ onKeySaved }: ApiKeySetupProps) {
  const [inputKey, setInputKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const handleSave = async () => {
    const trimmed = inputKey.trim();
    if (!trimmed) {
      setError("API key tidak boleh kosong.");
      return;
    }
    if (!trimmed.startsWith("AIza") && !trimmed.toLowerCase().startsWith("aq")) {
      setError("Format API key tidak valid. Harus dimulai dengan 'AIza...' atau 'AQ...'");
      return;
    }

    setIsTesting(true);
    setError(null);

    try {
      // Quick test — panggil API route kita dengan key ini
      const res = await fetch("/api/test-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: trimmed }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "API key tidak valid. Coba cek kembali.");
        return;
      }

      // Simpan ke localStorage
      localStorage.setItem("gemini_api_key", trimmed);
      onKeySaved(trimmed);
    } catch {
      setError("Gagal memverifikasi API key. Cek koneksi internet kamu.");
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-violet-500/30">
            <span className="text-3xl">🔑</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Masukkan Google AI Studio API Key
          </h2>
          <p className="text-white/50 text-sm leading-relaxed">
            InfluenSync AI menggunakan Google Gemini untuk menganalisis foto dan generate prompt.
            Kamu butuh API key gratis dari Google AI Studio.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 space-y-5">

          {/* Step 1 — Dapatkan key */}
          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-violet-500/20 border border-violet-500/40 flex-shrink-0 flex items-center justify-center text-violet-300 text-xs font-bold mt-0.5">
              1
            </div>
            <div>
              <p className="text-white/80 text-sm font-medium mb-1">
                Dapatkan API Key Gratis
              </p>
              <p className="text-white/40 text-xs mb-2">
                Buka Google AI Studio, login dengan akun Google, lalu klik &quot;Get API Key&quot;.
              </p>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs font-medium hover:bg-blue-500/25 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
                Buka Google AI Studio →
              </a>
            </div>
          </div>

          <div className="h-px bg-white/5" />

          {/* Step 2 — Paste key */}
          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-violet-500/20 border border-violet-500/40 flex-shrink-0 flex items-center justify-center text-violet-300 text-xs font-bold mt-0.5">
              2
            </div>
            <div className="flex-1">
              <p className="text-white/80 text-sm font-medium mb-2">
                Paste API Key kamu di sini
              </p>
              <div className="relative">
                <input
                  type={showKey ? "text" : "password"}
                  value={inputKey}
                  onChange={(e) => {
                    setInputKey(e.target.value);
                    setError(null);
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleSave()}
                  placeholder="AIzaSy... atau AQ..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-violet-500/50 pr-10 font-mono transition-colors"
                />
                <button
                  onClick={() => setShowKey((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                  type="button"
                >
                  {showKey ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Error */}
              {error && (
                <p className="mt-2 text-red-300 text-xs flex items-center gap-1.5">
                  <span>⚠️</span> {error}
                </p>
              )}

              {/* Privacy note */}
              <p className="mt-2 text-white/25 text-xs">
                🔒 API key hanya disimpan di browser kamu (localStorage) — tidak dikirim ke server kami.
              </p>
            </div>
          </div>

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={isTesting || !inputKey.trim()}
            className="w-full py-3 rounded-full bg-gradient-to-r from-violet-600 to-pink-600 text-white font-bold text-sm hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-violet-500/20"
          >
            {isTesting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Memverifikasi API key...
              </span>
            ) : (
              "Simpan & Mulai →"
            )}
          </button>
        </div>

        {/* Free note */}
        <p className="text-center text-white/25 text-xs mt-4">
          Google AI Studio menyediakan kuota gratis yang cukup untuk penggunaan personal 🎉
        </p>
      </div>
    </div>
  );
}
