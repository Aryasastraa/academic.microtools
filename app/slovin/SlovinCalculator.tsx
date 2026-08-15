"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

// ─────────────────────────────────────────────
//  Constants
// ─────────────────────────────────────────────

const COMMON_MARGINS = [
  { label: "1%", value: 0.01, desc: "Sangat ketat" },
  { label: "5%", value: 0.05, desc: "Standar skripsi" },
  { label: "10%", value: 0.10, desc: "Toleransi longgar" },
];

// ─────────────────────────────────────────────
//  Component
// ─────────────────────────────────────────────

export default function SlovinCalculator() {
  const [population, setPopulation] = useState<string>("");
  const [marginPct, setMarginPct] = useState<string>("5");
  const [useCustom, setUseCustom] = useState(false);

  // ── Calculation ──────────────────────────
  const result = useMemo(() => {
    const N = parseInt(population);
    const e = parseFloat(marginPct) / 100;
    if (!N || N <= 0 || !e || e <= 0 || e >= 1) return null;
    const n = N / (1 + N * e * e);
    return {
      sample: Math.ceil(n),
      exact: n,
      population: N,
      margin: e,
    };
  }, [population, marginPct]);

  // Comparison table: show all common margins
  const comparisonRows = useMemo(() => {
    const N = parseInt(population);
    if (!N || N <= 0) return [];
    return [1, 3, 5, 7, 10, 15].map((pct) => {
      const e = pct / 100;
      const n = N / (1 + N * e * e);
      return { pct, sample: Math.ceil(n), exact: n };
    });
  }, [population]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header Ad */}
      <div className="p-4 flex justify-center mt-2">
      </div>

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-5 py-4 max-w-4xl mx-auto w-full">
        <Link href="/" className="flex items-center gap-2 font-black uppercase text-sm border-2 border-transparent hover:border-black hover:bg-black hover:text-white px-3 py-1 rounded transition-all">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Kembali
        </Link>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center border-[3px] border-black bg-[var(--brand-orange)] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transform rotate-3">
          <span className="text-black text-sm font-black select-none">A</span>
        </div>
      </nav>

      {/* Main */}
      <main className="relative z-10 max-w-4xl mx-auto w-full px-4 pb-20 flex-1">
        <header className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase mb-4 brutal-badge bg-[var(--brand-orange)]">
            Teknik Sampling · Kuantitatif
          </div>
          <h1 className="text-4xl sm:text-5xl font-black mb-3 tracking-tight uppercase">
            Rumus Slovin
          </h1>
          <p className="max-w-lg mx-auto text-base font-bold leading-relaxed">
            Hitung jumlah sampel minimal penelitian Anda secara instan.
          </p>
        </header>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Left: Input */}
          <div className="flex-1 w-full min-w-0 space-y-6">
            {/* Formula display */}
            <div className="brutal-card p-6 bg-white text-center transform -rotate-1">
              <p className="text-sm font-black uppercase tracking-wider mb-4 border-b-2 border-black inline-block pb-1">
                Rumus Slovin
              </p>
              <div className="text-4xl sm:text-5xl font-black tracking-tight">
                <span className="text-[var(--brand-orange)] bg-black px-2 text-white border-2 border-black">n</span> = <span>N</span> / (1 + <span>N</span> · <span className="bg-[var(--brand-mint)] px-2 border-2 border-black">e</span>²)
              </div>
              <div className="flex flex-wrap justify-center gap-4 mt-6 text-sm font-bold uppercase">
                <span className="bg-black text-white px-2 border-2 border-black">n = Sampel</span>
                <span className="bg-slate-100 px-2 border-2 border-black">N = Populasi</span>
                <span className="bg-[var(--brand-mint)] px-2 border-2 border-black">e = Margin Error</span>
              </div>
            </div>

            {/* Population input */}
            <div className="brutal-card p-6 bg-white">
              <label htmlFor="input-population" className="block text-sm font-black uppercase mb-3">
                Jumlah Populasi (N)
              </label>
              <input
                id="input-population"
                type="number"
                min={1}
                placeholder="Misal: 150"
                value={population}
                onChange={(e) => setPopulation(e.target.value)}
                className="text-input w-full text-xl py-4 font-black"
              />
              <p className="mt-3 text-xs font-bold bg-[var(--brand-yellow)] p-2 border-2 border-black inline-block transform rotate-1">
                Total individu dalam populasi target penelitian Anda.
              </p>
            </div>

            {/* Margin of error */}
            <div className="brutal-card p-6 bg-[var(--brand-mint)]">
              <label className="block text-sm font-black uppercase mb-3">
                Margin Error (e)
              </label>

              {/* Quick buttons */}
              <div className="grid grid-cols-3 gap-3 mb-5">
                {COMMON_MARGINS.map((m) => {
                  const isSelected = !useCustom && marginPct === String(m.value * 100);
                  return (
                    <button
                      key={m.label}
                      onClick={() => { setMarginPct(String(m.value * 100)); setUseCustom(false); }}
                      className={`p-3 border-[3px] border-black rounded-lg transition-transform text-center ${isSelected ? 'bg-black text-white transform -translate-y-1 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]' : 'bg-white hover:-translate-y-1 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'}`}
                    >
                      <div className="text-xl font-black">{m.label}</div>
                      <div className="text-[9px] font-bold mt-1 uppercase leading-tight">
                        {m.desc}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Custom input */}
              <div className="flex items-center gap-3 p-3 bg-white border-[3px] border-black rounded-lg">
                <button
                  onClick={() => setUseCustom(true)}
                  className={`text-xs font-black uppercase px-3 py-2 border-2 border-black ${useCustom ? 'bg-[var(--brand-orange)]' : 'bg-slate-100 hover:bg-slate-200'}`}
                >
                  Custom
                </button>
                {useCustom ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      id="input-custom-margin"
                      type="number"
                      min={0.1}
                      max={50}
                      step={0.1}
                      value={marginPct}
                      onChange={(e) => setMarginPct(e.target.value)}
                      className="text-input flex-1 font-black"
                    />
                    <span className="text-lg font-black">%</span>
                  </div>
                ) : (
                  <div className="text-sm font-bold opacity-50 flex-1">Atau masukkan angka custom</div>
                )}
              </div>
            </div>

            {/* Comparison table */}
            {comparisonRows.length > 0 && (
              <div className="brutal-card p-6 bg-white overflow-hidden">
                <h3 className="text-sm font-black uppercase mb-2">
                  Perbandingan Margin Error
                </h3>
                <p className="text-xs font-bold mb-4">
                  Populasi (N) = <span className="bg-[var(--brand-yellow)] px-1 border border-black">{parseInt(population).toLocaleString("id-ID")}</span>
                </p>
                <div className="overflow-x-auto border-[3px] border-black rounded-lg">
                  <table className="brutal-table border-0 w-full text-sm">
                    <thead>
                      <tr>
                        <th className="text-left font-black border-0 border-b-[3px] border-r-[3px] border-black">Margin Error</th>
                        <th className="text-right font-black border-0 border-b-[3px] border-r-[3px] border-black">Sampel (n)</th>
                        <th className="text-right font-black border-0 border-b-[3px] border-black">Rasio</th>
                      </tr>
                    </thead>
                    <tbody>
                      {comparisonRows.map((row) => {
                        const isActive = parseFloat(marginPct) === row.pct;
                        return (
                          <tr key={row.pct} className={isActive ? "bg-[var(--brand-blue)]" : ""}>
                            <td className="font-bold border-0 border-b-[3px] border-r-[3px] border-black">
                              {row.pct}% {isActive && <span className="ml-1">◀</span>}
                            </td>
                            <td className="text-right font-black border-0 border-b-[3px] border-r-[3px] border-black">
                              {row.sample.toLocaleString("id-ID")}
                            </td>
                            <td className="text-right font-bold border-0 border-b-[3px] border-black">
                              {((row.sample / parseInt(population)) * 100).toFixed(1)}%
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Right: Results */}
          <aside className="w-full lg:w-80 flex-shrink-0 lg:sticky lg:top-4 space-y-6">
            <div className="brutal-card p-6 bg-white text-center">
              <h2 className="text-sm font-black uppercase tracking-wider mb-6 border-b-4 border-black inline-block pb-1">
                Hasil Perhitungan
              </h2>

              {result ? (
                <>
                  <div className="mb-6">
                    <div className="text-6xl font-black bg-[var(--brand-yellow)] border-[3px] border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transform rotate-1 inline-block">
                      {result.sample.toLocaleString("id-ID")}
                    </div>
                    <div className="text-sm font-black uppercase mt-4">Sampel Minimum</div>
                  </div>

                  <div className="p-4 bg-slate-100 border-[3px] border-black text-left space-y-3 font-bold text-sm">
                    <h3 className="text-xs font-black uppercase border-b-2 border-black pb-1 mb-2">Detail Hitungan</h3>
                    <div className="flex justify-between">
                      <span>N (Populasi)</span>
                      <span>{result.population.toLocaleString("id-ID")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>e (Margin Error)</span>
                      <span>{(result.margin * 100)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>1 + N·e²</span>
                      <span>{(1 + result.population * result.margin * result.margin).toFixed(4)}</span>
                    </div>
                    <div className="flex justify-between border-t-[3px] border-black pt-2">
                      <span>n (Eksak)</span>
                      <span className="bg-white px-1 border border-black">{result.exact.toFixed(4)}</span>
                    </div>
                  </div>

                  <div className="mt-4 p-4 text-left border-[3px] border-black bg-[var(--brand-blue)] transform -rotate-1">
                    <p className="text-xs font-bold leading-relaxed">
                      Dengan populasi sebesar <strong>{result.population.toLocaleString("id-ID")}</strong> dan margin error <strong>{(result.margin * 100)}%</strong>, sampel minimal adalah <strong className="bg-white px-1 border border-black">{result.sample.toLocaleString("id-ID")}</strong>.
                    </p>
                    <p className="text-[10px] font-black uppercase mt-3 pt-2 border-t-2 border-black">
                      💡 Saran: Tambah 10-20% untuk antisipasi data tidak valid.
                    </p>
                  </div>
                </>
              ) : (
                <div className="py-10">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full border-4 border-black border-dashed flex items-center justify-center bg-slate-100">
                    <span className="font-black text-4xl">n</span>
                  </div>
                  <p className="text-sm font-bold">
                    Masukkan populasi dan margin error untuk menghitung
                  </p>
                </div>
              )}
            </div>

            <div className="brutal-card p-5 bg-white">
              <h3 className="text-sm font-black uppercase mb-3 border-b-2 border-black pb-1">Referensi</h3>
              <div className="text-xs font-bold leading-relaxed space-y-3">
                <p>Slovin, M.J. (1960). <em>Sampling</em>. New York: Simon and Schuster.</p>
                <p className="bg-[var(--brand-pink)] p-2 border-2 border-black">
                  Margin error yang umum digunakan dalam penelitian sosial dan pendidikan adalah <strong>5% (0.05)</strong>.
                </p>
                <p>
                  Hanya cocok untuk populasi <strong>terhingga (finite)</strong> dan teknik <em>simple random sampling</em>.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <div className="p-4 flex justify-center mt-8">
      </div>
      <footer className="relative z-10 text-center py-6 font-bold text-sm border-t-[3px] border-black mt-4 bg-white">
        © 2025 AcademicTools · Kalkulator Rumus Slovin gratis
      </footer>
    </div>
  );
}
