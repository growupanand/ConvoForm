import type { Plan } from "../types/pricing";

export const freePlan: Plan = {
  name: "Free plan",
  price: "$0/month",
  features: [
    {
      name: "Create forms manually",
      featureValue: Number.POSITIVE_INFINITY,
      featureText: "Unlimited",
    },
    {
      name: "Generate forms using AI",
      featureValue: Number.POSITIVE_INFINITY,
      featureText: "Unlimited",
    },
    {
      name: "Collect form responses",
      featureValue: 500,
      featureText: "500 Total",
    },
  ],
};

export const formSubmissionLimit =
  freePlan.features.find((feature) => feature.name === "Collect form responses")
    ?.featureValue ?? 0;

export const aiGeneratedFormLimit =
  freePlan.features.find(
    (feature) => feature.name === "Generate forms using AI",
  )?.featureValue ?? 0;
