"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import Link from "next/link";

// ─────────────────────────────────────────────────────────────────────────────
//  UEQ Item definitions (standard 26 items, Indonesian)
//  reversed = true  → positive quality is on the LEFT (transform: 4 - raw)
//  reversed = false → positive quality is on the RIGHT (transform: raw - 4)
// ─────────────────────────────────────────────────────────────────────────────

type ScaleName = "Daya Tarik" | "Kejelasan" | "Efisiensi" | "Ketepatan" | "Stimulasi" | "Kebaruan";

interface UeqItem {
  left: string;
  right: string;
  scale: ScaleName;
  reversed: boolean;
}

const UEQ_ITEMS: UeqItem[] = [
  { left: "Menyusahkan",         right: "Menyenangkan",           scale: "Daya Tarik", reversed: false },
  { left: "Tak dapat dipahami",  right: "Dapat dipahami",         scale: "Kejelasan",  reversed: false },
  { left: "Kreatif",             right: "Monoton",                scale: "Kebaruan",   reversed: true  },
  { left: "Mudah dipelajari",    right: "Sulit dipelajari",       scale: "Kejelasan",  reversed: true  },
  { left: "Bermanfaat",          right: "Kurang bermanfaat",      scale: "Stimulasi",  reversed: true  },
  { left: "Membosankan",         right: "Mengasyikkan",           scale: "Stimulasi",  reversed: false },
  { left: "Tidak menarik",       right: "Menarik",                scale: "Stimulasi",  reversed: false },
  { left: "Tak dapat diprediksi",right: "Dapat diprediksi",       scale: "Ketepatan",  reversed: false },
  { left: "Cepat",               right: "Lambat",                 scale: "Efisiensi",  reversed: true  },
  { left: "Berdaya cipta",       right: "Konvensional",           scale: "Kebaruan",   reversed: true  },
  { left: "Menghalangi",         right: "Mendukung",              scale: "Ketepatan",  reversed: false },
  { left: "Baik",                right: "Buruk",                  scale: "Daya Tarik", reversed: true  },
  { left: "Rumit",               right: "Sederhana",              scale: "Kejelasan",  reversed: false },
  { left: "Tidak disukai",       right: "Menggembirakan",         scale: "Daya Tarik", reversed: false },
  { left: "Lazim",               right: "Terdepan",               scale: "Kebaruan",   reversed: false },
  { left: "Tidak nyaman",        right: "Nyaman",                 scale: "Daya Tarik", reversed: false },
  { left: "Aman",                right: "Tidak aman",             scale: "Ketepatan",  reversed: true  },
  { left: "Memotivasi",          right: "Tidak memotivasi",       scale: "Stimulasi",  reversed: true  },
  { left: "Memenuhi ekspektasi", right: "Tidak memenuhi ekspektasi", scale: "Ketepatan", reversed: true },
  { left: "Tidak efisien",       right: "Efisien",                scale: "Efisiensi",  reversed: false },
  { left: "Jelas",               right: "Membingungkan",          scale: "Kejelasan",  reversed: true  },
  { left: "Tidak praktis",       right: "Praktis",                scale: "Efisiensi",  reversed: false },
  { left: "Terorganisasi",       right: "Berantakan",             scale: "Efisiensi",  reversed: true  },
  { left: "Atraktif",            right: "Tidak atraktif",         scale: "Daya Tarik", reversed: true  },
  { left: "Ramah",               right: "Tidak ramah",            scale: "Daya Tarik", reversed: true  },
  { left: "Konservatif",         right: "Inovatif",               scale: "Kebaruan",   reversed: false },
];

const SCALE_ORDER: ScaleName[] = ["Daya Tarik", "Kejelasan", "Efisiensi", "Ketepatan", "Stimulasi", "Kebaruan"];

const SCALE_COLORS: Record<ScaleName, string> = {
  "Daya Tarik": "var(--brand-mint)",
  "Kejelasan":  "var(--brand-blue)",
  "Efisiensi":  "var(--brand-yellow)",
  "Ketepatan":  "var(--brand-pink)",
  "Stimulasi":  "var(--brand-orange)",
  "Kebaruan":   "var(--brand-lilac)",
};

const SCALE_EN: Record<ScaleName, string> = {
  "Daya Tarik": "Attractiveness",
  "Kejelasan":  "Perspicuity",
  "Efisiensi":  "Efficiency",
  "Ketepatan":  "Dependability",
  "Stimulasi":  "Stimulation",
  "Kebaruan":   "Novelty",
};

