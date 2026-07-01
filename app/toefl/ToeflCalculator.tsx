"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

// ─────────────────────────────────────────────────────────────────────────────
//  TOEFL ITP / PBT Conversion Tables (0 to Max Questions)
// ─────────────────────────────────────────────────────────────────────────────

// Section 1: Listening Comprehension (50 questions)
// Index = number of correct answers, Value = scaled score
const LISTENING_TABLE = [
  24, 25, 26, 27, 28, 29, 30, 31, 32, 32, 33, // 0-10
  35, 37, 37, 38, 41, 41, 42, 43, 44, 45, // 11-20
  45, 46, 47, 47, 48, 48, 49, 49, 50, 51, // 21-30
  51, 52, 52, 53, 54, 54, 55, 56, 57, 57, // 31-40
  58, 59, 60, 61, 62, 63, 65, 66, 67, 68  // 41-50
];

// Section 2: Structure and Written Expression (40 questions)
// Index = number of correct answers, Value = scaled score
const STRUCTURE_TABLE = [
  20, 20, 21, 22, 23, 25, 26, 27, 29, 31, 33, // 0-10
  35, 36, 37, 38, 40, 40, 41, 42, 43, 44, // 11-20
  45, 46, 47, 48, 49, 50, 51, 52, 53, 54, // 21-30
  55, 56, 57, 58, 60, 61, 63, 65, 67, 68  // 31-40
];

// Section 3: Reading Comprehension (50 questions)
// Index = number of correct answers, Value = scaled score
const READING_TABLE = [
  21, 22, 23, 23, 24, 25, 26, 27, 28, 28, 29, // 0-10
  30, 31, 32, 34, 35, 36, 37, 38, 39, 40, // 11-20
  41, 42, 43, 43, 44, 45, 46, 46, 47, 48, // 21-30
  48, 49, 50, 51, 52, 52, 53, 54, 54, 55, // 31-40
  56, 57, 58, 59, 60, 61, 63, 65, 66, 67  // 41-50
];

