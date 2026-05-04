import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "InfluenSync AI — Buat AI Influencer Kamu",
  description:
    "Platform untuk UMKM Indonesia yang ingin punya AI influencer persona tanpa perlu tampil di kamera. Upload foto, chat, dan dapatkan prompt NanoBanana siap pakai.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${geist.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-[#0a0a0f] text-white antialiased">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
