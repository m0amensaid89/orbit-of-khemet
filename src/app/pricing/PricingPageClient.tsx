"use client";
import { useLanguage } from "@/hooks/useLanguage";
import { useTranslations } from "@/lib/translations";

import { useState, useMemo } from "react";
import { NEW_PLANS } from "@/lib/new-plans";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, ChevronDown, Calculator, ShieldCheck, Zap } from "lucide-react";

const FAQ_ITEMS = [
  { question: "How do credits work?", answer: "Credits are our universal currency. Different tasks use varying amounts of credits based on the AI model and complexity. For example, a basic chat uses fewer credits than generating a high-res image or analyzing a large video." },
  { question: "Can I cancel or change plans?", answer: "Yes, you can upgrade, downgrade, or cancel your plan at any time. There are no long-term contracts unless you opt for annual billing, and you keep any unused credits for the duration of your active billing cycle." },
  { question: "Are there any hidden fees?", answer: "None. We believe in transparent pricing. You only pay the flat monthly or annual fee. No setup fees, no surprise bills." },
  { question: "What happens if I run out of credits?", answer: "You can purchase top-up credits at any time without upgrading your tier, or choose to upgrade to a higher tier for a better per-credit rate." }
];

const FEATURE_NAMES_AR: Record<string, string> = {
  "Shared Features (All Tiers)": "الميزات المشتركة (جميع الخطط)",
  "Access to all AI models": "الوصول لجميع نماذج الذكاء الاصطناعي",
  "Real-time usage tracking": "تتبع الاستخدام في الوقت الفعلي",
  "Credit rollover (limits apply)": "ترحيل الرصيد (بحدود)",
  "99.9% uptime SLA": "ضمان توفر 99.9%",
  "SOC 2 compliance": "امتثال SOC 2",
  "API access": "وصول API",
  "Usage analytics": "تحليلات الاستخدام",
  "API calls/day": "طلبات API يومياً",
  "Upload limits": "حدود الرفع",
  "Integrations": "التكاملات",
  "Team Members": "أعضاء الفريق",
  "Support Level": "مستوى الدعم",
  "Team Management": "إدارة الفريق",
  "White-label options": "خيارات العلامة البيضاء",
  "Community": "مجتمع",
  "Email": "بريد إلكتروني",
  "Priority": "أولوية",
  "Dedicated": "مخصص",
  "Unlimited": "غير محدود",
}

const PLAN_DESCS_AR: Record<string, string> = {
  "Try the empire. 100 Grid Energy daily.": "جرّب الإمبراطورية. 100 وحدة طاقة يومياً.",
  "For individuals exploring the empire": "للأفراد المستكشفين",
  "For power users building daily": "للمستخدمين المتقدمين",
  "For creators and professionals": "للمبدعين والمحترفين",
  "For teams and agencies": "للفرق والوكالات",
  "For scaling businesses": "للأعمال المتنامية",
  "For enterprises": "للمؤسسات الكبرى",
}

const FEATURES_TABLE = [
  // Shared Features
  { category: "Shared Features (All Tiers)" },
  { feature: "Access to all AI models", personalBasic: true, personalExplorer: true, personalStarter: true, businessProfessional: true, businessStandard: true, businessEnterprise: true },
  { feature: "Real-time usage tracking", personalBasic: true, personalExplorer: true, personalStarter: true, businessProfessional: true, businessStandard: true, businessEnterprise: true },
  { feature: "Credit rollover (limits apply)", personalBasic: true, personalExplorer: true, personalStarter: true, businessProfessional: true, businessStandard: true, businessEnterprise: true },
  { feature: "99.9% uptime SLA", personalBasic: true, personalExplorer: true, personalStarter: true, businessProfessional: true, businessStandard: true, businessEnterprise: true },
  { feature: "SOC 2 compliance", personalBasic: true, personalExplorer: true, personalStarter: true, businessProfessional: true, businessStandard: true, businessEnterprise: true },
  { feature: "API access", personalBasic: true, personalExplorer: true, personalStarter: true, businessProfessional: true, businessStandard: true, businessEnterprise: true },
  { feature: "Usage analytics", personalBasic: true, personalExplorer: true, personalStarter: true, businessProfessional: true, businessStandard: true, businessEnterprise: true },

  // Personal vs Business Limits
  { category: "Usage Limits & Integrations" },
  { feature: "API calls/day", personalBasic: "100", personalExplorer: "300", personalStarter: "1,000", businessProfessional: "Unlimited", businessStandard: "Unlimited", businessEnterprise: "Unlimited" },
  { feature: "Upload limits", personalBasic: "25MB", personalExplorer: "50MB", personalStarter: "100MB", businessProfessional: "500MB", businessStandard: "1GB", businessEnterprise: "2GB" },
  { feature: "Integrations", personalBasic: "5", personalExplorer: "15", personalStarter: "50", businessProfessional: "Custom", businessStandard: "Custom", businessEnterprise: "Custom" },

  // Team & Support
  { category: "Team & Support" },
  { feature: "Team Members", personalBasic: "1", personalExplorer: "1", personalStarter: "1", businessProfessional: "3", businessStandard: "10", businessEnterprise: "Unlimited" },
  { feature: "Support Level", personalBasic: "Community", personalExplorer: "Email", personalStarter: "Priority Email", businessProfessional: "Phone", businessStandard: "Priority", businessEnterprise: "Dedicated Manager" },
  { feature: "Team Management", personalBasic: false, personalExplorer: false, personalStarter: false, businessProfessional: false, businessStandard: true, businessEnterprise: true },
  { feature: "White-label options", personalBasic: false, personalExplorer: false, personalStarter: false, businessProfessional: false, businessStandard: false, businessEnterprise: true },
];

