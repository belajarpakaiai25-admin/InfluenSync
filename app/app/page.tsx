"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import PhotoUpload, { type PhotoData } from "@/components/PhotoUpload";
import ChatWindow from "@/components/ChatWindow";
import ChatInput from "@/components/ChatInput";
import PromptOutput from "@/components/PromptOutput";
import ApiKeySetup from "@/components/ApiKeySetup";
import type { ChatMessage } from "@/lib/gemini";

const LS_KEY = "gemini_api_key";

// ─── API helpers (semua kirim apiKey) ────────────────────────────────────────

async function apiAnalyzePhoto(base64: string, mimeType: string, apiKey: string): Promise<string> {
  const res = await fetch("/api/analyze-photo", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ base64, mimeType, apiKey }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? "Gagal menganalisis foto");
  }
  const data = await res.json();
  return data.description as string;
}

async function apiChat(
  message: string,
  photoDescription: string,
  history: ChatMessage[],
  apiKey: string
): Promise<string> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, photoDescription, history, apiKey }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? "Gagal menghubungi AI");
  }
  const data = await res.json();
  return data.reply as string;
}

async function apiGeneratePrompt(
  photoDescription: string,
  history: ChatMessage[],
  apiKey: string
): Promise<{ prompt: string; userRequirements: string }> {
  const res = await fetch("/api/generate-prompt", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ photoDescription, history, apiKey }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? "Gagal generate prompt");
  }
  const data = await res.json();
  return { prompt: data.prompt as string, userRequirements: data.userRequirements as string };
}

// ─── Guide component (Task 7.4) ───────────────────────────────────────────────

