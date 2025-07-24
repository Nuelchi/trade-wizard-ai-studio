import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Star } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { createPolarCheckout } from "@/lib/polar";
import { toast } from "sonner";

const plans = [
  {
    name: "Free",
    price: 0,
    priceAnnual: 0,
    features: [
      "Basic AI strategy builder",
      "Community showcase access",
      "Limited backtesting",
      "1 private strategy",
    ],
    highlight: false,
    hasAnnual: false,
  },
  {
    name: "Premium",
    price: 25,
    priceAnnual: 22, // $22/mo billed annually
    features: [
      "Unlimited private strategies",
      "Advanced AI builder",
      "Full backtesting suite",
      "Priority support",
      "Strategy export",
    ],
    highlight: true,
    hasAnnual: true,
  },
  {
    name: "Ultimate",
    price: 50,
    priceAnnual: 42, // $42/mo billed annually
    features: [
      "All Premium features",
      "Team collaboration",
      "Early access to new tools",
      "Dedicated onboarding",
      "White-glove support",
    ],
    highlight: false,
    hasAnnual: true,
  },
];

const productIds = {
  premium_monthly: "150f27c2-d30d-4961-8662-223cd5855b68",
  premium_annual: "77a7f1a8-ca07-4c39-97bb-09fc234f17b3",
  ultimate_monthly: "51e60e64-7fe8-4bf3-b8aa-8ddea26019ab",
  ultimate_annual: "794d4be9-0d0b-4d21-9e7c-a68594e0ffe6",
};

export default function Pricing() {
  const [annual, setAnnual] = useState([false, false, false]);
  const { user } = useAuth();
  const [loadingIdx, setLoadingIdx] = useState<number | null>(null);

  const handleToggle = (idx: number) => {
    setAnnual((prev) => prev.map((v, i) => (i === idx ? !v : v)));
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center py-12 px-4">
      <div className="max-w-3xl w-full text-center mb-12">
        <Badge variant="outline" className="mb-4 border-primary/20 text-primary">Pricing</Badge>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Choose Your Plan</h1>
        <p className="text-lg text-muted-foreground mb-2">Unlock the full power of AI trading. Start for free, upgrade anytime.</p>
      </div>
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan, idx) => (
          <div
            key={plan.name}
            className={`relative flex flex-col rounded-2xl shadow-lg bg-white/90 dark:bg-muted/80 border border-border p-8 pt-10 transition-all hover:scale-[1.03] ${plan.highlight ? 'ring-2 ring-primary z-10' : ''}`}
          >
            {plan.highlight && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <Badge className="bg-gradient-to-r from-primary to-primary-glow text-white px-4 py-1 text-xs flex items-center gap-1">
                  <Star className="w-3 h-3" /> Recommended
                </Badge>
              </div>
            )}
            <h2 className="text-2xl font-bold mb-2 text-foreground">{plan.name}</h2>
            <div className="flex items-center justify-center gap-2 mb-6">
              <span className="text-4xl font-extrabold text-primary">
                {plan.hasAnnual && annual[idx] ? plan.priceAnnual.toLocaleString(undefined, { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }) : plan.price.toLocaleString(undefined, { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })}
              </span>
              <span className="text-base text-muted-foreground">/mo</span>
              {/* Show savings badge only when annual is toggled */}
              {plan.hasAnnual && annual[idx] && (
                <Badge className="ml-2 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs font-semibold">
                  Save {Math.round((1 - plan.priceAnnual / plan.price) * 100)}%
                </Badge>
              )}
            </div>
            {plan.hasAnnual && (
              <div className="flex items-center justify-center mb-6">
                <span className="text-xs text-muted-foreground mr-2">Monthly</span>
                <button
                  className={`w-10 h-6 rounded-full border border-primary/30 bg-muted relative transition-colors ${annual[idx] ? 'bg-primary/80' : ''}`}
                  onClick={() => handleToggle(idx)}
                  aria-label="Toggle annual pricing"
                >
                  <span
                    className={`absolute left-1 top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${annual[idx] ? 'translate-x-4 bg-primary' : ''}`}
                  />
                </button>
                <span className="text-xs text-muted-foreground ml-2">Annual</span>
              </div>
            )}
            <ul className="mb-8 space-y-3 text-left">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm text-foreground/90">
                  <Check className="w-4 h-4 text-primary" /> {feature}
                </li>
              ))}
            </ul>
            <Button
              size="lg"
              className="w-full mt-auto"
              variant={plan.highlight ? "default" : "outline"}
              disabled={loadingIdx === idx}
              onClick={async () => {
                if (plan.price === 0) {
                  // Free: maybe sign up or go to dashboard
                  window.location.href = "/dashboard";
                  return;
                }
                if (!user || !user.email) {
                  toast.error("You must be logged in to start checkout. Please log in or sign up.");
                  return;
                }
                setLoadingIdx(idx);
                let productId = "";
                if (plan.name === "Premium") productId = annual[idx] ? productIds.premium_annual : productIds.premium_monthly;
                if (plan.name === "Ultimate") productId = annual[idx] ? productIds.ultimate_annual : productIds.ultimate_monthly;
                try {
                  const url = await createPolarCheckout(productId, user.email);
                  toast.success("Redirecting to secure checkout...");
                  window.location.href = url;
                } catch (err) {
                  const message = err instanceof Error ? err.message : String(err);
                  toast.error("Failed to start checkout: " + message);
                } finally {
                  setLoadingIdx(null);
                }
              }}
            >
              {loadingIdx === idx ? "Redirecting..." : plan.price === 0 ? "Get Started Free" : "Upgrade"}
            </Button>
          </div>
        ))}
      </div>
      <div className="text-center mt-12 text-muted-foreground text-xs">
        * Annual plans are billed upfront. Save up to 15% compared to monthly.
      </div>
    </div>
  );
} 