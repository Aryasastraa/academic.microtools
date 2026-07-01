"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";

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
  borderColor: string;
  emoji: string;
}

// ─────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────

function getIPKInfo(ipk: number): IPKInfo {
  if (ipk >= 3.5)
    return {
      label: "Cumlaude / Dengan Pujian",
      color: "#10b981",
      bgColor: "rgba(16,185,129,0.1)",
      borderColor: "rgba(16,185,129,0.28)",
      emoji: "🏆",
    };
  if (ipk >= 3.0)
    return {
      label: "Sangat Memuaskan",
      color: "#6366f1",
      bgColor: "rgba(99,102,241,0.1)",
      borderColor: "rgba(99,102,241,0.28)",
      emoji: "⭐",
    };
  if (ipk >= 2.5)
    return {
      label: "Memuaskan",
      color: "#f59e0b",
      bgColor: "rgba(245,158,11,0.1)",
      borderColor: "rgba(245,158,11,0.28)",
      emoji: "👍",
    };
  if (ipk >= 2.0)
    return {
      label: "Cukup",
      color: "#f97316",
      bgColor: "rgba(249,115,22,0.1)",
      borderColor: "rgba(249,115,22,0.28)",
      emoji: "✅",
    };
  return {
    label: "Kurang",
    color: "#ef4444",
    bgColor: "rgba(239,68,68,0.1)",
    borderColor: "rgba(239,68,68,0.28)",
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
  const cx = 80, cy = 80, r = 60, sw = 12;
  const circum = 2 * Math.PI * r;
  const filled = (pct / 100) * circum;

  return (
    <svg viewBox="0 0 160 160" className="w-full h-full" aria-label={`IPK ${ipk.toFixed(2)} dari 4.00`} role="img">
      <defs>
        <filter id="ring-glow">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Background track */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(30,41,100,0.55)" strokeWidth={sw} />

      {/* Filled ring (rotated to start from top) */}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke={info.color}
        strokeWidth={sw}
        strokeDasharray={`${filled} ${circum - filled}`}
        strokeDashoffset={circum / 4}
        strokeLinecap="round"
        filter="url(#ring-glow)"
        style={{ transition: "stroke-dasharray 0.8s cubic-bezier(0.34,1.56,0.64,1)" }}
      />

      {/* Center text */}
      <text x={cx} y={cy - 8} textAnchor="middle" fill="white" fontSize="24" fontWeight="900" fontFamily="Inter, sans-serif">
        {ipk.toFixed(2)}
      </text>
      <text x={cx} y={cy + 10} textAnchor="middle" fill="rgba(148,163,184,0.7)" fontSize="10" fontFamily="Inter, sans-serif">
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
    <div className="min-h-screen flex flex-col" style={{ background: "#050818" }}>
      {/* Ambient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute top-0 right-1/3 w-96 h-96 rounded-full blur-3xl animate-float"
          style={{ background: "rgba(139,92,246,0.09)" }} />
        <div className="absolute bottom-1/3 left-1/4 w-80 h-80 rounded-full blur-3xl animate-float-2"
          style={{ background: "rgba(236,72,153,0.06)" }} />
      </div>

      {/* Header Ad */}
      <div className="ad-placeholder w-full" style={{ height: "90px" }} role="complementary" aria-label="Ad Space Header">
        <span>Advertisement · 728 × 90</span>
      </div>

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-5 py-4 max-w-5xl mx-auto w-full">
        <a
          href="/"
          className="flex items-center gap-2 text-sm transition-colors"
          style={{ color: "#64748b" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#f1f5f9")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#64748b")}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          AcademicTools
        </a>
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #8b5cf6, #ec4899)" }}
        >
          <span className="text-white text-xs font-black select-none">A</span>
        </div>
      </nav>

      {/* Main */}
      <main className="relative z-10 max-w-5xl mx-auto w-full px-4 pb-20 flex-1">
        {/* Header */}
        <header className="text-center mb-10">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-4"
            style={{
              background: "rgba(139,92,246,0.1)",
              border: "1px solid rgba(139,92,246,0.22)",
              color: "#a78bfa",
            }}
          >
            Indeks Prestasi Kumulatif · IP Semester
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-3 tracking-tight" style={{ color: "#f1f5f9" }}>
            Kalkulator <span style={{
              background: "linear-gradient(135deg, #8b5cf6, #ec4899)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>IPK</span>
          </h1>
          <p className="max-w-lg mx-auto text-sm sm:text-base leading-relaxed" style={{ color: "#64748b" }}>
            Tambahkan mata kuliah, pilih nilai huruf dan SKS. IPK dihitung{" "}
            <strong style={{ color: "#94a3b8" }}>secara real-time</strong>.
          </p>
        </header>

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* ── Left: Course Input Table ── */}
          <div className="flex-1 min-w-0">
            {/* Table header */}
            <div
              className="hidden sm:grid mb-3 px-4 text-xs font-semibold uppercase tracking-wider"
              style={{
                color: "#334155",
                gridTemplateColumns: "1fr 80px 60px 36px",
                gap: "12px",
              }}
            >
              <span>Mata Kuliah</span>
              <span className="text-center">Nilai</span>
              <span className="text-center">SKS</span>
              <span />
            </div>

            {/* Course rows */}
            <div className="space-y-2.5">
              {courses.map((course, idx) => {
                const gradeVal = GRADE_VALUES[course.grade] ?? 0;
                const points = gradeVal * course.sks;
                const isRemoving = removingId === course.id;

                return (
                  <div
                    key={course.id}
                    id={`course-row-${idx + 1}`}
                    className="glass-card rounded-xl px-4 py-3 course-row"
                    style={{
                      opacity: isRemoving ? 0 : 1,
                      transform: isRemoving ? "translateX(-16px)" : "translateX(0)",
                      transition: "opacity 0.25s ease, transform 0.25s ease",
                      animationDelay: `${idx * 0.05}s`,
                    }}
                  >
                    {/* Mobile layout */}
                    <div className="flex sm:hidden flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold" style={{ color: "#475569" }}>
                          MK {idx + 1}
                        </span>
                        {courses.length > 1 && (
                          <button
                            onClick={() => removeCourse(course.id)}
                            className="w-6 h-6 rounded-lg flex items-center justify-center transition-colors"
                            style={{ color: "#ef4444", background: "rgba(239,68,68,0.1)" }}
                            aria-label={`Hapus mata kuliah ${idx + 1}`}
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
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
                          className="grade-select flex-shrink-0"
                          value={course.grade}
                          onChange={(e) => updateCourse(course.id, "grade", e.target.value)}
                          aria-label={`Nilai mata kuliah ${idx + 1}`}
                        >
                          {GRADE_OPTIONS.map((g) => (
                            <option key={g} value={g}>
                              {g} ({GRADE_VALUES[g].toFixed(1)})
                            </option>
                          ))}
                        </select>
                        <input
                          type="number"
                          className="number-input"
                          min={1}
                          max={6}
                          value={course.sks}
                          onChange={(e) => updateCourse(course.id, "sks", Math.max(1, Math.min(6, parseInt(e.target.value) || 1)))}
                          aria-label={`SKS mata kuliah ${idx + 1}`}
                        />
                        <div className="flex-1 text-right text-xs self-center" style={{ color: "#64748b" }}>
                          <span style={{ color: "#94a3b8", fontWeight: 600 }}>{points.toFixed(1)}</span> pts
                        </div>
                      </div>
                    </div>

                    {/* Desktop layout */}
                    <div
                      className="hidden sm:grid items-center"
                      style={{ gridTemplateColumns: "1fr 80px 60px 36px", gap: "12px" }}
                    >
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
                          <option key={g} value={g}>
                            {g} ({GRADE_VALUES[g].toFixed(1)})
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        className="number-input w-full"
                        min={1}
                        max={6}
                        value={course.sks}
                        onChange={(e) => updateCourse(course.id, "sks", Math.max(1, Math.min(6, parseInt(e.target.value) || 1)))}
                        aria-label={`SKS mata kuliah ${idx + 1}`}
                      />
                      {courses.length > 1 ? (
                        <button
                          onClick={() => removeCourse(course.id)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 flex-shrink-0"
                          style={{ color: "#475569", background: "rgba(239,68,68,0.06)" }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.color = "#ef4444";
                            (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.15)";
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.color = "#475569";
                            (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.06)";
                          }}
                          aria-label={`Hapus mata kuliah ${idx + 1}`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      ) : (
                        <div className="w-8" />
                      )}
                    </div>

                    {/* Points indicator (desktop only) */}
                    <div className="hidden sm:flex justify-end mt-1.5 pr-12">
                      <span className="text-[10px]" style={{ color: "#334155" }}>
                        Bobot:{" "}
                        <span style={{ color: "#818cf8", fontWeight: 700 }}>
                          {gradeVal.toFixed(1)} × {course.sks} SKS = {points.toFixed(1)} poin
                        </span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add course button */}
            <button
              id="btn-add-course"
              onClick={addCourse}
              className="mt-4 w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200"
              style={{
                background: "rgba(139,92,246,0.07)",
                border: "1px dashed rgba(139,92,246,0.3)",
                color: "#a78bfa",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(139,92,246,0.13)";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(139,92,246,0.5)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(139,92,246,0.07)";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(139,92,246,0.3)";
              }}
              aria-label="Tambah mata kuliah baru"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Tambah Mata Kuliah
            </button>

            {/* Grade reference table */}
            <div className="glass-card rounded-2xl p-5 mt-6">
              <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#475569" }}>
                Tabel Konversi Nilai
              </h3>
              <div className="grid grid-cols-7 gap-2">
                {GRADE_OPTIONS.map((g) => (
                  <div key={g} className="text-center">
                    <div
                      className="w-full py-2 rounded-lg text-xs font-bold mb-1"
                      style={{
                        background: "rgba(139,92,246,0.12)",
                        color: "#a78bfa",
                        border: "1px solid rgba(139,92,246,0.2)",
                      }}
                    >
                      {g}
                    </div>
                    <div className="text-[10px]" style={{ color: "#64748b" }}>
                      {GRADE_VALUES[g].toFixed(1)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right: Results Panel ── */}
          <aside className="w-full lg:w-72 xl:w-80 flex-shrink-0 lg:sticky lg:top-4 space-y-4">
            {/* IPK Result Card */}
            <div className="glass-card rounded-2xl p-5">
              <h2
                className="text-xs font-semibold uppercase tracking-wider text-center mb-4"
                style={{ color: "#475569" }}
              >
                Indeks Prestasi
              </h2>

              {ipk !== null ? (
                <>
                  {/* Ring chart */}
                  <div className="w-40 h-40 mx-auto mb-4" id="ipk-ring-chart">
                    <IPKRing ipk={ipk} />
                  </div>

                  {/* Interpretation badge */}
                  <div
                    className="p-4 rounded-xl text-center mb-4"
                    style={{
                      background: info!.bgColor,
                      border: `1px solid ${info!.borderColor}`,
                    }}
                  >
                    <div className="text-xl mb-1">{info!.emoji}</div>
                    <div className="font-bold text-sm" style={{ color: info!.color }}>
                      {info!.label}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div
                      className="p-3 rounded-xl text-center"
                      style={{ background: "rgba(99,102,241,0.07)", border: "1px solid rgba(99,102,241,0.15)" }}
                    >
                      <div className="text-lg font-black" style={{ color: "#818cf8" }}>
                        {ipk.toFixed(2)}
                      </div>
                      <div className="text-xs mt-0.5" style={{ color: "#475569" }}>IPK</div>
                    </div>
                    <div
                      className="p-3 rounded-xl text-center"
                      style={{ background: "rgba(99,102,241,0.07)", border: "1px solid rgba(99,102,241,0.15)" }}
                    >
                      <div className="text-lg font-black" style={{ color: "#818cf8" }}>
                        {totalSKS}
                      </div>
                      <div className="text-xs mt-0.5" style={{ color: "#475569" }}>Total SKS</div>
                    </div>
                  </div>

                  {/* Per-course breakdown */}
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {courses
                      .filter((c) => c.sks > 0 && c.grade in GRADE_VALUES)
                      .map((c, i) => {
                        const pts = (GRADE_VALUES[c.grade] ?? 0) * c.sks;
                        return (
                          <div key={c.id} className="flex items-center justify-between text-xs py-1">
                            <span
                              className="truncate max-w-[110px]"
                              style={{ color: "#94a3b8" }}
                              title={c.name || `MK ${i + 1}`}
                            >
                              {c.name || `MK ${i + 1}`}
                            </span>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span
                                className="px-1.5 py-0.5 rounded font-bold"
                                style={{ background: "rgba(139,92,246,0.15)", color: "#a78bfa", fontSize: "10px" }}
                              >
                                {c.grade}
                              </span>
                              <span style={{ color: "#64748b" }}>{c.sks} SKS</span>
                              <span style={{ color: "#6366f1", fontWeight: 700 }}>
                                {pts.toFixed(1)}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                  </div>

                  {/* Actions */}
                  <div className="mt-4 space-y-2">
                    <button
                      id="btn-share-ipk"
                      onClick={shareResult}
                      className="btn-primary w-full py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2"
                      style={{ background: "linear-gradient(135deg, #8b5cf6, #ec4899)" }}
                      aria-label="Salin link hasil IPK"
                    >
                      {copied ? (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Link Tersalin!
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                          </svg>
                          Salin Link Hasil
                        </>
                      )}
                    </button>
                    <button
                      id="btn-reset-ipk"
                      onClick={resetAll}
                      className="btn-ghost w-full py-2 text-xs"
                    >
                      Reset semua mata kuliah
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <div
                    className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center animate-pulseRing"
                    style={{
                      background: "rgba(139,92,246,0.08)",
                      border: "1px solid rgba(139,92,246,0.2)",
                    }}
                  >
                    <span className="font-black text-3xl" style={{ color: "rgba(139,92,246,0.4)" }}>?</span>
                  </div>
                  <p className="text-xs" style={{ color: "#334155" }}>
                    Tambahkan mata kuliah dan
                    <br />
                    pilih nilai untuk melihat IPK
                  </p>
                </div>
              )}
            </div>

            {/* Ad below results */}
            <div
              className="ad-placeholder rounded-2xl"
              style={{ height: "120px" }}
              role="complementary"
              aria-label="Ad Space"
            >
              <span>Advertisement · 300 × 250</span>
            </div>

            {/* IPK categories reference */}
            <div className="glass-card rounded-2xl p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#475569" }}>
                Kategori Predikat
              </h3>
              <div className="space-y-2">
                {[
                  { range: "3.50 – 4.00", label: "Cumlaude", color: "#10b981" },
                  { range: "3.00 – 3.49", label: "Sangat Memuaskan", color: "#6366f1" },
                  { range: "2.50 – 2.99", label: "Memuaskan", color: "#f59e0b" },
                  { range: "2.00 – 2.49", label: "Cukup", color: "#f97316" },
                  { range: "< 2.00", label: "Kurang", color: "#ef4444" },
                ].map((cat) => (
                  <div key={cat.label} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: cat.color }} />
                      <span style={{ color: "#475569" }}>{cat.range}</span>
                    </div>
                    <span style={{ color: "#94a3b8" }}>{cat.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Footer Ad */}
      <div
        className="ad-placeholder w-full"
        style={{ height: "90px" }}
        role="complementary"
        aria-label="Ad Space Footer"
      >
        <span>Advertisement · 728 × 90</span>
      </div>

      <footer className="relative z-10 text-center py-4 text-xs" style={{ color: "#1e293b" }}>
        © 2025 AcademicTools · Kalkulator IPK gratis untuk mahasiswa Indonesia
      </footer>
    </div>
  );
}
