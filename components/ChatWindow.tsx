"use client";

import { useEffect, useRef } from "react";
import type { ChatMessage } from "@/lib/gemini";

interface ChatWindowProps {
  messages: ChatMessage[];
  isLoading: boolean;
  hasPhoto: boolean;
}

function TypingIndicator() {
  return (
    <div className="flex gap-3 items-end">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex-shrink-0 flex items-center justify-center text-xs font-bold text-white shadow-md">
        AI
      </div>
      <div className="bg-white/10 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-white/50 animate-bounce [animation-delay:0ms]" />
        <span className="w-2 h-2 rounded-full bg-white/50 animate-bounce [animation-delay:150ms]" />
        <span className="w-2 h-2 rounded-full bg-white/50 animate-bounce [animation-delay:300ms]" />
      </div>
    </div>
  );
}

function EmptyState({ hasPhoto }: { hasPhoto: boolean }) {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center text-white/30">
        {hasPhoto ? (
          <>
            <div className="text-4xl mb-3">💬</div>
            <p className="text-sm">Menghubungi AI...</p>
          </>
        ) : (
          <>
            <div className="text-4xl mb-3">👆</div>
            <p className="text-sm">Upload foto dulu ya,</p>
            <p className="text-sm">baru bisa mulai chat</p>
          </>
        )}
      </div>
    </div>
  );
}

export default function ChatWindow({
  messages,
  isLoading,
  hasPhoto,
}: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom whenever messages change or loading state changes
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div className="flex-1 rounded-2xl border border-white/10 bg-black/30 p-3 sm:p-4 overflow-y-auto scrollbar-thin flex flex-col gap-3 sm:gap-4 min-h-[260px] sm:min-h-[320px] max-h-[380px] sm:max-h-[480px]">
      {messages.length === 0 && !isLoading ? (
        <EmptyState hasPhoto={hasPhoto} />
      ) : (
        <>
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "items-end"}`}
            >
              {/* Avatar — only for AI */}
              {msg.role === "ai" && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex-shrink-0 flex items-center justify-center text-xs font-bold text-white shadow-md">
                  AI
                </div>
              )}

              {/* Bubble */}
              <div
                className={`px-4 py-3 rounded-2xl text-sm leading-relaxed max-w-[80%] whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-gradient-to-br from-violet-600 to-pink-600 text-white rounded-tr-sm shadow-lg shadow-violet-500/20"
                    : "bg-white/10 text-white/85 rounded-tl-sm"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isLoading && <TypingIndicator />}
        </>
      )}

      {/* Scroll anchor */}
      <div ref={bottomRef} />
    </div>
  );
}
