"use client";

import { useCallback, useRef, useState } from "react";

const MAX_SIZE_MB = 5;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export interface PhotoData {
  file: File;
  preview: string;   // object URL for <img>
  base64: string;    // pure base64 string (no data: prefix)
  mimeType: string;
}

interface PhotoUploadProps {
  onPhotoReady: (data: PhotoData) => void;
  onPhotoCleared: () => void;
  disabled?: boolean;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // strip "data:image/...;base64," prefix → pure base64
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function validateFile(file: File): string | null {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return "Format tidak didukung. Gunakan JPG, PNG, atau WebP.";
  }
  if (file.size > MAX_SIZE_BYTES) {
    return `Ukuran file terlalu besar. Maksimal ${MAX_SIZE_MB}MB (file kamu: ${(file.size / 1024 / 1024).toFixed(1)}MB).`;
  }
  return null;
}

export default function PhotoUpload({
  onPhotoReady,
  onPhotoCleared,
  disabled = false,
}: PhotoUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    async (file: File) => {
      setError(null);

      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      setIsProcessing(true);
      try {
        const base64 = await fileToBase64(file);
        const objectUrl = URL.createObjectURL(file);
        setPreview(objectUrl);
        onPhotoReady({
          file,
          preview: objectUrl,
          base64,
          mimeType: file.type,
        });
      } catch {
        setError("Gagal memproses foto. Coba lagi ya.");
      } finally {
        setIsProcessing(false);
      }
    },
    [onPhotoReady]
  );

  // ── Drag & Drop handlers ──
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  // ── File input change ──
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    // reset input so same file can be re-selected
    e.target.value = "";
  };

  // ── Clear / reset ──
  const handleClear = () => {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setError(null);
    onPhotoCleared();
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Label */}
      <div>
        <h2 className="text-white font-bold text-xl mb-1">Upload Fotomu</h2>
        <p className="text-white/40 text-sm">
          AI akan analisis wajah &amp; fitur fisikmu dari foto ini
        </p>
      </div>

      {/* Drop zone / preview */}
      {preview ? (
        /* ── Preview state ── */
        <div className="relative w-full max-w-[280px] sm:max-w-xs mx-auto">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Foto yang diupload"
            className="w-full aspect-square object-cover rounded-2xl border-2 border-violet-500/50 shadow-xl shadow-violet-500/10"
          />
          {/* Overlay: change / clear */}
          <div className="absolute inset-0 rounded-2xl bg-black/0 hover:bg-black/50 transition-all flex items-center justify-center gap-3 opacity-0 hover:opacity-100">
            <button
              onClick={() => inputRef.current?.click()}
              className="px-3 py-1.5 rounded-full bg-white/20 text-white text-xs font-medium hover:bg-white/30 transition-colors backdrop-blur-sm"
            >
              Ganti Foto
            </button>
            <button
              onClick={handleClear}
              className="px-3 py-1.5 rounded-full bg-red-500/30 text-red-300 text-xs font-medium hover:bg-red-500/50 transition-colors backdrop-blur-sm"
            >
              Hapus
            </button>
          </div>
        </div>
      ) : (
        /* ── Empty / drop zone ── */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !disabled && inputRef.current?.click()}
          className={`
            relative w-full max-w-[280px] sm:max-w-xs mx-auto aspect-square rounded-2xl border-2 border-dashed
            flex flex-col items-center justify-center gap-3 cursor-pointer
            transition-all duration-200 select-none
            ${disabled ? "opacity-40 cursor-not-allowed border-white/10 bg-white/5" : ""}
            ${!disabled && isDragging
              ? "border-violet-400 bg-violet-500/15 scale-[1.02]"
              : !disabled
              ? "border-white/20 bg-white/5 hover:border-violet-500/50 hover:bg-violet-500/5"
              : ""}
          `}
        >
          {isProcessing ? (
            <div className="flex flex-col items-center gap-3 text-white/50">
              <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">Memproses foto...</span>
            </div>
          ) : isDragging ? (
            <div className="flex flex-col items-center gap-2 text-violet-300">
              <div className="text-5xl">📥</div>
              <span className="text-sm font-medium">Lepaskan di sini!</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 text-white/40 px-4 text-center">
              <div className="text-5xl">📸</div>
              <div>
                <p className="font-medium text-white/60 text-sm">
                  Drag &amp; drop atau klik untuk upload
                </p>
                <p className="text-xs mt-1">JPG, PNG, WebP · Maks {MAX_SIZE_MB}MB</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        className="sr-only"
        onChange={handleInputChange}
        disabled={disabled}
      />

      {/* Error message */}
      {error && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
          <span className="flex-shrink-0 mt-0.5">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Success banner */}
      {preview && !error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-violet-500/10 border border-violet-500/20">
          <span className="text-violet-400 text-lg">✓</span>
          <p className="text-violet-300 text-sm">
            Foto berhasil diupload! Sekarang chat di sebelah kanan.
          </p>
        </div>
      )}
    </div>
  );
}
