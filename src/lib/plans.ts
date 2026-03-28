export type PlanId = "free" | "explorer" | "commander";

export interface Plan {
  id: PlanId;
  name: string;
  price: number;
  priceLabel: string;
  monthlyMessages: number | "unlimited";
  heroOrbits: number | "all";
  models: string;
  claudeAccess: boolean;
  imageGeneration: boolean;
  autoRouter: boolean;
  support: string;
  cta: string;
  popular: boolean;
}

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Scout",
    price: 0,
    priceLabel: "$0",
    monthlyMessages: 30,
    heroOrbits: 1,
    models: "Free models (DeepSeek, Llama)",
    claudeAccess: false,
    imageGeneration: false,
    autoRouter: false,
    support: "Community",
    cta: "Start Free",
    popular: false,
  },
  {
    id: "explorer",
    name: "Explorer",
    price: 19,
    priceLabel: "$19",
    monthlyMessages: 300,
    heroOrbits: "all",
    models: "Gemini 2.5 Flash + DeepSeek R1",
    claudeAccess: false,
    imageGeneration: true,
    autoRouter: false,
    support: "Email support",
    cta: "Start Exploring",
    popular: true,
  },
  {
    id: "commander",
    name: "Commander",
    price: 49,
    priceLabel: "$49",
    monthlyMessages: "unlimited",
    heroOrbits: "all",
    models: "All models · Auto-Router · Claude · GPT",
    claudeAccess: true,
    imageGeneration: true,
    autoRouter: true,
    support: "Priority support",
    cta: "Command the Grid",
    popular: false,
  },
];
