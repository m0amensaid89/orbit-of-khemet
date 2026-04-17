import React from 'react';
import { motion } from 'framer-motion';
import { UserCredits, TIER_COLORS, getUsagePercentage, getWarningLevel, formatCredits } from '@/lib/credits';
import Link from 'next/link';

interface CreditMeterProps {
  credits: UserCredits;
  compact?: boolean;
  onUpgradeClick?: () => void;
}

export const CreditMeter: React.FC<CreditMeterProps> = ({ credits, compact, onUpgradeClick }) => {
  const percentage = getUsagePercentage(credits.balance, credits.totalAllocation);
  const warningLevel = getWarningLevel(percentage);
  const isCritical = warningLevel === 'critical';
  const isWarning = warningLevel === 'warning';

  const trackColor = '#0A0A0A';
  let fillColor = '#D4AF37'; // Default normal (gold)
  if (isCritical) fillColor = '#EF4444'; // Red
  else if (isWarning) fillColor = '#F59E0B'; // Amber

  return (
    <div className={`bg-[#131313] rounded-[4px] border border-[rgba(212,175,55,0.08)] relative overflow-hidden group ${compact ? 'p-2' : 'p-3'}`}>
      <div className="flex items-center justify-between mb-2 relative z-10">
        <div className="flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Eye of Ra simple SVG for decoration */}
            <path d="M12 4C5.5 4 2 12 2 12C2 12 5.5 20 12 20C18.5 20 22 12 22 12C22 12 18.5 4 12 4Z" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="12" cy="12" r="3" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 15V22" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 15C10 15 8.5 17 8.5 19" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-empire-xs text-[#d0c5af] font-orbitron uppercase">GRID ENERGY</span>
        </div>
        <span
          className="font-orbitron text-[9px] uppercase px-1.5 py-0.5 rounded-[2px]"
          style={{
            color: TIER_COLORS[credits.tier] || '#D4AF37',
            border: `1px solid ${TIER_COLORS[credits.tier] || '#D4AF37'}40`,
            backgroundColor: `${TIER_COLORS[credits.tier] || '#D4AF37'}15`
          }}
        >
          {credits.tier}
        </span>
      </div>

      <div className={`font-orbitron font-bold drop-shadow-[0_0_8px_rgba(212,175,55,0.2)] relative z-10 flex items-baseline gap-1 ${compact ? 'text-sm' : 'text-empire-lg'}`} style={{ color: fillColor }}>
        <span className={isCritical ? "animate-pulse" : ""}>
          {formatCredits(credits.balance)}
        </span>
        <span className="text-[10px] text-[#d0c5af] font-normal opacity-60">/ {formatCredits(credits.totalAllocation)}</span>
      </div>

      <div
        className="w-full h-1.5 mt-2 rounded-[4px] overflow-hidden relative z-10 border border-[rgba(212,175,55,0.08)]"
        style={{
          backgroundColor: trackColor,
          boxShadow: isWarning || isCritical ? `0 0 8px ${fillColor}` : 'none'
        }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="h-full"
          style={{ backgroundColor: fillColor }}
        />
      </div>

      {(isWarning || isCritical) && !compact && (
        <div className="mt-2 flex justify-between items-center">
          <div className={`font-rajdhani text-xs ${isCritical ? 'text-[#EF4444] animate-pulse' : 'text-[#F59E0B]'}`}>
            Low energy: upgrade to continue
          </div>
          {onUpgradeClick ? (
            <button
              onClick={onUpgradeClick}
              className="text-[#D4AF37] font-orbitron text-[9px] uppercase tracking-wider hover:underline"
            >
              UPGRADE
            </button>
          ) : (
            <Link
              href="/pricing"
              className="text-[#D4AF37] font-orbitron text-[9px] uppercase tracking-wider hover:underline"
            >
              UPGRADE
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default CreditMeter;
