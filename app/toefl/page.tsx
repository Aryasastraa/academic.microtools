import type { Metadata } from "next";
import { Suspense } from "react";
import ToeflCalculator from "./ToeflCalculator";

export const metadata: Metadata = {
  title: "Kalkulator Konversi Skor TOEFL ITP / PBT",
  description:
    "Hitung konversi skor TOEFL ITP secara otomatis dari jumlah jawaban benar. Cek apakah Anda memenuhi syarat bahasa Inggris untuk sidang skripsi.",
  keywords: [
    "kalkulator TOEFL",
    "konversi TOEFL ITP",
    "skor TOEFL skripsi",
    "hitung nilai TOEFL",
    "syarat sidang skripsi",
  ],
  openGraph: {
    title: "Kalkulator Konversi Skor TOEFL ITP",
    description: "Cek prediksi skor TOEFL ITP dari jumlah jawaban benar per section. Gratis.",
  },
};

function ToeflFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
      <div className="text-center">
        <div className="w-12 h-12 rounded-full border-[4px] border-black border-t-transparent animate-spin mx-auto mb-4" />
        <p className="font-bold text-sm">Memuat kalkulator…</p>
      </div>
    </div>
  );
}

export default function ToeflPage() {
  return (
    <Suspense fallback={<ToeflFallback />}>
      <ToeflCalculator />
    </Suspense>
  );
}
