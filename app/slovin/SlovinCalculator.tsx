"use client";

import { useState, useMemo } from "react";

// ─────────────────────────────────────────────
//  Constants
// ─────────────────────────────────────────────

const COMMON_MARGINS = [
  { label: "1%", value: 0.01, desc: "Sangat ketat — riset presisi tinggi" },
  { label: "5%", value: 0.05, desc: "Standar umum skripsi & tesis" },
  { label: "10%", value: 0.10, desc: "Toleransi longgar — survei cepat" },
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
    <div className="min-h-screen flex flex-col" style={{ background: "#050818" }}>
      {/* Ambient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl animate-float"
          style={{ background: "rgba(234,179,8,0.07)" }} />
        <div className="absolute bottom-1/4 right-1/3 w-80 h-80 rounded-full blur-3xl animate-float-2"
          style={{ background: "rgba(245,158,11,0.06)" }} />
      </div>

      {/* Header Ad */}
      <div className="ad-placeholder w-full" style={{ height: "90px" }} role="complementary" aria-label="Ad Space">
        <span>Advertisement · 728 × 90</span>
      </div>

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-5 py-4 max-w-4xl mx-auto w-full">
        <a href="/" className="flex items-center gap-2 text-sm transition-colors" style={{ color: "#64748b" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#f1f5f9")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#64748b")}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          AcademicTools
        </a>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #eab308, #f59e0b)" }}>
          <span className="text-white text-xs font-black select-none">A</span>
        </div>
      </nav>

      {/* Main */}
      <main className="relative z-10 max-w-4xl mx-auto w-full px-4 pb-20 flex-1">
        <header className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-4"
            style={{ background: "rgba(234,179,8,0.1)", border: "1px solid rgba(234,179,8,0.22)", color: "#facc15" }}>
            Teknik Sampling · Penelitian Kuantitatif
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-3 tracking-tight" style={{ color: "#f1f5f9" }}>
            Kalkulator <span style={{ background: "linear-gradient(135deg, #eab308, #f59e0b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Rumus Slovin</span>
          </h1>
          <p className="max-w-lg mx-auto text-sm sm:text-base leading-relaxed" style={{ color: "#64748b" }}>
            Hitung jumlah <strong style={{ color: "#94a3b8" }}>sampel minimal</strong> penelitian Anda secara instan.
          </p>
        </header>

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Left: Input */}
          <div className="flex-1 min-w-0 space-y-5">
            {/* Formula display */}
            <div className="glass-card rounded-2xl p-6 text-center">
              <p className="text-xs uppercase tracking-wider mb-3 font-semibold" style={{ color: "#475569" }}>Rumus Slovin</p>
              <div className="text-2xl sm:text-3xl font-black tracking-tight" style={{ color: "#f1f5f9" }}>
                <span style={{ color: "#facc15" }}>n</span> = <span style={{ color: "#94a3b8" }}>N</span> / (1 + <span style={{ color: "#94a3b8" }}>N</span> · <span style={{ color: "#f59e0b" }}>e</span><sup>2</sup>)
              </div>
              <div className="flex flex-wrap justify-center gap-4 mt-4 text-xs" style={{ color: "#64748b" }}>
                <span><strong style={{ color: "#facc15" }}>n</strong> = Jumlah Sampel</span>
                <span><strong style={{ color: "#94a3b8" }}>N</strong> = Populasi</span>
                <span><strong style={{ color: "#f59e0b" }}>e</strong> = Margin Error</span>
              </div>
            </div>

            {/* Population input */}
            <div className="glass-card rounded-2xl p-6">
              <label htmlFor="input-population" className="block text-sm font-bold mb-3" style={{ color: "#e2e8f0" }}>
                Jumlah Populasi (N)
              </label>
              <input
                id="input-population"
                type="number"
                min={1}
                placeholder="Masukkan jumlah populasi, misal: 150"
                value={population}
                onChange={(e) => setPopulation(e.target.value)}
                className="text-input w-full text-lg py-3"
                style={{ fontSize: "1.125rem" }}
              />
              <p className="mt-2 text-xs" style={{ color: "#475569" }}>
                Total individu dalam populasi target penelitian Anda.
              </p>
            </div>

            {/* Margin of error */}
            <div className="glass-card rounded-2xl p-6">
              <label className="block text-sm font-bold mb-3" style={{ color: "#e2e8f0" }}>
                Margin Error (e)
              </label>

              {/* Quick buttons */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {COMMON_MARGINS.map((m) => {
                  const isSelected = !useCustom && marginPct === String(m.value * 100);
                  return (
                    <button
                      key={m.label}
                      onClick={() => { setMarginPct(String(m.value * 100)); setUseCustom(false); }}
                      className="p-3 rounded-xl text-center transition-all duration-200"
                      style={{
                        background: isSelected ? "linear-gradient(135deg, #eab308, #f59e0b)" : "rgba(234,179,8,0.07)",
                        border: `1px solid ${isSelected ? "transparent" : "rgba(234,179,8,0.2)"}`,
                        color: isSelected ? "white" : "#94a3b8",
                        boxShadow: isSelected ? "0 4px 16px rgba(234,179,8,0.3)" : "none",
                      }}
                    >
                      <div className="text-lg font-black">{m.label}</div>
                      <div className="text-[10px] mt-0.5 leading-tight" style={{ color: isSelected ? "rgba(255,255,255,0.8)" : "#475569" }}>
                        {m.desc}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Custom input */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setUseCustom(true)}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                  style={{
                    background: useCustom ? "rgba(234,179,8,0.15)" : "rgba(234,179,8,0.05)",
                    color: useCustom ? "#facc15" : "#475569",
                    border: `1px solid ${useCustom ? "rgba(234,179,8,0.4)" : "rgba(234,179,8,0.15)"}`,
                  }}
                >
                  Custom
                </button>
                {useCustom && (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      id="input-custom-margin"
                      type="number"
                      min={0.1}
                      max={50}
                      step={0.1}
                      value={marginPct}
                      onChange={(e) => setMarginPct(e.target.value)}
                      className="number-input flex-1"
                      style={{ fontSize: "1rem" }}
                    />
                    <span className="text-sm font-bold" style={{ color: "#94a3b8" }}>%</span>
                  </div>
                )}
              </div>
            </div>

            {/* Comparison table */}
            {comparisonRows.length > 0 && (
              <div className="glass-card rounded-2xl p-6">
                <h3 className="text-sm font-bold mb-4" style={{ color: "#e2e8f0" }}>
                  Tabel Perbandingan Margin Error
                </h3>
                <p className="text-xs mb-4" style={{ color: "#475569" }}>
                  Populasi <strong style={{ color: "#facc15" }}>N = {parseInt(population).toLocaleString("id-ID")}</strong>
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr style={{ borderBottom: "1px solid rgba(234,179,8,0.15)" }}>
                        <th className="text-left py-2 font-semibold" style={{ color: "#475569" }}>Margin Error</th>
                        <th className="text-right py-2 font-semibold" style={{ color: "#475569" }}>Sampel (n)</th>
                        <th className="text-right py-2 font-semibold" style={{ color: "#475569" }}>Rasio</th>
                      </tr>
                    </thead>
                    <tbody>
                      {comparisonRows.map((row) => {
                        const isActive = parseFloat(marginPct) === row.pct;
                        return (
                          <tr key={row.pct}
                            className="transition-colors"
                            style={{
                              borderBottom: "1px solid rgba(99,102,241,0.06)",
                              background: isActive ? "rgba(234,179,8,0.08)" : "transparent",
                            }}>
                            <td className="py-2.5 font-bold" style={{ color: isActive ? "#facc15" : "#94a3b8" }}>
                              {row.pct}% {isActive && "◀"}
                            </td>
                            <td className="py-2.5 text-right font-black" style={{ color: isActive ? "#facc15" : "#818cf8" }}>
                              {row.sample.toLocaleString("id-ID")}
                            </td>
                            <td className="py-2.5 text-right" style={{ color: "#64748b" }}>
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
          <aside className="w-full lg:w-72 xl:w-80 flex-shrink-0 lg:sticky lg:top-4 space-y-4">
            <div className="glass-card rounded-2xl p-6">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-center mb-5" style={{ color: "#475569" }}>
                Hasil Perhitungan
              </h2>

              {result ? (
                <>
                  {/* Big number */}
                  <div className="text-center mb-5">
                    <div className="text-6xl font-black" style={{ color: "#facc15" }}>
                      {result.sample.toLocaleString("id-ID")}
                    </div>
                    <div className="text-sm mt-1" style={{ color: "#64748b" }}>sampel minimum</div>
                  </div>

                  {/* Calculation breakdown */}
                  <div className="p-4 rounded-xl space-y-2.5" style={{ background: "rgba(234,179,8,0.05)", border: "1px solid rgba(234,179,8,0.15)" }}>
                    <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#475569" }}>
                      Detail Perhitungan
                    </h3>
                    <div className="flex justify-between text-xs">
                      <span style={{ color: "#64748b" }}>N (Populasi)</span>
                      <span className="font-bold" style={{ color: "#f1f5f9" }}>{result.population.toLocaleString("id-ID")}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span style={{ color: "#64748b" }}>e (Margin Error)</span>
                      <span className="font-bold" style={{ color: "#f1f5f9" }}>{(result.margin * 100)}%</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span style={{ color: "#64748b" }}>1 + N·e²</span>
                      <span className="font-bold" style={{ color: "#f1f5f9" }}>{(1 + result.population * result.margin * result.margin).toFixed(4)}</span>
                    </div>
                    <div className="flex justify-between text-xs" style={{ borderTop: "1px solid rgba(234,179,8,0.15)", paddingTop: "8px" }}>
                      <span style={{ color: "#64748b" }}>n (Eksak)</span>
                      <span className="font-bold" style={{ color: "#facc15" }}>{result.exact.toFixed(4)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span style={{ color: "#64748b" }}>n (Dibulatkan)</span>
                      <span className="font-black text-sm" style={{ color: "#facc15" }}>{result.sample}</span>
                    </div>
                  </div>

                  {/* Prose conclusion */}
                  <div className="mt-4 p-4 rounded-xl" style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}>
                    <p className="text-xs leading-relaxed" style={{ color: "#94a3b8" }}>
                      Dengan populasi sebesar <strong style={{ color: "#f1f5f9" }}>{result.population.toLocaleString("id-ID")}</strong> dan margin error <strong style={{ color: "#f1f5f9" }}>{(result.margin * 100)}%</strong>, jumlah sampel minimal yang diperlukan adalah <strong style={{ color: "#10b981" }}>{result.sample.toLocaleString("id-ID")} responden</strong>.
                    </p>
                    <p className="text-[10px] mt-2" style={{ color: "#475569" }}>
                      💡 Disarankan menambah 10-20% dari jumlah di atas untuk mengantisipasi data tidak valid.
                    </p>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center animate-pulseRing"
                    style={{ background: "rgba(234,179,8,0.08)", border: "1px solid rgba(234,179,8,0.2)" }}>
                    <span className="font-black text-3xl" style={{ color: "rgba(234,179,8,0.4)" }}>n</span>
                  </div>
                  <p className="text-xs" style={{ color: "#334155" }}>
                    Masukkan populasi dan margin error<br />untuk menghitung jumlah sampel
                  </p>
                </div>
              )}
            </div>

            {/* Ad */}
            <div className="ad-placeholder rounded-2xl" style={{ height: "120px" }} role="complementary" aria-label="Ad Space">
              <span>Advertisement · 300 × 250</span>
            </div>

            {/* Reference */}
            <div className="glass-card rounded-2xl p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#475569" }}>
                Referensi
              </h3>
              <div className="text-xs leading-relaxed space-y-2" style={{ color: "#64748b" }}>
                <p>Slovin, M.J. (1960). <em>Sampling</em>. New York: Simon and Schuster.</p>
                <p>Margin error yang umum digunakan dalam penelitian sosial dan pendidikan adalah <strong style={{ color: "#94a3b8" }}>5% (0.05)</strong>.</p>
                <p>Rumus ini cocok untuk populasi yang <strong style={{ color: "#94a3b8" }}>terhingga (finite)</strong> dan teknik sampling acak sederhana (<em>simple random sampling</em>).</p>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Footer Ad */}
      <div className="ad-placeholder w-full" style={{ height: "90px" }} role="complementary" aria-label="Ad Space Footer">
        <span>Advertisement · 728 × 90</span>
      </div>
      <footer className="relative z-10 text-center py-4 text-xs" style={{ color: "#1e293b" }}>
        © 2025 AcademicTools · Kalkulator Rumus Slovin gratis untuk mahasiswa Indonesia
      </footer>
    </div>
  );
}
