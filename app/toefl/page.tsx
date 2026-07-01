import type { Metadata } from "next";
import { Suspense } from "react";
import ToeflCalculator from "./ToeflCalculator";

export const metadata: Metadata = {
  title: "Kalkulator Konversi Skor TOEFL ITP / PBT",
  description:
    "Konversi jumlah jawaban benar Listening, Structure, dan Reading menjadi skor akhir TOEFL ITP / PBT. Sering digunakan sebagai syarat sidang skripsi.",
  keywords: [
    "kalkulator toefl",
    "konversi skor toefl",
    "hitung skor toefl",
    "toefl itp pbt",
    "syarat sidang skripsi",
  ],
  openGraph: {
    title: "Kalkulator Konversi Skor TOEFL ITP / PBT Online",
    description:
      "Hitung prediksi skor TOEFL Anda berdasarkan jumlah jawaban yang benar. Gratis, instan, tanpa login.",
  },
};

function ToeflFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#050818" }}>
      <div className="text-center">
        <div className="w-12 h-12 rounded-full border-2 animate-spin mx-auto mb-4"
          style={{ borderColor: "rgba(59,130,246,0.5)", borderTopColor: "transparent" }} />
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
