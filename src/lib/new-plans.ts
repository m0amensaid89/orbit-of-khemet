export type PlanId = "personal_basic" | "personal_explorer" | "personal_starter" | "business_professional" | "business_standard" | "business_enterprise";

export interface Plan {
  id: PlanId;
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  credits: number;
  description: string;
  popular: boolean;
  cta: string;
  colorScheme: "personal" | "business";
}

export const NEW_PLANS: Plan[] = [
  {
    id: "personal_basic",
    name: "Personal Basic",
    monthlyPrice: 10,
    annualPrice: 108,
    credits: 2500,
    description: "Perfect for getting started with AI",
    popular: false,
    cta: "Start Free Trial",
    colorScheme: "personal"
  },
  {
    id: "personal_explorer",
    name: "Personal Explorer",
    monthlyPrice: 16,
    annualPrice: 172.8,
    credits: 4200,
    description: "Ideal for regular AI users and creators",
    popular: false,
    cta: "Get Started Now",
    colorScheme: "personal"
  },
  {
    id: "personal_starter",
    name: "Personal Starter",
    monthlyPrice: 32,
    annualPrice: 345.6,
    credits: 9000,
    description: "Professional-grade AI for power users",
    popular: false,
    cta: "Get Started Now",
    colorScheme: "personal"
  },
  {
    id: "business_professional",
    name: "Business Professional",
    monthlyPrice: 55,
    annualPrice: 594,
    credits: 16000,
    description: "Complete AI solution for small teams",
    popular: true,
    cta: "Start Free Trial",
    colorScheme: "business"
  },
  {
    id: "business_standard",
    name: "Business Standard",
    monthlyPrice: 600,
    annualPrice: 6480,
    credits: 175000,
    description: "Scale your business with enterprise AI",
    popular: false,
    cta: "Contact Sales",
    colorScheme: "business"
  },
  {
    id: "business_enterprise",
    name: "Business Enterprise",
    monthlyPrice: 1200,
    annualPrice: 12960,
    credits: 350000,
    description: "Custom AI solutions for large organizations",
    popular: false,
    cta: "Contact Sales",
    colorScheme: "business"
  }
];
