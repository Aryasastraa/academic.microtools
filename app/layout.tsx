import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "AcademicTools — Kalkulator Akademik Online untuk Mahasiswa",
    template: "%s | AcademicTools",
  },
  description:
    "Kalkulator SUS (System Usability Scale) dan IPK online gratis untuk mahasiswa. Hitung skor SUS dan nilai IPK secara real-time, tanpa login, bisa dibagikan lewat link.",
  keywords: [
    "kalkulator SUS",
    "system usability scale",
    "hitung skor SUS",
    "kalkulator IPK",
    "hitung IPK otomatis",
    "skripsi informatika",
    "alat akademik mahasiswa",
    "INSTIKI",
  ],
  authors: [{ name: "AcademicTools" }],
  openGraph: {
    title: "AcademicTools — Kalkulator SUS & IPK",
    description:
      "Hitung skor SUS dan IPK secara real-time. Gratis, tanpa login, share via link.",
    type: "website",
    locale: "id_ID",
  },
  twitter: {
    card: "summary_large_image",
    title: "AcademicTools — Kalkulator SUS & IPK",
    description:
      "Hitung skor SUS dan IPK secara real-time. Gratis, tanpa login.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${inter.variable} h-full`}>
      <body
        className="min-h-full flex flex-col antialiased"
        style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}
      >
        {children}
      </body>
    </html>
  );
}
