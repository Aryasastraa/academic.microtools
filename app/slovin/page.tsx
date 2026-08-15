import type { Metadata } from "next";
import { Suspense } from "react";
import SlovinCalculator from "./SlovinCalculator";

export const metadata: Metadata = {
  title: "Kalkulator Rumus Slovin — Hitung Sampel Minimal",
  description:
    "Hitung jumlah sampel minimal penelitian secara instan dengan Rumus Slovin. Masukkan total populasi dan margin error. Dilengkapi tabel perbandingan.",
  keywords: [
    "rumus slovin",
    "kalkulator slovin",
    "hitung sampel slovin",
    "ukuran sampel penelitian",
    "margin error skripsi",
  ],
  openGraph: {
    title: "Kalkulator Rumus Slovin Online",
    description: "Hitung jumlah sampel minimal penelitian secara instan. Gratis, cepat, dan akurat.",
  },
};

function SlovinFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
      <div className="text-center">
        <div className="w-12 h-12 rounded-full border-[4px] border-black border-t-transparent animate-spin mx-auto mb-4" />
        <p className="font-bold text-sm">Memuat kalkulator…</p>
      </div>
    </div>
  );
}

export default function SlovinPage() {
  return (
    <Suspense fallback={<SlovinFallback />}>
      <SlovinCalculator />
    </Suspense>
  );
}
