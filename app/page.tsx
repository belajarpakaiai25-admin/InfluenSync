import Link from "next/link";

const features = [
  {
    icon: "📸",
    title: "Upload Foto Kamu",
    desc: "Cukup upload satu foto selfie. AI kami akan analisis dan mengenali fitur wajahmu secara otomatis.",
  },
  {
    icon: "💬",
    title: "Cerita Mau Apa",
    desc: "Chat bebas — jelasin outfit, background, pose, atau vibe yang kamu mau. Tidak perlu skill teknis.",
  },
  {
    icon: "✨",
    title: "Dapatkan Prompt Siap Pakai",
    desc: "Sistem generate prompt NanoBanana yang detail dan konsisten. Copy, paste, dan hasilkan gambar AI influencer-mu.",
  },
];

const useCases = [
  { emoji: "🛍️", label: "Seller Shopee & TikTok Shop" },
  { emoji: "💼", label: "Freelancer & Solopreneur" },
  { emoji: "🍳", label: "Bisnis Kuliner & UMKM Lokal" },
  { emoji: "👗", label: "Brand Fashion & Beauty" },
];

export default function HomePage() {
  return (
    <div className="w-full">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden py-20 sm:py-32 px-4">
        {/* Ambient glow */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-violet-600/20 blur-[120px]" />
          <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] rounded-full bg-pink-600/15 blur-[100px]" />
        </div>

        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-sm font-medium mb-8">
            <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
            Powered by Google Gemini + NanoBanana
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white leading-tight mb-6">
            Buat{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400">
              AI Influencer
            </span>{" "}
            Kamu dalam Hitungan Menit
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed">
            Tidak perlu tampil di kamera. Upload foto, ceritakan visimu, dan
            dapatkan prompt NanoBanana siap pakai untuk konten brand kamu.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/app"
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-violet-600 to-pink-600 text-white font-bold text-lg hover:opacity-90 active:scale-95 transition-all shadow-xl shadow-violet-500/30"
            >
              Mulai Sekarang — Gratis ✨
            </Link>
            <a
              href="#cara-pakai"
              className="w-full sm:w-auto px-8 py-4 rounded-full border border-white/20 text-white/70 font-semibold text-lg hover:border-white/40 hover:text-white transition-all"
            >
              Lihat Cara Pakai
            </a>
          </div>

          {/* Social proof */}
          <p className="mt-8 text-sm text-white/30">
            Tidak perlu daftar · Tidak perlu kartu kredit · Langsung pakai
          </p>
        </div>
      </section>

      {/* ── Use cases ── */}
      <section className="py-8 px-4 border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-white/40 text-sm mb-6">Cocok untuk</p>
          <div className="flex flex-wrap justify-center gap-3">
            {useCases.map((u) => (
              <div
                key={u.label}
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-white/70 text-sm"
              >
                <span>{u.emoji}</span>
                <span>{u.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="cara-pakai" className="py-20 sm:py-28 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Cara Pakainya Super Mudah
            </h2>
            <p className="text-white/50 text-lg">
              Dari foto ke prompt siap pakai hanya dalam 3 langkah
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div
                key={f.title}
                className="relative p-6 rounded-2xl border border-white/10 bg-white/[0.03] hover:border-violet-500/30 hover:bg-violet-500/5 transition-all"
              >
                <div className="absolute top-4 right-4 text-white/10 font-black text-5xl leading-none select-none">
                  {i + 1}
                </div>
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="text-white font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contoh prompt output ── */}
      <section className="py-16 px-4 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-white/40 text-sm mb-3 uppercase tracking-widest">
            Contoh Output
          </p>
          <h2 className="text-2xl font-bold text-white mb-8">
            Prompt yang Dihasilkan Sistem
          </h2>
          <div className="text-left bg-black/60 border border-white/10 rounded-2xl p-6 font-mono text-sm text-green-300/80 leading-relaxed shadow-xl">
            <span className="text-white/30 select-none">
              {`// Niche: Beauty | Tone: Friendly | Brand Color: Coral`}
            </span>
            <br />
            <br />
            A 25-year-old Indonesian female influencer with warm skin tone, long
            black hair, wearing a casual modern outfit in coral and white, holding
            a skincare bottle, soft pink studio background with bokeh, confident
            smile, lifestyle photography style, high detail, 8K, professional
            lighting{" "}
            <span className="text-violet-400">--seed 42 --ar 4:5</span>
          </div>
          <p className="mt-4 text-white/30 text-sm">
            ↑ Dihasilkan otomatis dari foto + beberapa kalimat chat
          </p>
        </div>
      </section>

      {/* ── CTA Bottom ── */}
      <section className="py-24 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Siap Punya AI Influencer?
          </h2>
          <p className="text-white/50 text-lg mb-10">
            Gratis, tanpa daftar, langsung pakai sekarang.
          </p>
          <Link
            href="/app"
            className="inline-block px-10 py-5 rounded-full bg-gradient-to-r from-violet-600 to-pink-600 text-white font-bold text-xl hover:opacity-90 active:scale-95 transition-all shadow-2xl shadow-violet-500/30"
          >
            Buat AI Influencer Sekarang →
          </Link>
        </div>
      </section>
    </div>
  );
}
