"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";

// ─────────────────────────────────────────────────────────────────────────────
//  Constants
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_QUESTIONS: string[] = [
  "Saya pikir akan sering menggunakan sistem ini.",
  "Saya merasa sistem ini tidak perlu dibuat serumit ini.",
  "Saya pikir sistem ini mudah untuk digunakan.",
  "Saya membutuhkan bantuan orang teknis untuk dapat menggunakan sistem ini.",
  "Saya merasa berbagai fungsi dalam sistem ini terintegrasi dengan baik.",
  "Saya pikir ada terlalu banyak hal yang tidak konsisten pada sistem ini.",
  "Saya bayangkan kebanyakan orang akan belajar menggunakan sistem ini dengan sangat cepat.",
  "Saya merasa sistem ini sangat canggung untuk digunakan.",
  "Saya merasa sangat percaya diri menggunakan sistem ini.",
  "Saya perlu belajar banyak hal sebelum bisa menggunakan sistem ini.",
];

const SCALE_LABELS: Record<number, string> = {
  1: "Sangat Tidak Setuju",
  2: "Tidak Setuju",
  3: "Netral",
  4: "Setuju",
  5: "Sangat Setuju",
};

/** Text → number mapping for Likert cells that store label strings. */
const LIKERT_TEXT_MAP: Record<string, number> = {
  "sangat tidak setuju": 1, "strongly disagree": 1, "sts": 1,
  "tidak setuju": 2, "disagree": 2, "ts": 2,
  "netral": 3, "neutral": 3, "ragu-ragu": 3, "ragu ragu": 3, "n": 3, "cukup": 3,
  "setuju": 4, "agree": 4, "s": 4,
  "sangat setuju": 5, "strongly agree": 5, "ss": 5,
};

// ─────────────────────────────────────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────────────────────────────────────

interface Interpretation {
  label: string;
  emoji: string;
  color: string;
  bgColor: string;
  borderColor: string;
  grade: string;
  desc: string;
}

interface RespondentResult {
  id: number;
  answers: number[];
  score: number;
}

interface ImportResult {
  filename: string;
  respondents: RespondentResult[];
  averageScore: number;
  averageAnswers: number[];
  detectedQuestions: string[];
  warnings: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
//  Pure helpers
// ─────────────────────────────────────────────────────────────────────────────

function getInterpretation(score: number): Interpretation {
  if (score >= 85.5)
    return { label: "Excellent", emoji: "🌟", color: "#10b981", bgColor: "rgba(16,185,129,0.12)", borderColor: "rgba(16,185,129,0.3)", grade: "A", desc: "Sistem sangat mudah digunakan dan memuaskan pengguna sepenuhnya." };
  if (score >= 72.5)
    return { label: "Good", emoji: "👍", color: "#6366f1", bgColor: "rgba(99,102,241,0.12)", borderColor: "rgba(99,102,241,0.3)", grade: "B", desc: "Sistem memiliki kegunaan yang baik, di atas rata-rata." };
  if (score >= 52.5)
    return { label: "OK / Acceptable", emoji: "✅", color: "#f59e0b", bgColor: "rgba(245,158,11,0.12)", borderColor: "rgba(245,158,11,0.3)", grade: "C", desc: "Sistem cukup dapat digunakan, namun ada ruang untuk perbaikan." };
  if (score >= 35.5)
    return { label: "Poor", emoji: "⚠️", color: "#ef4444", bgColor: "rgba(239,68,68,0.12)", borderColor: "rgba(239,68,68,0.3)", grade: "D", desc: "Sistem kurang dapat digunakan dan perlu banyak perbaikan." };
  return { label: "Awful / Not Acceptable", emoji: "❌", color: "#dc2626", bgColor: "rgba(220,38,38,0.12)", borderColor: "rgba(220,38,38,0.3)", grade: "F", desc: "Sistem sangat sulit digunakan dan tidak dapat diterima pengguna." };
}

function getScoreColor(score: number): string {
  if (score >= 85.5) return "#10b981";
  if (score >= 72.5) return "#6366f1";
  if (score >= 52.5) return "#f59e0b";
  if (score >= 35.5) return "#ef4444";
  return "#dc2626";
}

function calcSUS(answers: number[]): number {
  let total = 0;
  answers.forEach((a, i) => { total += (i + 1) % 2 !== 0 ? a - 1 : 5 - a; });
  return total * 2.5;
}

// ─────────────────────────────────────────────────────────────────────────────
//  CSV parsing
// ─────────────────────────────────────────────────────────────────────────────

function parseLikertCell(cell: string): number | null {
  const t = cell.trim();
  if (!t) return null;
  // Strict single-digit integer 1-5 (with optional ".0")
  if (/^[1-5](\.0+)?$/.test(t)) return parseInt(t);
  // Text label
  return LIKERT_TEXT_MAP[t.toLowerCase().replace(/\s+/g, " ")] ?? null;
}

function parseCSVRows(text: string): string[][] {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .filter((l) => l.trim())
    .map((line) => {
      const cells: string[] = [];
      let cur = "";
      let inQ = false;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
          if (inQ && line[i + 1] === '"') { cur += '"'; i++; }
          else inQ = !inQ;
        } else if (ch === "," && !inQ) { cells.push(cur.trim()); cur = ""; }
        else cur += ch;
      }
      cells.push(cur.trim());
      return cells;
    });
}

