"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

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
    return { label: "Excellent", emoji: "🌟", color: "#1e293b", bgColor: "var(--brand-mint)", grade: "A", desc: "Sistem sangat mudah digunakan dan memuaskan pengguna." };
  if (score >= 72.5)
    return { label: "Good", emoji: "👍", color: "#1e293b", bgColor: "var(--brand-blue)", grade: "B", desc: "Sistem memiliki kegunaan yang baik, di atas rata-rata." };
  if (score >= 52.5)
    return { label: "OK / Acceptable", emoji: "✅", color: "#1e293b", bgColor: "var(--brand-yellow)", grade: "C", desc: "Sistem cukup dapat digunakan, ada ruang perbaikan." };
  if (score >= 35.5)
    return { label: "Poor", emoji: "⚠️", color: "#1e293b", bgColor: "var(--brand-orange)", grade: "D", desc: "Sistem kurang dapat digunakan, butuh perbaikan." };
  return { label: "Awful / Not Acceptable", emoji: "❌", color: "#1e293b", bgColor: "var(--brand-pink)", grade: "F", desc: "Sistem sulit digunakan dan tidak dapat diterima." };
}

function getScoreColor(score: number): string {
  if (score >= 85.5) return "var(--brand-mint)";
  if (score >= 72.5) return "var(--brand-blue)";
  if (score >= 52.5) return "var(--brand-yellow)";
  if (score >= 35.5) return "var(--brand-orange)";
  return "var(--brand-pink)";
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
  if (/^[1-5](\.0+)?$/.test(t)) return parseInt(t);
  return LIKERT_TEXT_MAP[t.toLowerCase().replace(/\s+/g, " ")] ?? null;
}

function parseCSVRows(text: string): string[][] {
  return text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n").filter((l) => l.trim()).map((line) => {
    const cells: string[] = [];
    let cur = ""; let inQ = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQ && line[i + 1] === '"') { cur += '"'; i++; } else inQ = !inQ;
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

  const likertCols: number[] = [];
  for (let col = 0; col < header.length; col++) {
    const parsed = dataRows.map((r) => parseLikertCell(r[col] ?? ""));
    const valid = parsed.filter((v) => v !== null).length;
    if (valid / dataRows.length >= 0.6) likertCols.push(col);
  }

  if (likertCols.length < 10) {
    throw new Error(`Hanya ${likertCols.length} kolom jawaban Likert (1–5) terdeteksi — dibutuhkan minimal 10.`);
  }

  const warnings: string[] = [];
  if (likertCols.length > 10) warnings.push(`${likertCols.length} kolom Likert ditemukan — hanya 10 pertama digunakan.`);
  const susCols = likertCols.slice(0, 10);

  const detectedQuestions = susCols.map((ci, qi) => {
    const raw = header[ci] ?? "";
    const cleaned = raw.replace(/^\[?\s*[Pp]?\s*\d+\s*[\]\.:\)]\s*/g, "").replace(/^(Pertanyaan|Question|Pernyataan)\s*\d+\s*[:\.]\s*/gi, "").replace(/\[.*?\]/g, "").trim();
    return cleaned.length > 4 ? cleaned : DEFAULT_QUESTIONS[qi];
  });

  const respondents: RespondentResult[] = dataRows.map((row, ri) => {
    const answers = susCols.map((ci) => parseLikertCell(row[ci] ?? "") ?? 3);
    return { id: ri + 1, answers, score: calcSUS(answers) };
  });

  const averageAnswers = Array.from({ length: 10 }, (_, qi) => {
    const avg = respondents.reduce((s, r) => s + r.answers[qi], 0) / respondents.length;
    return Math.round(avg);
  });

  const averageScore = respondents.reduce((s, r) => s + r.score, 0) / respondents.length;
  return { filename, respondents, averageScore, averageAnswers, detectedQuestions, warnings };
}

// ─────────────────────────────────────────────────────────────────────────────
//  SVG Gauge (Neo-Brutalism Style)
// ─────────────────────────────────────────────────────────────────────────────

