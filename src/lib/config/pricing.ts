import { Plan } from "../types/pricing";

export const freePlan: Plan = {
  name: "Free plan",
  price: "$0/month",
  features: [
    {
      name: "Create workspaces",
      featureValue: Infinity,
      featureText: "Unlimited",
    },
    {
      name: "Create forms",
      featureValue: Infinity,
      featureText: "Unlimited",
    },
    {
      name: "Collect form responses",
      featureValue: 500,
      featureText: "500 Total",
    },
  ],
};
