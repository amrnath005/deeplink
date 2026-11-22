/**
 * DeepLink Pro — Campaign Attribution Subsystem Engine
 * Handles Last Eligible Touch matching, multi-touch extensibility, currency normalization,
 * and campaign/link metrics calculation.
 */

import { Click, ConversionEvent, Link, Campaign, RiskAssessment } from "./repository/entities";

export type AttributionModel = "last_eligible_touch" | "first_touch" | "linear" | "time_decay";

export interface AttributionRecord {
  id: string;
  workspaceId: string;
  conversionId: string;
  clickId: string;
  linkId: string;
  campaignId?: string;
  source?: string; // utm_source
  medium?: string; // utm_medium
  content?: string; // utm_content
  model: AttributionModel;
  touchTimestamp: string;
  conversionTimestamp: string;
  eventName: "page_view" | "app_open" | "install" | "signup" | "add_to_cart" | "purchase" | string;
  orderId?: string;
  value: number;
  currency: string;
  attributedRevenue: number;
  createdAt: string;
}

export interface AnalyticsMetrics {
  clicks: number;
  qualityClicks: number;
  suspiciousClicks: number;
  conversions: number;
  conversionRate: number; // e.g. 0.052 (5.2%)
  revenue: number;
  revenuePerClick: number; // RPC
  trafficQuality: number; // Percentage e.g. 0.94 (94% human)
  attributedRevenue: number;
}

export interface CampaignAnalyticsSummary extends AnalyticsMetrics {
  campaignId: string;
  campaignName: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  linksCount: number;
}

export interface LinkAnalyticsSummary extends AnalyticsMetrics {
  linkId: string;
  alias: string;
  originalUrl: string;
  shortUrl: string;
}

// Fixed exchange rates relative to USD for currency normalization
const CURRENCY_RATES: Record<string, number> = {
  USD: 1.0,
  INR: 0.012, // 1 INR ~ 0.012 USD
  EUR: 1.09,  // 1 EUR ~ 1.09 USD
  GBP: 1.28,  // 1 GBP ~ 1.28 USD
  CAD: 0.73,  // 1 CAD ~ 0.73 USD
};

export function normalizeCurrencyToUsd(value: number, currency: string): number {
  const code = (currency || "USD").toUpperCase();
  const rate = CURRENCY_RATES[code] || 1.0;
  return Math.round(value * rate * 100) / 100;
}

/**
 * Last Eligible Touch Attribution Engine
 * Matches a conversion event to the most recent eligible non-high-risk click within 30 days.
 */
export function computeLastEligibleTouchAttribution(
  conversion: ConversionEvent,
  clicks: Click[],
  riskAssessments: Map<string, RiskAssessment>,
  links: Map<string, Link>,
  attributionWindowDays = 30
): AttributionRecord | null {
  const convTime = new Date(conversion.timestamp).getTime();
  const cutoffTime = convTime - attributionWindowDays * 86400 * 1000;

  // If conversion explicitly includes a clickId, verify it exists and is within window
  let candidateClicks: Click[] = [];

  if (conversion.clickId) {
    const directClick = clicks.find((c) => c.id === conversion.clickId);
    if (directClick) {
      const clickTime = new Date(directClick.timestamp).getTime();
      if (clickTime >= cutoffTime && clickTime <= convTime) {
        candidateClicks = [directClick];
      }
    }
  }

  // If no direct click match, find all clicks for the workspace/link within attribution window
  if (candidateClicks.length === 0) {
    candidateClicks = clicks.filter((c) => {
      const clickTime = new Date(c.timestamp).getTime();
      const isWindowValid = clickTime >= cutoffTime && clickTime <= convTime;
      const isLinkValid = conversion.linkId ? c.linkId === conversion.linkId : true;
      return isWindowValid && isLinkValid && c.workspaceId === conversion.workspaceId;
    });
  }

  // Filter out High Risk suspicious clicks for Last ELIGIBLE Touch
  const eligibleClicks = candidateClicks.filter((c) => {
    const risk = riskAssessments.get(c.id);
    return !risk || risk.riskCategory !== "High";
  });

  // Pick most recent eligible click
  const selectedClick = eligibleClicks.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )[0];

  if (!selectedClick) {
    return null;
  }

  const link = links.get(selectedClick.linkId);
  const normalizedValue = normalizeCurrencyToUsd(conversion.value, conversion.currency);

  return {
    id: "attr_" + Math.random().toString(36).substring(2, 10),
    workspaceId: conversion.workspaceId,
    conversionId: conversion.id,
    clickId: selectedClick.id,
    linkId: selectedClick.linkId,
    campaignId: link?.campaignId,
    model: "last_eligible_touch",
    touchTimestamp: selectedClick.timestamp,
    conversionTimestamp: conversion.timestamp,
    eventName: conversion.eventName,
    orderId: conversion.orderId,
    value: conversion.value,
    currency: conversion.currency,
    attributedRevenue: normalizedValue,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Compute Aggregated Analytics Metrics for a collection of clicks, conversions, and attributions
 */
export function calculateAnalyticsMetrics(
  clicks: Click[],
  riskAssessments: Map<string, RiskAssessment>,
  attributions: AttributionRecord[]
): AnalyticsMetrics {
  const totalClicks = clicks.length;
  let qualityClicks = 0;
  let suspiciousClicks = 0;

  clicks.forEach((c) => {
    const risk = riskAssessments.get(c.id);
    if (risk && (risk.riskCategory === "High" || risk.riskCategory === "Medium")) {
      suspiciousClicks++;
    } else {
      qualityClicks++;
    }
  });

  const conversions = attributions.length;
  const conversionRate = totalClicks > 0 ? Math.round((conversions / totalClicks) * 10000) / 10000 : 0;

  const totalRevenueUsd = attributions.reduce((sum, a) => sum + a.attributedRevenue, 0);
  const revenuePerClick = totalClicks > 0 ? Math.round((totalRevenueUsd / totalClicks) * 100) / 100 : 0;
  const trafficQuality = totalClicks > 0 ? Math.round((qualityClicks / totalClicks) * 1000) / 1000 : 1.0;

  return {
    clicks: totalClicks,
    qualityClicks,
    suspiciousClicks,
    conversions,
    conversionRate,
    revenue: totalRevenueUsd,
    revenuePerClick,
    trafficQuality,
    attributedRevenue: totalRevenueUsd,
  };
}
