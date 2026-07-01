"use client";

import { useState, useMemo, useCallback, useRef } from "react";

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
  "Daya Tarik": "#8b5cf6",
  "Kejelasan":  "#6366f1",
  "Efisiensi":  "#06b6d4",
  "Ketepatan":  "#10b981",
  "Stimulasi":  "#f59e0b",
  "Kebaruan":   "#ec4899",
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
  borderColor: string;
}

function getBenchmark(mean: number): BenchmarkInfo {
  if (mean >= 1.75) return { label: "Sangat Baik (Excellent)", color: "#10b981", bgColor: "rgba(16,185,129,0.1)", borderColor: "rgba(16,185,129,0.3)" };
  if (mean >= 0.72) return { label: "Baik (Good)", color: "#6366f1", bgColor: "rgba(99,102,241,0.1)", borderColor: "rgba(99,102,241,0.3)" };
  if (mean >= -0.7)  return { label: "Netral (Above Average)", color: "#f59e0b", bgColor: "rgba(245,158,11,0.1)", borderColor: "rgba(245,158,11,0.3)" };
  if (mean >= -1.5)  return { label: "Buruk (Below Average)", color: "#ef4444", bgColor: "rgba(239,68,68,0.1)", borderColor: "rgba(239,68,68,0.3)" };
  return { label: "Sangat Buruk (Bad)", color: "#dc2626", bgColor: "rgba(220,38,38,0.1)", borderColor: "rgba(220,38,38,0.3)" };
}

function getOverallBenchmark(mean: number): { label: string; emoji: string; color: string; bgColor: string; borderColor: string; desc: string } {
  if (mean >= 1.75) return { label: "Excellent", emoji: "🌟", color: "#10b981", bgColor: "rgba(16,185,129,0.12)", borderColor: "rgba(16,185,129,0.3)", desc: "Pengalaman pengguna sangat baik di seluruh aspek." };
  if (mean >= 0.72) return { label: "Good", emoji: "👍", color: "#6366f1", bgColor: "rgba(99,102,241,0.12)", borderColor: "rgba(99,102,241,0.3)", desc: "Pengalaman pengguna baik, di atas rata-rata benchmark." };
  if (mean >= -0.7)  return { label: "Neutral", emoji: "✅", color: "#f59e0b", bgColor: "rgba(245,158,11,0.12)", borderColor: "rgba(245,158,11,0.3)", desc: "Pengalaman pengguna cukup — ada ruang perbaikan." };
  if (mean >= -1.5)  return { label: "Below Average", emoji: "⚠️", color: "#ef4444", bgColor: "rgba(239,68,68,0.12)", borderColor: "rgba(239,68,68,0.3)", desc: "Pengalaman pengguna kurang baik, perlu evaluasi." };
  return { label: "Bad", emoji: "❌", color: "#dc2626", bgColor: "rgba(220,38,38,0.12)", borderColor: "rgba(220,38,38,0.3)", desc: "Pengalaman pengguna sangat buruk." };
}

// ─────────────────────────────────────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────────────────────────────────────

function transformItem(rawValue: number, reversed: boolean): number {
  return reversed ? 4 - rawValue : rawValue - 4;
}

