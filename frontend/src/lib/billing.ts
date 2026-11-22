/**
 * DeepLink Pro — Configuration-Driven SaaS Subscription Tiers & Usage Metering Engine
 * Enforces monthly click limits, plan features, and usage metering.
 */

export interface PlanConfig {
  id: "free" | "pro" | "business";
  name: string;
  monthlyClickLimit: number;
  priceMonthlyUsd: number;
  features: {
    customDomains: boolean;
    attributionWindowDays: number;
    teamMembersLimit: number;
    prioritySupport: boolean;
  };
}

export const SUBSCRIPTION_PLANS: Record<string, PlanConfig> = {
  free: {
    id: "free",
    name: "Free Tier",
    monthlyClickLimit: 1000,
    priceMonthlyUsd: 0,
    features: { customDomains: false, attributionWindowDays: 14, teamMembersLimit: 1, prioritySupport: false },
  },
  pro: {
    id: "pro",
    name: "Pro Tier",
    monthlyClickLimit: 100000,
    priceMonthlyUsd: 49,
    features: { customDomains: true, attributionWindowDays: 30, teamMembersLimit: 5, prioritySupport: false },
  },
  business: {
    id: "business",
    name: "Business Tier",
    monthlyClickLimit: 1000000,
    priceMonthlyUsd: 199,
    features: { customDomains: true, attributionWindowDays: 90, teamMembersLimit: 25, prioritySupport: true },
  },
};

export interface WorkspaceUsageStatus {
  workspaceId: string;
  planId: "free" | "pro" | "business";
  clicksThisMonth: number;
  monthlyClickLimit: number;
  usagePercentage: number;
  isLimitExceeded: boolean;
}

export function checkWorkspaceUsageLimit(
  workspaceId: string,
  planId: "free" | "pro" | "business",
  clicksThisMonth: number
): WorkspaceUsageStatus {
  const plan = SUBSCRIPTION_PLANS[planId] || SUBSCRIPTION_PLANS.free;
  const limit = plan.monthlyClickLimit;
  const usagePercentage = Math.round((clicksThisMonth / limit) * 100);
  const isLimitExceeded = clicksThisMonth >= limit;

  return {
    workspaceId,
    planId: plan.id,
    clicksThisMonth,
    monthlyClickLimit: limit,
    usagePercentage,
    isLimitExceeded,
  };
}
