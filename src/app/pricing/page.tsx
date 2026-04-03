import { Metadata } from "next";
import PricingPageClient from "./PricingPageClient";

export const metadata: Metadata = {
  title: "AI Platform Pricing - Better Value Than Manus | Khemet AI",
  description: "Transparent AI pricing with up to 25% more credits. Plans from $10-$1200/month. 30-day guarantee. Compare our rates vs Manus.",
};

export default function PricingPage() {
  return <PricingPageClient />;
}