"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

export default function TargetIpkCalculator() {
  const [currentSks, setCurrentSks] = useState<string>("");
  const [currentIpk, setCurrentIpk] = useState<string>("");
  const [targetSks, setTargetSks] = useState<string>("144"); // Default SKS kelulusan S1
  const [targetIpk, setTargetIpk] = useState<string>("3.50"); // Default target Cumlaude

  const result = useMemo(() => {
    const sCur = parseFloat(currentSks);
    const iCur = parseFloat(currentIpk);
    const sTot = parseFloat(targetSks);
    const iTgt = parseFloat(targetIpk);

    if (isNaN(sCur) || isNaN(iCur) || isNaN(sTot) || isNaN(iTgt)) return null;
    if (sCur >= sTot) return { error: "SKS yang sudah diambil tidak boleh lebih besar atau sama dengan Target Total SKS." };
    if (iCur < 0 || iCur > 4 || iTgt < 0 || iTgt > 4) return { error: "IPK harus berada di rentang 0.00 hingga 4.00." };

    const ptsCurrent = sCur * iCur;
    const ptsTarget = sTot * iTgt;
    const ptsNeeded = ptsTarget - ptsCurrent;
    const sRem = sTot - sCur;
    
    const iReq = ptsNeeded / sRem;

    return { sRem, iReq, ptsNeeded };
  }, [currentSks, currentIpk, targetSks, targetIpk]);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#050818" }}>
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full blur-3xl animate-float"
          style={{ background: "rgba(236,72,153,0.07)" }} />
        <div className="absolute bottom-1/3 left-1/4 w-80 h-80 rounded-full blur-3xl animate-float-2"
          style={{ background: "rgba(139,92,246,0.06)" }} />
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
          style={{ background: "linear-gradient(135deg, #ec4899, #8b5cf6)" }}>
          <span className="text-white text-xs font-black select-none">A</span>
        </div>
      </nav>

      <main className="relative z-10 max-w-4xl mx-auto w-full px-4 pb-20 flex-1">
        <header className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-4"
            style={{ background: "rgba(236,72,153,0.1)", border: "1px solid rgba(236,72,153,0.22)", color: "#f472b6" }}>
            Perencanaan Akademik Kelulusan
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-3 tracking-tight" style={{ color: "#f1f5f9" }}>
            Kalkulator <span style={{ background: "linear-gradient(135deg, #ec4899, #8b5cf6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Target IPK</span>
          </h1>
          <p className="max-w-lg mx-auto text-sm sm:text-base leading-relaxed" style={{ color: "#64748b" }}>
            Simulasikan nilai rata-rata yang Anda butuhkan di sisa semester untuk mengejar target kelulusan impian.
          </p>
        </header>

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Left: Inputs */}
          <div className="flex-1 min-w-0 space-y-4">
            <div className="glass-card rounded-2xl p-6">
              <h2 className="text-sm font-bold mb-4" style={{ color: "#e2e8f0" }}>Data Akademik Saat Ini</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "#94a3b8" }}>Total SKS Diambil</label>
                  <input type="number" min={1} placeholder="Cth: 100" value={currentSks}
                    onChange={(e) => setCurrentSks(e.target.value)}
                    className="number-input w-full py-3" style={{ fontSize: "1.125rem" }} />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "#94a3b8" }}>IPK Saat Ini</label>
                  <input type="number" min={0} max={4} step={0.01} placeholder="Cth: 3.25" value={currentIpk}
                    onChange={(e) => setCurrentIpk(e.target.value)}
                    className="number-input w-full py-3" style={{ fontSize: "1.125rem" }} />
                </div>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6" style={{ borderColor: "rgba(236,72,153,0.3)" }}>
              <h2 className="text-sm font-bold mb-4" style={{ color: "#f472b6" }}>Target Kelulusan</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "#94a3b8" }}>Total SKS Kelulusan (S1 = 144)</label>
                  <input type="number" min={1} value={targetSks}
                    onChange={(e) => setTargetSks(e.target.value)}
                    className="number-input w-full py-3" style={{ fontSize: "1.125rem" }} />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "#94a3b8" }}>Target IPK Lulus</label>
                  <input type="number" min={0} max={4} step={0.01} value={targetIpk}
                    onChange={(e) => setTargetIpk(e.target.value)}
                    className="number-input w-full py-3 text-pink-400 font-bold" style={{ fontSize: "1.125rem" }} />
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                {[3.00, 3.50, 3.75, 4.00].map(val => (
                  <button key={val} onClick={() => setTargetIpk(val.toFixed(2))}
                    className="text-[10px] px-3 py-1.5 rounded-full font-bold transition-colors"
                    style={{ background: "rgba(236,72,153,0.1)", color: "#f472b6", border: "1px solid rgba(236,72,153,0.25)" }}>
                    Target {val.toFixed(2)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Results */}
          <aside className="w-full lg:w-80 flex-shrink-0 lg:sticky lg:top-4 space-y-4">
            <div className="glass-card rounded-2xl p-6">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-center mb-5" style={{ color: "#475569" }}>
                Hasil Simulasi
              </h2>

              {!result ? (
                <div className="text-center py-8">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center animate-pulseRing"
                    style={{ background: "rgba(236,72,153,0.08)", border: "1px solid rgba(236,72,153,0.2)" }}>
                    <span className="font-black text-2xl" style={{ color: "rgba(236,72,153,0.4)" }}>🎯</span>
                  </div>
                  <p className="text-xs" style={{ color: "#334155" }}>
                    Lengkapi SKS dan IPK saat ini<br />untuk melihat hasil simulasi
                  </p>
                </div>
              ) : "error" in result ? (
                <div className="text-center py-6 px-2">
                  <span className="text-3xl mb-3 block">⚠️</span>
                  <p className="text-xs leading-relaxed" style={{ color: "#ef4444" }}>{result.error}</p>
                </div>
              ) : (
                <>
                  <div className="text-center mb-6">
                    <div className="text-sm font-semibold mb-1" style={{ color: "#94a3b8" }}>Sisa SKS Anda: <span style={{ color: "#f1f5f9" }}>{result.sRem} SKS</span></div>
                    <div className="text-xs" style={{ color: "#64748b" }}>Rata-rata IP / Nilai yang dibutuhkan di sisa SKS:</div>
                    
                    <div className="text-6xl font-black mt-3 mb-1" style={{ color: result.iReq > 4 ? "#ef4444" : "#f472b6" }}>
                      {result.iReq.toFixed(2)}
                    </div>
                  </div>

                  {result.iReq > 4 ? (
                    <div className="mt-4 p-4 rounded-xl" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)" }}>
                      <div className="font-bold text-sm text-red-500 mb-1">Misi Mustahil ❌</div>
                      <p className="text-xs leading-relaxed text-red-400">
                        Maaf, meskipun Anda mendapat nilai A (4.00) di semua sisa {result.sRem} SKS, Anda tidak akan bisa mencapai target IPK {targetIpk}. Pertimbangkan untuk menurunkan target.
                      </p>
                    </div>
                  ) : result.iReq <= 0 ? (
                    <div className="mt-4 p-4 rounded-xl" style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)" }}>
                      <div className="font-bold text-sm text-emerald-500 mb-1">Target Sudah Tercapai! 🎉</div>
                      <p className="text-xs leading-relaxed text-emerald-400">
                        Anda bahkan tidak perlu mengambil kelas lagi untuk mempertahankan target ini.
                      </p>
                    </div>
                  ) : (
                    <div className="mt-4 p-4 rounded-xl" style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.3)" }}>
                      <div className="font-bold text-sm mb-1" style={{ color: "#a78bfa" }}>Strategi Kelulusan 🚀</div>
                      <p className="text-xs leading-relaxed" style={{ color: "#c4b5fd" }}>
                        Untuk mencapai target IPK <strong className="text-white">{targetIpk}</strong>, Anda wajib mendapat rata-rata Indeks Prestasi Minimal <strong className="text-white">{result.iReq.toFixed(2)}</strong> di sisa <strong className="text-white">{result.sRem} SKS</strong>. 
                        {result.iReq >= 3.5 ? " Usahakan mendapat mayoritas nilai A!" : result.iReq >= 3.0 ? " Mayoritas nilai B sudah cukup, tapi A lebih aman." : ""}
                      </p>
                    </div>
                  )}
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
