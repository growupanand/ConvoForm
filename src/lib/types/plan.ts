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
