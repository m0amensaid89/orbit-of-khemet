"use client"
import Link from "next/link"
import { useEffect, useState } from "react"

export default function NotFound() {
  const [lang, setLang] = useState<"en" | "ar">("en")

  useEffect(() => {
    const stored = localStorage.getItem("orbit_lang")
    if (stored === "ar") setLang("ar")

    // Listen for language changes during the session
    const handleLangChange = () => {
      const updated = localStorage.getItem("orbit_lang")
      setLang(updated === "ar" ? "ar" : "en")
    }
    window.addEventListener("orbit-lang-changed", handleLangChange)
    window.addEventListener("storage", handleLangChange)
    return () => {
      window.removeEventListener("orbit-lang-changed", handleLangChange)
      window.removeEventListener("storage", handleLangChange)
    }
  }, [])

  const isAr = lang === "ar"

  return (
    <div
      className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-6"
      dir={isAr ? "rtl" : "ltr"}
    >
      <div className="flex flex-col items-center text-center max-w-md">
        <div className="w-24 h-24 rounded-full border border-[#D4AF37]/30 flex items-center justify-center mb-8 relative">
          <div className="absolute inset-0 rounded-full border border-[#D4AF37] animate-ping opacity-20" />
          <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>

        <h1 className="font-[Orbitron] text-6xl font-black text-white mb-4 tracking-tighter">
          404
        </h1>

        <div className="inline-block px-4 py-1.5 bg-red-950/30 border border-red-900/50 rounded-full mb-6">
          <span className="font-[Orbitron] text-[10px] tracking-[4px] uppercase text-red-400 font-bold">
            {isAr ? "إشارة مفقودة" : "SIGNAL LOST"}
          </span>
        </div>

        <p className="font-[Rajdhani] text-lg mb-10" style={{ color: "rgba(208,197,175,0.6)" }}>
          {isAr
            ? "الإحداثيات التي أدخلتها غير موجودة أو تم تطهير هذا القطاع. أعد معايرة أنظمة الملاحة."
            : "The grid coordinates you entered do not exist or the sector has been purged. Recalibrate your navigation systems."}
        </p>

        <Link href="/hub">
          <button
            className="font-[Orbitron] text-xs tracking-[3px] uppercase px-8 py-4 transition-all"
            style={{
              background: "rgba(212,175,55,0.1)",
              border: "1px solid rgba(212,175,55,0.4)",
              color: "#D4AF37",
            }}
          >
            {isAr ? "العودة إلى المركز" : "RETURN TO HUB"}
          </button>
        </Link>
      </div>
    </div>
  )
}
