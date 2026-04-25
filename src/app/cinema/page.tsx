"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/hooks/useLanguage";

const MODES = [
  { id: "text",  label: "TEXT TO VIDEO",  labelAr: "نص إلى فيديو",   desc: "Generate video from a prompt",           descAr: "أنشئ فيديو من وصف نصي" },
  { id: "image", label: "IMAGE TO VIDEO", labelAr: "صورة إلى فيديو", desc: "Animate any image into motion",          descAr: "حوّل أي صورة إلى فيديو متحرك" },
] as const;
type Mode = typeof MODES[number]["id"];

const ENGINES = [
  {
    id: "video_quick",
    label: "Kling 3 Turbo",  labelAr: "كلينج توربو",
    badge: "FAST",           badgeAr: "سريع",
    desc: "5-sec clips. Ultra-fast generation.",   descAr: "مقاطع 5 ثوانٍ. توليد فائق السرعة.",
    cost: 80,
    duration: 5,
    supportsImage: true,
  },
  {
    id: "video_standard",
    label: "Kling 3 Pro",    labelAr: "كلينج برو",
    badge: "QUALITY",        badgeAr: "جودة",
    desc: "10-sec cinematic clips. Pro quality.",  descAr: "مقاطع سينمائية 10 ثوانٍ. جودة احترافية.",
    cost: 400,
    duration: 10,
    supportsImage: true,
  },
  {
    id: "video_cinematic",
    label: "Veo 3.1",        labelAr: "فيو 3.1",
    badge: "CINEMATIC",      badgeAr: "سينمائي",
    desc: "Native audio. Highest fidelity.",       descAr: "صوت أصلي. أعلى دقة.",
    cost: 800,
    duration: 8,
    supportsImage: false,
  },
];

const ASPECT_RATIOS = [
  { id: "16:9",  label: "16:9",  icon: "▬", labelAr: "عرض" },
  { id: "9:16",  label: "9:16",  icon: "▮", labelAr: "طولي" },
  { id: "1:1",   label: "1:1",   icon: "◼", labelAr: "مربع" },
];

type JobStatus = "idle" | "submitting" | "queued" | "processing" | "completed" | "failed";

interface VideoJob {
  id: string;
  requestId: string;
  modelId: string;
  engine: string;
  prompt: string;
  status: JobStatus;
  videoUrl?: string;
  queuePosition?: number;
  createdAt: string;
}