export default function ToeflCalculator() {
  const [listening, setListening] = useState<string>("");
  const [structure, setStructure] = useState<string>("");
  const [reading, setReading] = useState<string>("");

  const result = useMemo(() => {
    const lRaw = parseInt(listening);
    const sRaw = parseInt(structure);
    const rRaw = parseInt(reading);

    if (isNaN(lRaw) || isNaN(sRaw) || isNaN(rRaw)) return null;
    
    // Bounds check
    const lValid = Math.max(0, Math.min(50, lRaw));
    const sValid = Math.max(0, Math.min(40, sRaw));
    const rValid = Math.max(0, Math.min(50, rRaw));

    const lScaled = LISTENING_TABLE[lValid];
    const sScaled = STRUCTURE_TABLE[sValid];
    const rScaled = READING_TABLE[rValid];

    // Formula: ((L + S + R) * 10) / 3
    const totalScore = Math.round(((lScaled + sScaled + rScaled) * 10) / 3);

    return {
      lRaw: lValid, sRaw: sValid, rRaw: rValid,
      lScaled, sScaled, rScaled,
      totalScore
    };
  }, [listening, structure, reading]);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#050818" }}>
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl animate-float"
          style={{ background: "rgba(59,130,246,0.07)" }} />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full blur-3xl animate-float-2"
          style={{ background: "rgba(14,165,233,0.06)" }} />
      </div>

      {/* Header Ad */}
      <div className="ad-placeholder w-full" style={{ height: "90px" }} role="complementary">
        <span>Advertisement · 728 × 90</span>
      </div>

      <nav className="relative z-10 flex items-center justify-between px-5 py-4 max-w-4xl mx-auto w-full">
        <Link href="/" className="flex items-center gap-2 text-sm transition-colors" style={{ color: "#64748b" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#f1f5f9")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#64748b")}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          AcademicTools
        </Link>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #3b82f6, #0ea5e9)" }}>
          <span className="text-white text-xs font-black select-none">A</span>
        </div>
      </nav>

      <main className="relative z-10 max-w-4xl mx-auto w-full px-4 pb-20 flex-1">
        <header className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-4"
            style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.22)", color: "#60a5fa" }}>
            Syarat Sidang Skripsi · Konversi ITP / PBT
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-3 tracking-tight" style={{ color: "#f1f5f9" }}>
            Kalkulator Konversi <span style={{ background: "linear-gradient(135deg, #3b82f6, #0ea5e9)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>TOEFL</span>
          </h1>
          <p className="max-w-lg mx-auto text-sm sm:text-base leading-relaxed" style={{ color: "#64748b" }}>
            Masukkan jumlah jawaban yang benar dari masing-masing section untuk mengetahui prediksi skor TOEFL Anda.
          </p>
        </header>

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Left: Inputs */}
          <div className="flex-1 min-w-0 space-y-4">
            {/* Listening */}
            <div className="glass-card rounded-2xl p-6" style={{ borderColor: result && result.lRaw > 50 ? "rgba(239,68,68,0.5)" : undefined }}>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{ background: "rgba(59,130,246,0.15)", color: "#60a5fa" }}>1</div>
                <div>
                  <h2 className="text-sm font-bold" style={{ color: "#e2e8f0" }}>Listening Comprehension</h2>
                  <p className="text-xs" style={{ color: "#64748b" }}>Total 50 Pertanyaan</p>
                </div>
              </div>
              <label className="block text-xs font-semibold mt-4 mb-2" style={{ color: "#94a3b8" }}>Jumlah Jawaban Benar</label>
              <input type="number" min={0} max={50} placeholder="Cth: 35" value={listening}
                onChange={(e) => setListening(e.target.value)}
                className="number-input w-full py-3" style={{ fontSize: "1.125rem" }} />
            </div>

            {/* Structure */}
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{ background: "rgba(16,185,129,0.15)", color: "#34d399" }}>2</div>
                <div>
                  <h2 className="text-sm font-bold" style={{ color: "#e2e8f0" }}>Structure &amp; Written Expression</h2>
                  <p className="text-xs" style={{ color: "#64748b" }}>Total 40 Pertanyaan</p>
                </div>
              </div>
              <label className="block text-xs font-semibold mt-4 mb-2" style={{ color: "#94a3b8" }}>Jumlah Jawaban Benar</label>
              <input type="number" min={0} max={40} placeholder="Cth: 28" value={structure}
                onChange={(e) => setStructure(e.target.value)}
                className="number-input w-full py-3" style={{ fontSize: "1.125rem" }} />
            </div>

            {/* Reading */}
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{ background: "rgba(245,158,11,0.15)", color: "#fbbf24" }}>3</div>
                <div>
                  <h2 className="text-sm font-bold" style={{ color: "#e2e8f0" }}>Reading Comprehension</h2>
                  <p className="text-xs" style={{ color: "#64748b" }}>Total 50 Pertanyaan</p>
                </div>
              </div>
              <label className="block text-xs font-semibold mt-4 mb-2" style={{ color: "#94a3b8" }}>Jumlah Jawaban Benar</label>
              <input type="number" min={0} max={50} placeholder="Cth: 42" value={reading}
                onChange={(e) => setReading(e.target.value)}
                className="number-input w-full py-3" style={{ fontSize: "1.125rem" }} />
            </div>
          </div>

          {/* Right: Results */}
          <aside className="w-full lg:w-80 flex-shrink-0 lg:sticky lg:top-4 space-y-4">
            <div className="glass-card rounded-2xl p-6">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-center mb-5" style={{ color: "#475569" }}>
                Prediksi Skor Akhir
              </h2>

              {!result ? (
                <div className="text-center py-8">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center animate-pulseRing"
                    style={{ background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)" }}>
                    <span className="font-black text-2xl" style={{ color: "rgba(59,130,246,0.4)" }}>A+</span>
                  </div>
                  <p className="text-xs" style={{ color: "#334155" }}>
                    Isi jawaban benar dari ketiga sesi<br />untuk melihat hasil konversi
                  </p>
                </div>
              ) : (
                <>
                  <div className="text-center mb-6">
                    <div className="text-6xl font-black mt-3 mb-1" style={{ color: result.totalScore >= 500 ? "#3b82f6" : "#f59e0b" }}>
                      {result.totalScore}
                    </div>
                    {result.totalScore >= 450 ? (
                      <span className="inline-block mt-2 px-3 py-1 rounded-full text-[10px] font-bold" style={{ background: "rgba(16,185,129,0.15)", color: "#34d399", border: "1px solid rgba(16,185,129,0.3)" }}>✓ Umumnya Memenuhi Syarat Sidang</span>
                    ) : (
                      <span className="inline-block mt-2 px-3 py-1 rounded-full text-[10px] font-bold" style={{ background: "rgba(239,68,68,0.15)", color: "#f87171", border: "1px solid rgba(239,68,68,0.3)" }}>⚠ Di Bawah Syarat Standar (450)</span>
                    )}
                  </div>

                  <div className="space-y-2 mt-4 pt-4" style={{ borderTop: "1px solid rgba(59,130,246,0.1)" }}>
                    <div className="flex justify-between items-center p-2.5 rounded-xl" style={{ background: "rgba(59,130,246,0.05)" }}>
                      <span className="text-xs text-blue-400">Section 1 (Scaled)</span>
                      <span className="font-bold text-sm text-blue-300">{result.lScaled}</span>
                    </div>
                    <div className="flex justify-between items-center p-2.5 rounded-xl" style={{ background: "rgba(16,185,129,0.05)" }}>
                      <span className="text-xs text-emerald-400">Section 2 (Scaled)</span>
                      <span className="font-bold text-sm text-emerald-300">{result.sScaled}</span>
                    </div>
                    <div className="flex justify-between items-center p-2.5 rounded-xl" style={{ background: "rgba(245,158,11,0.05)" }}>
                      <span className="text-xs text-amber-400">Section 3 (Scaled)</span>
                      <span className="font-bold text-sm text-amber-300">{result.rScaled}</span>
                    </div>
                  </div>

                  <div className="mt-4 p-3 rounded-xl text-xs leading-relaxed" style={{ background: "rgba(148,163,184,0.05)", border: "1px solid rgba(148,163,184,0.1)", color: "#94a3b8" }}>
                    Skor akhir dihitung dari penjumlahan nilai konversi (scaled score) dikali 10, lalu dibagi 3.
                  </div>
                </>
              )}
            </div>
            
            <div className="ad-placeholder rounded-2xl" style={{ height: "120px" }} role="complementary">
              <span>Advertisement · 300 × 250</span>
            </div>
          </aside>
        </div>
      </main>

      <footer className="relative z-10 text-center py-4 text-xs" style={{ color: "#1e293b" }}>
        © 2025 AcademicTools
      </footer>
    </div>
  );
}
