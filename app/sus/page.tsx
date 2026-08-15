import type { Metadata } from "next";
import { Suspense } from "react";
import SusCalculator from "./sus-calculator";

export const metadata: Metadata = {
  title: "Kalkulator SUS (System Usability Scale) Otomatis",
  description:
    "Hitung skor SUS (System Usability Scale) dari 10 pertanyaan kuesioner secara otomatis. Dapatkan interpretasi dan visualisasi grafik langsung untuk skripsi Anda.",
  keywords: [
    "kalkulator SUS",
    "hitung SUS otomatis",
    "system usability scale online",
    "skor SUS kuesioner",
    "evaluasi usability skripsi",
  ],
  openGraph: {
    title: "Kalkulator SUS — System Usability Scale Online",
    description:
      "Isi 10 pertanyaan kuesioner SUS, dapatkan skor dan interpretasi otomatis. Share hasil via link.",
  },
};

function SusCalculatorFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
      <div className="text-center">
        <div className="w-12 h-12 rounded-full border-[4px] border-black border-t-transparent animate-spin mx-auto mb-4" />
        <p className="font-bold text-sm">Memuat kalkulator…</p>
      </div>
    </div>
  );
}

export default function SusPage() {
  return (
    <Suspense fallback={<SusCalculatorFallback />}>
      <SusCalculator />
    </Suspense>
  );
}
