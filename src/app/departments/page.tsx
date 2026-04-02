"use client";

import { DEPARTMENTS } from "@/lib/departments";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function DepartmentsPage() {
  const router = useRouter();

  const handleQuickAction = (heroSlug: string, prompt: string) => {
    const encoded = encodeURIComponent(prompt);
    router.push(`/chat/${heroSlug}?autoprompt=${encoded}`);
  };

  const handleEnterDepartment = (heroSlug: string) => {
    router.push(`/heroes/${heroSlug}`);
  };

  return (
    <div className="min-h-screen bg-black text-[#d0c5af] font-rajdhani pb-20">
      {/* Stats Bar */}
      <div className="w-full bg-[#131313] border-b border-[#D4AF37]/20 py-2 px-4 flex justify-center items-center gap-6 text-[10px] sm:text-xs font-orbitron tracking-widest text-[#D4AF37]/80 sticky top-0 z-40">
        <span>7 DEPARTMENTS</span>
        <span className="text-[#D4AF37]/30">·</span>
        <span>120 AGENTS</span>
        <span className="text-[#D4AF37]/30">·</span>
        <span>6 AI MODELS</span>
        <span className="text-[#D4AF37]/30">·</span>
        <span className="text-green-500/90 animate-pulse">EMPIRE ACTIVE</span>
      </div>

      {/* Header */}
      <div className="container mx-auto px-4 pt-16 pb-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-block px-3 py-1 mb-4 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/5 text-[#D4AF37] text-xs font-orbitron tracking-[0.2em]">
            EMPIRE ENGINE
          </div>
          <h1 className="text-4xl md:text-6xl font-orbitron font-bold text-[#D4AF37] mb-4 drop-shadow-[0_0_15px_rgba(212,175,55,0.3)]">
            EMPIRE COMMAND
          </h1>
          <p className="text-[#d0c5af]/70 font-orbitron tracking-[0.15em] text-sm md:text-base">
            7 DEPARTMENTS · 120 AGENTS · ONE SYSTEM
          </p>
        </motion.div>
      </div>

      {/* Grid */}
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {DEPARTMENTS.map((dept, index) => (
            <motion.div
              key={dept.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-[#131313] rounded-lg border border-[#D4AF37]/20 overflow-hidden flex flex-col group relative transition-all duration-300"
              style={{ borderLeft: `4px solid ${dept.color}` }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = `0 0 20px ${dept.color}20`;
                e.currentTarget.style.borderLeftColor = dept.color; // Keep border color
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Department Header */}
              <div className="p-5 border-b border-[#D4AF37]/10 relative">
                <div className="flex justify-between items-start mb-3">
                  <div className="text-3xl filter drop-shadow-md">{dept.icon}</div>
                  <div
                    className="px-2 py-0.5 rounded text-[9px] font-orbitron tracking-widest font-bold border"
                    style={{
                      color: dept.color,
                      borderColor: `${dept.color}40`,
                      backgroundColor: `${dept.color}10`
                    }}
                  >
                    POWERED BY {dept.hero}
                  </div>
                </div>
                <h2 className="text-xl font-orbitron font-bold text-white mb-2">
                  {dept.name}
                </h2>
                <p className="text-sm text-[#d0c5af]/80 leading-relaxed min-h-[60px]">
                  {dept.description}
                </p>
              </div>

              {/* Capabilities */}
              <div className="p-5 bg-black/40 flex-1">
                <ul className="space-y-2 mb-6">
                  {dept.capabilities.slice(0, 3).map((cap, i) => (
                    <li key={i} className="flex items-center text-sm text-[#d0c5af]/90">
                      <span className="text-[#D4AF37] mr-2 text-xs">✦</span>
                      {cap}
                    </li>
                  ))}
                  {dept.capabilities.length > 3 && (
                    <li className="text-xs text-[#d0c5af]/50 font-orbitron tracking-wider pl-4 pt-1">
                      + {dept.capabilities.length - 3} MORE
                    </li>
                  )}
                </ul>

                {/* Quick Actions Grid */}
                <div className="grid grid-cols-2 gap-2 mt-auto">
                  {dept.quickActions.map((action) => (
                    <button
                      key={action.id}
                      onClick={() => handleQuickAction(dept.heroSlug, action.prompt)}
                      className="bg-[#131313] hover:bg-[#D4AF37]/10 border border-[#D4AF37]/20 hover:border-[#D4AF37]/50 rounded p-2 text-left transition-all group/btn flex flex-col justify-between h-[60px]"
                    >
                      <span className="text-sm mb-1 group-hover/btn:scale-110 transition-transform origin-left">{action.icon}</span>
                      <span className="text-[9px] font-orbitron tracking-widest text-[#d0c5af] group-hover/btn:text-[#D4AF37] leading-tight line-clamp-2">
                        {action.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Enter Button */}
              <button
                onClick={() => handleEnterDepartment(dept.heroSlug)}
                className="w-full py-4 text-center font-orbitron text-xs tracking-[0.2em] font-bold text-[#D4AF37] border-t border-[#D4AF37]/20 transition-all duration-300"
                style={{ backgroundColor: 'transparent' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(212,175,55,0.08)';
                  e.currentTarget.style.borderColor = 'rgba(212,175,55,0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.borderColor = 'rgba(212,175,55,0.2)';
                }}
              >
                ENTER DEPARTMENT
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}