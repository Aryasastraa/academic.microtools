import type { Metadata } from "next";
import { Suspense } from "react";
import IpkCalculator from "./ipk-calculator";

export const metadata: Metadata = {
  title: "Kalkulator IPK / IP Semester Otomatis",
  description:
    "Hitung IPK dan IP Semester secara otomatis dengan input mata kuliah dinamis. Masukkan nama MK, nilai huruf, dan SKS — IPK dihitung real-time. Bagikan via link.",
  keywords: [
    "kalkulator IPK",
    "hitung IPK otomatis",
    "kalkulator IP semester",
    "nilai huruf IPK",
    "kalkulator GPA Indonesia",
  ],
  openGraph: {
    title: "Kalkulator IPK / IP Semester Online",
    description:
      "Hitung IPK real-time dengan input mata kuliah dinamis. Gratis, tanpa login.",
  },
};

function IpkFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
      <div className="text-center">
        <div
          className="w-12 h-12 rounded-full border-[4px] border-black border-t-transparent animate-spin mx-auto mb-4"
        />
        <p className="font-bold text-sm">Memuat kalkulator…</p>
      </div>
    </div>
  );
}

export default function IpkPage() {
  return (
    <Suspense fallback={<IpkFallback />}>
      <IpkCalculator />
    </Suspense>
  );
}