// ─────────────────────────────────────────────────────────────────────────────
//  UEQ Benchmark interpretation
// ─────────────────────────────────────────────────────────────────────────────

interface BenchmarkInfo {
  label: string;
  color: string;
  bgColor: string;
}

function getBenchmark(mean: number): BenchmarkInfo {
  if (mean >= 1.75) return { label: "Sangat Baik", color: "#000", bgColor: "var(--brand-mint)" };
  if (mean >= 0.72) return { label: "Baik", color: "#000", bgColor: "var(--brand-blue)" };
  if (mean >= -0.7)  return { label: "Netral", color: "#000", bgColor: "var(--brand-yellow)" };
  if (mean >= -1.5)  return { label: "Buruk", color: "#000", bgColor: "var(--brand-orange)" };
  return { label: "Sangat Buruk", color: "#000", bgColor: "var(--brand-pink)" };
}

function getOverallBenchmark(mean: number): { label: string; emoji: string; color: string; bgColor: string; desc: string } {
  if (mean >= 1.75) return { label: "Excellent", emoji: "🌟", color: "#000", bgColor: "var(--brand-mint)", desc: "Pengalaman pengguna sangat baik." };
  if (mean >= 0.72) return { label: "Good", emoji: "👍", color: "#000", bgColor: "var(--brand-blue)", desc: "Pengalaman pengguna baik." };
  if (mean >= -0.7)  return { label: "Neutral", emoji: "✅", color: "#000", bgColor: "var(--brand-yellow)", desc: "Pengalaman pengguna cukup, ada ruang perbaikan." };
  if (mean >= -1.5)  return { label: "Below Average", emoji: "⚠️", color: "#000", bgColor: "var(--brand-orange)", desc: "Pengalaman pengguna kurang baik, perlu evaluasi." };
  return { label: "Bad", emoji: "❌", color: "#000", bgColor: "var(--brand-pink)", desc: "Pengalaman pengguna sangat buruk." };
}

// ─────────────────────────────────────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────────────────────────────────────

function transformItem(rawValue: number, reversed: boolean): number {
  return reversed ? 4 - rawValue : rawValue - 4;
}

// CSV parser
function parseCSVRows(text: string): string[][] {
  return text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n").filter((l) => l.trim()).map((line) => {
    const cells: string[] = [];
    let cur = "", inQ = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') { if (inQ && line[i + 1] === '"') { cur += '"'; i++; } else inQ = !inQ; }
      else if (ch === "," && !inQ) { cells.push(cur.trim()); cur = ""; }
      else cur += ch;
    }
    cells.push(cur.trim());
    return cells;
  });
}

// ─────────────────────────────────────────────────────────────────────────────
//  Bar chart: per-scale means (pure SVG)
// ─────────────────────────────────────────────────────────────────────────────

