"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import Link from "next/link";

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
  if (pct >= 81) return { label: "Sangat Layak", emoji: "🌟", color: "#000", bgColor: "var(--brand-mint)", borderColor: "#000", desc: "Sistem sangat layak digunakan dan diterima oleh pengguna." };
  if (pct >= 61) return { label: "Layak", emoji: "👍", color: "#000", bgColor: "var(--brand-blue)", borderColor: "#000", desc: "Sistem layak digunakan dengan sedikit perbaikan." };
  if (pct >= 41) return { label: "Cukup Layak", emoji: "✅", color: "#000", bgColor: "var(--brand-yellow)", borderColor: "#000", desc: "Sistem cukup layak, namun perlu perbaikan signifikan." };
  if (pct >= 21) return { label: "Tidak Layak", emoji: "⚠️", color: "#000", bgColor: "var(--brand-orange)", borderColor: "#000", desc: "Sistem tidak layak digunakan dan perlu banyak perbaikan." };
  return { label: "Sangat Tidak Layak", emoji: "❌", color: "#000", bgColor: "var(--brand-pink)", borderColor: "#000", desc: "Sistem tidak dapat diterima sama sekali oleh pengguna." };
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
  const cx = 80, cy = 80, r = 60, sw = 16;
  const circum = 2 * Math.PI * r;
  const filled = (pct / 100) * circum;

  return (
    <svg viewBox="0 0 160 160" className="w-full h-full" role="img" aria-label={`Kelayakan ${pct.toFixed(1)}%`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e2e8f0" strokeWidth={sw} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={info.bgColor} strokeWidth={sw}
        strokeDasharray={`${filled} ${circum - filled}`} strokeDashoffset={circum / 4}
        strokeLinecap="butt" style={{ transition: "stroke-dasharray 0.8s cubic-bezier(0.34,1.56,0.64,1)" }} />
      {/* Outer borders for gauge */}
      <circle cx={cx} cy={cy} r={r + sw/2} fill="none" stroke="#000" strokeWidth="3" />
      <circle cx={cx} cy={cy} r={r - sw/2} fill="none" stroke="#000" strokeWidth="3" />

      <text x={cx} y={cy} textAnchor="middle" fill="#000" fontSize="28" fontWeight="900" fontFamily="Inter, sans-serif" dominantBaseline="middle">
        {pct.toFixed(1)}%
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
    <div className="min-h-screen flex flex-col"
      onDragOver={(e) => { if (e.dataTransfer.types.includes("Files")) { e.preventDefault(); setIsDragOver(true); } }}
      onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragOver(false); }}
      onDrop={handleDrop}>

      <input ref={fileInputRef} type="file" accept=".csv" className="sr-only" onChange={handleFileInput} />

      {/* Drag overlay */}
      {isDragOver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-md">
          <div className="text-center px-16 py-12 brutal-card bg-[var(--brand-mint)] transform rotate-2">
            <div className="text-7xl mb-5">📋</div>
            <h2 className="text-3xl font-black mb-2 uppercase">Lepaskan file CSV di sini</h2>
            <p className="text-sm font-bold">Data UAT akan otomatis diproses</p>
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
        <div className="w-8 h-8 rounded-lg flex items-center justify-center border-[3px] border-black bg-[var(--brand-mint)] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transform rotate-3">
          <span className="text-black text-sm font-black select-none">A</span>
        </div>
      </nav>

      {/* Main */}
      <main className="relative z-10 max-w-5xl mx-auto w-full px-4 pb-20 flex-1">
        <header className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase mb-4 brutal-badge bg-[var(--brand-mint)]">
            User Acceptance Testing · Skala Likert
          </div>
          <h1 className="text-4xl sm:text-5xl font-black mb-3 tracking-tight uppercase">
            Kalkulator UAT
          </h1>
          <p className="max-w-lg mx-auto text-base font-bold leading-relaxed">
            Hitung persentase kelayakan sistem dari kuesioner UAT / Skala Likert.
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
                  <p className="text-xs font-bold leading-relaxed">{importError}</p>
                </div>
                <button onClick={() => setImportError(null)} className="btn-ghost px-3 py-1 bg-white">✕</button>
              </div>
            </div>
          )}
          <button onClick={() => fileInputRef.current?.click()}
            className="w-full btn-ghost border-dashed flex items-center justify-center gap-4 py-6 bg-slate-50"
          >
            <div className="w-12 h-12 rounded flex items-center justify-center border-[3px] border-black bg-[var(--brand-yellow)] transform -rotate-3">
              <span className="text-2xl font-black">+</span>
            </div>
            <div className="text-left">
              <p className="text-base font-black uppercase">Import CSV dari Google Forms</p>
              <p className="text-xs font-bold mt-1">Drag &amp; drop atau klik untuk memilih file</p>
            </div>
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Left: Config + Questions */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* Config row */}
            <div className="brutal-card p-5 bg-white flex flex-wrap gap-5 items-end transform -rotate-1">
              <div className="flex-1 min-w-[140px]">
                <label className="block text-xs font-black uppercase mb-2">Tipe Skala</label>
                <div className="flex gap-3">
                  {([4, 5] as const).map((s) => (
                    <button key={s} onClick={() => { setScaleType(s); setQuestions((q) => q.map((qi) => ({ ...qi, scores: [] }))); }}
                      className={`flex-1 py-3 px-2 rounded-lg text-sm font-black uppercase border-[3px] border-black transition-transform ${scaleType === s ? 'bg-black text-white transform -translate-y-1 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]' : 'bg-white hover:-translate-y-1 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'}`}>
                      {s} Poin
                    </button>
                  ))}
                </div>
              </div>
              <div className="min-w-[120px]">
                <label htmlFor="respondent-count" className="block text-xs font-black uppercase mb-2">Jumlah Responden</label>
                <input id="respondent-count" type="number" min={1} max={9999} value={respondentCount}
                  onChange={(e) => setRespondentCount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="text-input w-full font-black text-lg py-3" />
              </div>
            </div>

            {/* Scale legend */}
            <div className="flex flex-wrap gap-2">
              {scales.map((s) => (
                <span key={s.value} className="text-xs font-bold uppercase px-3 py-1 border-2 border-black bg-[var(--brand-mint)]">
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
              const isOdd = (qi + 1) % 2 !== 0;

              return (
                <div key={q.id} className="brutal-card p-5 bg-white relative overflow-hidden" style={{ borderColor: "#000" }}>
                  <div className="absolute top-0 right-0 w-4 h-full" style={{ background: isOdd ? "var(--brand-blue)" : "var(--brand-yellow)" }}></div>

                  <div className="flex items-start justify-between gap-3 mb-4 pr-6">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black border-[3px] border-black bg-slate-100">{qi + 1}</div>
                      <input type="text" value={q.text} onChange={(e) => updateQuestionText(q.id, e.target.value)}
                        className="text-input flex-1 text-sm font-bold border-0 shadow-none focus:bg-slate-100 p-2" placeholder={`Pertanyaan ${qi + 1}`} />
                    </div>
                    {questions.length > 1 && (
                      <button onClick={() => removeQuestion(q.id)} className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-white border-2 border-black hover:bg-[var(--brand-pink)] hover:text-white transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    )}
                  </div>

                  {/* Score inputs per scale value */}
                  <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${scaleType}, 1fr)` }}>
                    {scales.map((s) => {
                      const count = q.scores[s.value - 1] ?? 0;
                      return (
                        <div key={s.value} className="text-center">
                          <div className="text-[10px] mb-2 font-black uppercase truncate border-b-2 border-black pb-1">{s.label}</div>
                          <input type="number" min={0} max={respondentCount} value={count}
                            onChange={(e) => updateScore(qi, s.value, parseInt(e.target.value) || 0)}
                            className="text-input w-full text-center font-bold" />
                        </div>
                      );
                    })}
                  </div>

                  {/* Per-question stats */}
                  <div className="flex items-center justify-between mt-4 pt-3 border-t-2 border-black text-xs font-black uppercase">
                    <span>
                      Total: <span className="bg-[var(--brand-mint)] px-2 border-2 border-black">{qTotal}</span> / {qMax}
                      {totalResp !== respondentCount && totalResp > 0 && <span className="ml-2 bg-[var(--brand-pink)] px-1 text-white border-2 border-black">⚠ {totalResp}/{respondentCount} resp</span>}
                    </span>
                    <span className="px-2 py-1 border-2 border-black bg-[var(--brand-yellow)]">{qPct.toFixed(1)}%</span>
                  </div>
                </div>
              );
            })}

            <button onClick={addQuestion}
              className="w-full py-4 rounded-xl text-sm font-black uppercase flex items-center justify-center gap-2 border-[3px] border-dashed border-black bg-slate-50 hover:bg-slate-100 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
              Tambah Pertanyaan
            </button>
          </div>

          {/* Right: Results */}
          <aside className="w-full lg:w-80 flex-shrink-0 lg:sticky lg:top-4 space-y-6">
            <div className="brutal-card p-6 bg-white">
              <h2 className="text-sm font-black uppercase tracking-wider text-center mb-6 border-b-4 border-black pb-1 inline-block w-full">Kelayakan Sistem</h2>

              {stats.hasData ? (
                <>
                  <div className="w-48 h-48 mx-auto mb-6">
                    <PercentRing pct={stats.grandPct} />
                  </div>

                  {/* Interpretation */}
                  {(() => { const info = getInterpretation(stats.grandPct); return (
                    <div className="p-4 rounded-xl text-center mb-6 border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transform -rotate-1" style={{ background: info.bgColor }}>
                      <div className="text-3xl mb-2">{info.emoji}</div>
                      <div className="font-black text-lg uppercase mb-1">{info.label}</div>
                      <div className="text-xs font-bold">{info.desc}</div>
                    </div>
                  ); })()}

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 mb-6">
                    {[
                      { label: "Total Skor", value: String(stats.grandTotal) },
                      { label: "Skor Maks", value: String(stats.grandMax) },
                      { label: "Responden", value: String(respondentCount) },
                    ].map((s) => (
                      <div key={s.label} className="text-center p-2 border-[3px] border-black bg-[var(--brand-mint)] transform rotate-1">
                        <div className="text-base font-black">{s.value}</div>
                        <div className="text-[9px] mt-1 font-bold uppercase">{s.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Prose */}
                  <div className="p-4 border-2 border-black bg-slate-100 text-xs font-bold leading-relaxed">
                    Persentase = <span className="bg-white px-1 border border-black">(Total / Maks) × 100%</span><br />
                    = ({stats.grandTotal} / {stats.grandMax}) × 100% = <span className="bg-[var(--brand-yellow)] px-1 border border-black">{stats.grandPct.toFixed(2)}%</span>
                  </div>

                  <button onClick={resetAll} className="btn-ghost w-full py-3 text-xs uppercase font-black mt-4 border-[3px] border-black">Reset Semua</button>
                </>
              ) : (
                <div className="text-center py-10">
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full border-4 border-black border-dashed flex items-center justify-center bg-slate-100 transform rotate-12">
                    <span className="font-black text-4xl">%</span>
                  </div>
                  <p className="text-sm font-bold">Isi jumlah jawaban per skala untuk melihat kelayakan</p>
                </div>
              )}
            </div>

            {/* Interpretation scale */}
            <div className="brutal-card p-5 bg-[var(--brand-lilac)]">
              <h3 className="text-sm font-black uppercase mb-4 border-b-2 border-black pb-1">Skala Interpretasi</h3>
              <div className="space-y-3 font-bold text-sm">
                {[
                  { range: "81% – 100%", label: "Sangat Layak" },
                  { range: "61% – 80%", label: "Layak" },
                  { range: "41% – 60%", label: "Cukup Layak" },
                  { range: "21% – 40%", label: "Tidak Layak" },
                  { range: "0% – 20%", label: "Sangat Tidak Layak" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="bg-white border-2 border-black px-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">{item.range}</span>
                    <span className="uppercase text-xs">{item.label}</span>
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