const calculatorTasks = {
  "chat_conversations": { label: "AI Chat Conversations", credits: 8, unit: "conversations", description: "Typical back-and-forth conversation" },
  "content_writing": { label: "Content Writing (articles, blogs)", credits: 25, unit: "articles", description: "500-1000 word articles" },
  "email_drafting": { label: "Email Drafting & Responses", credits: 3, unit: "emails", description: "Professional email composition" },
  "image_generation": { label: "AI Image Generation", credits: 60, unit: "images", description: "High-quality AI-generated images" },
  "logo_design": { label: "Logo & Brand Design", credits: 80, unit: "designs", description: "Multiple iterations and refinements" },
  "document_analysis": { label: "Document Analysis (PDFs, Reports)", credits: 15, unit: "documents", description: "10-30 page document analysis" },
  "data_analysis": { label: "Excel/Data Analysis", credits: 20, unit: "spreadsheets", description: "Data processing and insights" },
  "presentation_creation": { label: "PowerPoint Presentations", credits: 40, unit: "presentations", description: "10-15 slide presentations" },
  "code_generation": { label: "Code Writing & Debugging", credits: 15, unit: "tasks", description: "Functions, scripts, debugging" },
  "api_documentation": { label: "Technical Documentation", credits: 30, unit: "documents", description: "API docs, user guides" },
  "video_analysis": { label: "Video Content Analysis", credits: 50, unit: "5-min videos", description: "Video summarization and insights" },
  "research_reports": { label: "Research & Analysis Reports", credits: 100, unit: "reports", description: "Comprehensive research with sources" }
} as const;


