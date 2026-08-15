"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

// ─────────────────────────────────────────────
//  Constants & Types
// ─────────────────────────────────────────────

const GRADE_VALUES: Record<string, number> = {
  A: 4.0,
  AB: 3.5,
  B: 3.0,
  BC: 2.5,
  C: 2.0,
  D: 1.0,
  E: 0.0,
};

const GRADE_OPTIONS = Object.keys(GRADE_VALUES);

interface Course {
  id: string;
  name: string;
  grade: string;
  sks: number;
}

interface IPKInfo {
  label: string;
  color: string;
  bgColor: string;
  emoji: string;
}

// ─────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────

function getIPKInfo(ipk: number): IPKInfo {
  if (ipk >= 3.5)
    return {
      label: "Cumlaude / Dengan Pujian",
      color: "#1e293b",
      bgColor: "var(--brand-mint)",
      emoji: "🏆",
    };
  if (ipk >= 3.0)
    return {
      label: "Sangat Memuaskan",
      color: "#1e293b",
      bgColor: "var(--brand-blue)",
      emoji: "⭐",
    };
  if (ipk >= 2.5)
    return {
      label: "Memuaskan",
      color: "#1e293b",
      bgColor: "var(--brand-yellow)",
      emoji: "👍",
    };
  if (ipk >= 2.0)
    return {
      label: "Cukup",
      color: "#1e293b",
      bgColor: "var(--brand-orange)",
      emoji: "✅",
    };
  return {
    label: "Kurang",
    color: "#1e293b",
    bgColor: "var(--brand-pink)",
    emoji: "⚠️",
  };
}

