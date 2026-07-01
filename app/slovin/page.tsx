import type { Metadata } from "next";
import { Suspense } from "react";
import SlovinCalculator from "./SlovinCalculator";

export const metadata: Metadata = {
  title: "Kalkulator Rumus Slovin — Hitung Sampel Penelitian",
  description:
    "Hitung jumlah sampel minimal penelitian dengan Rumus Slovin secara otomatis. Masukkan jumlah populasi dan margin error, dapatkan hasil instan.",
  keywords: [
    "rumus slovin",
    "kalkulator slovin",
    "hitung sampel penelitian",
    "jumlah sampel minimal",
    "slovin formula calculator",
  ],
  openGraph: {
    title: "Kalkulator Rumus Slovin Online",
    description:
      "Hitung jumlah sampel minimal penelitian dengan Rumus Slovin. Gratis, instan, tanpa login.",
  },
};

function SlovinFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#050818" }}>
      <div className="text-center">
        <div className="w-12 h-12 rounded-full border-2 animate-spin mx-auto mb-4"
          style={{ borderColor: "rgba(234,179,8,0.5)", borderTopColor: "transparent" }} />
        <p style={{ color: "#64748b", fontSize: "0.875rem" }}>Memuat kalkulator…</p>
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
