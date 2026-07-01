"use client";

import { useState, useCallback, useMemo, useRef } from "react";

// ─────────────────────────────────────────────
//  Types & Constants
// ─────────────────────────────────────────────

interface UatQuestion {
  id: string;
  text: string;
  scores: number[]; // scores from each respondent
}

interface LikertScale {
  value: number;
  label: string;
}

const SCALE_4: LikertScale[] = [
  { value: 4, label: "Sangat Baik" },
  { value: 3, label: "Baik" },
  { value: 2, label: "Cukup" },
  { value: 1, label: "Kurang" },
];

const SCALE_5: LikertScale[] = [
  { value: 5, label: "Sangat Setuju" },
  { value: 4, label: "Setuju" },
  { value: 3, label: "Netral" },
  { value: 2, label: "Tidak Setuju" },
  { value: 1, label: "Sangat Tidak Setuju" },
];

interface InterpretationInfo {
  label: string;
  emoji: string;
  color: string;
  bgColor: string;
  borderColor: string;
  desc: string;
}

function getInterpretation(pct: number): InterpretationInfo {
  if (pct >= 81) return { label: "Sangat Layak", emoji: "🌟", color: "#10b981", bgColor: "rgba(16,185,129,0.12)", borderColor: "rgba(16,185,129,0.3)", desc: "Sistem sangat layak digunakan dan diterima oleh pengguna." };
  if (pct >= 61) return { label: "Layak", emoji: "👍", color: "#6366f1", bgColor: "rgba(99,102,241,0.12)", borderColor: "rgba(99,102,241,0.3)", desc: "Sistem layak digunakan dengan sedikit perbaikan." };
  if (pct >= 41) return { label: "Cukup Layak", emoji: "✅", color: "#f59e0b", bgColor: "rgba(245,158,11,0.12)", borderColor: "rgba(245,158,11,0.3)", desc: "Sistem cukup layak, namun perlu perbaikan signifikan." };
  if (pct >= 21) return { label: "Tidak Layak", emoji: "⚠️", color: "#ef4444", bgColor: "rgba(239,68,68,0.12)", borderColor: "rgba(239,68,68,0.3)", desc: "Sistem tidak layak digunakan dan perlu banyak perbaikan." };
  return { label: "Sangat Tidak Layak", emoji: "❌", color: "#dc2626", bgColor: "rgba(220,38,38,0.12)", borderColor: "rgba(220,38,38,0.3)", desc: "Sistem tidak dapat diterima sama sekali oleh pengguna." };
}

function newQuestion(idx: number): UatQuestion {
  return { id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, text: `Pertanyaan ${idx}`, scores: [] };
}

// ─────────────────────────────────────────────
//  CSV Import
// ─────────────────────────────────────────────

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

function parseLikertValue(cell: string, maxScale: number): number | null {
  const t = cell.trim().toLowerCase();
  if (!t) return null;
  const num = parseInt(t);
  if (!isNaN(num) && num >= 1 && num <= maxScale) return num;
  // Text mappings for 5-point
  const map5: Record<string, number> = {
    "sangat tidak setuju": 1, "sts": 1, "strongly disagree": 1,
    "tidak setuju": 2, "ts": 2, "disagree": 2,
    "netral": 3, "n": 3, "neutral": 3, "ragu-ragu": 3,
    "setuju": 4, "s": 4, "agree": 4,
    "sangat setuju": 5, "ss": 5, "strongly agree": 5,
  };
  const map4: Record<string, number> = {
    "kurang": 1, "tidak baik": 1, "sangat kurang": 1,
    "cukup": 2, "cukup baik": 2,
    "baik": 3,
    "sangat baik": 4, "sangat bagus": 4,
  };
  const map = maxScale === 5 ? map5 : map4;
  return map[t] ?? null;
}

// ─────────────────────────────────────────────
//  Percentage Ring
// ─────────────────────────────────────────────

