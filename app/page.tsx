import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "AcademicTools — Kalkulator Akademik Online untuk Mahasiswa",
  description:
    "Kalkulator SUS, UEQ, IPK, Slovin, dan UAT online gratis untuk mahasiswa. Hitung skor dan nilai secara real-time, tanpa login, bisa dibagikan lewat link.",
};

/* ─── Tool card data ──────────────────────────────────── */

const TOOLS = [
  {
    href: "/sus",
    id: "tool-sus-card",
    title: "Kalkulator SUS",
    desc: "Hitung System Usability Scale dari 10 pertanyaan kuesioner standar. Visualisasi skor + interpretasi otomatis.",
    tags: ["10 Pertanyaan", "Import CSV", "Share Link"],
    accentColor: "var(--brand-blue)",
    icon: (
      <svg className="w-7 h-7 text-black" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" 
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    href: "/ueq",
    id: "tool-ueq-card",
    title: "Kalkulator UEQ",
    desc: "User Experience Questionnaire — 26 item, 6 skala otomatis: Daya Tarik, Kejelasan, Efisiensi, Ketepatan, Stimulasi, Kebaruan.",
    tags: ["26 Item", "6 Skala", "Bar Chart"],
    accentColor: "var(--brand-mint)",
    icon: (
      <svg className="w-7 h-7 text-black" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" 
          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
  },
  {
    href: "/uat",
    id: "tool-uat-card",
    title: "Kalkulator UAT",
    desc: "User Acceptance Testing — hitung persentase kelayakan sistem dari kuesioner Skala Likert 4 atau 5 poin.",
    tags: ["Skala Likert", "% Kelayakan", "Import CSV"],
    accentColor: "var(--brand-yellow)",
    icon: (
      <svg className="w-7 h-7 text-black" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" 
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    href: "/slovin",
    id: "tool-slovin-card",
    title: "Rumus Slovin",
    desc: "Hitung jumlah sampel minimal penelitian dari total populasi dan margin error. Instan, lengkap dengan tabel perbandingan.",
    tags: ["Sampel", "Margin Error", "Real-time"],
    accentColor: "var(--brand-orange)",
    icon: (
      <svg className="w-7 h-7 text-black" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" 
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    href: "/target-ipk",
    id: "tool-target-ipk-card",
    title: "Kalkulator Target IPK",
    desc: "Simulasikan rata-rata nilai yang Anda butuhkan di sisa SKS untuk mencapai target IPK kelulusan (misal: Cumlaude).",
    tags: ["Sisa SKS", "Target Kelulusan", "Strategi"],
    accentColor: "var(--brand-pink)",
    icon: (
      <svg className="w-7 h-7 text-black" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" 
          d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    href: "/toefl",
    id: "tool-toefl-card",
    title: "Konversi TOEFL",
    desc: "Hitung prediksi skor akhir TOEFL ITP / PBT dari jumlah jawaban yang benar. Cocok untuk syarat pendaftaran sidang skripsi.",
    tags: ["Syarat Sidang", "ITP / PBT", "Tabel Standar"],
    accentColor: "var(--brand-emerald)",
    icon: (
      <svg className="w-7 h-7 text-black" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" 
          d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
      </svg>
    ),
  },
  {
    href: "/ipk",
    id: "tool-ipk-card",
    title: "Kalkulator IPK",
    desc: "Hitung IPK / IP Semester dengan input mata kuliah dinamis. Tambah dan hapus baris, pilih nilai huruf dan SKS secara fleksibel.",
    tags: ["Input Dinamis", "Real-time", "Share Link"],
    accentColor: "var(--brand-lilac)",
    icon: (
      <svg className="w-7 h-7 text-black" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" 
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477-4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
];

/* ─── Page Component ──────────────────────────────────── */

export default function HomePage() {
  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden">
      {/* Header Ad Placeholder */}
      <div className="p-4 flex justify-center mt-2">
      </div>

      {/* Main content */}
      <main className="relative z-10 flex flex-col items-center px-4 py-10 sm:py-16 flex-1">
        {/* Brand */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-12 h-12 flex items-center justify-center border-[3px] border-black rounded-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] bg-white transform -rotate-3 hover:rotate-0 transition-transform cursor-pointer">
            <span className="text-black font-black text-xl select-none">A</span>
          </div>
          <span className="text-2xl font-black tracking-tight uppercase" style={{ WebkitTextStroke: "1px black" }}>
            Academic<span className="text-transparent bg-clip-text bg-gradient-to-r from-black to-black" style={{WebkitTextStroke: "0"}}>Tools</span>
          </span>
        </div>

        {/* Hero */}
        <div className="brutal-card p-8 sm:p-12 max-w-3xl w-full text-center mb-16 bg-white transform -rotate-1 relative" style={{ animation: "fadeInUp 0.6s ease-out both" }}>
          {/* Decorative shapes */}
          <div className="absolute -top-4 -left-4 w-8 h-8 rounded-full border-[3px] border-black bg-[var(--brand-pink)]"></div>
          <div className="absolute -bottom-4 -right-4 w-12 h-12 border-[3px] border-black bg-[var(--brand-mint)] transform rotate-12"></div>
          
          <h1 className="text-4xl sm:text-6xl font-black mb-6 leading-tight tracking-tight uppercase">
            Kalkulator Akademik<br />
            <span className="bg-[var(--brand-yellow)] px-2 inline-block transform rotate-1 border-2 border-black mt-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              Untuk Mahasiswa
            </span>
          </h1>

          <p className="max-w-xl mx-auto text-base sm:text-lg font-bold leading-relaxed">
            Hitung skor SUS, UEQ, UAT, Sampel Slovin, dan IPK secara real-time. 
            Gratis, tanpa login, bisa dibagikan via link.
          </p>
        </div>

        {/* Tool Cards Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl" style={{ animation: "fadeInUp 0.6s ease-out 0.2s both" }}>
          {TOOLS.map((tool, idx) => (
            <Link
              key={tool.id}
              href={tool.href}
              id={tool.id}
              className="brutal-card brutal-card-hover p-6 flex flex-col group relative overflow-hidden"
              style={{ 
                background: "white", 
                borderTop: `8px solid ${tool.accentColor}`
              }}
            >
              {/* Icon Container */}
              <div 
                className="w-14 h-14 border-[3px] border-black rounded-lg flex items-center justify-center mb-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                style={{ background: tool.accentColor }}
              >
                {tool.icon}
              </div>

              <h2 className="text-xl font-black mb-2 uppercase">{tool.title}</h2>
              <p className="text-sm font-semibold leading-relaxed mb-6 flex-1 text-slate-700">{tool.desc}</p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {tool.tags.map((tag) => (
                  <span key={tag} className="brutal-badge bg-white">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Action Button */}
              <div className="w-full text-center border-2 border-black rounded-md py-2 font-black uppercase text-sm group-hover:bg-black group-hover:text-white transition-colors">
                Buka Kalkulator
              </div>
            </Link>
          ))}
        </div>

        {/* Feature strip */}
        <div className="flex flex-wrap justify-center gap-4 sm:gap-8 mt-16" style={{ animation: "fadeInUp 0.6s ease-out 0.3s both" }}>
          {["Tanpa Login", "100% Gratis", "Mobile-Friendly", "Data di URL", "SEO Optimized"].map((f, i) => (
            <div key={f} className="flex items-center gap-2">
              <div className="w-3 h-3 bg-black transform rotate-45"></div>
              <span className="font-black uppercase text-sm">{f}</span>
            </div>
          ))}
        </div>
      </main>

      {/* Footer Ad */}
      <div className="p-4 flex justify-center">
      </div>

      <footer className="relative z-10 text-center py-8 font-bold text-sm border-t-[3px] border-black mt-8 bg-white">
        © 2025 AcademicTools · Dibuat untuk mahasiswa Indonesia
      </footer>
    </div>
  );
}
