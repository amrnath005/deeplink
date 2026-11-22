/**
 * DeepLink Pro V2 Core Entities & Validation Schemas
 * Mobile Campaign Intelligence Platform Architecture
 */

// 1. Workspace (Multi-tenancy isolation)
export interface Workspace {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

// 2. User
export interface User {
  id: string;
  email: string;
  workspaceId: string;
  role: "owner" | "admin" | "member";
  createdAt: string;
  updatedAt: string;
}

// 3. Subscription
export interface Subscription {
  id: string;
  workspaceId: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  planTier: "free" | "pro" | "enterprise";
  status: "active" | "canceled" | "past_due";
  currentPeriodEnd?: string;
  createdAt: string;
  updatedAt: string;
}

// 4. Domain
export interface Domain {
  id: string;
  workspaceId: string;
  domain: string;
  isVerified: boolean;
  createdAt: string;
}

// 5. Campaign
export interface Campaign {
  id: string;
  workspaceId: string;
  name: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  createdAt: string;
}

// 6. Link (Smart Shortlink)
export interface Link {
  id: string;
  workspaceId: string;
  campaignId?: string;
  domainId?: string;
  alias: string;
  originalUrl: string;
  shortUrl: string;
  targetScheme?: string;
  fallbackUrl?: string;
  qrCode?: string;
  isActive: boolean;
  expiresAt?: string;
  createdAt: string;
}

// 7. Click (Operational Data - Short/Medium term operational log)
export interface Click {
  id: string;
  workspaceId: string;
  linkId: string;
  alias: string;
  ip: string;
  country: string;
  city?: string;
  os: string;
  browser: string;
  device: string;
  userAgent?: string;
  timestamp: string;
}

// 8. Raw Telemetry (Short-lived 14-day Data - Canvas, GPU, WebGL)
export interface RawTelemetry {
  id: string;
  clickId: string;
  canvasHash?: string;
  webglVendor?: string;
  gpuRenderer?: string;
  screenResolution?: string;
  touchPoints?: number;
  createdAt: string;
}

// 9. Risk Assessment (Derived Quality Score 0.00 - 1.00)
export interface RiskAssessment {
  id: string;
  clickId: string;
  trafficQualityScore: number; // 0.00 (Bot) to 1.00 (Human)
  riskCategory: "Low" | "Medium" | "High";
  suspiciousSignals: string[];
  createdAt: string;
}

// 10. Conversion Event (Idempotent by workspaceId + orderId + eventName)
export interface ConversionEvent {
  id: string;
  workspaceId: string;
  clickId?: string;
  linkId?: string;
  eventName: "purchase" | "add_to_cart" | "signup" | "lead" | string;
  orderId?: string;
  value: number;
  currency: string;
  idempotencyKey: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

// 11. Attribution (Derived Analytics)
export interface Attribution {
  id: string;
  conversionId: string;
  clickId: string;
  campaignId?: string;
  touchType: "last_touch" | "first_touch";
  attributedValue: number;
  createdAt: string;
}

// 12. Aggregated Daily Campaign Metrics (Historical Rollup)
export interface DailyCampaignMetrics {
  id: string;
  workspaceId: string;
  linkId: string;
  metricDate: string; // YYYY-MM-DD
  totalClicks: number;
  humanClicks: number;
  suspiciousClicks: number;
  conversions: number;
  totalRevenue: number;
}

// Conversion Ingestion Input DTO & Validation Helper
export interface CreateConversionInput {
  event: string;
  click_id?: string;
  order_id?: string;
  value?: number;
  currency?: string;
  metadata?: Record<string, any>;
}

export function validateConversionInput(body: any): { valid: boolean; error?: string; data?: CreateConversionInput } {
  if (!body || typeof body !== "object") {
    return { valid: false, error: "Invalid JSON request body" };
  }

  if (!body.event || typeof body.event !== "string" || body.event.trim() === "") {
    return { valid: false, error: "Event name is required and must be a string (e.g. 'purchase')" };
  }

  const allowedEvents = ["purchase", "add_to_cart", "signup", "lead"];
  const eventName = body.event.trim().toLowerCase();
  
  const value = typeof body.value === "number" && !isNaN(body.value) ? body.value : 0;
  const currency = typeof body.currency === "string" ? body.currency.trim().toUpperCase() : "USD";
  const click_id = typeof body.click_id === "string" ? body.click_id.trim() : undefined;
  const order_id = typeof body.order_id === "string" ? body.order_id.trim() : undefined;

  return {
    valid: true,
    data: {
      event: eventName,
      click_id,
      order_id,
      value,
      currency,
      metadata: body.metadata && typeof body.metadata === "object" ? body.metadata : {},
    },
  };
}