function processCSVImport(text: string, filename: string): ImportResult {
  const rows = parseCSVRows(text);
  if (rows.length < 2) throw new Error("File CSV kosong atau tidak memiliki data.");

  const header = rows[0];
  const dataRows = rows.slice(1).filter((r) => r.some((c) => c.trim()));
  if (dataRows.length === 0) throw new Error("Tidak ada baris data responden ditemukan.");

  // Detect columns where ≥ 60 % of values are Likert 1-5
  const likertCols: number[] = [];
  for (let col = 0; col < header.length; col++) {
    const parsed = dataRows.map((r) => parseLikertCell(r[col] ?? ""));
    const valid = parsed.filter((v) => v !== null).length;
    if (valid / dataRows.length >= 0.6) likertCols.push(col);
  }

  if (likertCols.length < 10) {
    throw new Error(
      `Hanya ${likertCols.length} kolom jawaban Likert (1–5) terdeteksi — dibutuhkan minimal 10.\n` +
      `Pastikan file berisi data kuesioner SUS dari Google Forms, ` +
      `dan diunduh sebagai CSV (Google Sheets → File → Unduh → Comma Separated Values).`
    );
  }

  const warnings: string[] = [];
  if (likertCols.length > 10)
    warnings.push(`${likertCols.length} kolom Likert ditemukan — hanya 10 pertama digunakan.`);

  const susCols = likertCols.slice(0, 10);

  // Extract question text from header row
  const detectedQuestions = susCols.map((ci, qi) => {
    const raw = header[ci] ?? "";
    const cleaned = raw
      .replace(/^\[?\s*[Pp]?\s*\d+\s*[\]\.:\)]\s*/g, "") // strip leading numbering
      .replace(/^(Pertanyaan|Question|Pernyataan)\s*\d+\s*[:\.]\s*/gi, "")
      .replace(/\[.*?\]/g, "") // strip inline notes like [1=STS 5=SS]
      .trim();
    return cleaned.length > 4 ? cleaned : DEFAULT_QUESTIONS[qi];
  });

  // Process each respondent
  const respondents: RespondentResult[] = dataRows.map((row, ri) => {
    const answers = susCols.map((ci) => parseLikertCell(row[ci] ?? "") ?? 3);
    return { id: ri + 1, answers, score: calcSUS(answers) };
  });

  // Compute per-question averages (rounded to nearest integer for radio buttons)
  const averageAnswers = Array.from({ length: 10 }, (_, qi) => {
    const avg = respondents.reduce((s, r) => s + r.answers[qi], 0) / respondents.length;
    return Math.round(avg);
  });

  const averageScore = respondents.reduce((s, r) => s + r.score, 0) / respondents.length;

  return { filename, respondents, averageScore, averageAnswers, detectedQuestions, warnings };
}

// ─────────────────────────────────────────────────────────────────────────────
//  SVG Gauge (unchanged except unused-var cleanup)
// ─────────────────────────────────────────────────────────────────────────────

interface GaugeProps {
  score: number;
  svgRef: React.RefObject<SVGSVGElement | null>;
}

