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
    tags: [
      { label: "10 Pertanyaan", color: "#6366f1" },
      { label: "Import CSV", color: "#8b5cf6" },
      { label: "Share Link", color: "#06b6d4" },
    ],
    gradient: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    shadow: "0 8px 20px rgba(99, 102, 241, 0.3)",
    arrowColor: "#6366f1",
    icon: (
      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    href: "/ueq",
    id: "tool-ueq-card",
    title: "Kalkulator UEQ",
    desc: "User Experience Questionnaire — 26 item, 6 skala otomatis: Daya Tarik, Kejelasan, Efisiensi, Ketepatan, Stimulasi, Kebaruan.",
    tags: [
      { label: "26 Item", color: "#06b6d4" },
      { label: "6 Skala", color: "#8b5cf6" },
      { label: "Bar Chart", color: "#ec4899" },
    ],
    gradient: "linear-gradient(135deg, #06b6d4, #8b5cf6)",
    shadow: "0 8px 20px rgba(6, 182, 212, 0.3)",
    arrowColor: "#06b6d4",
    icon: (
      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
  },
  {
    href: "/uat",
    id: "tool-uat-card",
    title: "Kalkulator UAT",
    desc: "User Acceptance Testing — hitung persentase kelayakan sistem dari kuesioner Skala Likert 4 atau 5 poin.",
    tags: [
      { label: "Skala Likert", color: "#10b981" },
      { label: "% Kelayakan", color: "#06b6d4" },
      { label: "Import CSV", color: "#34d399" },
    ],
    gradient: "linear-gradient(135deg, #10b981, #06b6d4)",
    shadow: "0 8px 20px rgba(16, 185, 129, 0.3)",
    arrowColor: "#10b981",
    icon: (
      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    href: "/slovin",
    id: "tool-slovin-card",
    title: "Rumus Slovin",
    desc: "Hitung jumlah sampel minimal penelitian dari total populasi dan margin error. Instan, lengkap dengan tabel perbandingan.",
    tags: [
      { label: "Sampel", color: "#eab308" },
      { label: "Margin Error", color: "#f59e0b" },
      { label: "Real-time", color: "#fbbf24" },
    ],
    gradient: "linear-gradient(135deg, #eab308, #f59e0b)",
    shadow: "0 8px 20px rgba(234, 179, 8, 0.3)",
    arrowColor: "#eab308",
    icon: (
      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    href: "/target-ipk",
    id: "tool-target-ipk-card",
    title: "Kalkulator Target IPK",
    desc: "Simulasikan rata-rata nilai yang Anda butuhkan di sisa SKS untuk mencapai target IPK kelulusan (misal: Cumlaude).",
    tags: [
      { label: "Sisa SKS", color: "#ec4899" },
      { label: "Target Kelulusan", color: "#8b5cf6" },
      { label: "Strategi", color: "#d946ef" },
    ],
    gradient: "linear-gradient(135deg, #ec4899, #8b5cf6)",
    shadow: "0 8px 20px rgba(236, 72, 153, 0.3)",
    arrowColor: "#ec4899",
    icon: (
      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    href: "/toefl",
    id: "tool-toefl-card",
    title: "Konversi TOEFL",
    desc: "Hitung prediksi skor akhir TOEFL ITP / PBT dari jumlah jawaban yang benar. Cocok untuk syarat pendaftaran sidang skripsi.",
    tags: [
      { label: "Syarat Sidang", color: "#3b82f6" },
      { label: "ITP / PBT", color: "#0ea5e9" },
      { label: "Tabel Standar", color: "#2563eb" },
    ],
    gradient: "linear-gradient(135deg, #3b82f6, #0ea5e9)",
    shadow: "0 8px 20px rgba(59, 130, 246, 0.3)",
    arrowColor: "#3b82f6",
    icon: (
      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
      </svg>
    ),
  },
  {
    href: "/ipk",
    id: "tool-ipk-card",
    title: "Kalkulator IPK",
    desc: "Hitung IPK / IP Semester dengan input mata kuliah dinamis. Tambah dan hapus baris, pilih nilai huruf dan SKS secara fleksibel.",
    tags: [
      { label: "Input Dinamis", color: "#8b5cf6" },
      { label: "Real-time", color: "#ec4899" },
      { label: "Share Link", color: "#06b6d4" },
    ],
    gradient: "linear-gradient(135deg, #8b5cf6, #ec4899)",
    shadow: "0 8px 20px rgba(139, 92, 246, 0.3)",
    arrowColor: "#8b5cf6",
    icon: (
      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
];

/* ─── Page Component ──────────────────────────────────── */

export default function HomePage() {
  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden">
      {/* Ambient background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute top-[-5%] left-[20%] w-[500px] h-[500px] rounded-full blur-3xl animate-float"
          style={{ background: "rgba(99, 102, 241, 0.12)" }} />
        <div className="absolute top-[30%] right-[10%] w-[400px] h-[400px] rounded-full blur-3xl animate-float-2"
          style={{ background: "rgba(139, 92, 246, 0.10)" }} />
        <div className="absolute bottom-[10%] left-[5%] w-[350px] h-[350px] rounded-full blur-3xl animate-float-3"
          style={{ background: "rgba(6, 182, 212, 0.07)" }} />
      </div>

      {/* Header Ad Placeholder */}
      <div className="ad-placeholder w-full" style={{ height: "90px" }} role="complementary" aria-label="Ad Space Header">
        <span>Advertisement · 728 × 90</span>
      </div>

      {/* Main content */}
      <main className="relative z-10 flex flex-col items-center px-4 py-14 sm:py-20 flex-1">
        {/* Brand */}
        <div className="flex items-center gap-3 mb-7">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", boxShadow: "0 8px 24px rgba(99, 102, 241, 0.35)" }}>
            <span className="text-white font-black text-lg select-none">A</span>
          </div>
          <span className="text-xl font-bold tracking-tight" style={{ color: "#f1f5f9" }}>AcademicTools</span>
        </div>

        {/* Hero */}
        <h1 className="text-4xl sm:text-5xl font-extrabold text-center mb-4 leading-tight tracking-tight"
          style={{ animation: "fadeInUp 0.6s ease-out both" }}>
          <span className="gradient-text">Kalkulator Akademik</span>
          <br />
          <span style={{ color: "#f1f5f9" }}>untuk Mahasiswa</span>
        </h1>

        <p className="text-center max-w-xl text-base sm:text-lg leading-relaxed mb-12"
          style={{ color: "#64748b", animation: "fadeInUp 0.6s ease-out 0.1s both" }}>
          Hitung skor <strong style={{ color: "#818cf8" }}>SUS</strong>, <strong style={{ color: "#22d3ee" }}>UEQ</strong>, <strong style={{ color: "#34d399" }}>UAT</strong>,{" "}
          <strong style={{ color: "#facc15" }}>Sampel Slovin</strong>, dan <strong style={{ color: "#a78bfa" }}>IPK</strong> secara{" "}
          <em>real-time</em>. Gratis, tanpa login, bisa dibagikan via link.
        </p>

        {/* Tool Cards Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-4xl"
          style={{ animation: "fadeInUp 0.6s ease-out 0.2s both" }}>
          {TOOLS.map((tool) => (
            <Link
              key={tool.id}
              href={tool.href}
              id={tool.id}
              className="glass-card glass-card-hover rounded-2xl p-6 flex flex-col group"
            >
              {/* Icon */}
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                style={{ background: tool.gradient, boxShadow: tool.shadow }}>
                {tool.icon}
              </div>

              <h2 className="text-lg font-bold mb-1.5" style={{ color: "#f1f5f9" }}>{tool.title}</h2>
              <p className="text-xs leading-relaxed mb-4 flex-1" style={{ color: "#64748b" }}>{tool.desc}</p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {tool.tags.map((tag) => (
                  <span key={tag.label} className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                    style={{ background: `${tag.color}18`, color: tag.color, border: `1px solid ${tag.color}30` }}>
                    {tag.label}
                  </span>
                ))}
              </div>

              {/* Arrow */}
              <div className="flex items-center gap-1 text-xs font-semibold transition-all duration-300 group-hover:gap-2"
                style={{ color: tool.arrowColor }}>
                Buka Kalkulator
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>

        {/* Feature strip */}
        <div className="flex flex-wrap justify-center gap-5 mt-12 text-xs font-medium"
          style={{ color: "#334155", animation: "fadeInUp 0.6s ease-out 0.3s both" }}>
          {["✦ Tanpa Login", "✦ 100% Gratis", "✦ Mobile-Friendly", "✦ Data di URL", "✦ SEO Optimized"].map((f) => (
            <span key={f}>{f}</span>
          ))}
        </div>
      </main>

      {/* Footer Ad */}
      <div className="ad-placeholder w-full" style={{ height: "90px" }} role="complementary" aria-label="Ad Space Footer">
        <span>Advertisement · 728 × 90</span>
      </div>

      <footer className="relative z-10 text-center py-5 text-xs" style={{ color: "#1e293b" }}>
        © 2025 AcademicTools · Dibuat untuk mahasiswa Indonesia
      </footer>
    </div>
  );
}
