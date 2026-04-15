export type PlanId = "free_scout" | "personal_basic" | "personal_explorer" | "personal_starter" | "business_pro" | "business_standard" | "business_enterprise";

export interface Plan {
  id: PlanId;
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  credits: number;
  dailyCredits?: number;
  description: string;
  popular: boolean;
  cta: string;
  colorScheme: "personal" | "business";
  isFree?: boolean;
}

export const NEW_PLANS: Plan[] = [
  { id: "free_scout", name: "Free Scout", monthlyPrice: 0, annualPrice: 0, credits: 100, dailyCredits: 100, description: "Try the empire. 100 Grid Energy daily.", popular: false, cta: "Start Free", colorScheme: "personal", isFree: true },
  { id: "personal_basic", name: "Personal Basic", monthlyPrice: 9, annualPrice: 97, credits: 7000, description: "For individuals exploring the empire", popular: false, cta: "Start Now", colorScheme: "personal" },
  { id: "personal_explorer", name: "Personal Explorer", monthlyPrice: 15, annualPrice: 162, credits: 11200, description: "For power users building daily", popular: true, cta: "Start Now", colorScheme: "personal" },
  { id: "personal_starter", name: "Personal Starter", monthlyPrice: 29, annualPrice: 313, credits: 22400, description: "For creators and professionals", popular: false, cta: "Start Now", colorScheme: "personal" },
  { id: "business_pro", name: "Business Pro", monthlyPrice: 49, annualPrice: 529, credits: 38500, description: "For teams and agencies", popular: false, cta: "Start Now", colorScheme: "business" },
  { id: "business_standard", name: "Business Standard", monthlyPrice: 149, annualPrice: 1609, credits: 420000, description: "For growing enterprises", popular: true, cta: "Contact Sales", colorScheme: "business" },
  { id: "business_enterprise", name: "Business Enterprise", monthlyPrice: 299, annualPrice: 3228, credits: 840000, description: "For large organizations", popular: false, cta: "Contact Sales", colorScheme: "business" }
];