function InAppGuide() {
  return (
    <div className="mb-6 p-5 rounded-2xl border border-white/8 bg-white/[0.02]">
      <p className="text-white/40 text-xs uppercase tracking-widest mb-4">Cara Pakai</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            n: "1",
            icon: "📸",
            title: "Upload Fotomu",
            desc: "Drag & drop atau klik area foto. AI akan otomatis analisis tampilan fisikmu.",
          },
          {
            n: "2",
            icon: "💬",
            title: "Chat Bebas",
            desc: 'Ceritakan mau outfit, background, pose, atau vibe apa. Contoh: "baju merah, background cafe, senyum".',
          },
          {
            n: "3",
            icon: "✨",
            title: "Generate & Copy",
            desc: "Klik Generate Prompt, lalu copy hasilnya ke NanoBanana Pro/2 untuk membuat gambar AI influencer.",
          },
        ].map((step) => (
          <div key={step.n} className="flex gap-3 items-start">
            <div className="w-7 h-7 rounded-full border border-white/15 flex items-center justify-center text-xs text-white/40 flex-shrink-0 mt-0.5">
              {step.n}
            </div>
            <div>
              <p className="text-white/70 text-sm font-medium mb-0.5">
                {step.icon} {step.title}
              </p>
              <p className="text-white/35 text-xs leading-relaxed">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function AppPage() {
  // API key — state untuk render, ref untuk selalu punya nilai terbaru di callbacks
  const [apiKey, setApiKey]                     = useState<string | null>(null);
  const [keyLoaded, setKeyLoaded]               = useState(false);
  const apiKeyRef                               = useRef<string | null>(null);

  const [photoData, setPhotoData]               = useState<PhotoData | null>(null);
  const [photoDescription, setPhotoDescription] = useState<string | null>(null);
  const [messages, setMessages]                 = useState<ChatMessage[]>([]);
  const [isAnalyzing, setIsAnalyzing]           = useState(false);
  const [isChatLoading, setIsChatLoading]       = useState(false);
  const [analyzeError, setAnalyzeError]         = useState<string | null>(null);
  const [chatError, setChatError]               = useState<string | null>(null);
  const [generatedPrompt, setGeneratedPrompt]   = useState<string | null>(null);
  const [userRequirements, setUserRequirements] = useState<string | null>(null);
  const [isGenerating, setIsGenerating]         = useState(false);
  const [generateError, setGenerateError]       = useState<string | null>(null);

  // Load API key dari localStorage, simpan ke ref juga
  useEffect(() => {
    const saved = localStorage.getItem(LS_KEY);
    if (saved) {
      setApiKey(saved);
      apiKeyRef.current = saved;
    }
    setKeyLoaded(true);
  }, []);

  const handleKeySaved = useCallback((key: string) => {
    setApiKey(key);
    apiKeyRef.current = key; // langsung update ref tanpa tunggu re-render
  }, []);

  const handleChangeKey = useCallback(() => {
    localStorage.removeItem(LS_KEY);
    setApiKey(null);
    apiKeyRef.current = null;
  }, []);

  // ── Reset semua state (Task 7.2) ──────────────────────────────────────────
  const handleReset = useCallback(() => {
    setPhotoData(null);
    setPhotoDescription(null);
    setMessages([]);
    setIsAnalyzing(false);
    setIsChatLoading(false);
    setAnalyzeError(null);
    setChatError(null);
    setGeneratedPrompt(null);
    setUserRequirements(null);
    setIsGenerating(false);
    setGenerateError(null);
  }, []);

  // ── Photo uploaded ────────────────────────────────────────────────────────
  const handlePhotoReady = useCallback(async (data: PhotoData) => {
    // Reset chat & prompt state saat ganti foto
    setMessages([]);
    setPhotoDescription(null);
    setGeneratedPrompt(null);
    setUserRequirements(null);
    setGenerateError(null);
    setChatError(null);
    setAnalyzeError(null);
    setPhotoData(data);
    setIsAnalyzing(true);

    try {
      const description = await apiAnalyzePhoto(data.base64, data.mimeType, apiKeyRef.current!);
      setPhotoDescription(description);

      setIsChatLoading(true);
      const welcome = await apiChat(
        "Hei! Saya baru saja upload foto saya. Tolong sambut saya dan tanya apa yang ingin saya buat untuk AI influencer saya.",
        description,
        [],
        apiKeyRef.current!
      );
      setMessages([{ role: "ai", content: welcome }]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gagal menganalisis foto";
      setAnalyzeError(`${msg}. Pastikan foto jelas, wajah terlihat, lalu coba lagi.`);
    } finally {
      setIsAnalyzing(false);
      setIsChatLoading(false);
    }
  }, [apiKey]);

  const handlePhotoCleared = useCallback(() => {
    handleReset();
  }, [handleReset]);

  // ── User sends chat message ───────────────────────────────────────────────
  const handleSendMessage = useCallback(
    async (message: string) => {
      if (!photoDescription || isChatLoading) return;
      setChatError(null);

      const userMsg: ChatMessage = { role: "user", content: message };
      const updatedHistory = [...messages, userMsg];
      setMessages(updatedHistory);
      setIsChatLoading(true);

      try {
        const reply = await apiChat(message, photoDescription, updatedHistory, apiKeyRef.current!);
        setMessages((prev) => [...prev, { role: "ai", content: reply }]);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
        setChatError(msg);
        // Tambah error bubble ke chat agar lebih visible
        setMessages((prev) => [
          ...prev,
          { role: "ai", content: "Maaf, saya tidak bisa membalas saat ini. Coba kirim pesan lagi ya 🙏" },
        ]);
      } finally {
        setIsChatLoading(false);
      }
    },
    [photoDescription, messages, isChatLoading, apiKey]
  );

  // ── Generate prompt ───────────────────────────────────────────────────────
  const handleGeneratePrompt = useCallback(async () => {
    if (!photoDescription || isGenerating) return;
    setIsGenerating(true);
    setGenerateError(null);
    setGeneratedPrompt(""); // tampilkan panel dengan loading

    try {
      const { prompt, userRequirements: reqs } = await apiGeneratePrompt(photoDescription, messages, apiKeyRef.current!);
      setGeneratedPrompt(prompt);
      setUserRequirements(reqs);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gagal generate prompt";
      setGenerateError(`${msg}. Coba lagi atau tambah detail di chat terlebih dahulu.`);
      setGeneratedPrompt(null);
    } finally {
      setIsGenerating(false);
    }
  }, [photoDescription, messages, isGenerating, apiKey]);

  // ── Computed states ───────────────────────────────────────────────────────
  const isReady       = !!photoDescription && !isAnalyzing;
  const hasUserMsg    = messages.filter((m) => m.role === "user").length > 0;
  const isBusy        = isAnalyzing || isChatLoading;
  const promptIsDone  = !!generatedPrompt && !isGenerating;
  const hasActivity   = !!photoData;

  const steps = [
    { n: "1", label: "Upload Foto",      done: !!photoData },
    { n: "2", label: "Chat & Deskripsi", done: hasUserMsg },
    { n: "3", label: "Generate Prompt",  done: promptIsDone },
  ];

  // Tunggu localStorage terbaca dulu (hindari flash)
  if (!keyLoaded) return null;

  // Belum ada API key → tampilkan setup screen
  if (!apiKey) return <ApiKeySetup onKeySaved={handleKeySaved} />;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">

      {/* ── Header + action buttons ── */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
            Buat AI Influencer Kamu
          </h1>
          <p className="text-white/50 text-sm sm:text-base">
            Upload foto → chat → dapatkan prompt NanoBanana siap pakai
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Ganti API Key */}
          <button
            onClick={handleChangeKey}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full border border-white/10 bg-white/5 text-white/40 text-xs hover:text-white/70 hover:border-white/20 transition-all"
            title="Ganti API Key"
          >
            🔑 <span className="hidden sm:inline">Ganti Key</span>
          </button>

          {/* Reset button — hanya muncul kalau sudah ada aktivitas */}
          {hasActivity && (
          <button
            onClick={handleReset}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full border border-white/10 bg-white/5 text-white/50 text-xs font-medium hover:border-red-500/30 hover:text-red-300 hover:bg-red-500/5 transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            Mulai Ulang
          </button>
          )}
        </div>
      </div>

      {/* ── In-app guide — hanya tampil sebelum upload foto (Task 7.4) ── */}
      {!hasActivity && <InAppGuide />}

      {/* ── Step indicators ── */}
      <div className="flex items-center gap-1.5 sm:gap-2 mb-6 overflow-x-auto pb-1 scrollbar-hide">
        {steps.map((step, i) => (
          <div key={step.n} className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            <div
              className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step.done
                  ? "bg-violet-500 text-white"
                  : "border border-white/20 text-white/40"
              }`}
            >
              {step.done ? "✓" : step.n}
            </div>
            <span className={`text-xs sm:text-sm whitespace-nowrap ${step.done ? "text-white/70" : "text-white/30"}`}>
              {step.label}
            </span>
            {i < 2 && <div className="w-6 sm:w-8 h-px bg-white/10 mx-1 flex-shrink-0" />}
          </div>
        ))}
      </div>

      {/* ── Main 2-column layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">

        {/* Left — Photo Upload */}
        <div className="p-4 sm:p-6 rounded-2xl border border-white/10 bg-white/[0.03]">
          <PhotoUpload
            onPhotoReady={handlePhotoReady}
            onPhotoCleared={handlePhotoCleared}
            disabled={isAnalyzing}
          />

          {/* Analyzing state */}
          {isAnalyzing && (
            <div className="mt-4 flex items-center gap-3 p-3 rounded-xl bg-violet-500/10 border border-violet-500/20">
              <div className="w-4 h-4 border-2 border-violet-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
              <p className="text-violet-300 text-sm">AI sedang menganalisis fotomu...</p>
            </div>
          )}

          {/* Analyze error (Task 7.1) */}
          {analyzeError && (
            <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
              <div className="flex items-start gap-2 text-red-300 text-sm">
                <span className="flex-shrink-0 mt-0.5">⚠️</span>
                <div>
                  <p className="font-medium mb-0.5">Gagal Menganalisis Foto</p>
                  <p className="text-red-300/70 text-xs">{analyzeError}</p>
                </div>
              </div>
              <button
                onClick={() => setAnalyzeError(null)}
                className="mt-2 text-xs text-red-400/60 hover:text-red-300 transition-colors"
              >
                Tutup ✕
              </button>
            </div>
          )}

          {/* AI description badge */}
          {photoDescription && (
            <div className="mt-4 p-3 rounded-xl bg-black/30 border border-white/5">
              <p className="text-white/30 text-xs mb-1 uppercase tracking-wider">Deskripsi AI</p>
              <p className="text-white/55 text-xs leading-relaxed">{photoDescription}</p>
            </div>
          )}
        </div>

        {/* Right — Chat */}
        <div className="p-4 sm:p-6 rounded-2xl border border-white/10 bg-white/[0.03] flex flex-col">
          <div className="mb-3 sm:mb-4">
            <h2 className="text-white font-bold text-lg sm:text-xl mb-1">Chat dengan AI</h2>
            <p className="text-white/40 text-xs sm:text-sm">
              Ceritakan mau outfit apa, background apa, atau pose gimana
            </p>
          </div>

          <ChatWindow
            messages={messages}
            isLoading={isChatLoading}
            hasPhoto={!!photoData}
          />

          {/* Chat error (Task 7.1) */}
          {chatError && (
            <div className="mt-2 flex items-center gap-2 p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs">
              <span>⚠️</span>
              <span className="flex-1">{chatError}</span>
              <button onClick={() => setChatError(null)} className="text-red-400/60 hover:text-red-300">✕</button>
            </div>
          )}

          <ChatInput
            onSend={handleSendMessage}
            disabled={!isReady || isBusy}
            placeholder={
              !photoData
                ? "Upload foto dulu untuk mulai chat"
                : isAnalyzing
                ? "Menganalisis foto..."
                : "Ceritakan mau tampil gimana... (Enter untuk kirim)"
            }
          />

          {/* Generate Prompt Button */}
          {isReady && (
            <div className="mt-3 sm:mt-4">
              {generateError && (
                <div className="mb-2 flex items-start gap-2 p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs">
                  <span>⚠️</span>
                  <span className="flex-1">{generateError}</span>
                  <button onClick={() => setGenerateError(null)} className="text-red-400/60 hover:text-red-300 flex-shrink-0">✕</button>
                </div>
              )}
              <button
                onClick={handleGeneratePrompt}
                disabled={!hasUserMsg || isGenerating || isBusy}
                className={`w-full py-3 sm:py-3.5 rounded-full font-bold text-sm transition-all ${
                  hasUserMsg && !isGenerating && !isBusy
                    ? "bg-gradient-to-r from-violet-600 to-pink-600 text-white hover:opacity-90 active:scale-[0.98] shadow-xl shadow-violet-500/25"
                    : "border border-dashed border-white/15 text-white/25 cursor-not-allowed"
                }`}
              >
                {isGenerating ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Membuat prompt...
                  </span>
                ) : hasUserMsg ? (
                  "✨ Generate Prompt NanoBanana"
                ) : (
                  "Chat dulu sebelum generate prompt"
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Prompt Output Panel ── */}
      {(generatedPrompt !== null || isGenerating) && (
        <PromptOutput
          prompt={generatedPrompt ?? ""}
          isGenerating={isGenerating}
          onRegenerate={handleGeneratePrompt}
          userRequirements={userRequirements ?? undefined}
        />
      )}

      {/* ── Tips ── */}
      <div className="mt-4 sm:mt-6 p-3 sm:p-4 rounded-xl border border-white/5 bg-white/[0.02] flex items-start gap-3 text-xs sm:text-sm text-white/40">
        <span className="text-base flex-shrink-0">💡</span>
        <span>
          <strong className="text-white/60">Tips:</strong> Semakin detail chat
          kamu (warna baju, jenis background, ekspresi), semakin akurat prompt
          yang dihasilkan.
        </span>
      </div>
    </div>
  );
}
