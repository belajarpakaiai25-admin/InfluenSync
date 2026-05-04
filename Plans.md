# InfluenSync AI — Plans.md

Dibuat: 2026-05-02

---

## Ringkasan Produk

Web app untuk UMKM Indonesia — generate AI influencer prompt (teks) siap pakai di NanoBanana Pro/2.
User upload foto diri → chat bebas jelasin mau apa → sistem generate English prompt → copy-paste ke NanoBanana.

**Stack:** Next.js (App Router) · Google Gemini API · Tailwind CSS · Tanpa login / database

---

## Phase 1: Project Setup & Fondasi

| Task | Konten | DoD | Depends | Status |
|------|--------|-----|---------|--------|
| 1.1 | Init Next.js App Router + Tailwind CSS | `npm run dev` jalan tanpa error, Tailwind class terapply | - | cc:完了 |
| 1.2 | Install & konfigurasi Google Generative AI SDK (`@google/generative-ai`) | Import SDK berhasil, env var `GEMINI_API_KEY` terbaca di API route | 1.1 | cc:完了 |
| 1.3 | Setup struktur folder: `app/`, `components/`, `lib/`, `public/` | Folder ada, tidak ada file orphan | 1.1 | cc:完了 |
| 1.4 | Buat file `.env.local` template + `.env.example` | `GEMINI_API_KEY=` terdokumentasi di `.env.example` | 1.1 | cc:完了 |

---

## Phase 2: UI — Landing & Layout

| Task | Konten | DoD | Depends | Status |
|------|--------|-----|---------|--------|
| 2.1 | Layout utama — navbar minimal + footer | Tampil di semua halaman, responsive mobile & desktop | 1.1 | cc:完了 |
| 2.2 | Hero section — value prop Bahasa Indonesia | Teks "Buat AI Influencer kamu dalam hitungan menit", CTA button ke app, tampil rapi di mobile | 2.1 | cc:完了 |
| 2.3 | Halaman utama app (`/app`) — container 2 kolom (upload kiri, chat kanan) | Layout responsif: 2 kolom di desktop, stack di mobile | 2.1 | cc:完了 |

---

## Phase 3: Upload Foto Component

| Task | Konten | DoD | Depends | Status |
|------|--------|-----|---------|--------|
| 3.1 | Komponen `PhotoUpload` — drag & drop + klik untuk upload | User bisa upload foto, preview tampil, format JPG/PNG diterima | 2.3 | cc:完了 |
| 3.2 | Validasi file — ukuran max 5MB, format gambar saja | Muncul pesan error jika file > 5MB atau bukan gambar | 3.1 | cc:完了 |
| 3.3 | Konversi foto ke base64 untuk dikirim ke Gemini API | Base64 string tersedia di state, siap dikirim | 3.1 | cc:完了 |

---

## Phase 4: Gemini API Integration

| Task | Konten | DoD | Depends | Status |
|------|--------|-----|---------|--------|
| 4.1 | API route `/api/analyze-photo` — kirim foto ke Gemini Vision, return deskripsi fisik | Response berisi deskripsi fisik dalam bahasa Inggris (skin tone, hair, facial features) | 1.2, 3.3 | cc:完了 |
| 4.2 | API route `/api/chat` — terima pesan user + konteks foto + history chat, return respons Gemini | Gemini membalas dalam Bahasa Indonesia, mengingat konteks foto & chat sebelumnya | 4.1 | cc:完了 |
| 4.3 | API route `/api/generate-prompt` — gabungkan deskripsi fisik + seluruh chat history → generate English prompt NanoBanana | Output berupa satu blok teks prompt dalam Bahasa Inggris, detail, siap pakai di NanoBanana | 4.2 | cc:完了 |
| 4.4 | System prompt engineering — instruksi Gemini agar output prompt konsisten dengan format NanoBanana | Prompt output selalu include: deskripsi fisik, outfit, background, pose, lighting, style, `--seed`, `--ar` | 4.3 | cc:完了 |

---

## Phase 5: Chat Interface Component