interface GaugeProps {
  score: number;
  svgRef: React.RefObject<SVGSVGElement | null>;
}

function SUSGauge({ score, svgRef }: GaugeProps) {
  const cx = 160, cy = 160, r = 118, sw = 20;

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
  const interp = getInterpretation(score);
  // Using explicit colors for the gauge to ensure visibility on light bg
  const mainColor = "#000"; 
  const fillColor = interp.bgColor;

  return (
    <svg ref={svgRef} viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg" className="w-full" role="img" aria-label={`SUS Gauge: ${Math.round(score)} / 100`}>
      <rect width="320" height="200" fill="#fff" rx="12" stroke="#000" strokeWidth="3" />
      
      {/* Background Track */}
      <path d={`M ${left.x.toFixed(2)} ${left.y.toFixed(2)} A ${r} ${r} 0 0 0 ${right.x.toFixed(2)} ${right.y.toFixed(2)}`} fill="none" stroke="#e2e8f0" strokeWidth={sw} strokeLinecap="butt" />
      
      {/* Colored Segments */}
      <path d={arcSeg(left, p51)} fill="none" stroke="var(--brand-pink)" strokeWidth={sw} opacity="0.6" />
      <path d={arcSeg(p51, p68)} fill="none" stroke="var(--brand-yellow)" strokeWidth={sw} opacity="0.6" />
      <path d={arcSeg(p68, right)} fill="none" stroke="var(--brand-mint)" strokeWidth={sw} opacity="0.6" />
      
      {/* Filled Score Path */}
      {score > 0 && <path d={scorePath} fill="none" stroke={fillColor} strokeWidth={sw} strokeLinecap="butt" />}
      
      {/* Outer and Inner Borders for Track */}
      <path d={`M ${left.x.toFixed(2)} ${left.y.toFixed(2)} A ${r} ${r} 0 0 0 ${right.x.toFixed(2)} ${right.y.toFixed(2)}`} fill="none" stroke="#000" strokeWidth="3" strokeLinecap="square" />
      <path d={`M ${cx + (r - sw/2) * Math.cos(Math.PI)} ${cy - (r - sw/2) * Math.sin(Math.PI)} A ${r - sw/2} ${r - sw/2} 0 0 0 ${cx + (r - sw/2) * Math.cos(0)} ${cy - (r - sw/2) * Math.sin(0)}`} fill="none" stroke="#000" strokeWidth="3" strokeLinecap="square" />
      <path d={`M ${cx + (r + sw/2) * Math.cos(Math.PI)} ${cy - (r + sw/2) * Math.sin(Math.PI)} A ${r + sw/2} ${r + sw/2} 0 0 0 ${cx + (r + sw/2) * Math.cos(0)} ${cy - (r + sw/2) * Math.sin(0)}`} fill="none" stroke="#000" strokeWidth="3" strokeLinecap="square" />

      {/* Lines closing the track ends */}
      <line x1={cx - r - sw/2} y1={cy} x2={cx - r + sw/2} y2={cy} stroke="#000" strokeWidth="3" />
      <line x1={cx + r - sw/2} y1={cy} x2={cx + r + sw/2} y2={cy} stroke="#000" strokeWidth="3" />

      {/* Indicator Line */}
      {indicatorPt && (
        <line x1={cx} y1={cy} x2={indicatorPt.x} y2={indicatorPt.y} stroke="#000" strokeWidth="4" />
      )}
      {indicatorPt && (
        <circle cx={indicatorPt.x} cy={indicatorPt.y} r="10" fill={fillColor} stroke="#000" strokeWidth="3" />
      )}
      {/* Center Pin */}
      <circle cx={cx} cy={cy} r="8" fill="#000" />

      {/* Ticks */}
      {[0, 25, 50, 75, 100].map((tick) => {
        const angleDeg = 180 - (tick / 100) * 180;
        const rad = (angleDeg * Math.PI) / 180;
        const lx = cx + (r + sw / 2 + 18) * Math.cos(rad), ly = cy - (r + sw / 2 + 18) * Math.sin(rad);
        return (
          <text key={tick} x={lx} y={ly} textAnchor="middle" dominantBaseline="central" fill="#000" fontSize="11" fontWeight="800" fontFamily="Inter, sans-serif">{tick}</text>
        );
      })}

      {/* Score Text */}
      <text x={cx} y={cy - 20} textAnchor="middle" fill="#000" fontSize="48" fontWeight="900" fontFamily="Inter, sans-serif">{Math.round(score)}</text>
      <text x={cx} y={cy + 20} textAnchor="middle" fill="#000" fontSize="14" fontWeight="800" fontFamily="Inter, sans-serif">/ 100</text>
      
      {/* Grade Label */}
      <rect x={cx - 20} y={cy + 30} width="40" height="26" rx="4" fill={fillColor} stroke="#000" strokeWidth="2" />
      <text x={cx} y={cy + 48} textAnchor="middle" fill="#000" fontSize="14" fontWeight="900" fontFamily="Inter, sans-serif">{interp.grade}</text>
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

  const [questions, setQuestions] = useState<string[]>([...DEFAULT_QUESTIONS]);
  const [answers, setAnswers] = useState<(number | null)[]>(Array(10).fill(null));
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [viewRespondent, setViewRespondent] = useState<"avg" | number>("avg");
  const [copied, setCopied] = useState(false);

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

  useEffect(() => {
    if (!importResult) return;
    if (viewRespondent === "avg") {
      setAnswers([...importResult.averageAnswers] as (number | null)[]);
    } else {
      const r = importResult.respondents.find((r) => r.id === viewRespondent);
      if (r) setAnswers([...r.answers] as (number | null)[]);
    }
  }, [viewRespondent, importResult]);

  const score: number | null = answers.some((a) => a === null) ? null : calcSUS(answers as number[]);
  const answeredCount = answers.filter((a) => a !== null).length;
  const isComplete = answeredCount === 10;
  const interpretation = score !== null ? getInterpretation(score) : null;

  const processFile = useCallback(async (file: File) => {
    setImportError(null);
    setIsImporting(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (ext === "xlsx" || ext === "xls" || ext === "ods") {
        throw new Error(`Format .${ext} tidak didukung. Di Google Sheets: klik File → Unduh → Nilai Terpisah Koma (.csv).`);
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

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    if (e.dataTransfer.types.includes("Files")) { e.preventDefault(); setIsDragOver(true); }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) await processFile(file);
  }, [processFile]);

  const handleFileInput = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await processFile(file);
    e.target.value = "";
  }, [processFile]);

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

  return (
    <div
      className="min-h-screen flex flex-col"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        className="sr-only"
        onChange={handleFileInput}
      />

      {isDragOver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-md">
          <div className="text-center px-16 py-12 brutal-card bg-[var(--brand-mint)] transform rotate-2">
            <div className="text-7xl mb-5">📊</div>
            <h2 className="text-3xl font-black mb-2 uppercase">Lepaskan file CSV di sini</h2>
            <p className="text-sm font-bold">Data Google Forms akan otomatis diproses</p>
          </div>
        </div>
      )}

      {/* Header Ad */}
      <div className="p-4 flex justify-center mt-2">
      </div>

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-5 py-4 max-w-5xl mx-auto w-full">
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

      {/* Main */}
      <main className="relative z-10 max-w-5xl mx-auto w-full px-4 pb-20 flex-1">
        <header className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase mb-4 brutal-badge bg-[var(--brand-blue)]">
            System Usability Scale · Standar ISO 9241
          </div>
          <h1 className="text-4xl sm:text-5xl font-black mb-3 tracking-tight uppercase">
            Kalkulator SUS
          </h1>
          <p className="max-w-lg mx-auto text-base font-bold leading-relaxed">
            Isi 10 pertanyaan secara manual atau import langsung dari spreadsheet Google Forms.
          </p>
        </header>

        {/* ── Import Banner ── */}
        <div className="mb-8">
          {importResult && (
            <div className="brutal-card p-4 mb-4 bg-[var(--brand-mint)]">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="text-3xl">✅</div>
                  <div className="min-w-0">
                    <p className="text-sm font-black truncate">{importResult.filename}</p>
                    <p className="text-xs font-bold mt-1">
                      {importResult.respondents.length} responden · Rata-rata skor:{" "}
                      <span className="bg-white border-2 border-black px-1">{importResult.averageScore.toFixed(1)}</span>
                      {importResult.warnings.length > 0 && <span> · ⚠ {importResult.warnings[0]}</span>}
                    </p>
                  </div>
                </div>
                <button onClick={clearImport} className="btn-ghost px-3 py-1 bg-white">Hapus</button>
              </div>
            </div>
          )}

          {importError && (
            <div className="brutal-card p-4 mb-4 bg-[var(--brand-pink)]">
              <div className="flex items-start gap-3">
                <span className="text-3xl">❌</span>
                <div>
                  <p className="text-sm font-black mb-1">Gagal membaca file</p>
                  <p className="text-xs font-bold">{importError}</p>
                </div>
                <button onClick={() => setImportError(null)} className="btn-ghost ml-auto bg-white px-3 py-1">✕</button>
              </div>
            </div>
          )}

          <button
            id="btn-import-csv"
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            className="w-full btn-ghost border-dashed flex items-center justify-center gap-4 py-6 bg-slate-50"
          >
            <div className="w-12 h-12 rounded flex items-center justify-center border-[3px] border-black bg-[var(--brand-yellow)] transform -rotate-3">
              {isImporting ? (
                <div className="w-5 h-5 rounded-full border-[3px] border-black animate-spin" />
              ) : (
                <span className="text-2xl font-black">+</span>
              )}
            </div>
            <div className="text-left">
              <p className="text-base font-black uppercase">
                {isImporting ? "Memproses file…" : "Import dari Google Forms (.CSV)"}
              </p>
              <p className="text-xs font-bold mt-1">
                Seret &amp; lepas file .csv atau klik untuk memilih
              </p>
            </div>
          </button>
        </div>

        {/* ── Main Grid ── */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* ── Left: Questions Panel ── */}
          <div className="flex-1 w-full min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
              <div>
                <h2 className="text-lg font-black uppercase border-b-4 border-black inline-block">
                  Pertanyaan Kuesioner SUS
                </h2>
              </div>
              <div className="flex items-center gap-2">
                {isEditMode && (
                  <button onClick={() => setQuestions([...DEFAULT_QUESTIONS])} className="btn-secondary text-xs">
                    Reset
                  </button>
                )}
                <button
                  onClick={() => setIsEditMode((v) => !v)}
                  className={`btn-primary text-xs ${isEditMode ? 'bg-[var(--brand-pink)]' : 'bg-[var(--brand-blue)]'}`}
                >
                  {isEditMode ? "SELESAI EDIT" : "EDIT PERTANYAAN"}
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {questions.map((question, qi) => {
                const isOdd = (qi + 1) % 2 !== 0;
                const answered = answers[qi] !== null;

                return (
                  <div
                    key={qi}
                    className="brutal-card p-5 bg-white relative overflow-hidden"
                    style={{ borderColor: answered ? "#000" : "#cbd5e1" }}
                  >
                    {/* Background accent based on odd/even to subtly differentiate */}
                    <div className="absolute top-0 right-0 w-4 h-full" style={{ background: isOdd ? "var(--brand-mint)" : "var(--brand-pink)" }}></div>

                    <div className="flex items-start gap-4 mb-4 pr-6">
                      <div className={`w-8 h-8 flex-shrink-0 border-[3px] border-black rounded-lg flex items-center justify-center font-black ${answered ? 'bg-black text-white' : 'bg-slate-100 text-black'}`}>
                        {answered ? "✓" : qi + 1}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 border-2 border-black ${isOdd ? 'bg-[var(--brand-mint)]' : 'bg-[var(--brand-pink)]'}`}>
                            {isOdd ? "Positif (Ganjil)" : "Negatif (Genap)"}
                          </span>
                          {isEditMode && <span className="text-[10px] font-black uppercase px-2 py-0.5 border-2 border-black bg-[var(--brand-yellow)]">✏ Edit</span>}
                        </div>

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
                            className="text-input font-bold"
                            placeholder={`Pertanyaan ${qi + 1}…`}
                          />
                        ) : (
                          <p className="text-sm font-bold">{question}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 sm:gap-3 lg:pl-12">
                      {[1, 2, 3, 4, 5].map((v) => {
                        const selected = answers[qi] === v;
                        return (
                          <label key={v} className="flex flex-col items-center gap-1 cursor-pointer">
                            <input
                              type="radio"
                              name={`question_${qi}`}
                              value={v}
                              checked={selected}
                              onChange={() => handleAnswer(qi, v)}
                              className="sr-only"
                            />
                            <span
                              className={`w-10 h-10 border-[3px] border-black rounded-lg flex items-center justify-center font-black text-lg transition-transform ${selected ? 'bg-black text-white transform -translate-y-1 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]' : 'bg-slate-50 text-slate-700 hover:-translate-y-1 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'}`}
                            >
                              {v}
                            </span>
                            <span className="text-[9px] font-bold text-center leading-tight uppercase w-12 hidden sm:block">
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

          {/* ── Right: Results Panel ── */}
          <aside className="w-full lg:w-80 flex-shrink-0 lg:sticky lg:top-4 space-y-6">
            <div className="brutal-card p-5 bg-white">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-black uppercase">
                  {importResult ? "Menampilkan" : "Progress"}
                </span>
                <span className="text-lg font-black bg-[var(--brand-yellow)] border-2 border-black px-2 transform rotate-2">
                  {importResult ? (viewRespondent === "avg" ? "Rata-rata" : `Resp. #${viewRespondent}`) : `${answeredCount} / 10`}
                </span>
              </div>
              {!importResult && (
                <div className="progress-track" style={{ height: "12px" }}>
                  <div className="progress-fill" style={{ width: `${(answeredCount / 10) * 100}%` }} />
                </div>
              )}
            </div>

            <div className="brutal-card p-5 bg-white text-center">
              <h2 className="text-sm font-black uppercase mb-6 border-b-4 border-black inline-block pb-1">Skor SUS</h2>

              {isComplete && score !== null ? (
                <>
                  <div id="sus-gauge-container" className="mb-4">
                    <SUSGauge score={score} svgRef={svgRef} />
                  </div>

                  {importResult && (
                    <p className="text-xs font-bold mt-2 mb-4 bg-slate-100 border-2 border-black p-2 inline-block">
                      {viewRespondent === "avg" ? `Rata-rata dari ${importResult.respondents.length} responden` : `Responden #${viewRespondent}`}
                    </p>
                  )}

                  <div className="p-4 border-[3px] border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transform -rotate-1 mb-6" style={{ background: interpretation!.bgColor }}>
                    <div className="text-3xl mb-2">{interpretation!.emoji}</div>
                    <div className="font-black text-xl uppercase mb-1">{interpretation!.label}</div>
                    <div className="text-xs font-bold leading-relaxed">{interpretation!.desc}</div>
                  </div>

                  <div className="space-y-3">
                    <button onClick={shareResult} className="btn-primary w-full" style={{ background: "var(--brand-blue)" }}>
                      <div className="flex items-center justify-center gap-2 uppercase">
                        {copied ? "LINK TERSALIN!" : "SALIN LINK HASIL"}
                      </div>
                    </button>
                    <button onClick={downloadSVG} className="btn-secondary w-full uppercase text-xs">
                      DOWNLOAD GRAFIK SVG
                    </button>
                    <button onClick={resetAll} className="btn-ghost w-full uppercase text-xs">
                      RESET SEMUA
                    </button>
                  </div>
                </>
              ) : (
                <div className="py-10">
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full border-4 border-black border-dashed flex items-center justify-center bg-slate-100 transform -rotate-12">
                    <span className="font-black text-4xl">?</span>
                  </div>
                  <p className="text-sm font-bold">Isi semua pertanyaan atau import file CSV untuk melihat skor</p>
                </div>
              )}
            </div>

            {importResult && (
              <div className="brutal-card p-4 bg-[var(--brand-mint)]">
                <h3 className="text-sm font-black uppercase mb-3 border-b-2 border-black pb-1">Hasil Per Responden</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                  <button
                    onClick={() => setViewRespondent("avg")}
                    className={`w-full flex items-center justify-between px-3 py-2 border-2 border-black font-bold text-sm ${viewRespondent === "avg" ? 'bg-black text-white shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]' : 'bg-white hover:bg-slate-100'}`}
                  >
                    <span>⌀ Rata-rata</span>
                    <div className="flex items-center gap-2">
                      <span>{importResult.averageScore.toFixed(1)}</span>
                      <span className="bg-white text-black px-1 border border-black">{getInterpretation(importResult.averageScore).grade}</span>
                    </div>
                  </button>

                  {importResult.respondents.map((r) => {
                    const selected = viewRespondent === r.id;
                    const grade = getInterpretation(r.score).grade;
                    return (
                      <button
                        key={r.id}
                        onClick={() => setViewRespondent(r.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 border-2 border-black font-bold text-sm ${selected ? 'bg-black text-white shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]' : 'bg-white hover:bg-slate-100'}`}
                      >
                        <span>Resp. #{r.id}</span>
                        <div className="flex items-center gap-2">
                          <span>{r.score.toFixed(1)}</span>
                          <span className={`px-1 border border-black ${selected ? 'bg-white text-black' : 'bg-slate-200'}`}>{grade}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
                
                <div className="mt-4 pt-4 border-t-4 border-black grid grid-cols-3 gap-2">
                  {[
                    { label: "Min", value: Math.min(...importResult.respondents.map((r) => r.score)).toFixed(1) },
                    { label: "Max", value: Math.max(...importResult.respondents.map((r) => r.score)).toFixed(1) },
                    { label: "Total", value: String(importResult.respondents.length) },
                  ].map((s) => (
                    <div key={s.label} className="text-center bg-white border-2 border-black py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      <div className="text-sm font-black">{s.value}</div>
                      <div className="text-[10px] font-bold uppercase">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="brutal-card p-5 bg-[var(--brand-lilac)]">
              <h3 className="text-sm font-black uppercase mb-4 border-b-2 border-black pb-2">Skala Interpretasi SUS</h3>
              <div className="space-y-3 font-bold text-sm">
                {[
                  { range: "≥ 85.5", label: "Excellent", grade: "A" },
                  { range: "72.5 – 85.4", label: "Good", grade: "B" },
                  { range: "52.5 – 72.4", label: "OK", grade: "C" },
                  { range: "35.5 – 52.4", label: "Poor", grade: "D" },
                  { range: "< 35.5", label: "Awful", grade: "F" },
                ].map((item) => (
                  <div key={item.grade} className="flex items-center justify-between">
                    <span className="bg-white border-2 border-black px-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">{item.range}</span>
                    <div className="flex items-center gap-2">
                      <span className="uppercase">{item.label}</span>
                      <span className="bg-black text-white px-1 border-2 border-black">{item.grade}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>

      <div className="p-4 flex justify-center mt-8">
      </div>
      <footer className="relative z-10 text-center py-6 font-bold text-sm border-t-[3px] border-black mt-4 bg-white">
        © 2025 AcademicTools · Kalkulator SUS gratis untuk mahasiswa Indonesia
      </footer>
    </div>
  );
}
