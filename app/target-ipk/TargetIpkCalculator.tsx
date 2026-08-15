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
    <div className="min-h-screen flex flex-col">
      {/* Header Ad */}
      <div className="p-4 flex justify-center mt-2">
      </div>

      <nav className="relative z-10 flex items-center justify-between px-5 py-4 max-w-4xl mx-auto w-full">
        <Link href="/" className="flex items-center gap-2 font-black uppercase text-sm border-2 border-transparent hover:border-black hover:bg-black hover:text-white px-3 py-1 rounded transition-all">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Kembali
        </Link>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center border-[3px] border-black bg-[var(--brand-pink)] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transform rotate-3">
          <span className="text-black text-sm font-black select-none">A</span>
        </div>
      </nav>

      <main className="relative z-10 max-w-4xl mx-auto w-full px-4 pb-20 flex-1">
        <header className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase mb-4 brutal-badge bg-[var(--brand-pink)]">
            Perencanaan Akademik Kelulusan
          </div>
          <h1 className="text-4xl sm:text-5xl font-black mb-3 tracking-tight uppercase">
            Target IPK
          </h1>
          <p className="max-w-lg mx-auto text-base font-bold leading-relaxed">
            Simulasikan nilai rata-rata yang Anda butuhkan di sisa semester untuk mengejar target kelulusan impian.
          </p>
        </header>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Left: Inputs */}
          <div className="flex-1 min-w-0 space-y-6 w-full">
            <div className="brutal-card p-6 bg-[var(--brand-blue)]">
              <h2 className="text-sm font-black uppercase tracking-wider mb-4 border-b-2 border-black pb-1 inline-block">Data Akademik Saat Ini</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-white p-3 border-[3px] border-black rounded-lg">
                  <label className="block text-xs font-black uppercase mb-2">Total SKS Diambil</label>
                  <input type="number" min={1} placeholder="Cth: 100" value={currentSks}
                    onChange={(e) => setCurrentSks(e.target.value)}
                    className="text-input w-full font-black text-xl bg-transparent border-0 shadow-none focus:bg-slate-100 p-2" />
                </div>
                <div className="bg-white p-3 border-[3px] border-black rounded-lg">
                  <label className="block text-xs font-black uppercase mb-2">IPK Saat Ini</label>
                  <input type="number" min={0} max={4} step={0.01} placeholder="Cth: 3.25" value={currentIpk}
                    onChange={(e) => setCurrentIpk(e.target.value)}
                    className="text-input w-full font-black text-xl bg-transparent border-0 shadow-none focus:bg-slate-100 p-2" />
                </div>
              </div>
            </div>

            <div className="brutal-card p-6 bg-white transform rotate-1">
              <h2 className="text-sm font-black uppercase tracking-wider mb-4 border-b-2 border-black pb-1 inline-block text-[var(--brand-pink)]">Target Kelulusan</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase mb-2">Total SKS (S1 = 144)</label>
                  <input type="number" min={1} value={targetSks}
                    onChange={(e) => setTargetSks(e.target.value)}
                    className="text-input w-full py-4 text-xl font-black bg-slate-50" />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase mb-2">Target IPK Lulus</label>
                  <input type="number" min={0} max={4} step={0.01} value={targetIpk}
                    onChange={(e) => setTargetIpk(e.target.value)}
                    className="text-input w-full py-4 text-xl font-black bg-[var(--brand-yellow)] border-2 border-black" />
                </div>
              </div>
              <div className="mt-5 flex gap-2 flex-wrap">
                {[3.00, 3.50, 3.75, 4.00].map(val => (
                  <button key={val} onClick={() => setTargetIpk(val.toFixed(2))}
                    className="text-xs font-black uppercase px-3 py-2 border-[3px] border-black bg-[var(--brand-pink)] hover:bg-black hover:text-white transition-colors rounded">
                    Target {val.toFixed(2)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Results */}
          <aside className="w-full lg:w-80 flex-shrink-0 lg:sticky lg:top-4 space-y-6">
            <div className="brutal-card p-6 bg-white text-center">
              <h2 className="text-sm font-black uppercase tracking-wider mb-6 border-b-4 border-black inline-block pb-1">
                Hasil Simulasi
              </h2>

              {!result ? (
                <div className="py-10">
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full border-4 border-black border-dashed flex items-center justify-center bg-slate-100 transform rotate-12">
                    <span className="font-black text-4xl">🎯</span>
                  </div>
                  <p className="text-sm font-bold">
                    Lengkapi SKS dan IPK saat ini untuk melihat hasil simulasi
                  </p>
                </div>
              ) : "error" in result ? (
                <div className="py-10 px-2 bg-[var(--brand-pink)] border-2 border-black rounded shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <span className="text-4xl mb-4 block">⚠️</span>
                  <p className="text-sm font-black uppercase">{result.error}</p>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <div className="text-sm font-black uppercase mb-2 border-2 border-black p-2 bg-[var(--brand-yellow)] inline-block transform -rotate-2">
                      Sisa SKS Anda: {result.sRem} SKS
                    </div>
                    <div className="text-xs font-bold mt-4">Rata-rata Nilai / IP yang dibutuhkan:</div>
                    
                    <div className={`text-6xl font-black mt-3 mb-2 p-4 border-[4px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] inline-block ${result.iReq > 4 ? "bg-[var(--brand-pink)] text-white" : "bg-[var(--brand-mint)]"}`}>
                      {result.iReq.toFixed(2)}
                    </div>
                  </div>

                  {result.iReq > 4 ? (
                    <div className="mt-6 p-4 bg-[var(--brand-pink)] border-[3px] border-black text-left">
                      <div className="font-black text-lg uppercase mb-2 border-b-2 border-black pb-1">Misi Mustahil ❌</div>
                      <p className="text-xs font-bold">
                        Maaf, meskipun Anda mendapat nilai A (4.00) di semua sisa <strong>{result.sRem} SKS</strong>, Anda tidak akan bisa mencapai target IPK <strong>{targetIpk}</strong>. Pertimbangkan untuk menurunkan target.
                      </p>
                    </div>
                  ) : result.iReq <= 0 ? (
                    <div className="mt-6 p-4 bg-[var(--brand-mint)] border-[3px] border-black text-left">
                      <div className="font-black text-lg uppercase mb-2 border-b-2 border-black pb-1">Target Tercapai! 🎉</div>
                      <p className="text-xs font-bold">
                        Anda sudah mencapai target! Tetap semangat mempertahankan nilai.
                      </p>
                    </div>
                  ) : (
                    <div className="mt-6 p-4 bg-[var(--brand-blue)] border-[3px] border-black text-left transform rotate-1">
                      <div className="font-black text-lg uppercase mb-2 border-b-2 border-black pb-1">Strategi Kelulusan 🚀</div>
                      <p className="text-xs font-bold leading-relaxed">
                        Untuk IPK <strong>{targetIpk}</strong>, Anda wajib mendapat Indeks Prestasi Minimal <span className="bg-white px-1 border border-black">{result.iReq.toFixed(2)}</span> di sisa <strong>{result.sRem} SKS</strong>. 
                        {result.iReq >= 3.5 ? " Usahakan mendapat mayoritas nilai A!" : result.iReq >= 3.0 ? " Mayoritas nilai B sudah cukup, tapi A lebih aman." : ""}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </aside>
        </div>
      </main>

      <footer className="relative z-10 text-center py-6 font-bold text-sm border-t-[3px] border-black mt-8 bg-white">
        © 2025 AcademicTools
      </footer>
    </div>
  );
}
