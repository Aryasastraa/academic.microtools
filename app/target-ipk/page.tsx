import type { Metadata } from "next";
import { Suspense } from "react";
import TargetIpkCalculator from "./TargetIpkCalculator";

export const metadata: Metadata = {
  title: "Kalkulator Target IPK Kelulusan",
  description:
    "Simulasikan rata-rata nilai yang Anda butuhkan di sisa SKS untuk mencapai target IPK kelulusan (misal: Cumlaude).",
  keywords: [
    "kalkulator target IPK",
    "simulasi IPK kelulusan",
    "hitung sisa SKS",
    "target cumlaude",
    "perencanaan akademik",
  ],
  openGraph: {
    title: "Kalkulator Target IPK Kelulusan",
    description: "Simulasikan nilai rata-rata yang Anda butuhkan untuk mencapai target IPK kelulusan.",
  },
};

function TargetIpkFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
      <div className="text-center">
        <div className="w-12 h-12 rounded-full border-[4px] border-black border-t-transparent animate-spin mx-auto mb-4" />
        <p className="font-bold text-sm">Memuat kalkulator…</p>
      </div>
    </div>
  );
}

export default function TargetIpkPage() {
  return (
    <Suspense fallback={<TargetIpkFallback />}>
      <TargetIpkCalculator />
    </Suspense>
  );
}
