import type { Metadata } from "next";
import { Suspense } from "react";
import UatCalculator from "./UatCalculator";

export const metadata: Metadata = {
  title: "Kalkulator UAT (User Acceptance Test) Skala Likert",
  description:
    "Hitung persentase kelayakan sistem (UAT) dari kuesioner Skala Likert 4 atau 5 poin. Import dari Google Forms, lengkap dengan visualisasi dan skala interpretasi.",
  keywords: [
    "kalkulator UAT",
    "user acceptance test",
    "hitung skala likert",
    "persentase kelayakan sistem",
    "skripsi UAT otomatis",
  ],
  openGraph: {
    title: "Kalkulator UAT & Skala Likert Online",
    description: "Hitung persentase kelayakan sistem dari kuesioner UAT dengan Skala Likert. Import dari Google Forms.",
  },
};

function UatFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
      <div className="text-center">
        <div className="w-12 h-12 rounded-full border-[4px] border-black border-t-transparent animate-spin mx-auto mb-4" />
        <p className="font-bold text-sm">Memuat kalkulator…</p>
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
