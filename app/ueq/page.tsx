import type { Metadata } from "next";
import { Suspense } from "react";
import UeqCalculator from "./UeqCalculator";

export const metadata: Metadata = {
  title: "Kalkulator UEQ (User Experience Questionnaire) Online",
  description:
    "Hitung skor UEQ (User Experience Questionnaire) dari 26 pasangan kata sifat secara otomatis. Hasil 6 skala: Daya Tarik, Kejelasan, Efisiensi, Ketepatan, Stimulasi, dan Kebaruan.",
  keywords: [
    "kalkulator UEQ",
    "user experience questionnaire",
    "UEQ online",
    "evaluasi usability",
    "skor UEQ otomatis",
  ],
  openGraph: {
    title: "Kalkulator UEQ — User Experience Questionnaire Online",
    description:
      "Isi 26 item UEQ, dapatkan skor 6 skala dan visualisasi otomatis. Gratis, tanpa login.",
  },
};

function UeqFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#050818" }}>
      <div className="text-center">
        <div className="w-12 h-12 rounded-full border-2 animate-spin mx-auto mb-4"
          style={{ borderColor: "rgba(6,182,212,0.5)", borderTopColor: "transparent" }} />
        <p style={{ color: "#64748b", fontSize: "0.875rem" }}>Memuat kalkulator…</p>
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