function UeqBarChart({ scaleMeans }: { scaleMeans: Record<ScaleName, number> }) {
  const w = 320, h = 200;
  const ml = 70, mr = 15, mt = 15, mb = 30; // margins
  const plotW = w - ml - mr, plotH = h - mt - mb;
  const barCount = SCALE_ORDER.length;
  const barW = Math.min(30, (plotW / barCount) * 0.65);
  const gap = (plotW - barW * barCount) / (barCount + 1);

  // Y-axis: -3 to +3
  const yMin = -3, yMax = 3;
  const toY = (v: number) => mt + plotH - ((v - yMin) / (yMax - yMin)) * plotH;
  const zeroY = toY(0);

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full bg-white border-[3px] border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transform -rotate-1 mb-4" role="img" aria-label="UEQ bar chart">
      <rect width={w} height={h} fill="none" />
      {/* Grid lines */}
      {[-3, -2, -1, 0, 1, 2, 3].map((v) => (
        <g key={v}>
          <line x1={ml} y1={toY(v)} x2={ml + plotW} y2={toY(v)} stroke={v === 0 ? "#000" : "#cbd5e1"} strokeWidth={v === 0 ? 2 : 1} strokeDasharray={v === 0 ? "none" : "4 4"} />
          <text x={ml - 10} y={toY(v) + 4} textAnchor="end" fill="#000" fontSize="11" fontWeight="800" fontFamily="Inter, sans-serif">{v}</text>
        </g>
      ))}
      {/* Bars */}
      {SCALE_ORDER.map((scale, i) => {
        const val = scaleMeans[scale];
        const x = ml + gap + i * (barW + gap);
        const barH = Math.abs(val / (yMax - yMin)) * plotH;
        const barY = val >= 0 ? zeroY - barH : zeroY;
        const color = SCALE_COLORS[scale];
        return (
          <g key={scale}>
            <rect x={x} y={barY} width={barW} height={barH} rx={0} fill={color} stroke="#000" strokeWidth="2" />
            {/* Value label */}
            <text x={x + barW / 2} y={val >= 0 ? barY - 5 : barY + barH + 12} textAnchor="middle" fill="#000" fontSize="10" fontWeight="900" fontFamily="Inter, sans-serif">
              {val.toFixed(2)}
            </text>
            {/* Scale label */}
            <text x={x + barW / 2} y={h - 8} textAnchor="middle" fill="#000" fontSize="9" fontWeight="800" fontFamily="Inter, sans-serif" transform={`rotate(-45, ${x + barW / 2}, ${h - 8})`}>
              {scale.split(" ")[scale.split(" ").length > 1 ? 1 : 0]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Main Component
// ─────────────────────────────────────────────────────────────────────────────

export default function UeqCalculator() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // answers[itemIndex] = 1–7 | null
  const [answers, setAnswers] = useState<(number | null)[]>(Array(26).fill(null));
  const [isDragOver, setIsDragOver] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importInfo, setImportInfo] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // ── Calculation ───────────────────────────────
  const isComplete = answers.every((a) => a !== null);
  const answeredCount = answers.filter((a) => a !== null).length;

  const results = useMemo(() => {
    if (!isComplete) return null;

    // Transform each item
    const transformed = answers.map((raw, i) => transformItem(raw!, UEQ_ITEMS[i].reversed));

    // Per-scale aggregation
    const scaleItems: Record<ScaleName, number[]> = {
      "Daya Tarik": [], "Kejelasan": [], "Efisiensi": [], "Ketepatan": [], "Stimulasi": [], "Kebaruan": [],
    };
    transformed.forEach((val, i) => scaleItems[UEQ_ITEMS[i].scale].push(val));

    const scaleMeans: Record<ScaleName, number> = {} as Record<ScaleName, number>;
    const scaleStdDevs: Record<ScaleName, number> = {} as Record<ScaleName, number>;
    for (const s of SCALE_ORDER) {
      const items = scaleItems[s];
      const mean = items.reduce((a, b) => a + b, 0) / items.length;
      scaleMeans[s] = mean;
      const variance = items.reduce((a, v) => a + (v - mean) ** 2, 0) / items.length;
      scaleStdDevs[s] = Math.sqrt(variance);
    }

    // Pragmatic Quality (Kejelasan + Efisiensi + Ketepatan) / 3
    const pragmatic = (scaleMeans["Kejelasan"] + scaleMeans["Efisiensi"] + scaleMeans["Ketepatan"]) / 3;
    // Hedonic Quality (Stimulasi + Kebaruan) / 2
    const hedonic = (scaleMeans["Stimulasi"] + scaleMeans["Kebaruan"]) / 2;
    // Overall
    const overall = SCALE_ORDER.reduce((s, sc) => s + scaleMeans[sc], 0) / SCALE_ORDER.length;

    return { transformed, scaleMeans, scaleStdDevs, pragmatic, hedonic, overall };
  }, [answers, isComplete]);

  // ── File Import ───────────────────────────────
  const processCSVImport = useCallback((text: string) => {
    try {
      const rows = parseCSVRows(text);
      if (rows.length < 2) throw new Error("File CSV kosong atau tidak memiliki data.");
      const dataRows = rows.slice(1).filter((r) => r.some((c) => c.trim()));
      if (dataRows.length === 0) throw new Error("Tidak ada baris responden ditemukan.");

      // Detect columns with values in 1-7 range
      const header = rows[0];
      const likertCols: number[] = [];
      for (let col = 0; col < header.length; col++) {
        const parsed = dataRows.map((r) => { const n = parseInt(r[col] ?? ""); return (!isNaN(n) && n >= 1 && n <= 7) ? n : null; });
        const valid = parsed.filter((v) => v !== null).length;
        if (valid / dataRows.length >= 0.5) likertCols.push(col);
      }

      if (likertCols.length < 26) {
        throw new Error(
          `Hanya ${likertCols.length} kolom jawaban (1–7) terdeteksi — dibutuhkan 26.\n` +
          `Pastikan file berisi data kuesioner UEQ dengan 26 item berskala 1–7.`
        );
      }

      const ueqCols = likertCols.slice(0, 26);

      // Average across all respondents per item
      const avgAnswers = ueqCols.map((ci) => {
        const vals = dataRows.map((r) => { const n = parseInt(r[ci] ?? ""); return (!isNaN(n) && n >= 1 && n <= 7) ? n : null; }).filter((v): v is number => v !== null);
        return vals.length > 0 ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 4;
      });

      setAnswers(avgAnswers as (number | null)[]);
      setImportInfo(`${dataRows.length} responden berhasil diimport — menampilkan rata-rata.`);
      setImportError(null);
    } catch (e) {
      setImportError(e instanceof Error ? e.message : "Gagal membaca file.");
      setImportInfo(null);
    }
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processCSVImport(await file.text());
  }, [processCSVImport]);

  const handleFileInput = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processCSVImport(await file.text());
    e.target.value = "";
  }, [processCSVImport]);

  // ── Other handlers ────────────────────────────
  const handleAnswer = (qi: number, value: number) => {
    setAnswers((prev) => { const n = [...prev]; n[qi] = value; return n; });
  };

  const shareResult = async () => {
    const encoded = btoa(JSON.stringify(answers));
    const url = new URL(window.location.href);
    url.searchParams.set("data", encoded);
    window.history.replaceState(null, "", url.toString());
    try { await navigator.clipboard.writeText(url.toString()); } catch { /* ok */ }
    setCopied(true); setTimeout(() => setCopied(false), 2500);
  };

  const resetAll = () => {
    setAnswers(Array(26).fill(null));
    setImportError(null); setImportInfo(null);
    const url = new URL(window.location.href);
    url.searchParams.delete("data");
    window.history.replaceState(null, "", url.toString());
  };

  // ── Render ────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col"
      onDragOver={(e) => { if (e.dataTransfer.types.includes("Files")) { e.preventDefault(); setIsDragOver(true); } }}
      onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragOver(false); }}
      onDrop={handleDrop}>

      <input ref={fileInputRef} type="file" accept=".csv" className="sr-only" onChange={handleFileInput} />

      {/* Drag overlay */}
      {isDragOver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-md">
          <div className="text-center px-16 py-12 brutal-card bg-[var(--brand-mint)] transform rotate-2">
            <div className="text-7xl mb-5">🎯</div>
            <h2 className="text-3xl font-black mb-2 uppercase">Lepaskan file CSV di sini</h2>
            <p className="text-sm font-bold">Data UEQ akan otomatis diproses</p>
          </div>
        </div>
      )}

      {/* Header Ad */}
      <div className="p-4 flex justify-center mt-2">
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-5 py-4 max-w-5xl mx-auto w-full">
        <Link href="/" className="flex items-center gap-2 font-black uppercase text-sm border-2 border-transparent hover:border-black hover:bg-black hover:text-white px-3 py-1 rounded transition-all">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Kembali
        </Link>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center border-[3px] border-black bg-[var(--brand-lilac)] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transform rotate-3">
          <span className="text-black text-sm font-black select-none">A</span>
        </div>
      </nav>

      <main className="relative z-10 max-w-5xl mx-auto w-full px-4 pb-20 flex-1">
        <header className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase mb-4 brutal-badge bg-[var(--brand-lilac)]">
            User Experience Questionnaire · 26 Item
          </div>
          <h1 className="text-4xl sm:text-5xl font-black mb-3 tracking-tight uppercase">
            Kalkulator UEQ
          </h1>
          <p className="max-w-lg mx-auto text-base font-bold leading-relaxed">
            Isi 26 pasangan kata sifat atau <span className="bg-[var(--brand-yellow)] px-1 border-2 border-black font-black transform -rotate-1 inline-block">import CSV</span>. Skor dihitung otomatis.
          </p>
        </header>

        {/* Import zone */}
        <div className="mb-8">
          {importError && (
            <div className="brutal-card p-4 mb-4 bg-[var(--brand-pink)]">
              <div className="flex items-start gap-3">
                <span className="text-3xl flex-shrink-0">❌</span>
                <div className="flex-1">
                  <p className="text-sm font-black mb-1">Gagal membaca file</p>
                  <p className="text-xs font-bold leading-relaxed whitespace-pre-line">{importError}</p>
                </div>
                <button onClick={() => setImportError(null)} className="btn-ghost px-3 py-1 bg-white">✕</button>
              </div>
            </div>
          )}
          {importInfo && (
            <div className="brutal-card p-4 mb-4 bg-[var(--brand-mint)]">
              <div className="flex items-center gap-3">
                <span className="text-3xl">✅</span>
                <p className="text-sm font-black flex-1">{importInfo}</p>
                <button onClick={() => { setImportInfo(null); }} className="btn-ghost px-3 py-1 bg-white">✕</button>
              </div>
            </div>
          )}
          <button onClick={() => fileInputRef.current?.click()}
            className="w-full btn-ghost border-dashed flex items-center justify-center gap-4 py-6 bg-slate-50"
          >
            <div className="w-12 h-12 rounded flex items-center justify-center border-[3px] border-black bg-[var(--brand-blue)] transform -rotate-3">
              <span className="text-2xl font-black text-white">+</span>
            </div>
            <div className="text-left">
              <p className="text-base font-black uppercase">Import CSV dari Google Forms</p>
              <p className="text-xs font-bold mt-1">Drag &amp; drop atau klik · 26 kolom skala 1–7</p>
            </div>
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Left: Items */}
          <div className="flex-1 min-w-0 space-y-4">
            {UEQ_ITEMS.map((item, qi) => {
              const answered = answers[qi] !== null;
              const color = SCALE_COLORS[item.scale];
              return (
                <div key={qi} id={`ueq-item-${qi + 1}`}
                  className="brutal-card p-5 bg-white relative overflow-hidden"
                  style={{ borderColor: "#000" }}>

                  <div className="absolute top-0 right-0 w-4 h-full" style={{ background: color }}></div>

                  {/* Scale & number */}
                  <div className="flex items-center gap-3 mb-4">
                    <span className={`w-8 h-8 flex-shrink-0 border-[3px] border-black rounded flex items-center justify-center text-sm font-black ${answered ? 'bg-black text-white' : 'bg-slate-100 text-black'}`}>
                      {qi + 1}
                    </span>
                    <span className="text-[10px] font-black uppercase px-2 py-1 border-2 border-black" style={{ background: color }}>
                      {item.scale}
                    </span>
                  </div>

                  {/* Semantic differential slider */}
                  <div className="flex items-center gap-2">
                    <span className={`text-xs text-right w-24 sm:w-28 flex-shrink-0 font-black uppercase`}
                      style={{ color: "#000" }}>
                      {item.left}
                    </span>

                    <div className="flex gap-1 sm:gap-2 flex-1 justify-center">
                      {[1, 2, 3, 4, 5, 6, 7].map((v) => {
                        const selected = answers[qi] === v;
                        return (
                          <button key={v} onClick={() => handleAnswer(qi, v)}
                            className={`w-7 h-7 sm:w-10 sm:h-10 rounded border-[3px] border-black flex items-center justify-center font-black text-sm sm:text-base transition-transform ${selected ? 'bg-black text-white transform -translate-y-1 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]' : 'bg-white hover:-translate-y-1 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'}`}
                          >
                            {v}
                          </button>
                        );
                      })}
                    </div>

                    <span className={`text-xs text-left w-24 sm:w-28 flex-shrink-0 font-black uppercase`}
                      style={{ color: "#000" }}>
                      {item.right}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Results */}
          <aside className="w-full lg:w-80 xl:w-96 flex-shrink-0 lg:sticky lg:top-4 space-y-6">
            {/* Progress */}
            <div className="brutal-card p-5 bg-white">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-black uppercase">Progress</span>
                <span className="text-lg font-black bg-black text-white px-2 py-1 transform rotate-2">{answeredCount} / 26</span>
              </div>
              <div className="progress-track" style={{ height: "12px", border: "2px solid #000" }}>
                <div className="progress-fill" style={{ width: `${(answeredCount / 26) * 100}%`, background: "var(--brand-lilac)" }} />
              </div>
            </div>

            {/* Results */}
            <div className="brutal-card p-6 bg-white">
              <h2 className="text-sm font-black uppercase tracking-wider text-center mb-6 border-b-4 border-black pb-1 inline-block w-full">Hasil UEQ</h2>

              {isComplete && results ? (
                <>
                  {/* Bar chart */}
                  <UeqBarChart scaleMeans={results.scaleMeans} />

                  {/* Overall interpretation */}
                  {(() => { const info = getOverallBenchmark(results.overall); return (
                    <div className="mt-6 p-4 border-[3px] border-black text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transform -rotate-1 mb-6" style={{ background: info.bgColor }}>
                      <div className="text-3xl mb-2">{info.emoji}</div>
                      <div className="font-black text-lg uppercase mb-1">{info.label}</div>
                      <div className="text-xs font-bold leading-relaxed">{info.desc}</div>
                      <div className="text-2xl font-black mt-3 bg-white border-2 border-black px-2 py-1 inline-block">{results.overall.toFixed(2)}</div>
                    </div>
                  ); })()}

                  {/* Per-scale table */}
                  <div className="mt-6 space-y-3">
                    {SCALE_ORDER.map((scale) => {
                      const mean = results.scaleMeans[scale];
                      const bm = getBenchmark(mean);
                      const color = SCALE_COLORS[scale];
                      return (
                        <div key={scale} className="flex items-center justify-between p-3 border-2 border-black" style={{ background: color }}>
                          <div className="flex items-center gap-3">
                            <div>
                              <div className="text-xs font-black uppercase">{scale}</div>
                              <div className="text-[10px] font-bold uppercase bg-white px-1 mt-1 inline-block border border-black">{SCALE_EN[scale]}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-black bg-white px-1 border-2 border-black mb-1 inline-block shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">{mean.toFixed(2)}</div>
                            <div className="text-[10px] font-black uppercase text-center">{bm.label}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Pragmatic / Hedonic */}
                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <div className="p-3 text-center border-[3px] border-black bg-[var(--brand-mint)] transform -rotate-1">
                      <div className="text-2xl font-black bg-white border-2 border-black inline-block px-2 mb-2">{results.pragmatic.toFixed(2)}</div>
                      <div className="text-[10px] font-black uppercase">Pragmatic<br/>Quality</div>
                    </div>
                    <div className="p-3 text-center border-[3px] border-black bg-[var(--brand-pink)] transform rotate-1">
                      <div className="text-2xl font-black bg-white border-2 border-black inline-block px-2 mb-2">{results.hedonic.toFixed(2)}</div>
                      <div className="text-[10px] font-black uppercase">Hedonic<br/>Quality</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-6 space-y-3">
                    <button onClick={shareResult} className="btn-primary w-full" style={{ background: "var(--brand-blue)" }}>
                      <div className="flex items-center justify-center gap-2 uppercase">
                        {copied ? "LINK TERSALIN!" : "SALIN LINK HASIL"}
                      </div>
                    </button>
                    <button onClick={resetAll} className="btn-ghost w-full uppercase text-xs font-black">Reset Semua</button>
                  </div>
                </>
              ) : (
                <div className="text-center py-10">
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full border-4 border-black border-dashed flex items-center justify-center bg-slate-100 transform rotate-12">
                    <span className="font-black text-4xl">?</span>
                  </div>
                  <p className="text-sm font-bold">Isi semua 26 item atau import CSV untuk melihat hasil UEQ</p>
                </div>
              )}
            </div>

            {/* UEQ Scale Reference */}
            <div className="brutal-card p-5 bg-[var(--brand-yellow)]">
              <h3 className="text-sm font-black uppercase mb-4 border-b-2 border-black pb-1">Skala UEQ</h3>
              <div className="space-y-3 font-bold text-sm">
                {SCALE_ORDER.map((s) => (
                  <div key={s} className="flex items-center justify-between text-xs">
                    <span className="bg-white border-2 border-black px-2 py-0.5 uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" style={{ background: SCALE_COLORS[s] }}>
                      {s}
                    </span>
                    <span className="uppercase text-[10px]">{SCALE_EN[s]}</span>
                  </div>
                ))}
              </div>
              <div className="mt-5 pt-4 space-y-2 border-t-[3px] border-black">
                <div className="text-[10px] font-black uppercase mb-2">Benchmark Ranges:</div>
                {[
                  { range: "≥ 1.75", label: "Excellent" },
                  { range: "0.72 – 1.74", label: "Good" },
                  { range: "-0.70 – 0.71", label: "Neutral" },
                  { range: "-1.50 – -0.71", label: "Below Avg" },
                  { range: "< -1.50", label: "Bad" },
                ].map((b) => (
                  <div key={b.label} className="flex items-center justify-between text-xs font-bold uppercase">
                    <span className="bg-white border border-black px-1">{b.range}</span>
                    <span>{b.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>

      <div className="p-4 flex justify-center mt-8">
      </div>
      <footer className="relative z-10 text-center py-6 font-bold text-sm border-t-[3px] border-black mt-4 bg-white">© 2025 AcademicTools</footer>
    </div>
  );
}
