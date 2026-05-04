import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="w-full border-b border-white/10 bg-black/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <span className="text-white font-bold text-sm">AI</span>
          </div>
          <span className="font-bold text-white text-lg tracking-tight">
            Influen<span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-pink-400">Sync</span>
          </span>
        </Link>

        {/* CTA */}
        <Link
          href="/app"
          className="px-4 py-2 rounded-full bg-gradient-to-r from-violet-600 to-pink-600 text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-violet-500/25"
        >
          Coba Sekarang
        </Link>
      </div>
    </nav>
  );
}
