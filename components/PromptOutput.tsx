"use client";

import { useState } from "react";

interface PromptOutputProps {
  prompt: string;
  isGenerating: boolean;
  onRegenerate: () => void;
  userRequirements?: string;
}

export default function PromptOutput({
  prompt,
  isGenerating,
  onRegenerate,
  userRequirements,
}: PromptOutputProps) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopyState("copied");
      setTimeout(() => setCopyState("idle"), 2000);
    } catch {
      setCopyState("error");
      setTimeout(() => setCopyState("idle"), 2000);
    }
  };

  return (
    <div className="mt-6 rounded-2xl border border-violet-500/30 bg-violet-500/5 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-violet-500/20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <span className="text-white text-sm">✨</span>
          </div>
          <div>
            <p className="text-white font-semibold text-sm">Prompt NanoBanana Siap Pakai</p>
            <p className="text-white/40 text-xs">Copy → paste ke NanoBanana Pro/2</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {/* Regenerate */}
          <button
            onClick={onRegenerate}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-white/60 text-xs font-medium hover:border-white/20 hover:text-white/80 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className={`w-3.5 h-3.5 ${isGenerating ? "animate-spin" : ""}`}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
              />
            </svg>
            {isGenerating ? "Generating..." : "Generate Ulang"}
          </button>

          {/* Copy */}
          <button
            onClick={handleCopy}
            disabled={isGenerating}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
              copyState === "copied"
                ? "bg-green-500/20 border border-green-500/40 text-green-300"
                : copyState === "error"
                ? "bg-red-500/20 border border-red-500/40 text-red-300"
                : "bg-gradient-to-r from-violet-600 to-pink-600 text-white hover:opacity-90 shadow-lg shadow-violet-500/20"
            }`}
          >
            {copyState === "copied" ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                  <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clipRule="evenodd" />
                </svg>
                Tersalin!
              </>
            ) : copyState === "error" ? (
              <>⚠️ Gagal Copy</>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                  <path fillRule="evenodd" d="M7.502 6h7.128A3.375 3.375 0 0118 9.375v9.375a3 3 0 003-3V6.108c0-1.505-1.125-2.811-2.664-2.94a48.972 48.972 0 00-.673-.05A3 3 0 0015 1.5h-1.5a3 3 0 00-2.663 1.618c-.225.015-.45.032-.673.05C8.662 3.295 7.554 4.542 7.502 6zM13.5 3A1.5 1.5 0 0012 4.5h4.5A1.5 1.5 0 0015 3h-1.5z" clipRule="evenodd" />
                  <path fillRule="evenodd" d="M3 9.375C3 8.339 3.84 7.5 4.875 7.5h9.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-9.75A1.875 1.875 0 013 20.625V9.375z" clipRule="evenodd" />
                </svg>
                Copy Prompt
              </>
            )}
          </button>
        </div>
      </div>

      {/* User requirements panel — biar user bisa verifikasi apa yang terdeteksi */}
      {userRequirements && !isGenerating && (
        <div className="px-5 pt-4 pb-0">
          <details className="group">
            <summary className="cursor-pointer text-white/30 text-xs flex items-center gap-1.5 hover:text-white/50 transition-colors list-none">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3 h-3 transition-transform group-open:rotate-90">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
              Lihat apa yang AI tangkap dari chatmu
            </summary>
            <div className="mt-2 p-3 rounded-xl bg-black/30 border border-white/5 font-mono text-xs text-white/50 leading-relaxed whitespace-pre-wrap">
              {userRequirements}
            </div>
          </details>
          <div className="mt-3 h-px bg-white/5" />
        </div>
      )}

      {/* Prompt text */}
      <div className="relative p-5">
        {isGenerating ? (
          <div className="flex items-center gap-3 py-6 text-white/40">
            <div className="w-5 h-5 border-2 border-violet-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
            <span className="text-sm">AI sedang merangkai prompt terbaik untukmu...</span>
          </div>
        ) : (
          <pre className="font-mono text-sm text-green-300/90 leading-relaxed whitespace-pre-wrap break-words">
            {prompt}
          </pre>
        )}
      </div>

      {/* Footer hint */}
      {!isGenerating && (
        <div className="px-5 pb-4">
          <p className="text-white/25 text-xs">
            💡 Paste prompt ini ke NanoBanana Pro/2 → klik Generate → AI influencer kamu siap!
          </p>
        </div>
      )}
    </div>
  );
}
