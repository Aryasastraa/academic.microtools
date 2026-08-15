import type { Metadata } from "next";
import { Suspense } from "react";
import UeqCalculator from "./UeqCalculator";

export const metadata: Metadata = {
  title: "Kalkulator UEQ (User Experience Questionnaire)",
  description:
    "Hitung skala User Experience Questionnaire (UEQ) 26 item otomatis. Import CSV langsung, dan dapatkan grafik serta interpretasi benchmark.",
  keywords: [
    "kalkulator UEQ",
    "user experience questionnaire",
    "hitung UEQ otomatis",
    "skripsi UEQ online",
    "evaluasi UX sistem",
  ],
  openGraph: {
    title: "Kalkulator UEQ (User Experience Questionnaire) Online",
    description: "Hitung skor UEQ dari 26 item kuesioner. Lengkap dengan grafik dan benchmark.",
  },
};

function UeqFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
      <div className="text-center">
        <div className="w-12 h-12 rounded-full border-[4px] border-black border-t-transparent animate-spin mx-auto mb-4" />
        <p className="font-bold text-sm">Memuat kalkulator…</p>
      </div>
    </div>
  );
}

export default function UeqPage() {
  return (
    <Suspense fallback={<UeqFallback />}>
      <UeqCalculator />
    </Suspense>
  );
}