| Task | Konten | DoD | Depends | Status |
|------|--------|-----|---------|--------|
| 5.1 | Komponen `ChatWindow` — tampilan bubble chat (user & AI) dengan scroll otomatis | Pesan tampil sebagai bubble, scroll ke bawah otomatis saat pesan baru masuk | 2.3 | cc:完了 |
| 5.2 | Komponen `ChatInput` — text input + tombol kirim | Enter atau klik kirim → pesan terkirim, input kosong kembali, disabled saat loading | 5.1 | cc:完了 |
| 5.3 | State management chat — simpan history pesan di React state | History pesan persisten selama sesi, dikirim ke API setiap request | 5.2, 4.2 | cc:完了 |
| 5.4 | Loading state — indikator "AI sedang mengetik..." saat menunggu respons | Muncul animasi loading saat request API berlangsung, hilang saat respons tiba | 5.3 | cc:完了 |
| 5.5 | Pesan selamat datang otomatis setelah foto diupload | Setelah foto dianalisis, AI kirim pesan pembuka dalam Bahasa Indonesia: "Hei! Saya sudah lihat fotomu..." | 4.1, 5.1 | cc:完了 |

---

## Phase 6: Prompt Generator & Output

| Task | Konten | DoD | Depends | Status |
|------|--------|-----|---------|--------|
| 6.1 | Tombol "Generate Prompt" — muncul setelah minimal 1 pesan chat | Tombol visible setelah user kirim 1 pesan, disabled saat loading | 5.3 | cc:完了 |
| 6.2 | Panel output prompt — tampilkan hasil prompt dalam kotak teks tersendiri | Prompt muncul di area khusus (bukan di bubble chat), styling monospace/code-like | 4.3, 6.1 | cc:完了 |
| 6.3 | Tombol Copy — salin prompt ke clipboard | Klik → prompt tersalin ke clipboard, muncul feedback "Tersalin!" selama 2 detik | 6.2 | cc:完了 |
| 6.4 | Tombol Generate Ulang — generate variasi prompt baru dari chat yang sama | Klik → generate ulang dengan seed berbeda, output baru menggantikan yang lama | 6.2 | cc:完了 |

---

## Phase 7: Polish & UX

| Task | Konten | DoD | Depends | Status |
|------|--------|-----|---------|--------|
| 7.1 | Error handling global — tampil pesan error yang friendly jika API gagal | Semua error API ditangkap, user melihat pesan Bahasa Indonesia yang jelas, bukan error teknis | Phase 4, Phase 5 | cc:完了 |
| 7.2 | Tombol Reset / Mulai Ulang — hapus foto & chat, mulai dari awal | Klik → state dikosongkan, kembali ke state upload foto | Phase 5, Phase 6 | cc:完了 |
| 7.3 | Responsive mobile polish — pastikan flow bisa dipakai di HP | Semua interaksi (upload, chat, copy) berjalan di layar 375px | Phase 2–6 | cc:完了 |
| 7.4 | Panduan singkat in-app — tooltip atau callout cara pakai | Ada teks panduan "Cara Pakai" minimal 3 langkah, visible di halaman utama | 2.3 | cc:完了 |

---

## Backlog / Phase 2+ (Post-MVP)

| Ide | Catatan |
|-----|---------|
| Prompt Library — simpan & recall prompt favorit | Butuh localStorage atau database |
| Caption & Hashtag Generator | Tambah API route untuk generate caption IG/TikTok |
| Template prompt by niche | Beauty, Kuliner, Fashion, dll |
| Panduan NanoBanana in-app | Video/screenshot tutorial |
| Integrasi NanoBanana API langsung | Phase 3 PRD |

---

## Keputusan Arsitektur

- **Tidak ada login/auth** — semua state di React state (in-memory per sesi)
- **Tidak ada database** — tidak ada penyimpanan permanen di MVP
- **Gemini model:** `gemini-1.5-flash` — cepat, murah, support vision + chat
- **Bahasa UI:** Indonesia | **Prompt output:** English
- **Chat style:** Bebas ketik, tidak guided, multi-turn
