import React from 'react';

export const CreditMeterSkeleton: React.FC = () => {
  return (
    <div className="bg-[#131313] rounded-[4px] border border-[rgba(212,175,55,0.08)] relative overflow-hidden group p-3">
      <div className="flex items-center justify-between mb-2 relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-[rgba(212,175,55,0.1)] animate-pulse" />
          <div className="h-3 w-20 bg-[rgba(212,175,55,0.1)] rounded animate-pulse" />
        </div>
        <div className="h-4 w-12 bg-[rgba(212,175,55,0.1)] rounded animate-pulse" />
      </div>

      <div className="mt-2 h-6 w-24 bg-[rgba(212,175,55,0.1)] rounded animate-pulse" />

      <div className="w-full bg-[#0A0A0A] h-1.5 mt-3 rounded-[4px] overflow-hidden relative z-10 border border-[rgba(212,175,55,0.08)]">
        <div className="h-full w-1/3 bg-[rgba(212,175,55,0.2)] animate-pulse" />
      </div>
    </div>
  );
};

export default CreditMeterSkeleton;