function PercentRing({ pct }: { pct: number }) {
  const info = getInterpretation(pct);
  const cx = 80, cy = 80, r = 60, sw = 12;
  const circum = 2 * Math.PI * r;
  const filled = (pct / 100) * circum;

  return (
    <svg viewBox="0 0 160 160" className="w-full h-full" role="img" aria-label={`Kelayakan ${pct.toFixed(1)}%`}>
      <defs>
        <filter id="uat-glow">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(30,41,100,0.55)" strokeWidth={sw} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={info.color} strokeWidth={sw}
        strokeDasharray={`${filled} ${circum - filled}`} strokeDashoffset={circum / 4}
        strokeLinecap="round" filter="url(#uat-glow)"
        style={{ transition: "stroke-dasharray 0.8s cubic-bezier(0.34,1.56,0.64,1)" }} />
      <text x={cx} y={cy - 6} textAnchor="middle" fill="white" fontSize="22" fontWeight="900" fontFamily="Inter, sans-serif">
        {pct.toFixed(1)}%
      </text>
      <text x={cx} y={cy + 12} textAnchor="middle" fill="rgba(148,163,184,0.7)" fontSize="9" fontFamily="Inter, sans-serif">
        Kelayakan
      </text>
    </svg>
  );
}

// ─────────────────────────────────────────────
//  Main Component
// ─────────────────────────────────────────────