export default function PricingPage() {
  const [lang] = useLanguage()
  const t = useTranslations(lang)
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Calculator State
  const [taskQuantities, setTaskQuantities] = useState<Record<string, number>>(
    Object.keys(calculatorTasks).reduce((acc, key) => ({ ...acc, [key]: 0 }), {})
  );

  const handleTaskChange = (taskKey: string, value: string) => {
    setTaskQuantities(prev => ({
      ...prev,
      [taskKey]: parseInt(value) || 0
    }));
  };

  const calculatedResult = useMemo(() => {
    let totalCredits = 0;
    Object.entries(taskQuantities).forEach(([key, quantity]) => {
      totalCredits += quantity * calculatorTasks[key as keyof typeof calculatorTasks].credits;
    });

    const recommendedTier = NEW_PLANS.find(tier => tier.credits >= totalCredits * 1.2) || NEW_PLANS[NEW_PLANS.length - 1];

    return {
      totalCredits,
      recommendedTier,
      monthlyPrice: recommendedTier.monthlyPrice,
      annualPrice: recommendedTier.annualPrice,
      savings: (recommendedTier.monthlyPrice * 12 - recommendedTier.annualPrice).toFixed(0)
    };
  }, [taskQuantities]);

  // Analytics placeholder
  const trackEvent = (eventName: string, data: Record<string, unknown> | string) => {
    console.log(`[Analytics Track] ${eventName}`, data);
  };

  return (
    <main className="flex flex-col min-h-screen pt-24 pb-12 items-center bg-[#0A0A0A] text-white overflow-x-hidden">
      {/* 1. HERO SECTION */}
      <div className="text-center mb-12 px-4 max-w-4xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] font-[Orbitron] text-[10px] tracking-widest uppercase">
          <Zap className="w-3 h-3" /> Launch Special: First 1000 customers get 25% bonus credits
        </div>

        <h1 className="font-[Cinzel Decorative] text-4xl md:text-6xl font-black tracking-tight mb-6"
          style={{ color: "#D4AF37", textShadow: "0 0 30px rgba(212,175,55,0.25)" }}>
          AI That Scales With Your Business
        </h1>
        <p className="font-[Indie Flower] text-xl md:text-2xl text-[#d0c5af] max-w-2xl mx-auto mb-4">
          Choose your plan, use credits however you want. No hidden fees, no surprise bills, no model restrictions.
        </p>
        <p className="font-[Roboto] text-base text-white/50 mb-10">
          From individuals to enterprises - we&apos;ve got you covered. More AI Power, Better Value Than Manus.
        </p>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mb-16">
          <span className={`font-[Orbitron] text-xs tracking-widest uppercase transition-colors ${billingCycle === "monthly" ? "text-white" : "text-white/40"}`}>{t.pricing.monthly}</span>
          <button
            onClick={() => {
              setBillingCycle(billingCycle === "monthly" ? "annual" : "monthly");
              trackEvent("toggle_billing", { cycle: billingCycle === "monthly" ? "annual" : "monthly" });
            }}
            className="w-14 h-7 rounded-full bg-[#1A1A1A] border border-[#D4AF37]/30 relative flex items-center px-1 transition-colors hover:border-[#D4AF37]/60"
            aria-label="Toggle Billing Cycle"
          >
            <motion.div
              className="w-5 h-5 rounded-full bg-[#D4AF37] shadow-[0_0_10px_rgba(212,175,55,0.5)]"
              layout
              animate={{ x: billingCycle === "monthly" ? 0 : 26 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </button>
          <div className="flex items-center gap-2">
            <span className={`font-[Orbitron] text-xs tracking-widest uppercase transition-colors ${billingCycle === "annual" ? "text-white" : "text-white/40"}`}>{t.pricing.annual}</span>
            <span className="font-[Roboto] text-[10px] font-bold uppercase tracking-widest bg-[#22c55e]/20 text-[#22c55e] px-2 py-0.5 rounded-sm border border-[#22c55e]/30">Save 10%</span>
          </div>
        </div>
      </div>

      {/* 2. DETAILED PRICING TABLE */}
      <div className="max-w-7xl w-full mx-auto px-4 pb-24">
        {/* Mobile: stacked, Tablet: 2 cols, Desktop: 3 cols (we have 6 plans so it's a 2-row grid on desktop) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {NEW_PLANS.map((plan, i) => {
            const isPopular = plan.popular;
            const price = billingCycle === "annual" ? (plan.annualPrice / 12).toFixed(2) : plan.monthlyPrice;
            const displayPrice = price.toString().endsWith('.00') ? Math.floor(Number(price)) : price;

            // UI distinctions
            const isBusiness = plan.colorScheme === "business";

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`relative rounded-xl p-8 flex flex-col gap-6 transition-all duration-300 bg-[#131313]
                  ${isPopular ? "border-2 border-[#D4AF37] shadow-[0_0_40px_rgba(212,175,55,0.15)] scale-[1.02] z-10" : "border border-white/10 hover:border-[#D4AF37]/30"}`}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 overflow-hidden rounded-sm">
                    <div className="relative font-[Orbitron] text-[10px] tracking-[4px] uppercase bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black px-6 py-2 font-black shadow-[0_0_20px_rgba(255,215,0,0.4)]">
                      MOST POPULAR
                    </div>
                  </div>
                )}

                <div>
                  <p className={`font-[Orbitron] text-[11px] tracking-[5px] uppercase mb-2 ${isBusiness ? "text-[#D4AF37]" : "text-[#7aa2f7]"}`}>
                    {plan.name}
                  </p>
                  <p className="font-[Roboto] text-sm text-[#d0c5af] min-h-[40px] mb-4">{lang === 'ar' ? (PLAN_DESCS_AR[plan.description] || plan.description) : plan.description}</p>

                  <div className="flex items-baseline gap-1" dir="ltr">
                    <span className="font-[Orbitron] text-4xl md:text-5xl font-black text-white leading-none">
                      ${displayPrice}
                    </span>
                    <span className="font-[Roboto] text-white/40 text-sm">/ mo</span>
                  </div>

                  <div className="mt-2 min-h-[24px]">
                     {billingCycle === "annual" && (
                       <p className="font-[Roboto] text-[#22c55e] text-xs font-medium tracking-wide">
                         Billed annually (${plan.annualPrice})
                       </p>
                     )}
                  </div>
                </div>

                <div className={`p-4 rounded-lg bg-black/40 border ${isBusiness ? "border-[#D4AF37]/20" : "border-[#7aa2f7]/20"}`}>
                   <div className="flex flex-col items-center justify-center">
                     <span className={`font-[Orbitron] text-2xl font-bold ${isBusiness ? "text-[#D4AF37]" : "text-[#7aa2f7]"}`}>
                       {plan.credits.toLocaleString()}
                     </span>
                     <span className="font-[Roboto] text-xs text-white/60 uppercase tracking-wider" dir="ltr">Credits / Month</span>
                   </div>
                </div>

                <div className="flex-1">
                  {/* Summary features before matrix */}
                  <ul className="flex flex-col gap-3">
                    <li className="flex items-start gap-3">
                      <Check className={`w-4 h-4 shrink-0 mt-0.5 ${isBusiness ? "text-[#D4AF37]" : "text-[#7aa2f7]"}`} />
                      <span className="font-[Roboto] text-sm text-white/80">
                        ~${(plan.monthlyPrice / plan.credits).toFixed(4)} per credit
                      </span>
                    </li>
                  </ul>
                </div>

                <button
                  onClick={() => trackEvent("cta_click", { plan: plan.id, cycle: billingCycle })}
                  className="w-full font-[Cinzel Decorative] text-[14px] font-bold py-3 mt-4 transition-all duration-300 rounded-md relative overflow-hidden group"
                  style={isPopular
                    ? { background: "linear-gradient(135deg, #D4AF37, #FFD700)", color: "#000" }
                    : { background: "rgba(255,255,255,0.05)", color: "white", border: "1px solid rgba(255,255,255,0.1)" }}
                >
                  <span className="relative z-10">{plan.cta}</span>
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* 3. CREDIT CALCULATOR WIDGET */}
      <div className="w-full max-w-5xl mx-auto px-4 mb-32">
        <div className="bg-[#131313] border border-white/10 rounded-2xl p-6 md:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
             <Calculator className="w-64 h-64" />
          </div>

          <div className="relative z-10">
            <h2 className="font-[Cinzel Decorative] text-2xl md:text-3xl font-bold mb-2 text-[#D4AF37]">How Many Credits Do I Need?</h2>
            <p className="font-[Roboto] text-white/60 mb-8">Estimate your monthly usage and find the perfect plan</p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-6 max-h-[500px] overflow-y-auto pr-4 scrollbar-thin">
                {Object.entries(calculatorTasks).map(([key, task]) => (
                  <div key={key} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg bg-black/40 border border-white/5 hover:border-white/10 transition-colors">
                    <div className="flex-1">
                      <label htmlFor={key} className="font-[Roboto] font-medium text-white/90 block mb-1">{task.label}</label>
                      <span className="font-[Roboto] text-xs text-white/50">{task.credits} credits / {task.unit.replace(/s$/, '')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        id={key}
                        min="0"
                        placeholder="0"
                        value={taskQuantities[key] || ""}
                        onChange={(e) => handleTaskChange(key, e.target.value)}
                        className="w-20 bg-[#1A1A1A] border border-white/20 rounded px-3 py-2 text-white font-[Roboto] text-right focus:border-[#D4AF37] focus:outline-none"
                      />
                      <span className="font-[Roboto] text-xs text-white/40 w-16">{task.unit}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-black/60 rounded-xl p-8 border border-[#D4AF37]/20 flex flex-col justify-center h-fit sticky top-24">
                <div className="text-center mb-8">
                  <span className="font-[Orbitron] text-[10px] tracking-[4px] uppercase text-white/40 block mb-2">Total Estimated Need</span>
                  <div className="font-[Orbitron] text-5xl font-black text-[#D4AF37]">
                    {calculatedResult.totalCredits.toLocaleString()}
                  </div>
                  <span className="font-[Roboto] text-sm text-white/60">credits / month</span>
                </div>

                <div className="border-t border-white/10 pt-8">
                  <h4 className="font-[Roboto] text-white/80 font-medium mb-4">Recommended Plan:</h4>
                  <div className="bg-[#131313] border border-[#D4AF37] rounded-lg p-5">
                    <h5 className="font-[Orbitron] text-[#D4AF37] mb-1">{calculatedResult.recommendedTier.name}</h5>
                    <p className="font-[Roboto] text-sm text-white/60 mb-4">{calculatedResult.recommendedTier.credits.toLocaleString()} credits included</p>

                    <div className="flex justify-between items-end mb-4">
                      <div>
                        <span className="font-[Roboto] text-xs text-white/40 block">{t.pricing.monthly}</span>
                        <span className="font-[Orbitron] text-xl text-white">${calculatedResult.monthlyPrice}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-[Roboto] text-xs text-[#22c55e] block">Annual (Save ${calculatedResult.savings})</span>
                        <span className="font-[Orbitron] text-xl text-white">${calculatedResult.annualPrice}</span>
                      </div>
                    </div>

                    <button className="w-full bg-[#D4AF37] text-black font-[Cinzel Decorative] py-2 rounded font-bold hover:bg-[#FFD700] transition-colors">
                      Choose {calculatedResult.recommendedTier.name}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. FEATURE COMPARISON MATRIX */}
      <div className="w-full max-w-[90rem] mx-auto px-4 mb-32">
        <div className="text-center mb-12">
          <h2 className="font-[Cinzel Decorative] text-3xl font-bold text-white mb-4">Compare All Features</h2>
          <p className="font-[Roboto] text-white/60">Everything you need to scale your AI operations</p>
        </div>

        <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#131313] pb-4 scrollbar-thin">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="border-b border-white/10 bg-black/40">
                <th className="p-4 md:p-6 font-[Orbitron] text-xs tracking-widest uppercase text-white/50 w-1/4 sticky left-0 bg-[#0A0A0A] z-20 border-r border-white/5">Features</th>
                <th className="p-4 md:p-6 font-[Orbitron] text-[10px] tracking-wider uppercase text-center text-[#7aa2f7]">Personal<br/>Basic</th>
                <th className="p-4 md:p-6 font-[Orbitron] text-[10px] tracking-wider uppercase text-center text-[#7aa2f7]">Personal<br/>Explorer</th>
                <th className="p-4 md:p-6 font-[Orbitron] text-[10px] tracking-wider uppercase text-center text-[#7aa2f7]">Personal<br/>Starter</th>
                <th className="p-4 md:p-6 font-[Orbitron] text-[10px] tracking-wider uppercase text-center text-[#D4AF37] bg-[#D4AF37]/5">Business<br/>Professional</th>
                <th className="p-4 md:p-6 font-[Orbitron] text-[10px] tracking-wider uppercase text-center text-[#D4AF37]">Business<br/>Standard</th>
                <th className="p-4 md:p-6 font-[Orbitron] text-[10px] tracking-wider uppercase text-center text-[#D4AF37]">Business<br/>Enterprise</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-[Roboto] text-sm">
              {FEATURES_TABLE.map((row, i) => {
                if (row.category) {
                  return (
                    <tr key={`cat-${i}`} className="bg-white/[0.02]">
                      <td colSpan={7} className="p-4 md:p-6 font-[Cinzel Decorative] text-[#D4AF37] text-lg font-bold sticky left-0 bg-[#131313] z-10">
                        {lang === 'ar' ? (FEATURE_NAMES_AR[row.category] || row.category) : row.category}
                      </td>
                    </tr>
                  );
                }

                const renderCell = (val: boolean | string | number | undefined, highlight: boolean = false) => {
                  if (val === undefined) return null;
                  if (typeof val === "boolean") {
                    return val
                      ? <Check className={`w-5 h-5 mx-auto ${highlight ? "text-[#D4AF37]" : "text-white/60"}`} />
                      : <X className="w-5 h-5 mx-auto text-white/10" />;
                  }
                  return <span className={highlight ? "text-[#D4AF37] font-medium" : "text-white/80"}>{val}</span>;
                };

                return (
                  <tr key={`feat-${i}`} className="hover:bg-white/[0.01] transition-colors">
                    <td className="p-4 md:p-6 text-white/90 sticky left-0 bg-[#131313] z-10 border-r border-white/5">{lang === 'ar' ? (FEATURE_NAMES_AR[row.feature] || row.feature) : row.feature}</td>
                    <td className="p-4 text-center">{renderCell(row.personalBasic)}</td>
                    <td className="p-4 text-center">{renderCell(row.personalExplorer)}</td>
                    <td className="p-4 text-center">{renderCell(row.personalStarter)}</td>
                    <td className="p-4 text-center bg-[#D4AF37]/5">{renderCell(row.businessProfessional, true)}</td>
                    <td className="p-4 text-center">{renderCell(row.businessStandard)}</td>
                    <td className="p-4 text-center">{renderCell(row.businessEnterprise)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. TRUST & CONVERSION SECTION */}
      <div className="w-full bg-[#131313] py-16 border-y border-white/10 mb-24">
         <div className="max-w-5xl mx-auto px-4">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
             <div className="flex flex-col items-center gap-4">
               <div className="w-16 h-16 rounded-full bg-[#D4AF37]/10 flex items-center justify-center">
                 <ShieldCheck className="w-8 h-8 text-[#D4AF37]" />
               </div>
               <h4 className="font-[Cinzel Decorative] text-lg text-white">30-Day Guarantee</h4>
               <p className="font-[Roboto] text-sm text-white/60">Try risk-free for 30 days. Full refund if you&apos;re not completely satisfied.</p>
             </div>
             <div className="flex flex-col items-center gap-4">
               <div className="w-16 h-16 rounded-full bg-[#D4AF37]/10 flex items-center justify-center">
                 <Zap className="w-8 h-8 text-[#D4AF37]" />
               </div>
               <h4 className="font-[Cinzel Decorative] text-lg text-white">Up to 25% More Value</h4>
               <p className="font-[Roboto] text-sm text-white/60">Get up to 25% more credits compared to Manus on equivalent tiers.</p>
             </div>
             <div className="flex flex-col items-center gap-4">
               <div className="w-16 h-16 rounded-full bg-[#D4AF37]/10 flex items-center justify-center">
                 <Check className="w-8 h-8 text-[#D4AF37]" />
               </div>
               <h4 className="font-[Cinzel Decorative] text-lg text-white">Cancel Anytime</h4>
               <p className="font-[Roboto] text-sm text-white/60">No long term contracts required. Upgrade, downgrade or cancel with ease.</p>
             </div>
           </div>
         </div>
      </div>

      {/* 6. FAQ Section */}
      <div className="w-full max-w-3xl mx-auto px-4 mb-24">
        <h2 className="font-[Cinzel Decorative] text-2xl md:text-3xl font-bold text-center mb-10 text-white">Frequently Asked Questions</h2>
        <div className="flex flex-col gap-4">
          {FAQ_ITEMS.map((faq, i) => (
            <div key={i} className="border border-white/10 rounded-xl bg-[#131313] overflow-hidden transition-colors hover:border-white/20">
              <button
                onClick={() => {
                  setOpenFaq(openFaq === i ? null : i);
                  if (openFaq !== i) trackEvent("faq_open", { question: faq.question });
                }}
                className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
              >
                <span className="font-[Indie Flower] font-bold text-xl text-white pr-4">{faq.question}</span>
                <motion.div animate={{ rotate: openFaq === i ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown className={`w-5 h-5 ${openFaq === i ? "text-[#D4AF37]" : "text-white/40"}`} />
                </motion.div>
              </button>
              <AnimatePresence>
                {openFaq === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="p-6 pt-0 font-[Roboto] text-base text-white/60 leading-relaxed border-t border-white/5 mt-2">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center pb-20 px-4 space-y-6 max-w-2xl mx-auto">
        <h2 className="font-[Cinzel Decorative] text-3xl font-bold text-white">Ready to get started?</h2>
        <p className="font-[Roboto] text-[#d0c5af] text-lg">Join thousands of satisfied users leveraging the power of Khemet AI.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
           <button className="bg-[#D4AF37] text-black font-[Cinzel Decorative] font-bold py-3 px-8 rounded-md hover:bg-[#FFD700] transition-colors">
             Start Free Trial
           </button>
           <button className="bg-transparent border border-white/20 text-white font-[Cinzel Decorative] font-bold py-3 px-8 rounded-md hover:bg-white/10 transition-colors">
             Contact Sales
           </button>
        </div>
      </div>
    </main>
  );
}