// CSV parser (same lightweight parser used across all tools)
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
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" role="img" aria-label="UEQ bar chart">
      <rect width={w} height={h} fill="#050818" rx="12" />
      {/* Grid lines */}
      {[-3, -2, -1, 0, 1, 2, 3].map((v) => (
        <g key={v}>
          <line x1={ml} y1={toY(v)} x2={ml + plotW} y2={toY(v)} stroke={v === 0 ? "rgba(148,163,184,0.3)" : "rgba(148,163,184,0.08)"} strokeWidth={v === 0 ? 1 : 0.5} />
          <text x={ml - 6} y={toY(v) + 3} textAnchor="end" fill="rgba(148,163,184,0.5)" fontSize="9" fontFamily="Inter, sans-serif">{v}</text>
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
            <rect x={x} y={barY} width={barW} height={barH} rx={4} fill={color} opacity={0.85} />
            {/* Value label */}
            <text x={x + barW / 2} y={val >= 0 ? barY - 5 : barY + barH + 11} textAnchor="middle" fill={color} fontSize="9" fontWeight="800" fontFamily="Inter, sans-serif">
              {val.toFixed(2)}
            </text>
            {/* Scale label */}
            <text x={x + barW / 2} y={h - 6} textAnchor="middle" fill="rgba(148,163,184,0.6)" fontSize="7" fontFamily="Inter, sans-serif">
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
    <div className="min-h-screen flex flex-col" style={{ background: "#050818" }}
      onDragOver={(e) => { if (e.dataTransfer.types.includes("Files")) { e.preventDefault(); setIsDragOver(true); } }}
      onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragOver(false); }}
      onDrop={handleDrop}>

      <input ref={fileInputRef} type="file" accept=".csv" className="sr-only" onChange={handleFileInput} />

      {/* Drag overlay */}
      {isDragOver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(5,8,24,0.92)", backdropFilter: "blur(12px)" }}>
          <div className="text-center px-16 py-12 rounded-3xl" style={{ border: "2px dashed rgba(6,182,212,0.7)", background: "rgba(6,182,212,0.08)" }}>
            <div className="text-7xl mb-5">🎯</div>
            <h2 className="text-2xl font-extrabold mb-2" style={{ color: "#f1f5f9" }}>Lepaskan file CSV di sini</h2>
            <p className="text-sm" style={{ color: "#94a3b8" }}>Data UEQ akan otomatis diproses</p>
          </div>
        </div>
      )}

      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl animate-float" style={{ background: "rgba(6,182,212,0.07)" }} />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full blur-3xl animate-float-2" style={{ background: "rgba(139,92,246,0.06)" }} />
      </div>

      <div className="ad-placeholder w-full" style={{ height: "90px" }} role="complementary"><span>Advertisement · 728 × 90</span></div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-5 py-4 max-w-5xl mx-auto w-full">
        <a href="/" className="flex items-center gap-2 text-sm transition-colors" style={{ color: "#64748b" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#f1f5f9")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#64748b")}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          AcademicTools
        </a>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #06b6d4, #8b5cf6)" }}>
          <span className="text-white text-xs font-black select-none">A</span>
        </div>
      </nav>

      <main className="relative z-10 max-w-5xl mx-auto w-full px-4 pb-20 flex-1">
        <header className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-4"
            style={{ background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.22)", color: "#22d3ee" }}>
            User Experience Questionnaire · 26 Item · 6 Skala
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-3 tracking-tight" style={{ color: "#f1f5f9" }}>
            Kalkulator <span style={{ background: "linear-gradient(135deg, #06b6d4, #8b5cf6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>UEQ</span>
          </h1>
          <p className="max-w-lg mx-auto text-sm sm:text-base leading-relaxed" style={{ color: "#64748b" }}>
            Isi 26 pasangan kata sifat atau <strong style={{ color: "#94a3b8" }}>import CSV</strong>. Skor dihitung otomatis.
          </p>
        </header>

        {/* Import zone */}
        <div className="mb-6">
          {importError && (
            <div className="glass-card rounded-2xl p-4 mb-3" style={{ borderColor: "rgba(239,68,68,0.35)", background: "rgba(239,68,68,0.05)" }}>
              <div className="flex items-start gap-3">
                <span className="text-lg flex-shrink-0">❌</span>
                <p className="text-xs leading-relaxed whitespace-pre-line" style={{ color: "#94a3b8" }}>{importError}</p>
                <button onClick={() => setImportError(null)} className="btn-ghost ml-auto text-xs px-2 py-1 rounded-lg">✕</button>
              </div>
            </div>
          )}
          {importInfo && (
            <div className="glass-card rounded-2xl p-3 mb-3" style={{ borderColor: "rgba(16,185,129,0.35)", background: "rgba(16,185,129,0.05)" }}>
              <div className="flex items-center gap-2"><span>✅</span><p className="text-xs" style={{ color: "#34d399" }}>{importInfo}</p>
                <button onClick={() => { setImportInfo(null); }} className="btn-ghost ml-auto text-xs px-2 py-1 rounded-lg">✕</button>
              </div>
            </div>
          )}
          <button onClick={() => fileInputRef.current?.click()}
            className="w-full rounded-2xl py-3 px-6 text-left transition-all duration-200 flex items-center gap-4"
            style={{ background: "rgba(6,182,212,0.05)", border: "1.5px dashed rgba(6,182,212,0.28)" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(6,182,212,0.09)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(6,182,212,0.05)"; }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(6,182,212,0.12)" }}>
              <svg className="w-4 h-4" fill="none" stroke="#22d3ee" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold" style={{ color: "#67e8f9" }}>Import CSV dari Google Forms</p>
              <p className="text-xs mt-0.5" style={{ color: "#475569" }}>Drag &amp; drop atau klik · 26 kolom skala 1–7</p>
            </div>
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Left: Items */}
          <div className="flex-1 min-w-0 space-y-2.5">
            {UEQ_ITEMS.map((item, qi) => {
              const answered = answers[qi] !== null;
              const color = SCALE_COLORS[item.scale];
              return (
                <div key={qi} id={`ueq-item-${qi + 1}`}
                  className="glass-card rounded-xl p-4 transition-all duration-200"
                  style={{ animation: `fadeInUp 0.3s ease-out ${qi * 0.02}s both`, borderColor: answered ? `${color}55` : undefined }}>

                  {/* Scale & number */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ background: answered ? color : "rgba(30,41,100,0.7)", color: answered ? "white" : "#475569" }}>{qi + 1}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: `${color}18`, color, border: `1px solid ${color}30` }}>{item.scale}</span>
                  </div>

                  {/* Semantic differential slider */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-right w-28 sm:w-32 flex-shrink-0 font-medium"
                      style={{ color: item.reversed ? "#6ee7b7" : "#f87171", fontSize: "11px" }}>
                      {item.left}
                    </span>

                    <div className="flex gap-1 flex-1 justify-center">
                      {[1, 2, 3, 4, 5, 6, 7].map((v) => {
                        const selected = answers[qi] === v;
                        return (
                          <button key={v} onClick={() => handleAnswer(qi, v)}
                            className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center font-bold text-xs transition-all duration-150"
                            style={{
                              background: selected ? color : "rgba(15,23,70,0.5)",
                              border: `1px solid ${selected ? "transparent" : "rgba(99,102,241,0.15)"}`,
                              color: selected ? "white" : "#475569",
                              boxShadow: selected ? `0 3px 12px ${color}55` : "none",
                              transform: selected ? "scale(1.1)" : "scale(1)",
                            }}>
                            {v}
                          </button>
                        );
                      })}
                    </div>

                    <span className="text-xs text-left w-28 sm:w-32 flex-shrink-0 font-medium"
                      style={{ color: item.reversed ? "#f87171" : "#6ee7b7", fontSize: "11px" }}>
                      {item.right}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Results */}
          <aside className="w-full lg:w-80 xl:w-96 flex-shrink-0 lg:sticky lg:top-4 space-y-4">
            {/* Progress */}
            <div className="glass-card rounded-2xl p-5">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#475569" }}>Progress</span>
                <span className="text-sm font-bold" style={{ color: "#22d3ee" }}>{answeredCount} / 26</span>
              </div>
              <div className="progress-track" style={{ height: "6px" }}>
                <div className="progress-fill" style={{ width: `${(answeredCount / 26) * 100}%`, background: "linear-gradient(90deg, #06b6d4, #8b5cf6)" }} />
              </div>
            </div>

            {/* Results */}
            <div className="glass-card rounded-2xl p-5">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-center mb-4" style={{ color: "#475569" }}>Hasil UEQ</h2>

              {isComplete && results ? (
                <>
                  {/* Bar chart */}
                  <UeqBarChart scaleMeans={results.scaleMeans} />

                  {/* Overall interpretation */}
                  {(() => { const info = getOverallBenchmark(results.overall); return (
                    <div className="mt-4 p-4 rounded-xl text-center" style={{ background: info.bgColor, border: `1px solid ${info.borderColor}` }}>
                      <div className="text-xl mb-1">{info.emoji}</div>
                      <div className="font-bold text-sm" style={{ color: info.color }}>{info.label}</div>
                      <div className="text-xs mt-1" style={{ color: "#64748b" }}>{info.desc}</div>
                      <div className="text-lg font-black mt-2" style={{ color: info.color }}>{results.overall.toFixed(2)}</div>
                    </div>
                  ); })()}

                  {/* Per-scale table */}
                  <div className="mt-4 space-y-2">
                    {SCALE_ORDER.map((scale) => {
                      const mean = results.scaleMeans[scale];
                      const bm = getBenchmark(mean);
                      const color = SCALE_COLORS[scale];
                      return (
                        <div key={scale} className="flex items-center justify-between p-2.5 rounded-xl" style={{ background: `${color}0a`, border: `1px solid ${color}20` }}>
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
                            <div>
                              <div className="text-xs font-bold" style={{ color }}>{scale}</div>
                              <div className="text-[10px]" style={{ color: "#475569" }}>{SCALE_EN[scale]}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-black" style={{ color }}>{mean.toFixed(2)}</div>
                            <div className="text-[10px]" style={{ color: bm.color }}>{bm.label.split("(")[0].trim()}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Pragmatic / Hedonic */}
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <div className="p-3 rounded-xl text-center" style={{ background: "rgba(99,102,241,0.07)", border: "1px solid rgba(99,102,241,0.15)" }}>
                      <div className="text-lg font-black" style={{ color: "#818cf8" }}>{results.pragmatic.toFixed(2)}</div>
                      <div className="text-[10px] mt-0.5" style={{ color: "#475569" }}>Pragmatic Quality</div>
                    </div>
                    <div className="p-3 rounded-xl text-center" style={{ background: "rgba(236,72,153,0.07)", border: "1px solid rgba(236,72,153,0.15)" }}>
                      <div className="text-lg font-black" style={{ color: "#f472b6" }}>{results.hedonic.toFixed(2)}</div>
                      <div className="text-[10px] mt-0.5" style={{ color: "#475569" }}>Hedonic Quality</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 space-y-2">
                    <button onClick={shareResult} className="btn-primary w-full py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2"
                      style={{ background: "linear-gradient(135deg, #06b6d4, #8b5cf6)" }}>
                      {copied ? (
                        <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Link Tersalin!</>
                      ) : (
                        <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>Salin Link Hasil</>
                      )}
                    </button>
                    <button onClick={resetAll} className="btn-ghost w-full py-2 text-xs">Reset semua jawaban</button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center animate-pulseRing"
                    style={{ background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.2)" }}>
                    <span className="font-black text-3xl" style={{ color: "rgba(6,182,212,0.4)" }}>?</span>
                  </div>
                  <p className="text-xs" style={{ color: "#334155" }}>Isi semua 26 item atau import CSV<br />untuk melihat hasil UEQ</p>
                </div>
              )}
            </div>

            <div className="ad-placeholder rounded-2xl" style={{ height: "120px" }} role="complementary"><span>Advertisement · 300 × 250</span></div>

            {/* UEQ Scale Reference */}
            <div className="glass-card rounded-2xl p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#475569" }}>Skala UEQ</h3>
              <div className="space-y-1.5">
                {SCALE_ORDER.map((s) => (
                  <div key={s} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: SCALE_COLORS[s] }} />
                      <span style={{ color: "#94a3b8" }}>{s}</span>
                    </div>
                    <span style={{ color: "#475569" }}>{SCALE_EN[s]}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 space-y-1" style={{ borderTop: "1px solid rgba(99,102,241,0.12)" }}>
                <div className="text-[10px]" style={{ color: "#475569" }}>Benchmark ranges (per skala):</div>
                {[
                  { range: "≥ 1.75", label: "Excellent", color: "#10b981" },
                  { range: "0.72 – 1.74", label: "Good", color: "#6366f1" },
                  { range: "-0.70 – 0.71", label: "Neutral", color: "#f59e0b" },
                  { range: "-1.50 – -0.71", label: "Below Average", color: "#ef4444" },
                  { range: "< -1.50", label: "Bad", color: "#dc2626" },
                ].map((b) => (
                  <div key={b.label} className="flex items-center justify-between text-[10px]">
                    <span style={{ color: "#475569" }}>{b.range}</span>
                    <span style={{ color: b.color }}>{b.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>

      <div className="ad-placeholder w-full" style={{ height: "90px" }} role="complementary"><span>Advertisement · 728 × 90</span></div>
      <footer className="relative z-10 text-center py-4 text-xs" style={{ color: "#1e293b" }}>© 2025 AcademicTools · Kalkulator UEQ gratis untuk mahasiswa Indonesia</footer>
    </div>
  );
}