export default function UatCalculator() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── State ──────────────────────────────
  const [scaleType, setScaleType] = useState<4 | 5>(4);
  const [respondentCount, setRespondentCount] = useState<number>(5);
  const [questions, setQuestions] = useState<UatQuestion[]>(() =>
    Array.from({ length: 5 }, (_, i) => newQuestion(i + 1))
  );
  const [isDragOver, setIsDragOver] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  const scales = scaleType === 5 ? SCALE_5 : SCALE_4;

  // ── Calculations ───────────────────────
  const stats = useMemo(() => {
    const maxPerQ = scaleType * respondentCount;
    const qStats = questions.map((q) => {
      const total = q.scores.reduce((s, v) => s + v, 0);
      const max = maxPerQ;
      const pct = max > 0 ? (total / max) * 100 : 0;
      return { total, max, pct };
    });
    const grandTotal = qStats.reduce((s, q) => s + q.total, 0);
    const grandMax = questions.length * maxPerQ;
    const grandPct = grandMax > 0 ? (grandTotal / grandMax) * 100 : 0;
    const hasData = questions.some((q) => q.scores.length > 0);
    return { qStats, grandTotal, grandMax, grandPct, hasData };
  }, [questions, scaleType, respondentCount]);

  // ── Handlers ───────────────────────────
  const updateQuestionText = (id: string, text: string) => {
    setQuestions((prev) => prev.map((q) => q.id === id ? { ...q, text } : q));
  };

  const updateScore = (qIdx: number, scaleValue: number, count: number) => {
    setQuestions((prev) => {
      const next = [...prev];
      const q = { ...next[qIdx] };
      // scores array: index = scaleValue - 1
      const scores = [...q.scores];
      while (scores.length < scaleType) scores.push(0);
      scores[scaleValue - 1] = Math.max(0, count);
      q.scores = scores;
      return next.map((orig, i) => i === qIdx ? q : orig);
    });
  };

  const addQuestion = () => {
    setQuestions((prev) => [...prev, newQuestion(prev.length + 1)]);
  };

  const removeQuestion = (id: string) => {
    if (questions.length <= 1) return;
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const resetAll = () => {
    setQuestions(Array.from({ length: 5 }, (_, i) => newQuestion(i + 1)));
    setRespondentCount(5);
    setImportError(null);
  };

  // ── CSV Import ─────────────────────────

  const processCSVImport = useCallback((text: string) => {
    try {
      const rows = parseCSVRows(text);
      if (rows.length < 2) throw new Error("File kosong atau tidak memiliki data.");

      const header = rows[0];
      const dataRows = rows.slice(1).filter((r) => r.some((c) => c.trim()));

      // Detect likert columns
      const likertCols: number[] = [];
      for (let col = 0; col < header.length; col++) {
        const parsed = dataRows.map((r) => parseLikertValue(r[col] ?? "", scaleType));
        const valid = parsed.filter((v) => v !== null).length;
        if (valid / dataRows.length >= 0.5) likertCols.push(col);
      }

      if (likertCols.length === 0) throw new Error("Tidak ada kolom jawaban Likert terdeteksi.");

      // Build questions from detected columns
      const imported: UatQuestion[] = likertCols.map((ci, qi) => {
        const rawLabel = header[ci] ?? `Pertanyaan ${qi + 1}`;
        const text = rawLabel.replace(/^\[?\s*[Pp]?\s*\d+\s*[\]\.:\)]\s*/g, "").trim() || `Pertanyaan ${qi + 1}`;

        // Count occurrences of each value
        const scores = Array(scaleType).fill(0);
        dataRows.forEach((row) => {
          const v = parseLikertValue(row[ci] ?? "", scaleType);
          if (v !== null) scores[v - 1]++;
        });

        return { id: `q-imp-${qi}-${Date.now()}`, text, scores };
      });

      setQuestions(imported);
      setRespondentCount(dataRows.length);
      setImportError(null);
    } catch (e) {
      setImportError(e instanceof Error ? e.message : "Gagal membaca file.");
    }
  }, [scaleType]);

  const handleDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processCSVImport(await file.text());
  }, [processCSVImport]);

  const handleFileInput = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processCSVImport(await file.text());
    e.target.value = "";
  }, [processCSVImport]);

  // ── Render ─────────────────────────────
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#050818" }}
      onDragOver={(e) => { if (e.dataTransfer.types.includes("Files")) { e.preventDefault(); setIsDragOver(true); } }}
      onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragOver(false); }}
      onDrop={handleDrop}>

      <input ref={fileInputRef} type="file" accept=".csv" className="sr-only" onChange={handleFileInput} />

      {/* Drag overlay */}
      {isDragOver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(5,8,24,0.92)", backdropFilter: "blur(12px)" }}>
          <div className="text-center px-16 py-12 rounded-3xl" style={{ border: "2px dashed rgba(16,185,129,0.7)", background: "rgba(16,185,129,0.08)" }}>
            <div className="text-7xl mb-5">📋</div>
            <h2 className="text-2xl font-extrabold mb-2" style={{ color: "#f1f5f9" }}>Lepaskan file CSV di sini</h2>
            <p className="text-sm" style={{ color: "#94a3b8" }}>Data UAT akan otomatis diproses</p>
          </div>
        </div>
      )}

      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full blur-3xl animate-float" style={{ background: "rgba(16,185,129,0.07)" }} />
        <div className="absolute bottom-1/3 left-1/4 w-80 h-80 rounded-full blur-3xl animate-float-2" style={{ background: "rgba(99,102,241,0.06)" }} />
      </div>

      {/* Header Ad */}
      <div className="ad-placeholder w-full" style={{ height: "90px" }} role="complementary" aria-label="Ad Space"><span>Advertisement · 728 × 90</span></div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-5 py-4 max-w-5xl mx-auto w-full">
        <a href="/" className="flex items-center gap-2 text-sm transition-colors" style={{ color: "#64748b" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#f1f5f9")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#64748b")}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          AcademicTools
        </a>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #10b981, #06b6d4)" }}>
          <span className="text-white text-xs font-black select-none">A</span>
        </div>
      </nav>

      {/* Main */}
      <main className="relative z-10 max-w-5xl mx-auto w-full px-4 pb-20 flex-1">
        <header className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-4"
            style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.22)", color: "#34d399" }}>
            User Acceptance Testing · Skala Likert
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-3 tracking-tight" style={{ color: "#f1f5f9" }}>
            Kalkulator <span style={{ background: "linear-gradient(135deg, #10b981, #06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>UAT</span>
          </h1>
          <p className="max-w-lg mx-auto text-sm sm:text-base leading-relaxed" style={{ color: "#64748b" }}>
            Hitung <strong style={{ color: "#94a3b8" }}>persentase kelayakan sistem</strong> dari kuesioner UAT / Skala Likert.
          </p>
        </header>

        {/* Import zone */}
        <div className="mb-6">
          {importError && (
            <div className="glass-card rounded-2xl p-4 mb-3" style={{ borderColor: "rgba(239,68,68,0.35)", background: "rgba(239,68,68,0.05)" }}>
              <div className="flex items-start gap-3">
                <span className="text-lg flex-shrink-0">❌</span>
                <p className="text-xs leading-relaxed" style={{ color: "#94a3b8" }}>{importError}</p>
                <button onClick={() => setImportError(null)} className="btn-ghost ml-auto text-xs px-2 py-1 rounded-lg">✕</button>
              </div>
            </div>
          )}
          <button onClick={() => fileInputRef.current?.click()}
            className="w-full rounded-2xl py-3 px-6 text-left transition-all duration-200 flex items-center gap-4"
            style={{ background: "rgba(16,185,129,0.05)", border: "1.5px dashed rgba(16,185,129,0.28)" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(16,185,129,0.09)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(16,185,129,0.05)"; }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(16,185,129,0.12)" }}>
              <svg className="w-4 h-4" fill="none" stroke="#34d399" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold" style={{ color: "#6ee7b7" }}>Import CSV dari Google Forms</p>
              <p className="text-xs mt-0.5" style={{ color: "#475569" }}>Drag &amp; drop atau klik untuk memilih file</p>
            </div>
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Left: Config + Questions */}
          <div className="flex-1 min-w-0 space-y-4">
            {/* Config row */}
            <div className="glass-card rounded-2xl p-5 flex flex-wrap gap-5 items-end">
              <div className="flex-1 min-w-[140px]">
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "#94a3b8" }}>Tipe Skala</label>
                <div className="flex gap-2">
                  {([4, 5] as const).map((s) => (
                    <button key={s} onClick={() => { setScaleType(s); setQuestions((q) => q.map((qi) => ({ ...qi, scores: [] }))); }}
                      className="flex-1 py-2 rounded-xl text-sm font-bold transition-all duration-200"
                      style={{
                        background: scaleType === s ? "linear-gradient(135deg, #10b981, #06b6d4)" : "rgba(16,185,129,0.07)",
                        border: `1px solid ${scaleType === s ? "transparent" : "rgba(16,185,129,0.2)"}`,
                        color: scaleType === s ? "white" : "#64748b",
                        boxShadow: scaleType === s ? "0 4px 16px rgba(16,185,129,0.3)" : "none",
                      }}>
                      {s} Poin
                    </button>
                  ))}
                </div>
              </div>
              <div className="min-w-[120px]">
                <label htmlFor="respondent-count" className="block text-xs font-semibold mb-1.5" style={{ color: "#94a3b8" }}>Jumlah Responden</label>
                <input id="respondent-count" type="number" min={1} max={9999} value={respondentCount}
                  onChange={(e) => setRespondentCount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="number-input w-full" style={{ fontSize: "1rem" }} />
              </div>
            </div>

            {/* Scale legend */}
            <div className="flex flex-wrap gap-2">
              {scales.map((s) => (
                <span key={s.value} className="text-xs px-2.5 py-1 rounded-full"
                  style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", color: "#6ee7b7" }}>
                  {s.value} = {s.label}
                </span>
              ))}
            </div>

            {/* Question rows */}
            {questions.map((q, qi) => {
              const qTotal = q.scores.reduce((s, v, vi) => s + v * (vi + 1), 0);
              const qMax = scaleType * respondentCount;
              const qPct = qMax > 0 ? (qTotal / qMax) * 100 : 0;
              const totalResp = q.scores.reduce((s, v) => s + v, 0);
              return (
                <div key={q.id} className="glass-card rounded-2xl p-5" style={{ animation: `fadeInUp 0.35s ease-out ${qi * 0.03}s both` }}>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{ background: "rgba(16,185,129,0.15)", color: "#34d399" }}>{qi + 1}</div>
                      <input type="text" value={q.text} onChange={(e) => updateQuestionText(q.id, e.target.value)}
                        className="text-input flex-1 text-sm" placeholder={`Pertanyaan ${qi + 1}`} />
                    </div>
                    {questions.length > 1 && (
                      <button onClick={() => removeQuestion(q.id)} className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors"
                        style={{ color: "#475569", background: "rgba(239,68,68,0.06)" }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#ef4444"; (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.15)"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#475569"; (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.06)"; }}>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    )}
                  </div>
                  {/* Score inputs per scale value */}
                  <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${scaleType}, 1fr)` }}>
                    {scales.map((s) => {
                      const count = q.scores[s.value - 1] ?? 0;
                      return (
                        <div key={s.value} className="text-center">
                          <div className="text-[10px] mb-1 font-semibold truncate" style={{ color: "#475569" }}>{s.label}</div>
                          <input type="number" min={0} max={respondentCount} value={count}
                            onChange={(e) => updateScore(qi, s.value, parseInt(e.target.value) || 0)}
                            className="number-input w-full text-center" style={{ fontSize: "0.875rem" }} />
                        </div>
                      );
                    })}
                  </div>
                  {/* Per-question stats */}
                  <div className="flex items-center justify-between mt-3 text-[10px]" style={{ color: "#334155" }}>
                    <span>Total: <strong style={{ color: "#6ee7b7" }}>{qTotal}</strong> / {qMax}{totalResp !== respondentCount && totalResp > 0 && <span style={{ color: "#f59e0b" }}> ⚠ responden: {totalResp}/{respondentCount}</span>}</span>
                    <span className="font-bold" style={{ color: getInterpretation(qPct).color }}>{qPct.toFixed(1)}%</span>
                  </div>
                </div>
              );
            })}

            <button onClick={addQuestion}
              className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200"
              style={{ background: "rgba(16,185,129,0.07)", border: "1px dashed rgba(16,185,129,0.3)", color: "#34d399" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(16,185,129,0.13)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(16,185,129,0.07)"; }}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Tambah Pertanyaan
            </button>
          </div>

          {/* Right: Results */}
          <aside className="w-full lg:w-72 xl:w-80 flex-shrink-0 lg:sticky lg:top-4 space-y-4">
            <div className="glass-card rounded-2xl p-5">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-center mb-4" style={{ color: "#475569" }}>Kelayakan Sistem</h2>

              {stats.hasData ? (
                <>
                  <div className="w-40 h-40 mx-auto mb-4">
                    <PercentRing pct={stats.grandPct} />
                  </div>
                  {/* Interpretation */}
                  {(() => { const info = getInterpretation(stats.grandPct); return (
                    <div className="p-4 rounded-xl text-center mb-4" style={{ background: info.bgColor, border: `1px solid ${info.borderColor}` }}>
                      <div className="text-xl mb-1">{info.emoji}</div>
                      <div className="font-bold text-sm" style={{ color: info.color }}>{info.label}</div>
                      <div className="text-xs mt-1" style={{ color: "#64748b" }}>{info.desc}</div>
                    </div>
                  ); })()}
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {[
                      { label: "Total Skor", value: String(stats.grandTotal) },
                      { label: "Skor Maks", value: String(stats.grandMax) },
                      { label: "Responden", value: String(respondentCount) },
                    ].map((s) => (
                      <div key={s.label} className="text-center p-2 rounded-xl" style={{ background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.12)" }}>
                        <div className="text-sm font-black" style={{ color: "#34d399" }}>{s.value}</div>
                        <div className="text-[9px] mt-0.5" style={{ color: "#475569" }}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                  {/* Prose */}
                  <div className="p-3 rounded-xl text-xs leading-relaxed" style={{ background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.15)", color: "#94a3b8" }}>
                    Persentase kelayakan dihitung: <strong style={{ color: "#f1f5f9" }}>(Total Skor / Skor Maksimal) × 100%</strong> = ({stats.grandTotal} / {stats.grandMax}) × 100% = <strong style={{ color: "#10b981" }}>{stats.grandPct.toFixed(2)}%</strong>.
                  </div>
                  <button onClick={resetAll} className="btn-ghost w-full py-2 text-xs mt-3">Reset Semua</button>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center animate-pulseRing"
                    style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}>
                    <span className="font-black text-3xl" style={{ color: "rgba(16,185,129,0.4)" }}>%</span>
                  </div>
                  <p className="text-xs" style={{ color: "#334155" }}>Isi jumlah jawaban per skala<br />untuk melihat kelayakan</p>
                </div>
              )}
            </div>

            <div className="ad-placeholder rounded-2xl" style={{ height: "120px" }} role="complementary" aria-label="Ad Space"><span>Advertisement · 300 × 250</span></div>

            {/* Interpretation scale */}
            <div className="glass-card rounded-2xl p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#475569" }}>Skala Interpretasi</h3>
              <div className="space-y-2">
                {[
                  { range: "81% – 100%", label: "Sangat Layak", color: "#10b981" },
                  { range: "61% – 80%", label: "Layak", color: "#6366f1" },
                  { range: "41% – 60%", label: "Cukup Layak", color: "#f59e0b" },
                  { range: "21% – 40%", label: "Tidak Layak", color: "#ef4444" },
                  { range: "0% – 20%", label: "Sangat Tidak Layak", color: "#dc2626" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: item.color }} />
                      <span style={{ color: "#475569" }}>{item.range}</span>
                    </div>
                    <span style={{ color: "#94a3b8" }}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>

      <div className="ad-placeholder w-full" style={{ height: "90px" }} role="complementary" aria-label="Ad Space Footer"><span>Advertisement · 728 × 90</span></div>
      <footer className="relative z-10 text-center py-4 text-xs" style={{ color: "#1e293b" }}>© 2025 AcademicTools · Kalkulator UAT gratis untuk mahasiswa Indonesia</footer>
    </div>
  );
}
