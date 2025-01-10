export type PlanFeature = {
  name: string;
  featureValue: number;
  featureText: string;
};

export type Plan = {
  name: string;
  price: string;
  features: PlanFeature[];
};

export const freePlan: Plan = {
  name: "Free",
  price: "$0",
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
