import type { Metadata } from "next";
import { Suspense } from "react";
import UatCalculator from "./UatCalculator";

export const metadata: Metadata = {
  title: "Kalkulator UAT / Skala Likert — Persentase Kelayakan Sistem",
  description:
    "Hitung persentase kelayakan sistem (User Acceptance Testing) dari kuesioner Skala Likert. Input dinamis, visualisasi otomatis, share via link.",
  keywords: [
    "kalkulator UAT",
    "user acceptance testing",
    "skala likert",
    "persentase kelayakan sistem",
    "kalkulator likert",
  ],
  openGraph: {
    title: "Kalkulator UAT / Skala Likert Online",
    description:
      "Hitung persentase kelayakan sistem dari kuesioner UAT. Real-time, gratis, tanpa login.",
  },
};

function UatFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#050818" }}>
      <div className="text-center">
        <div className="w-12 h-12 rounded-full border-2 animate-spin mx-auto mb-4"
          style={{ borderColor: "rgba(16,185,129,0.5)", borderTopColor: "transparent" }} />
        <p style={{ color: "#64748b", fontSize: "0.875rem" }}>Memuat kalkulator…</p>
      </div>
    </div>
  );
}

export default function UatPage() {
  return (
    <Suspense fallback={<UatFallback />}>
      <UatCalculator />
    </Suspense>
  );
}
