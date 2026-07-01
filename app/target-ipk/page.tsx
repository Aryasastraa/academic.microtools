import type { Metadata } from "next";
import { Suspense } from "react";
import TargetIpkCalculator from "./TargetIpkCalculator";

export const metadata: Metadata = {
  title: "Kalkulator Target IPK — Simulasi Nilai Kelulusan",
  description:
    "Hitung nilai rata-rata yang dibutuhkan di sisa semester untuk mencapai target IPK kelulusan (misalnya Cumlaude 3.50).",
  keywords: [
    "kalkulator target IPK",
    "simulasi IPK",
    "hitung IPK cumlaude",
    "target kelulusan",
  ],
  openGraph: {
    title: "Kalkulator Target IPK Online",
    description:
      "Simulasikan berapa nilai rata-rata yang Anda butuhkan di sisa SKS untuk mencapai IPK target kelulusan Anda.",
  },
};

function TargetFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#050818" }}>
      <div className="text-center">
        <div className="w-12 h-12 rounded-full border-2 animate-spin mx-auto mb-4"
          style={{ borderColor: "rgba(236,72,153,0.5)", borderTopColor: "transparent" }} />
      </div>
    </div>
  );
}

export default function TargetIpkPage() {
  return (
    <Suspense fallback={<TargetFallback />}>
      <TargetIpkCalculator />
    </Suspense>
  );
}
