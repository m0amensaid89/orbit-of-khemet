"use client"
import Link from "next/link";
import { useEffect, useState } from "react";

export default function NotFound() {
  const [lang, setLang] = useState<'en'|'ar'>('en')

  useEffect(() => {
    const stored = localStorage.getItem('orbit_lang')
    if (stored === 'ar') setLang('ar')
  }, [])

  const isAr = lang === 'ar'

  return (
    <div
      className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-6 relative overflow-hidden"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#D4AF37]/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center max-w-md">
        <div className="w-24 h-24 rounded-full border border-[#D4AF37]/30 flex items-center justify-center mb-8 relative">
          <div className="absolute inset-0 rounded-full border border-[#D4AF37] animate-ping opacity-20" />
          <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>

        <h1 className="font-[Orbitron] text-6xl font-black text-white mb-4 tracking-tighter drop-shadow-[0_0_15px_rgba(212,175,55,0.3)]">
          404
        </h1>

        <div className="inline-block px-4 py-1.5 bg-red-950/30 border border-red-900/50 rounded-full mb-6">
          <span className="font-[Orbitron] text-[10px] tracking-[4px] uppercase text-red-500 font-bold">
            {isAr ? 'إشارة مفقودة' : 'SIGNAL LOST'}
          </span>
        </div>

        <p className="font-[Rajdhani] text-lg text-white/60 mb-10">
          {isAr
            ? 'الإحداثيات التي أدخلتها غير موجودة أو تم تطهير هذا القطاع. أعد معايرة أنظمة الملاحة.'
            : 'The grid coordinates you entered do not exist or the sector has been purged. Recalibrate your navigation systems.'}
        </p>

        <Link href="/hub">
          <button className="group relative font-[Orbitron] text-xs tracking-[3px] uppercase px-8 py-4 bg-gradient-to-r from-[#D4AF37]/10 to-[#D4AF37]/5 border border-[#D4AF37]/30 hover:border-[#D4AF37] text-[#D4AF37] font-bold transition-all duration-300 hover:shadow-[0_0_20px_rgba(212,175,55,0.2)] rounded flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
            <span className="relative z-10">{isAr ? 'العودة إلى المركز' : 'RETURN TO HUB'}</span>
          </button>
        </Link>
      </div>
    </div>
  );
}