function SUSGauge({ score, svgRef }: GaugeProps) {
  const cx = 160, cy = 160, r = 118, sw = 17;

  const getPoint = (s: number) => {
    const rad = ((180 - (s / 100) * 180) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy - r * Math.sin(rad) };
  };

  const left = getPoint(0);
  const right = getPoint(100);
  const p51 = getPoint(51);
  const p68 = getPoint(68);

  const arcSeg = (a: { x: number; y: number }, b: { x: number; y: number }) =>
    `M ${a.x.toFixed(2)} ${a.y.toFixed(2)} A ${r} ${r} 0 0 0 ${b.x.toFixed(2)} ${b.y.toFixed(2)}`;

  let scorePath = "";
  if (score > 0) {
    if (score >= 100) {
      const top = getPoint(50);
      scorePath = `M ${left.x.toFixed(2)} ${left.y.toFixed(2)} A ${r} ${r} 0 0 0 ${top.x.toFixed(2)} ${top.y.toFixed(2)} A ${r} ${r} 0 0 0 ${right.x.toFixed(2)} ${right.y.toFixed(2)}`;
    } else {
      const p = getPoint(score);
      scorePath = `M ${left.x.toFixed(2)} ${left.y.toFixed(2)} A ${r} ${r} 0 0 0 ${p.x.toFixed(2)} ${p.y.toFixed(2)}`;
    }
  }

  const indicatorPt = score >= 100 ? right : score > 0 ? getPoint(score) : null;
  const mainColor = getScoreColor(score);
  const interp = getInterpretation(score);

  return (
    <svg ref={svgRef} viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg" className="w-full" role="img" aria-label={`SUS Gauge: ${Math.round(score)} / 100`}>
      <defs>
        <filter id="glow-filter" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="dot-glow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <rect width="320" height="200" fill="#050818" rx="16" />
      <path d={arcSeg(left, p51)} fill="none" stroke="#ef4444" strokeWidth={sw} strokeLinecap="round" opacity="0.18" />
      <path d={arcSeg(p51, p68)} fill="none" stroke="#f59e0b" strokeWidth={sw} opacity="0.18" />
      <path d={arcSeg(p68, right)} fill="none" stroke="#10b981" strokeWidth={sw} strokeLinecap="round" opacity="0.18" />
      <path d={`M ${left.x.toFixed(2)} ${left.y.toFixed(2)} A ${r} ${r} 0 0 0 ${right.x.toFixed(2)} ${right.y.toFixed(2)}`} fill="none" stroke="rgba(10,15,50,0.55)" strokeWidth={sw} strokeLinecap="round" />
      {score > 0 && <path d={scorePath} fill="none" stroke={mainColor} strokeWidth={sw} strokeLinecap="round" filter="url(#glow-filter)" />}
      {indicatorPt && <circle cx={indicatorPt.x} cy={indicatorPt.y} r="11" fill={mainColor} filter="url(#dot-glow)" />}
      {[0, 25, 50, 75, 100].map((tick) => {
        const angleDeg = 180 - (tick / 100) * 180;
        const rad = (angleDeg * Math.PI) / 180;
        const ix = cx + (r - sw / 2 - 4) * Math.cos(rad), iy = cy - (r - sw / 2 - 4) * Math.sin(rad);
        const ox = cx + (r + sw / 2 + 4) * Math.cos(rad), oy = cy - (r + sw / 2 + 4) * Math.sin(rad);
        const lx = cx + (r + sw / 2 + 16) * Math.cos(rad), ly = cy - (r + sw / 2 + 16) * Math.sin(rad);
        return (
          <g key={tick}>
            <line x1={ix} y1={iy} x2={ox} y2={oy} stroke="rgba(99,102,241,0.4)" strokeWidth="2" />
            <text x={lx} y={ly} textAnchor="middle" dominantBaseline="central" fill="rgba(148,163,184,0.6)" fontSize="9" fontFamily="Inter, sans-serif">{tick}</text>
          </g>
        );
      })}
      <text x={cx} y={cy - 12} textAnchor="middle" fill="white" fontSize="54" fontWeight="900" fontFamily="Inter, sans-serif" letterSpacing="-2">{Math.round(score)}</text>
      <text x={cx} y={cy + 16} textAnchor="middle" fill="rgba(148,163,184,0.65)" fontSize="12" fontFamily="Inter, sans-serif">/ 100</text>
      <rect x={cx - 17} y={cy + 28} width="34" height="22" rx="6" fill={`${mainColor}22`} />
      <rect x={cx - 17} y={cy + 28} width="34" height="22" rx="6" fill="none" stroke={`${mainColor}55`} strokeWidth="1" />
      <text x={cx} y={cy + 43} textAnchor="middle" fill={mainColor} fontSize="12" fontWeight="800" fontFamily="Inter, sans-serif">{interp.grade}</text>
      <text x={left.x + 4} y="192" fill="rgba(239,68,68,0.55)" fontSize="8" fontFamily="Inter, sans-serif" textAnchor="start">Buruk</text>
      <text x={cx} y="188" fill="rgba(245,158,11,0.55)" fontSize="8" fontFamily="Inter, sans-serif" textAnchor="middle">Marginal</text>
      <text x={right.x - 4} y="192" fill="rgba(16,185,129,0.55)" fontSize="8" fontFamily="Inter, sans-serif" textAnchor="end">Baik</text>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Main Component
// ─────────────────────────────────────────────────────────────────────────────

export default function SusCalculator() {
  const searchParams = useSearchParams();
  const svgRef = useRef<SVGSVGElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Core state ────────────────────────────────
  const [questions, setQuestions] = useState<string[]>([...DEFAULT_QUESTIONS]);
  const [answers, setAnswers] = useState<(number | null)[]>(Array(10).fill(null));

  // ── UI state ──────────────────────────────────
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  /** Currently viewed respondent: 'avg' = average answers, or a 1-based id */
  const [viewRespondent, setViewRespondent] = useState<"avg" | number>("avg");
  const [copied, setCopied] = useState(false);

  // ── URL restore ───────────────────────────────
  useEffect(() => {
    const data = searchParams.get("data");
    if (!data) return;
    try {
      const decoded: unknown = JSON.parse(atob(data));
      if (Array.isArray(decoded) && decoded.length === 10 && decoded.every((v) => v === null || (typeof v === "number" && v >= 1 && v <= 5))) {
        setAnswers(decoded as (number | null)[]);
      }
    } catch { /* ignore */ }
  }, [searchParams]);

  // ── Switch respondent view ─────────────────────
  useEffect(() => {
    if (!importResult) return;
    if (viewRespondent === "avg") {
      setAnswers([...importResult.averageAnswers] as (number | null)[]);
    } else {
      const r = importResult.respondents.find((r) => r.id === viewRespondent);
      if (r) setAnswers([...r.answers] as (number | null)[]);
    }
  }, [viewRespondent, importResult]);

  // ── Calculations ──────────────────────────────
  const score: number | null = answers.some((a) => a === null) ? null : calcSUS(answers as number[]);
  const answeredCount = answers.filter((a) => a !== null).length;
  const isComplete = answeredCount === 10;
  const interpretation = score !== null ? getInterpretation(score) : null;

  // ── File processing ───────────────────────────
  const processFile = useCallback(async (file: File) => {
    setImportError(null);
    setIsImporting(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (ext === "xlsx" || ext === "xls" || ext === "ods") {
        throw new Error(
          `Format .${ext} tidak didukung langsung.\n` +
          `Di Google Sheets: klik File → Unduh → Nilai Terpisah Koma (.csv), lalu drag file CSV-nya ke sini.`
        );
      }
      if (ext !== "csv") throw new Error(`Format .${ext} tidak dikenali. Gunakan file .csv dari Google Sheets.`);

      const text = await file.text();
      const result = processCSVImport(text, file.name);

      setImportResult(result);
      setViewRespondent("avg");
      setAnswers([...result.averageAnswers] as (number | null)[]);
      setQuestions(result.detectedQuestions);
      setImportError(null);
    } catch (e) {
      setImportError(e instanceof Error ? e.message : "Gagal membaca file.");
    } finally {
      setIsImporting(false);
    }
  }, []);

  // ── Drag & drop handlers ──────────────────────
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    if (e.dataTransfer.types.includes("Files")) { e.preventDefault(); setIsDragOver(true); }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    // Only clear when leaving the root element (not a child)
    if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) await processFile(file);
  }, [processFile]);

  const handleFileInput = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await processFile(file);
    e.target.value = "";
  }, [processFile]);

  // ── Other handlers ────────────────────────────
  const handleAnswer = (qi: number, value: number) => {
    setAnswers((prev) => { const n = [...prev]; n[qi] = value; return n; });
  };

  const updateQuestion = (qi: number, text: string) => {
    setQuestions((prev) => { const n = [...prev]; n[qi] = text; return n; });
  };

  const shareResult = async () => {
    const encoded = btoa(JSON.stringify(answers));
    const url = new URL(window.location.href);
    url.searchParams.set("data", encoded);
    window.history.replaceState(null, "", url.toString());
    try { await navigator.clipboard.writeText(url.toString()); } catch { /* ok */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const downloadSVG = () => {
    const el = svgRef.current;
    if (!el || !isComplete) return;
    const blob = new Blob([new XMLSerializer().serializeToString(el)], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sus-score-${Math.round(score!)}.svg`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const resetAll = () => {
    setAnswers(Array(10).fill(null));
    setQuestions([...DEFAULT_QUESTIONS]);
    setImportResult(null);
    setImportError(null);
    setViewRespondent("avg");
    const url = new URL(window.location.href);
    url.searchParams.delete("data");
    window.history.replaceState(null, "", url.toString());
  };

  const clearImport = () => {
    setImportResult(null);
    setImportError(null);
    setViewRespondent("avg");
  };

  // ── Render ────────────────────────────────────

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#050818" }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        className="sr-only"
        onChange={handleFileInput}
        aria-label="Import file CSV"
      />

      {/* ── Full-page drag overlay ── */}
      {isDragOver && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(5,8,24,0.92)", backdropFilter: "blur(12px)" }}
        >
          <div
            className="text-center px-16 py-12 rounded-3xl"
            style={{
              border: "2px dashed rgba(99,102,241,0.7)",
              background: "rgba(99,102,241,0.08)",
              animation: "fadeInUp 0.25s ease-out both",
            }}
          >
            <div className="text-7xl mb-5">📊</div>
            <h2 className="text-2xl font-extrabold mb-2" style={{ color: "#f1f5f9" }}>
              Lepaskan file CSV di sini
            </h2>
            <p className="text-sm" style={{ color: "#94a3b8" }}>
              Data Google Forms akan otomatis diproses
            </p>
          </div>
        </div>
      )}

      {/* Ambient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute top-0 left-1/3 w-96 h-96 rounded-full blur-3xl animate-float" style={{ background: "rgba(99,102,241,0.09)" }} />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-3xl animate-float-2" style={{ background: "rgba(139,92,246,0.07)" }} />
      </div>

      {/* Header Ad */}
      <div className="ad-placeholder w-full" style={{ height: "90px" }} role="complementary" aria-label="Ad Space">
        <span>Advertisement · 728 × 90</span>
      </div>

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-5 py-4 max-w-5xl mx-auto w-full">
        <a href="/" className="flex items-center gap-2 text-sm transition-colors" style={{ color: "#64748b" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#f1f5f9")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#64748b")}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          AcademicTools
        </a>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
          <span className="text-white text-xs font-black select-none">A</span>
        </div>
      </nav>

      {/* Main */}
      <main className="relative z-10 max-w-5xl mx-auto w-full px-4 pb-20 flex-1">
        {/* Page header */}
        <header className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-4"
            style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.22)", color: "#818cf8" }}>
            System Usability Scale · Standar ISO 9241
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-3 tracking-tight" style={{ color: "#f1f5f9" }}>
            Kalkulator <span className="gradient-text">SUS</span>
          </h1>
          <p className="max-w-lg mx-auto text-sm sm:text-base leading-relaxed" style={{ color: "#64748b" }}>
            Isi 10 pertanyaan secara manual atau <strong style={{ color: "#94a3b8" }}>import langsung dari spreadsheet Google Forms</strong>.
          </p>
        </header>

        {/* ── Import Banner ── */}
        <div className="mb-6">
          {/* Success banner (after import) */}
          {importResult && (
            <div className="glass-card rounded-2xl p-4 mb-3"
              style={{ borderColor: "rgba(16,185,129,0.35)", background: "rgba(16,185,129,0.05)" }}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(16,185,129,0.15)" }}>
                    <span className="text-lg">✅</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: "#34d399" }}>
                      {importResult.filename}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "#64748b" }}>
                      {importResult.respondents.length} responden · Rata-rata skor:{" "}
                      <strong style={{ color: "#94a3b8" }}>{importResult.averageScore.toFixed(1)}</strong>
                      {importResult.warnings.length > 0 && (
                        <span style={{ color: "#f59e0b" }}> · ⚠ {importResult.warnings[0]}</span>
                      )}
                    </p>
                  </div>
                </div>
                <button onClick={clearImport} className="btn-ghost text-xs flex-shrink-0 px-2 py-1 rounded-lg"
                  style={{ fontSize: "11px" }}>
                  Hapus Import
                </button>
              </div>
            </div>
          )}

          {/* Error banner */}
          {importError && (
            <div className="glass-card rounded-2xl p-4 mb-3"
              style={{ borderColor: "rgba(239,68,68,0.35)", background: "rgba(239,68,68,0.05)" }}>
              <div className="flex items-start gap-3">
                <span className="text-lg flex-shrink-0">❌</span>
                <div>
                  <p className="text-sm font-semibold mb-1" style={{ color: "#f87171" }}>Gagal membaca file</p>
                  <p className="text-xs leading-relaxed whitespace-pre-line" style={{ color: "#94a3b8" }}>{importError}</p>
                </div>
                <button onClick={() => setImportError(null)} className="btn-ghost ml-auto flex-shrink-0 text-xs px-2 py-1 rounded-lg">✕</button>
              </div>
            </div>
          )}

          {/* Drop zone / import prompt */}
          <button
            id="btn-import-csv"
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            className="w-full rounded-2xl py-4 px-6 text-left transition-all duration-200 flex items-center gap-4"
            style={{
              background: "rgba(99,102,241,0.05)",
              border: "1.5px dashed rgba(99,102,241,0.28)",
              cursor: isImporting ? "wait" : "pointer",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(99,102,241,0.09)";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(99,102,241,0.5)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(99,102,241,0.05)";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(99,102,241,0.28)";
            }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(99,102,241,0.12)" }}>
              {isImporting ? (
                <div className="w-5 h-5 rounded-full border-2 animate-spin"
                  style={{ borderColor: "rgba(99,102,241,0.4)", borderTopColor: "#818cf8" }} />
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="#818cf8" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold" style={{ color: "#a5b4fc" }}>
                {isImporting ? "Memproses file…" : "Import dari Google Forms Spreadsheet"}
              </p>
              <p className="text-xs mt-0.5" style={{ color: "#475569" }}>
                Seret &amp; lepas file .csv ke halaman ini, atau klik untuk memilih file
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 flex-shrink-0">
              <span className="text-xs px-2 py-1 rounded-full" style={{ background: "rgba(99,102,241,0.12)", color: "#818cf8" }}>CSV</span>
              <span className="text-xs" style={{ color: "#334155" }}>dari Google Sheets</span>
            </div>
          </button>
        </div>

        {/* ── Main Grid: Questions | Results ── */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* ─── Left: Questions Panel ─── */}
          <div className="flex-1 min-w-0">
            {/* Questions toolbar */}
            <div className="flex items-center justify-between mb-4 gap-3">
              <div>
                <h2 className="text-sm font-bold" style={{ color: "#94a3b8" }}>
                  Pertanyaan Kuesioner SUS
                </h2>
                <p className="text-xs mt-0.5" style={{ color: "#475569" }}>
                  {isEditMode ? "Klik teks pertanyaan untuk mengedit" : "Aktifkan Edit Mode untuk mengubah teks"}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {isEditMode && (
                  <button
                    id="btn-reset-questions"
                    onClick={() => setQuestions([...DEFAULT_QUESTIONS])}
                    className="btn-secondary text-xs py-1.5 px-3 rounded-lg"
                    title="Kembalikan ke pertanyaan SUS default"
                  >
                    Reset Default
                  </button>
                )}
                <button
                  id="btn-toggle-edit"
                  onClick={() => setIsEditMode((v) => !v)}
                  className="flex items-center gap-1.5 text-xs py-1.5 px-3 rounded-lg font-semibold transition-all duration-200"
                  style={{
                    background: isEditMode ? "rgba(99,102,241,0.2)" : "rgba(99,102,241,0.08)",
                    border: `1px solid ${isEditMode ? "rgba(99,102,241,0.5)" : "rgba(99,102,241,0.2)"}`,
                    color: isEditMode ? "#a5b4fc" : "#64748b",
                  }}
                >
                  {isEditMode ? (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Selesai Edit
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit Pertanyaan
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Question cards */}
            <div className="space-y-3">
              {questions.map((question, qi) => {
                const isOdd = (qi + 1) % 2 !== 0;
                const answered = answers[qi] !== null;

                return (
                  <div
                    key={qi}
                    id={`question-${qi + 1}`}
                    className="glass-card rounded-2xl p-5 transition-all duration-200"
                    style={{
                      animation: `fadeInUp 0.4s ease-out ${qi * 0.03}s both`,
                      borderColor: answered ? "rgba(99,102,241,0.35)" : undefined,
                    }}
                  >
                    {/* Question header row */}
                    <div className="flex items-start gap-3 mb-4">
                      {/* Number / check badge */}
                      <div
                        className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
                        style={{
                          background: answered ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : "rgba(30,41,100,0.7)",
                          color: answered ? "white" : "#475569",
                          boxShadow: answered ? "0 4px 12px rgba(99,102,241,0.4)" : "none",
                        }}
                      >
                        {answered ? "✓" : qi + 1}
                      </div>

                      <div className="flex-1 min-w-0">
                        {/* Type + edit hint badges */}
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                            style={{
                              background: isOdd ? "rgba(99,102,241,0.12)" : "rgba(239,68,68,0.12)",
                              color: isOdd ? "#818cf8" : "#f87171",
                              border: `1px solid ${isOdd ? "rgba(99,102,241,0.2)" : "rgba(239,68,68,0.2)"}`,
                            }}
                          >
                            {isOdd ? "Positif (Ganjil)" : "Negatif (Genap)"}
                          </span>
                          {isEditMode && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full"
                              style={{ background: "rgba(245,158,11,0.1)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.2)" }}>
                              ✏ Edit Mode
                            </span>
                          )}
                        </div>

                        {/* Question text — editable textarea or plain display */}
                        {isEditMode ? (
                          <textarea
                            value={question}
                            onChange={(e) => updateQuestion(qi, e.target.value)}
                            onInput={(e) => {
                              const ta = e.target as HTMLTextAreaElement;
                              ta.style.height = "auto";
                              ta.style.height = ta.scrollHeight + "px";
                            }}
                            rows={2}
                            className="w-full resize-none text-sm leading-relaxed rounded-xl px-3 py-2 outline-none"
                            style={{
                              background: "rgba(245,158,11,0.06)",
                              border: "1px solid rgba(245,158,11,0.3)",
                              color: "#e2e8f0",
                              fontFamily: "inherit",
                              transition: "border-color 0.2s",
                              minHeight: "56px",
                            }}
                            onFocus={(e) => ((e.target as HTMLTextAreaElement).style.borderColor = "rgba(245,158,11,0.6)")}
                            onBlur={(e) => ((e.target as HTMLTextAreaElement).style.borderColor = "rgba(245,158,11,0.3)")}
                            placeholder={`Pertanyaan ${qi + 1}…`}
                            aria-label={`Edit pertanyaan ${qi + 1}`}
                          />
                        ) : (
                          <p className="text-sm leading-relaxed" style={{ color: "#cbd5e1" }}>
                            {question}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Scale radio buttons */}
                    <div className="flex flex-wrap gap-2 pl-10">
                      {[1, 2, 3, 4, 5].map((v) => {
                        const selected = answers[qi] === v;
                        return (
                          <label
                            key={v}
                            htmlFor={`q${qi}_v${v}`}
                            className="flex flex-col items-center gap-1 cursor-pointer select-none"
                            title={SCALE_LABELS[v]}
                          >
                            <input
                              type="radio"
                              id={`q${qi}_v${v}`}
                              name={`question_${qi}`}
                              value={v}
                              checked={selected}
                              onChange={() => handleAnswer(qi, v)}
                              className="sr-only"
                            />
                            <span
                              className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-all duration-200"
                              style={{
                                background: selected ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : "rgba(15,23,70,0.5)",
                                border: `1px solid ${selected ? "transparent" : "rgba(99,102,241,0.2)"}`,
                                color: selected ? "white" : "#64748b",
                                boxShadow: selected ? "0 4px 16px rgba(99,102,241,0.4)" : "none",
                                transform: selected ? "scale(1.08)" : "scale(1)",
                              }}
                            >
                              {v}
                            </span>
                            <span className="text-[9px] text-center leading-tight hidden sm:block" style={{ color: "#334155", maxWidth: "44px" }}>
                              {SCALE_LABELS[v]}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ─── Right: Results Panel ─── */}
          <aside className="w-full lg:w-72 xl:w-80 flex-shrink-0 lg:sticky lg:top-4 space-y-4">

            {/* Progress */}
            <div className="glass-card rounded-2xl p-5">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#475569" }}>
                  {importResult ? "Menampilkan" : "Progress"}
                </span>
                <span className="text-sm font-bold" style={{ color: "#818cf8" }}>
                  {importResult
                    ? (viewRespondent === "avg" ? "Rata-rata" : `Resp. #${viewRespondent}`)
                    : `${answeredCount} / 10`}
                </span>
              </div>
              {!importResult && (
                <div className="progress-track" style={{ height: "6px" }}>
                  <div className="progress-fill" style={{ width: `${(answeredCount / 10) * 100}%` }} />
                </div>
              )}
              {!importResult && !isComplete && (
                <p className="mt-2 text-xs" style={{ color: "#334155" }}>{10 - answeredCount} pertanyaan tersisa</p>
              )}
            </div>

            {/* Score display */}
            <div className="glass-card rounded-2xl p-5">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-center mb-4" style={{ color: "#475569" }}>
                Skor SUS
              </h2>

              {isComplete && score !== null ? (
                <>
                  <div id="sus-gauge-container">
                    <SUSGauge score={score} svgRef={svgRef} />
                  </div>

                  {importResult && (
                    <p className="text-center text-xs mt-1 mb-2" style={{ color: "#475569" }}>
                      {viewRespondent === "avg"
                        ? `Rata-rata dari ${importResult.respondents.length} responden`
                        : `Responden #${viewRespondent}`}
                    </p>
                  )}

                  {/* Interpretation */}
                  <div className="mt-4 p-4 rounded-xl text-center"
                    style={{ background: interpretation!.bgColor, border: `1px solid ${interpretation!.borderColor}` }}>
                    <div className="text-2xl mb-1">{interpretation!.emoji}</div>
                    <div className="font-bold text-base mb-1" style={{ color: interpretation!.color }}>{interpretation!.label}</div>
                    <div className="text-xs leading-relaxed" style={{ color: "#64748b" }}>{interpretation!.desc}</div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 space-y-2">
                    <button id="btn-share-result" onClick={shareResult}
                      className="btn-primary w-full py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2">
                      {copied ? (
                        <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Link Tersalin!</>
                      ) : (
                        <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>Salin Link Hasil</>
                      )}
                    </button>
                    <button id="btn-download-svg" onClick={downloadSVG}
                      className="btn-secondary w-full py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                      Download Grafik SVG
                    </button>
                    <button id="btn-reset-sus" onClick={resetAll} className="btn-ghost w-full py-2 text-xs">
                      Reset semua jawaban
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center animate-pulseRing"
                    style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)" }}>
                    <span className="font-black text-3xl" style={{ color: "rgba(99,102,241,0.4)" }}>?</span>
                  </div>
                  <p className="text-xs" style={{ color: "#334155" }}>
                    Isi semua pertanyaan atau<br />import file CSV untuk melihat skor
                  </p>
                </div>
              )}
            </div>

            {/* ── Import Results: respondent table ── */}
            {importResult && (
              <div className="glass-card rounded-2xl p-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#475569" }}>
                  Hasil Per Responden
                </h3>

                <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
                  {/* Average row */}
                  <button
                    onClick={() => setViewRespondent("avg")}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all duration-150"
                    style={{
                      background: viewRespondent === "avg" ? "rgba(99,102,241,0.2)" : "rgba(15,23,70,0.4)",
                      border: `1px solid ${viewRespondent === "avg" ? "rgba(99,102,241,0.4)" : "rgba(99,102,241,0.1)"}`,
                    }}
                  >
                    <span className="font-bold" style={{ color: "#a5b4fc" }}>⌀ Rata-rata</span>
                    <div className="flex items-center gap-2">
                      <span className="font-black" style={{ color: getScoreColor(importResult.averageScore) }}>
                        {importResult.averageScore.toFixed(1)}
                      </span>
                      <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                        style={{ background: `${getScoreColor(importResult.averageScore)}22`, color: getScoreColor(importResult.averageScore) }}>
                        {getInterpretation(importResult.averageScore).grade}
                      </span>
                    </div>
                  </button>

                  {/* Individual respondents */}
                  {importResult.respondents.map((r) => {
                    const c = getScoreColor(r.score);
                    const selected = viewRespondent === r.id;
                    return (
                      <button
                        key={r.id}
                        onClick={() => setViewRespondent(r.id)}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all duration-150"
                        style={{
                          background: selected ? "rgba(99,102,241,0.12)" : "rgba(15,23,70,0.3)",
                          border: `1px solid ${selected ? "rgba(99,102,241,0.3)" : "rgba(99,102,241,0.07)"}`,
                        }}
                      >
                        <span style={{ color: selected ? "#a5b4fc" : "#64748b" }}>Resp. #{r.id}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold" style={{ color: c }}>{r.score.toFixed(1)}</span>
                          <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                            style={{ background: `${c}22`, color: c }}>
                            {getInterpretation(r.score).grade}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Stats summary */}
                <div className="mt-3 pt-3 grid grid-cols-3 gap-2" style={{ borderTop: "1px solid rgba(99,102,241,0.12)" }}>
                  {[
                    { label: "Min", value: Math.min(...importResult.respondents.map((r) => r.score)).toFixed(1) },
                    { label: "Max", value: Math.max(...importResult.respondents.map((r) => r.score)).toFixed(1) },
                    { label: "N", value: String(importResult.respondents.length) },
                  ].map((s) => (
                    <div key={s.label} className="text-center">
                      <div className="text-xs font-black" style={{ color: "#818cf8" }}>{s.value}</div>
                      <div className="text-[10px]" style={{ color: "#475569" }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Ad */}
            <div className="ad-placeholder rounded-2xl" style={{ height: "120px" }} role="complementary" aria-label="Ad Space">
              <span>Advertisement · 300 × 250</span>
            </div>

            {/* SUS Scale Reference */}
            <div className="glass-card rounded-2xl p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#475569" }}>
                Skala Interpretasi SUS
              </h3>
              <div className="space-y-2">
                {[
                  { range: "≥ 85.5", label: "Excellent", grade: "A", color: "#10b981" },
                  { range: "72.5 – 85.4", label: "Good", grade: "B", color: "#6366f1" },
                  { range: "52.5 – 72.4", label: "OK / Acceptable", grade: "C", color: "#f59e0b" },
                  { range: "35.5 – 52.4", label: "Poor", grade: "D", color: "#ef4444" },
                  { range: "< 35.5", label: "Awful", grade: "F", color: "#dc2626" },
                ].map((item) => (
                  <div key={item.grade} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: item.color }} />
                      <span style={{ color: "#475569" }}>{item.range}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span style={{ color: "#94a3b8" }}>{item.label}</span>
                      <span className="w-5 h-5 rounded-full flex items-center justify-center font-bold"
                        style={{ background: `${item.color}1a`, color: item.color, fontSize: "10px" }}>
                        {item.grade}
                      </span>
                    </div>
                  </div>
                ))}
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
        © 2025 AcademicTools · Kalkulator SUS gratis untuk mahasiswa Indonesia
      </footer>
    </div>
  );
}