export default function CinemaEnginePage() {
  const [lang] = useLanguage();
  const isAr = lang === "ar";

  const [mode, setMode] = useState<Mode>("text");
  const [engine, setEngine] = useState("video_quick");
  const [prompt, setPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [jobs, setJobs] = useState<VideoJob[]>([]);
  const [activeJob, setActiveJob] = useState<VideoJob | null>(null);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  const gold = "#D4AF37";
  const goldFaint = "rgba(212,175,55,0.06)";
  const goldBorder = "rgba(212,175,55,0.18)";
  const goldText = "rgba(212,175,55,0.5)";

  const selectedEngine = ENGINES.find(e => e.id === engine) || ENGINES[0];

  // Poll active job
  useEffect(() => {
    if (!activeJob || activeJob.status === "completed" || activeJob.status === "failed") {
      if (pollRef.current) clearInterval(pollRef.current);
      return;
    }
    pollRef.current = setInterval(async () => {
      try {
        const MODEL_IDS: Record<string, string> = {
          video_quick:     "fal-ai/kling-video/v1/standard/text-to-video",
          video_standard:  "fal-ai/kling-video/v1.6/pro/text-to-video",
          video_cinematic: "fal-ai/minimax-video/text-to-video",
        };
        const modelId = encodeURIComponent(MODEL_IDS[activeJob.engine] || MODEL_IDS.video_quick);
        const res = await fetch(`/api/video/status?requestId=${activeJob.requestId}&modelId=${modelId}`);
        const data = await res.json();

        setJobs(prev => prev.map(j => j.id === activeJob.id
          ? {
              ...j,
              status: data.status === "COMPLETED" ? "completed"
                    : data.status === "FAILED"    ? "failed"
                    : data.status === "IN_PROGRESS" ? "processing"
                    : "queued",
              videoUrl: data.videoUrl || j.videoUrl,
              queuePosition: data.position ?? j.queuePosition,
            }
          : j
        ));

        setActiveJob(prev => prev ? {
          ...prev,
          status: data.status === "COMPLETED" ? "completed"
                : data.status === "FAILED"    ? "failed"
                : data.status === "IN_PROGRESS" ? "processing"
                : "queued",
          videoUrl: data.videoUrl || prev.videoUrl,
          queuePosition: data.position ?? prev.queuePosition,
        } : null);

      } catch { /* continue polling */ }
    }, 4000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [activeJob?.id, activeJob?.status]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = ev => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!prompt.trim() || (mode === "image" && !imageFile)) return;
    if (activeJob && (activeJob.status === "queued" || activeJob.status === "processing" || activeJob.status === "submitting")) return;

    setError("");
    const tempId = Date.now().toString();

    const newJob: VideoJob = {
      id: tempId,
      requestId: "",
      modelId: "",
      engine,
      prompt,
      status: "submitting",
      createdAt: new Date().toLocaleTimeString(),
    };
    setJobs(prev => [newJob, ...prev]);
    setActiveJob(newJob);

    try {
      let body: FormData | string;
      let headers: Record<string, string> = {};

      if (mode === "image" && imageFile) {
        const fd = new FormData();
        fd.append("prompt", prompt);
        fd.append("videoType", engine);
        fd.append("aspectRatio", aspectRatio);
        fd.append("mode", "image");
        fd.append("image", imageFile);
        body = fd;
      } else {
        body = JSON.stringify({ prompt, videoType: engine, aspectRatio, mode });
        headers["Content-Type"] = "application/json";
      }

      const res = await fetch("/api/video/submit", {
        method: "POST",
        headers: Object.keys(headers).length ? headers : undefined,
        body,
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        const msg = data.error === "upgrade_required"
          ? (isAr ? "هذه الميزة تتطلب خطة مدفوعة" : "Video generation requires a paid plan")
          : data.error === "insufficient_credits"
          ? (isAr ? "طاقة الشبكة غير كافية" : "Insufficient Grid Energy")
          : data.message || (isAr ? "فشل الإرسال" : "Submission failed");
        setError(msg);
        setJobs(prev => prev.map(j => j.id === tempId ? { ...j, status: "failed" } : j));
        setActiveJob(prev => prev?.id === tempId ? { ...prev, status: "failed" } : prev);
        return;
      }

      const updatedJob: VideoJob = { ...newJob, requestId: data.requestId, modelId: data.modelId, status: "queued" };
      setJobs(prev => prev.map(j => j.id === tempId ? updatedJob : j));
      setActiveJob(updatedJob);

    } catch {
      setError(isAr ? "فشل الاتصال بالخادم" : "Server connection failed");
      setJobs(prev => prev.map(j => j.id === tempId ? { ...j, status: "failed" } : j));
      setActiveJob(prev => prev?.id === tempId ? { ...prev, status: "failed" } : prev);
    }
  };

  const statusLabel = (s: JobStatus) => {
    const map: Record<JobStatus, string> = {
      idle: "", submitting: isAr ? "جارٍ الإرسال..." : "SUBMITTING...",
      queued: isAr ? "في قائمة الانتظار" : "IN QUEUE",
      processing: isAr ? "جارٍ التوليد..." : "GENERATING...",
      completed: isAr ? "مكتمل ✓" : "COMPLETED ✓",
      failed: isAr ? "فشل" : "FAILED",
    };
    return map[s] || s;
  };

  const statusColor = (s: JobStatus) => ({
    idle: goldText, submitting: gold, queued: "#06B6D4",
    processing: "#FBBF24", completed: "#22C55E", failed: "#EF4444",
  }[s] || goldText);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#d0c5af]" dir={isAr ? "rtl" : "ltr"}>

      {/* Header */}
      <div className="px-8 py-6 border-b" style={{ borderColor: "rgba(212,175,55,0.1)" }}>
        <p className="font-[Orbitron] text-[9px] tracking-[5px] uppercase mb-1" style={{ color: goldText }}>
          {isAr ? "المهارات المتقدمة" : "SUPER SKILLS"}
        </p>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-[Orbitron] text-3xl font-black tracking-tighter" style={{ color: gold }}>
              {isAr ? "محرك السينما" : "CINEMA ENGINE"}
            </h1>
            <p className="font-[Rajdhani] text-sm mt-1" style={{ color: goldText }}>
              {isAr ? "تحويل النص والصور إلى فيديو سينمائي بثلاثة محركات" : "Text & image to cinematic video — 3 AI engines"}
            </p>
          </div>
          <Link href="/creative-studio"
            className="font-[Orbitron] text-[8px] tracking-[2px] uppercase px-4 py-2 transition-all"
            style={{ border: `1px solid ${goldBorder}`, color: goldText }}>
            {isAr ? "← الاستوديو الإبداعي" : "CREATIVE STUDIO →"}
          </Link>
        </div>

        {/* Mode tabs */}
        <div className="flex gap-1 mt-5">
          {MODES.map(m => (
            <button key={m.id} onClick={() => setMode(m.id)}
              className="font-[Orbitron] text-[9px] tracking-[2px] uppercase px-5 py-2.5 transition-all"
              style={{
                background: mode === m.id ? gold : "transparent",
                color: mode === m.id ? "#0A0A0A" : goldText,
                border: `1px solid ${mode === m.id ? gold : goldBorder}`,
                fontWeight: mode === m.id ? 700 : 400,
              }}>
              {isAr ? m.labelAr : m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex h-[calc(100vh-180px)]">

        {/* ── Left control panel ── */}
        <div className="w-[340px] shrink-0 border-r overflow-y-auto p-6 flex flex-col gap-5"
          style={{ borderColor: "rgba(212,175,55,0.08)" }}>

          {/* Image upload (image-to-video mode) */}
          {mode === "image" && (
            <div>
              <label className="font-[Orbitron] text-[8px] tracking-[3px] uppercase block mb-2" style={{ color: goldText }}>
                {isAr ? "الصورة المصدر" : "SOURCE IMAGE"}
              </label>
              <div
                onClick={() => fileRef.current?.click()}
                className="w-full flex flex-col items-center justify-center cursor-pointer transition-all"
                style={{
                  background: goldFaint, border: `1px dashed ${goldBorder}`,
                  minHeight: imagePreview ? "auto" : "120px", padding: "16px",
                }}>
                {imagePreview ? (
                  <img src={imagePreview} alt="Source" className="w-full max-h-40 object-contain" />
                ) : (
                  <>
                    <div className="font-[Orbitron] text-2xl mb-2" style={{ color: goldText }}>𓂀</div>
                    <p className="font-[Orbitron] text-[8px] tracking-[2px] uppercase" style={{ color: goldText }}>
                      {isAr ? "انقر لرفع الصورة" : "CLICK TO UPLOAD IMAGE"}
                    </p>
                    <p className="font-[Rajdhani] text-[11px] mt-1" style={{ color: "rgba(212,175,55,0.3)" }}>
                      JPG · PNG · WEBP
                    </p>
                  </>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              {imagePreview && (
                <button onClick={() => { setImageFile(null); setImagePreview(null); if (fileRef.current) fileRef.current.value = ""; }}
                  className="font-[Orbitron] text-[8px] tracking-[2px] uppercase mt-1.5 px-3 py-1"
                  style={{ border: `1px solid ${goldBorder}`, color: goldText }}>
                  {isAr ? "إزالة الصورة" : "REMOVE"}
                </button>
              )}
            </div>
          )}

          {/* Prompt */}
          <div>
            <label className="font-[Orbitron] text-[8px] tracking-[3px] uppercase block mb-2" style={{ color: goldText }}>
              {isAr ? "الوصف" : "PROMPT"}
            </label>
            <textarea value={prompt} onChange={e => setPrompt(e.target.value)}
              placeholder={isAr
                ? "صف المشهد السينمائي الذي تريده..."
                : "Describe the cinematic scene you want to generate..."}
              rows={5}
              className="w-full px-4 py-3 text-sm font-[Rajdhani] resize-none"
              style={{ background: goldFaint, border: `1px solid ${goldBorder}`, color: "#d0c5af", outline: "none" }}
            />
          </div>

          {/* Engine selection */}
          <div>
            <label className="font-[Orbitron] text-[8px] tracking-[3px] uppercase block mb-2" style={{ color: goldText }}>
              {isAr ? "المحرك" : "ENGINE"}
            </label>
            <div className="flex flex-col gap-1.5">
              {ENGINES.filter(e => mode === "text" || e.supportsImage).map(e => (
                <button key={e.id} onClick={() => setEngine(e.id)}
                  className="text-left px-3 py-2.5 transition-all"
                  style={{
                    background: engine === e.id ? "rgba(212,175,55,0.1)" : "transparent",
                    border: `1px solid ${engine === e.id ? gold : goldBorder}`,
                  }}>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-[Orbitron] text-[10px] font-bold" style={{ color: engine === e.id ? gold : "#d0c5af" }}>
                      {isAr ? e.labelAr : e.label}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[8px] px-1.5 py-0.5" style={{ background: "rgba(212,175,55,0.1)", color: goldText }}>
                        {isAr ? e.badgeAr : e.badge}
                      </span>
                      <span className="font-mono text-[9px]" style={{ color: goldText }}>{e.cost} GE</span>
                    </div>
                  </div>
                  <p className="font-[Rajdhani] text-[11px]" style={{ color: goldText }}>
                    {isAr ? e.descAr : e.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Aspect ratio */}
          <div>
            <label className="font-[Orbitron] text-[8px] tracking-[3px] uppercase block mb-2" style={{ color: goldText }}>
              {isAr ? "نسبة الأبعاد" : "ASPECT RATIO"}
            </label>
            <div className="flex gap-2">
              {ASPECT_RATIOS.map(ar => (
                <button key={ar.id} onClick={() => setAspectRatio(ar.id)}
                  className="flex-1 flex flex-col items-center gap-1 py-2.5 transition-all"
                  style={{
                    background: aspectRatio === ar.id ? "rgba(212,175,55,0.12)" : "transparent",
                    border: `1px solid ${aspectRatio === ar.id ? gold : goldBorder}`,
                  }}>
                  <span className="text-lg" style={{ color: aspectRatio === ar.id ? gold : goldText }}>{ar.icon}</span>
                  <span className="font-[Orbitron] text-[8px]" style={{ color: aspectRatio === ar.id ? gold : goldText }}>
                    {isAr ? ar.labelAr : ar.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Generate button */}
          <button onClick={handleSubmit}
            disabled={!prompt.trim() || (mode === "image" && !imageFile) ||
              (!!activeJob && (activeJob.status === "queued" || activeJob.status === "processing" || activeJob.status === "submitting"))}
            className="w-full font-[Orbitron] text-[10px] tracking-[3px] uppercase py-4 transition-all disabled:opacity-40"
            style={{ background: "rgba(212,175,55,0.12)", border: `1px solid ${gold}`, color: gold }}>
            {activeJob && (activeJob.status === "queued" || activeJob.status === "processing" || activeJob.status === "submitting")
              ? (isAr ? "⟳ جارٍ التوليد..." : "⟳ GENERATING...")
              : (isAr ? "✦ توليد الفيديو" : "✦ GENERATE VIDEO")}
          </button>

          {error && (
            <p className="font-[Rajdhani] text-sm text-center" style={{ color: "#ef4444" }}>{error}</p>
          )}

          {/* Job history */}
          {jobs.length > 0 && (
            <div>
              <p className="font-[Orbitron] text-[8px] tracking-[3px] uppercase mb-2" style={{ color: goldText }}>
                {isAr ? "المهام" : "JOBS"}
              </p>
              <div className="flex flex-col gap-1">
                {jobs.slice(0, 6).map(job => (
                  <button key={job.id} onClick={() => setActiveJob(job)}
                    className="text-left px-3 py-2 transition-all"
                    style={{
                      background: activeJob?.id === job.id ? "rgba(212,175,55,0.08)" : "transparent",
                      border: `1px solid ${activeJob?.id === job.id ? gold : goldBorder}`,
                    }}>
                    <div className="flex items-center justify-between">
                      <p className="font-[Rajdhani] text-xs truncate flex-1" style={{ color: "#d0c5af" }}>
                        {job.prompt.slice(0, 30)}...
                      </p>
                      <span className="font-[Orbitron] text-[7px] tracking-wide uppercase ml-2 shrink-0"
                        style={{ color: statusColor(job.status) }}>
                        {statusLabel(job.status)}
                      </span>
                    </div>
                    <p className="font-mono text-[9px] mt-0.5" style={{ color: goldText }}>{job.createdAt}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Right canvas ── */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {activeJob ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8">

              {/* Status */}
              {activeJob.status !== "completed" && (
                <div className="text-center mb-8">
                  {(activeJob.status === "queued" || activeJob.status === "processing" || activeJob.status === "submitting") && (
                    <div className="w-16 h-16 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-6"
                      style={{ borderColor: `${gold} transparent` }} />
                  )}
                  <p className="font-[Orbitron] text-sm tracking-[3px] uppercase"
                    style={{ color: statusColor(activeJob.status) }}>
                    {statusLabel(activeJob.status)}
                  </p>
                  {activeJob.status === "queued" && activeJob.queuePosition && (
                    <p className="font-[Rajdhani] text-sm mt-2" style={{ color: goldText }}>
                      {isAr ? `الموضع في القائمة: ${activeJob.queuePosition}` : `Queue position: ${activeJob.queuePosition}`}
                    </p>
                  )}
                  {activeJob.status === "processing" && (
                    <p className="font-[Rajdhani] text-sm mt-2" style={{ color: goldText }}>
                      {isAr ? "قد يستغرق هذا 2-5 دقائق" : "This may take 2-5 minutes"}
                    </p>
                  )}
                  {activeJob.status === "failed" && (
                    <p className="font-[Rajdhani] text-sm mt-2" style={{ color: "#ef4444" }}>
                      {isAr ? "فشل التوليد. حاول مرة أخرى." : "Generation failed. Please try again."}
                    </p>
                  )}
                  <div className="mt-6 p-4 max-w-md" style={{ background: "rgba(212,175,55,0.04)", border: `1px solid ${goldBorder}` }}>
                    <p className="font-[Rajdhani] text-sm" style={{ color: "rgba(208,197,175,0.6)" }}>
                      {activeJob.prompt.slice(0, 100)}{activeJob.prompt.length > 100 ? "..." : ""}
                    </p>
                    <p className="font-mono text-[9px] mt-1" style={{ color: goldText }}>
                      {ENGINES.find(e => e.id === activeJob.engine)?.[isAr ? "labelAr" : "label"]}
                    </p>
                  </div>
                </div>
              )}

              {/* Completed video */}
              {activeJob.status === "completed" && activeJob.videoUrl && (
                <div className="w-full max-w-3xl flex flex-col gap-4">
                  <video
                    src={activeJob.videoUrl}
                    controls autoPlay loop
                    className="w-full"
                    style={{ border: `1px solid ${goldBorder}`, boxShadow: `0 0 60px rgba(212,175,55,0.08)` }}
                  />
                  <div className="flex gap-3 justify-center">
                    <a href={activeJob.videoUrl} target="_blank" rel="noopener noreferrer" download
                      className="font-[Orbitron] text-[9px] tracking-[2px] uppercase px-5 py-2.5 transition-all"
                      style={{ background: "rgba(212,175,55,0.12)", border: `1px solid ${gold}`, color: gold }}>
                      {isAr ? "تحميل الفيديو" : "DOWNLOAD VIDEO"}
                    </a>
                    <button onClick={() => { setPrompt(activeJob.prompt); setActiveJob(null); }}
                      className="font-[Orbitron] text-[9px] tracking-[2px] uppercase px-5 py-2.5 transition-all"
                      style={{ border: `1px solid ${goldBorder}`, color: goldText }}>
                      {isAr ? "إعادة استخدام" : "REUSE PROMPT"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center opacity-20">
              <div className="text-center">
                <div className="font-[Orbitron] text-8xl mb-6" style={{ color: gold }}>𓁿</div>
                <p className="font-[Orbitron] text-xs tracking-[6px] uppercase" style={{ color: gold }}>
                  {isAr ? "فيديوك سيظهر هنا" : "YOUR VIDEO WILL APPEAR HERE"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
