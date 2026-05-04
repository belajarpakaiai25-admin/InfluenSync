export default function Footer() {
  return (
    <footer className="w-full border-t border-white/10 bg-black/80 py-6 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-white/40">
        <p>
          &copy; {new Date().getFullYear()}{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-pink-400 font-semibold">
            InfluenSync AI
          </span>{" "}
          — Powered by NanoBanana Pro
        </p>
        <p className="text-xs">
          Output AI — bukan representasi orang nyata
        </p>
      </div>
    </footer>
  );
}
