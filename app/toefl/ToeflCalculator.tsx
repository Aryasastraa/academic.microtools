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
        <div className="w-8 h-8 rounded-lg flex items-center justify-center border-[3px] border-black bg-[var(--brand-blue)] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transform rotate-3">
          <span className="text-black text-sm font-black select-none">A</span>
        </div>
      </nav>

      <main className="relative z-10 max-w-4xl mx-auto w-full px-4 pb-20 flex-1">
        <header className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase mb-4 brutal-badge bg-[var(--brand-blue)]">
            Syarat Sidang Skripsi · Konversi ITP / PBT
          </div>
          <h1 className="text-4xl sm:text-5xl font-black mb-3 tracking-tight uppercase">
            Konversi TOEFL
          </h1>
          <p className="max-w-lg mx-auto text-base font-bold leading-relaxed">
            Masukkan jumlah jawaban yang benar dari masing-masing section untuk mengetahui prediksi skor TOEFL Anda.
          </p>
        </header>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Left: Inputs */}
          <div className="flex-1 min-w-0 space-y-6 w-full">
            {/* Listening */}
            <div className="brutal-card p-6 bg-[var(--brand-mint)] transform -rotate-1">
              <div className="flex items-center gap-3 mb-4 border-b-2 border-black pb-3">
                <div className="w-10 h-10 rounded bg-white border-2 border-black flex items-center justify-center text-xl font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">1</div>
                <div>
                  <h2 className="text-lg font-black uppercase tracking-tight">Listening Comprehension</h2>
                  <p className="text-xs font-bold uppercase bg-black text-white px-1 mt-1 inline-block">Total 50 Pertanyaan</p>
                </div>
              </div>
              <label className="block text-sm font-black uppercase mb-2">Jumlah Jawaban Benar</label>
              <input type="number" min={0} max={50} placeholder="Cth: 35" value={listening}
                onChange={(e) => setListening(e.target.value)}
                className="text-input w-full py-4 text-xl font-black bg-white" />
            </div>

            {/* Structure */}
            <div className="brutal-card p-6 bg-[var(--brand-yellow)]">
              <div className="flex items-center gap-3 mb-4 border-b-2 border-black pb-3">
                <div className="w-10 h-10 rounded bg-white border-2 border-black flex items-center justify-center text-xl font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">2</div>
                <div>
                  <h2 className="text-lg font-black uppercase tracking-tight">Structure &amp; Written</h2>
                  <p className="text-xs font-bold uppercase bg-black text-white px-1 mt-1 inline-block">Total 40 Pertanyaan</p>
                </div>
              </div>
              <label className="block text-sm font-black uppercase mb-2">Jumlah Jawaban Benar</label>
              <input type="number" min={0} max={40} placeholder="Cth: 28" value={structure}
                onChange={(e) => setStructure(e.target.value)}
                className="text-input w-full py-4 text-xl font-black bg-white" />
            </div>

            {/* Reading */}
            <div className="brutal-card p-6 bg-[var(--brand-pink)] transform rotate-1">
              <div className="flex items-center gap-3 mb-4 border-b-2 border-black pb-3">
                <div className="w-10 h-10 rounded bg-white border-2 border-black flex items-center justify-center text-xl font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">3</div>
                <div>
                  <h2 className="text-lg font-black uppercase tracking-tight">Reading Comprehension</h2>
                  <p className="text-xs font-bold uppercase bg-black text-white px-1 mt-1 inline-block">Total 50 Pertanyaan</p>
                </div>
              </div>
              <label className="block text-sm font-black uppercase mb-2">Jumlah Jawaban Benar</label>
              <input type="number" min={0} max={50} placeholder="Cth: 42" value={reading}
                onChange={(e) => setReading(e.target.value)}
                className="text-input w-full py-4 text-xl font-black bg-white" />
            </div>
          </div>

          {/* Right: Results */}
          <aside className="w-full lg:w-80 flex-shrink-0 lg:sticky lg:top-4 space-y-6">
            <div className="brutal-card p-6 bg-white text-center">
              <h2 className="text-sm font-black uppercase tracking-wider mb-6 border-b-4 border-black inline-block pb-1">
                Prediksi Skor Akhir
              </h2>

              {!result ? (
                <div className="py-10">
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full border-4 border-black border-dashed flex items-center justify-center bg-slate-100 transform -rotate-12">
                    <span className="font-black text-4xl">A+</span>
                  </div>
                  <p className="text-sm font-bold">
                    Isi jawaban benar dari ketiga sesi untuk melihat hasil konversi
                  </p>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <div className={`text-6xl font-black mt-3 mb-4 p-4 border-[4px] border-black inline-block shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${result.totalScore >= 450 ? "bg-[var(--brand-mint)]" : "bg-[var(--brand-pink)]"}`}>
                      {result.totalScore}
                    </div>
                    {result.totalScore >= 450 ? (
                      <div className="font-black text-sm uppercase bg-black text-white px-2 py-1 inline-block transform rotate-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">✓ Memenuhi Syarat Sidang (Umumnya)</div>
                    ) : (
                      <div className="font-black text-sm uppercase bg-black text-white px-2 py-1 inline-block transform -rotate-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">⚠ Di Bawah Syarat Standar (450)</div>
                    )}
                  </div>

                  <div className="space-y-3 mt-6 pt-4 border-t-4 border-black">
                    <div className="flex justify-between items-center p-3 border-2 border-black font-bold uppercase text-xs bg-[var(--brand-mint)]">
                      <span>Section 1 (Scaled)</span>
                      <span className="font-black text-base bg-white px-2 border-2 border-black">{result.lScaled}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 border-2 border-black font-bold uppercase text-xs bg-[var(--brand-yellow)]">
                      <span>Section 2 (Scaled)</span>
                      <span className="font-black text-base bg-white px-2 border-2 border-black">{result.sScaled}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 border-2 border-black font-bold uppercase text-xs bg-[var(--brand-pink)]">
                      <span>Section 3 (Scaled)</span>
                      <span className="font-black text-base bg-white px-2 border-2 border-black">{result.rScaled}</span>
                    </div>
                  </div>

                  <div className="mt-6 p-4 border-2 border-black bg-slate-100 text-left transform rotate-1">
                    <p className="text-xs font-bold leading-relaxed uppercase">
                      Skor akhir dihitung dari penjumlahan nilai konversi dikali 10, lalu dibagi 3.
                    </p>
                  </div>
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