function newCourse(): Course {
  return {
    id: `c-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: "",
    grade: "A",
    sks: 3,
  };
}

/** URL-safe Base64 encode that handles Unicode (e.g., Indonesian course names) */
function safeEncode(str: string): string {
  return btoa(unescape(encodeURIComponent(str)));
}

function safeDecode(str: string): string {
  return decodeURIComponent(escape(atob(str)));
}

// ─────────────────────────────────────────────
//  IPK Donut / Ring Chart (pure SVG)
// ─────────────────────────────────────────────

function IPKRing({ ipk }: { ipk: number }) {
  const info = getIPKInfo(ipk);
  const pct = (ipk / 4.0) * 100;

  // SVG ring parameters
  const cx = 80, cy = 80, r = 60, sw = 16;
  const circum = 2 * Math.PI * r;
  const filled = (pct / 100) * circum;

  return (
    <svg viewBox="0 0 160 160" className="w-full h-full" aria-label={`IPK ${ipk.toFixed(2)} dari 4.00`} role="img">
      {/* Background track */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e2e8f0" strokeWidth={sw} />

      {/* Filled ring (rotated to start from top) */}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke={info.bgColor}
        strokeWidth={sw}
        strokeDasharray={`${filled} ${circum - filled}`}
        strokeDashoffset={circum / 4}
        strokeLinecap="butt"
        style={{ transition: "stroke-dasharray 0.8s cubic-bezier(0.34,1.56,0.64,1)" }}
      />
      {/* Outline for the filled ring */}
      <circle
        cx={cx}
        cy={cy}
        r={r + sw/2}
        fill="none"
        stroke="#000"
        strokeWidth="2"
      />
      <circle
        cx={cx}
        cy={cy}
        r={r - sw/2}
        fill="none"
        stroke="#000"
        strokeWidth="2"
      />

      {/* Center text */}
      <text x={cx} y={cy - 5} textAnchor="middle" fill="#000" fontSize="28" fontWeight="900" fontFamily="Inter, sans-serif">
        {ipk.toFixed(2)}
      </text>
      <text x={cx} y={cy + 15} textAnchor="middle" fill="#64748b" fontSize="12" fontWeight="700" fontFamily="Inter, sans-serif">
        / 4.00
      </text>
    </svg>
  );
}

// ─────────────────────────────────────────────
//  Main Component
// ─────────────────────────────────────────────

export default function IpkCalculator() {
  const searchParams = useSearchParams();
  const [courses, setCourses] = useState<Course[]>([newCourse(), newCourse(), newCourse()]);
  const [copied, setCopied] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  // ── Restore from URL ──────────────────────────

  useEffect(() => {
    const data = searchParams.get("data");
    if (!data) return;
    try {
      const parsed: unknown = JSON.parse(safeDecode(data));
      if (!Array.isArray(parsed)) return;
      const restored: Course[] = (parsed as unknown[])
        .filter(
          (item): item is { n: string; g: string; s: number } =>
            typeof item === "object" &&
            item !== null &&
            "n" in item &&
            "g" in item &&
            "s" in item
        )
        .map((item) => ({
          id: `c-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          name: String(item.n),
          grade: GRADE_OPTIONS.includes(String(item.g)) ? String(item.g) : "A",
          sks: Math.max(1, Math.min(6, Number(item.s) || 3)),
        }));
      if (restored.length > 0) setCourses(restored);
    } catch {
      // Invalid data — ignore
    }
  }, [searchParams]);

  // ── Calculation ──────────────────────────────

  const calculateIPK = useCallback((): number | null => {
    const valid = courses.filter((c) => c.grade in GRADE_VALUES && c.sks > 0);
    if (valid.length === 0) return null;
    const totalPoints = valid.reduce(
      (sum, c) => sum + (GRADE_VALUES[c.grade] ?? 0) * c.sks,
      0
    );
    const totalSKS = valid.reduce((sum, c) => sum + c.sks, 0);
    return totalPoints / totalSKS;
  }, [courses]);

  const ipk = calculateIPK();
  const totalSKS = courses.reduce((s, c) => s + (c.sks > 0 ? c.sks : 0), 0);
  const info = ipk !== null ? getIPKInfo(ipk) : null;

  // ── Handlers ─────────────────────────────────

  const addCourse = () => setCourses((prev) => [...prev, newCourse()]);

  const removeCourse = (id: string) => {
    if (courses.length <= 1) return;
    setRemovingId(id);
    setTimeout(() => {
      setCourses((prev) => prev.filter((c) => c.id !== id));
      setRemovingId(null);
    }, 250);
  };

  const updateCourse = (id: string, field: keyof Omit<Course, "id">, value: string | number) => {
    setCourses((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const shareResult = async () => {
    const payload = courses.map((c) => ({ n: c.name, g: c.grade, s: c.sks }));
    const encoded = safeEncode(JSON.stringify(payload));
    const url = new URL(window.location.href);
    url.searchParams.set("data", encoded);
    window.history.replaceState(null, "", url.toString());
    try {
      await navigator.clipboard.writeText(url.toString());
    } catch {
      // clipboard unavailable — URL updated in address bar
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const resetAll = () => {
    setCourses([newCourse(), newCourse(), newCourse()]);
    const url = new URL(window.location.href);
    url.searchParams.delete("data");
    window.history.replaceState(null, "", url.toString());
  };

  // ── Render ───────────────────────────────────

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header Ad */}
      <div className="p-4 flex justify-center mt-2">
      </div>

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-5 py-4 max-w-5xl mx-auto w-full">
        <Link href="/" className="flex items-center gap-2 font-black uppercase text-sm border-2 border-transparent hover:border-black hover:bg-black hover:text-white px-3 py-1 rounded transition-all">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Kembali
        </Link>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center border-[3px] border-black bg-[var(--brand-lilac)] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transform rotate-3">
          <span className="text-black text-sm font-black select-none">A</span>
        </div>
      </nav>

      {/* Main */}
      <main className="relative z-10 max-w-5xl mx-auto w-full px-4 pb-20 flex-1">
        {/* Header */}
        <header className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase mb-4 brutal-badge bg-[var(--brand-lilac)]">
            Indeks Prestasi Kumulatif · IP Semester
          </div>
          <h1 className="text-4xl sm:text-5xl font-black mb-3 tracking-tight uppercase">
            Kalkulator IPK
          </h1>
          <p className="max-w-lg mx-auto text-base font-bold leading-relaxed">
            Tambahkan mata kuliah, pilih nilai huruf dan SKS. IPK dihitung secara real-time.
          </p>
        </header>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* ── Left: Course Input Table ── */}
          <div className="flex-1 w-full min-w-0">
            {/* Desktop Table Header */}
            <div className="hidden sm:grid mb-2 px-4 text-xs font-black uppercase tracking-wider"
              style={{ gridTemplateColumns: "1fr 80px 60px 48px", gap: "12px" }}>
              <span>Mata Kuliah</span>
              <span className="text-center">Nilai</span>
              <span className="text-center">SKS</span>
              <span />
            </div>

            {/* Course rows */}
            <div className="space-y-4">
              {courses.map((course, idx) => {
                const gradeVal = GRADE_VALUES[course.grade] ?? 0;
                const points = gradeVal * course.sks;
                const isRemoving = removingId === course.id;

                return (
                  <div
                    key={course.id}
                    id={`course-row-${idx + 1}`}
                    className="brutal-card p-4 course-row bg-white"
                    style={{
                      opacity: isRemoving ? 0 : 1,
                      transform: isRemoving ? "translateX(-20px)" : "translateX(0)",
                      animationDelay: `${idx * 0.05}s`,
                    }}
                  >
                    {/* Mobile layout */}
                    <div className="flex sm:hidden flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-black uppercase">
                          MK {idx + 1}
                        </span>
                        {courses.length > 1 && (
                          <button onClick={() => removeCourse(course.id)} className="btn-danger p-1 border-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        className="text-input"
                        placeholder={`Nama Mata Kuliah ${idx + 1}`}
                        value={course.name}
                        onChange={(e) => updateCourse(course.id, "name", e.target.value)}
                        aria-label={`Nama mata kuliah ${idx + 1}`}
                      />
                      <div className="flex gap-3">
                        <select
                          className="grade-select"
                          value={course.grade}
                          onChange={(e) => updateCourse(course.id, "grade", e.target.value)}
                          aria-label={`Nilai mata kuliah ${idx + 1}`}
                        >
                          {GRADE_OPTIONS.map((g) => (
                            <option key={g} value={g}>{g}</option>
                          ))}
                        </select>
                        <input
                          type="number"
                          className="number-input"
                          min={1} max={6}
                          value={course.sks}
                          onChange={(e) => updateCourse(course.id, "sks", Math.max(1, Math.min(6, parseInt(e.target.value) || 1)))}
                          aria-label={`SKS mata kuliah ${idx + 1}`}
                        />
                        <div className="flex-1 text-right text-xs self-center font-bold">
                          <span className="text-base">{points.toFixed(1)}</span> pts
                        </div>
                      </div>
                    </div>

                    {/* Desktop layout */}
                    <div className="hidden sm:grid items-center" style={{ gridTemplateColumns: "1fr 80px 60px 48px", gap: "12px" }}>
                      <input
                        type="text"
                        className="text-input"
                        placeholder={`Nama Mata Kuliah ${idx + 1}`}
                        value={course.name}
                        onChange={(e) => updateCourse(course.id, "name", e.target.value)}
                        aria-label={`Nama mata kuliah ${idx + 1}`}
                      />
                      <select
                        className="grade-select w-full"
                        value={course.grade}
                        onChange={(e) => updateCourse(course.id, "grade", e.target.value)}
                        aria-label={`Nilai mata kuliah ${idx + 1}`}
                      >
                        {GRADE_OPTIONS.map((g) => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                      <input
                        type="number"
                        className="number-input w-full"
                        min={1} max={6}
                        value={course.sks}
                        onChange={(e) => updateCourse(course.id, "sks", Math.max(1, Math.min(6, parseInt(e.target.value) || 1)))}
                        aria-label={`SKS mata kuliah ${idx + 1}`}
                      />
                      {courses.length > 1 ? (
                        <button
                          onClick={() => removeCourse(course.id)}
                          className="btn-danger w-10 h-10 flex items-center justify-center p-0 flex-shrink-0"
                          aria-label={`Hapus mata kuliah ${idx + 1}`}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      ) : (
                        <div className="w-10" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add course button */}
            <button
              id="btn-add-course"
              onClick={addCourse}
              className="mt-6 w-full btn-secondary py-3 flex items-center justify-center gap-2 border-dashed bg-slate-50"
              aria-label="Tambah mata kuliah baru"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              TAMBAH MATA KULIAH
            </button>

            {/* Grade reference table */}
            <div className="brutal-card p-5 mt-10 bg-white">
              <h3 className="text-sm font-black uppercase tracking-wider mb-4 border-b-2 border-black pb-2">
                Konversi Nilai
              </h3>
              <div className="grid grid-cols-7 gap-2">
                {GRADE_OPTIONS.map((g) => (
                  <div key={g} className="text-center">
                    <div className="w-full py-2 border-2 border-black rounded bg-[var(--brand-mint)] font-black text-sm mb-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      {g}
                    </div>
                    <div className="text-xs font-bold mt-2">
                      {GRADE_VALUES[g].toFixed(1)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right: Results Panel ── */}
          <aside className="w-full lg:w-80 flex-shrink-0 lg:sticky lg:top-4 space-y-6">
            {/* IPK Result Card */}
            <div className="brutal-card p-6 bg-white">
              <h2 className="text-sm font-black uppercase tracking-wider text-center mb-6">
                Hasil Indeks Prestasi
              </h2>

              {ipk !== null ? (
                <>
                  {/* Ring chart */}
                  <div className="w-48 h-48 mx-auto mb-6" id="ipk-ring-chart">
                    <IPKRing ipk={ipk} />
                  </div>

                  {/* Interpretation badge */}
                  <div
                    className="p-4 rounded-xl text-center mb-6 border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transform -rotate-1"
                    style={{ background: info!.bgColor }}
                  >
                    <div className="text-3xl mb-2">{info!.emoji}</div>
                    <div className="font-black uppercase text-sm" style={{ color: info!.color }}>
                      {info!.label}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="brutal-card p-3 text-center bg-[var(--brand-yellow)]">
                      <div className="text-2xl font-black">{ipk.toFixed(2)}</div>
                      <div className="text-xs font-bold uppercase mt-1">IPK</div>
                    </div>
                    <div className="brutal-card p-3 text-center bg-[var(--brand-blue)]">
                      <div className="text-2xl font-black">{totalSKS}</div>
                      <div className="text-xs font-bold uppercase mt-1">Total SKS</div>
                    </div>
                  </div>

                  {/* Per-course breakdown */}
                  <div className="space-y-2 mb-6 max-h-48 overflow-y-auto pr-2 border-y-2 border-black py-4">
                    {courses
                      .filter((c) => c.sks > 0 && c.grade in GRADE_VALUES)
                      .map((c, i) => {
                        const pts = (GRADE_VALUES[c.grade] ?? 0) * c.sks;
                        return (
                          <div key={c.id} className="flex items-center justify-between text-sm font-bold">
                            <span className="truncate max-w-[110px]" title={c.name || `MK ${i + 1}`}>
                              {c.name || `MK ${i + 1}`}
                            </span>
                            <div className="flex items-center gap-3 flex-shrink-0">
                              <span className="brutal-badge bg-[var(--brand-lilac)]">
                                {c.grade}
                              </span>
                              <span>{c.sks} SKS</span>
                              <span className="bg-black text-white px-2 rounded-sm">{pts.toFixed(1)}</span>
                            </div>
                          </div>
                        );
                      })}
                  </div>

                  {/* Actions */}
                  <div className="space-y-3">
                    <button
                      id="btn-share-ipk"
                      onClick={shareResult}
                      className="btn-primary w-full py-3"
                      style={{ background: "var(--brand-mint)" }}
                      aria-label="Salin link hasil IPK"
                    >
                      <div className="flex items-center justify-center gap-2">
                        {copied ? (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                            LINK TERSALIN!
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            SALIN LINK HASIL
                          </>
                        )}
                      </div>
                    </button>
                    <button id="btn-reset-ipk" onClick={resetAll} className="btn-ghost w-full">
                      RESET SEMUA
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-10">
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full border-4 border-black border-dashed flex items-center justify-center bg-slate-100 transform rotate-12">
                    <span className="font-black text-4xl">?</span>
                  </div>
                  <p className="text-sm font-bold">
                    Tambahkan mata kuliah dan pilih nilai untuk melihat IPK
                  </p>
                </div>
              )}
            </div>

            {/* Ad below results */}

            {/* IPK categories reference */}
            <div className="brutal-card p-5 bg-[var(--brand-pink)]">
              <h3 className="text-sm font-black uppercase tracking-wider mb-4 border-b-2 border-black pb-2">
                Kategori Predikat
              </h3>
              <div className="space-y-3 font-bold text-sm">
                {[
                  { range: "3.50 – 4.00", label: "Cumlaude" },
                  { range: "3.00 – 3.49", label: "Sgt Memuaskan" },
                  { range: "2.50 – 2.99", label: "Memuaskan" },
                  { range: "2.00 – 2.49", label: "Cukup" },
                  { range: "< 2.00", label: "Kurang" },
                ].map((cat) => (
                  <div key={cat.label} className="flex items-center justify-between">
                    <span className="bg-white border-2 border-black px-2 py-0.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">{cat.range}</span>
                    <span>{cat.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Footer Ad */}
      <div className="p-4 flex justify-center mt-8">
      </div>

      <footer className="relative z-10 text-center py-6 font-bold text-sm border-t-[3px] border-black mt-4 bg-white">
        © 2025 AcademicTools · Kalkulator IPK gratis untuk mahasiswa Indonesia
      </footer>
    </div>
  );
}
