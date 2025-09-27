import { z } from "zod/v4";
import { formatFileSize, mbToBytes } from "../../utils/storage";

/**
 * Plan feature schema for validation
 */
export const planFeatureSchema = z.object({
  name: z.string(),
  featureValue: z.number(),
  featureText: z.string(),
});

/**
 * Plan schema for validation
 */
export const planSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.string(),
  features: z.array(planFeatureSchema),
});

export type PlanFeature = z.infer<typeof planFeatureSchema>;
export type Plan = z.infer<typeof planSchema>;

/**
 * Plan identifiers for consistent referencing
 */
export const PLAN_IDS = {
  FREE: "free",
  PRO: "pro",
  ENTERPRISE: "enterprise",
} as const;

export type PlanId = (typeof PLAN_IDS)[keyof typeof PLAN_IDS];

/**
 * Feature identifiers for consistent referencing
 */
export const FEATURE_NAMES = {
  FORM_RESPONSES: "Collect form responses",
  FORMS_LIMIT: "Create forms",
  FILE_STORAGE: "File storage",
  AI_FORM_GENERATION: "AI form generation",
  AI_FORM_FIELDS_PER_GENERATION: "AI form fields per generation",
  AI_FORM_GENERATIONS_PER_MONTH: "AI form generations per month",
} as const;

/**
 * Plan limits configuration
 */
export const PLAN_LIMITS = {
  FREE_RESPONSES: 500,
  FREE_FORMS: 10,
  FREE_STORAGE_BYTES: mbToBytes(100),
  FREE_AI_FIELDS_PER_GENERATION: 8,
  FREE_AI_GENERATIONS_PER_MONTH: 5,
  PRO_RESPONSES: 10000,
  PRO_FORMS: 100,
  PRO_STORAGE_BYTES: mbToBytes(1000),
  PRO_AI_FIELDS_PER_GENERATION: 15,
  PRO_AI_GENERATIONS_PER_MONTH: 50,
} as const;

/**
 * Free plan configuration for ConvoForm
 */
export const freePlan: Plan = {
  id: PLAN_IDS.FREE,
  name: "Free",
  price: "$0",
  features: [
    {
      name: FEATURE_NAMES.FORM_RESPONSES,
      featureValue: PLAN_LIMITS.FREE_RESPONSES,
      featureText: `${PLAN_LIMITS.FREE_RESPONSES} Total`,
    },
    {
      name: FEATURE_NAMES.FORMS_LIMIT,
      featureValue: PLAN_LIMITS.FREE_FORMS,
      featureText: `${PLAN_LIMITS.FREE_FORMS} Forms`,
    },
    {
      name: FEATURE_NAMES.FILE_STORAGE,
      featureValue: PLAN_LIMITS.FREE_STORAGE_BYTES,
      featureText: `${formatFileSize(PLAN_LIMITS.FREE_STORAGE_BYTES)}`,
    },
    {
      name: FEATURE_NAMES.AI_FORM_FIELDS_PER_GENERATION,
      featureValue: PLAN_LIMITS.FREE_AI_FIELDS_PER_GENERATION,
      featureText: `${PLAN_LIMITS.FREE_AI_FIELDS_PER_GENERATION} fields per generation`,
    },
    {
      name: FEATURE_NAMES.AI_FORM_GENERATIONS_PER_MONTH,
      featureValue: PLAN_LIMITS.FREE_AI_GENERATIONS_PER_MONTH,
      featureText: `${PLAN_LIMITS.FREE_AI_GENERATIONS_PER_MONTH} generations per month`,
    },
  ],
};

/**
 * All available plans
 */
export const plans = {
  [PLAN_IDS.FREE]: freePlan,
  // Add more plans here as needed
} as const;

/**
 * Gets a plan by its ID with validation
 * @param planId - The plan identifier
 * @returns The plan configuration
 * @throws Error if plan not found
 */
export function getPlan(planId: PlanId): Plan {
  const plan = plans[planId as keyof typeof plans];
  if (!plan) {
    throw new Error(`Plan not found: ${planId}`);
  }
  return planSchema.parse(plan);
}

/**
 * Gets a specific feature limit for a plan
 * @param planId - The plan identifier
 * @param featureName - The feature name to look up
 * @returns The feature value, or 0 if not found
 */
export function getPlanLimit(planId: PlanId, featureName: string): number {
  try {
    const plan = getPlan(planId);
    const feature = plan.features.find(
      (f: PlanFeature) => f.name === featureName,
    );
    return feature?.featureValue ?? 0;
  } catch {
    return 0;
  }
}

/**
 * Checks if a plan has unlimited access to a feature
 * @param planId - The plan identifier
 * @param featureName - The feature name to check
 * @returns True if unlimited (value is -1), false otherwise
 */
export function hasUnlimitedFeature(
  planId: PlanId,
  featureName: string,
): boolean {
  return getPlanLimit(planId, featureName) === -1;
}

/**
 * Checks if usage exceeds the plan limit
 * @param usage - Current usage amount
 * @param planId - The plan identifier
 * @param featureName - The feature name to check
 * @returns True if over limit, false if within limit or unlimited
 */
export function isOverLimit(
  usage: number,
  planId: PlanId,
  featureName: string,
): boolean {
  const limit = getPlanLimit(planId, featureName);
  if (limit === -1) return false; // Unlimited
  return usage > limit;
}

// Backward compatibility exports
export const formSubmissionLimit = getPlanLimit(
  PLAN_IDS.FREE,
  FEATURE_NAMES.FORM_RESPONSES,
);
