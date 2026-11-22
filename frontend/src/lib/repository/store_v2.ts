/**
 * Unified Repository Layer for DeepLink Pro V2
 * Supports multi-tenancy, data tiering (operational, short-lived telemetry, derived analytics, rollups),
 * strict idempotency for conversion events, and Campaign Analytics aggregations.
 */
import { supabase, isSupabaseConfigured } from "@/lib/db";
import {
  Workspace, User, Subscription, Domain, Campaign, Link, Click,
  RawTelemetry, RiskAssessment, ConversionEvent, Attribution, DailyCampaignMetrics,
  CreateConversionInput
} from "./entities";
import {
  AttributionRecord, computeLastEligibleTouchAttribution,
  calculateAnalyticsMetrics, CampaignAnalyticsSummary, LinkAnalyticsSummary,
  normalizeCurrencyToUsd
} from "@/lib/attribution";

// In-Memory Storage for Development / Fallback Mode
const inMemoryWorkspaces = new Map<string, Workspace>([
  ["ws_default", { id: "ws_default", name: "Default Brand Workspace", slug: "default-brand", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }]
]);

const inMemoryCampaigns = new Map<string, Campaign>([
  [
    "camp_summer",
    {
      id: "camp_summer",
      workspaceId: "ws_default",
      name: "Summer Sale 2026",
      utmSource: "instagram",
      utmMedium: "paid_social",
      utmCampaign: "summer_drop",
      createdAt: new Date().toISOString()
    }
  ]
]);

const inMemoryLinks = new Map<string, Link>([
  [
    "rickroll",
    {
      id: "dl_rickroll_9f",
      workspaceId: "ws_default",
      campaignId: "camp_summer",
      alias: "rickroll",
      originalUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      shortUrl: "/rickroll",
      targetScheme: "vnd.youtube://dQw4w9WgXcQ",
      fallbackUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      isActive: true,
      createdAt: new Date().toISOString()
    }
  ]
]);

const inMemoryClicks = new Map<string, Click>([
  [
    "clk_demo_1",
    {
      id: "clk_demo_1",
      workspaceId: "ws_default",
      linkId: "dl_rickroll_9f",
      alias: "rickroll",
      ip: "117.250.253.225",
      country: "India",
      city: "Mumbai",
      os: "Windows 11",
      browser: "Chrome 124",
      device: "Desktop",
      timestamp: new Date().toISOString()
    }
  ]
]);

const inMemoryRawTelemetry = new Map<string, RawTelemetry>();
const inMemoryRiskAssessments = new Map<string, RiskAssessment>();
const inMemoryConversions = new Map<string, ConversionEvent>();
const inMemoryAttributions = new Map<string, AttributionRecord>();

// Idempotency cache map: idempotencyKey -> ConversionEvent
const idempotencyStore = new Map<string, ConversionEvent>();

export function generateIdempotencyKey(workspaceId: string, orderId?: string, eventName?: string): string {
  const cleanOrder = (orderId || "").trim().toLowerCase();
  const cleanEvent = (eventName || "").trim().toLowerCase();
  
  if (!cleanOrder) {
    return `idem_${workspaceId}_${cleanEvent}_${Math.random().toString(36).substring(2, 10)}_${Date.now()}`;
  }

  return `idem_${workspaceId}_${cleanOrder}_${cleanEvent}`;
}

export class RepositoryV2 {
  
  static async getWorkspaceBySlug(slug: string): Promise<Workspace | null> {
    const ws = Array.from(inMemoryWorkspaces.values()).find((w) => w.slug === slug);
    if (ws) return ws;

    if (isSupabaseConfigured()) {
      try {
        const { data } = await supabase.from("workspaces").select("*").eq("slug", slug).single();
        if (data) return data as Workspace;
      } catch (e) {
        console.warn("[RepositoryV2] Supabase workspace query error:", e);
      }
    }
    return inMemoryWorkspaces.get("ws_default") || null;
  }

  static async createWorkspace(wsInput: Partial<Workspace>): Promise<Workspace> {
    const id = wsInput.id || "ws_" + Math.random().toString(36).substring(2, 10);
    const ws: Workspace = {
      id,
      name: wsInput.name || "New Workspace",
      slug: wsInput.slug || id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    inMemoryWorkspaces.set(ws.id, ws);
    return ws;
  }

  static async createCampaign(campInput: Partial<Campaign>): Promise<Campaign> {
    const id = campInput.id || "camp_" + Math.random().toString(36).substring(2, 10);
    const camp: Campaign = {
      id,
      workspaceId: campInput.workspaceId || "ws_default",
      name: campInput.name || "New Campaign",
      utmSource: campInput.utmSource,
      utmMedium: campInput.utmMedium,
      utmCampaign: campInput.utmCampaign,
      createdAt: new Date().toISOString()
    };
    inMemoryCampaigns.set(camp.id, camp);
    return camp;
  }

  static async createLink(linkInput: Partial<Link>): Promise<Link> {
    const id = linkInput.id || "link_" + Math.random().toString(36).substring(2, 10);
    const link: Link = {
      id,
      workspaceId: linkInput.workspaceId || "ws_default",
      campaignId: linkInput.campaignId,
      alias: linkInput.alias || id,
      originalUrl: linkInput.originalUrl || "",
      shortUrl: linkInput.shortUrl || `/${linkInput.alias || id}`,
      targetScheme: linkInput.targetScheme,
      fallbackUrl: linkInput.fallbackUrl || linkInput.originalUrl,
      isActive: linkInput.isActive !== undefined ? linkInput.isActive : true,
      createdAt: new Date().toISOString()
    };
    inMemoryLinks.set(link.id, link);
    inMemoryLinks.set(link.alias, link);
    return link;
  }

  static async clearWorkspaceData(workspaceId: string): Promise<void> {
    for (const [id, link] of Array.from(inMemoryLinks.entries())) {
      if (link.workspaceId === workspaceId) inMemoryLinks.delete(id);
    }
    for (const [id, camp] of Array.from(inMemoryCampaigns.entries())) {
      if (camp.workspaceId === workspaceId) inMemoryCampaigns.delete(id);
    }
    for (const [id, click] of Array.from(inMemoryClicks.entries())) {
      if (click.workspaceId === workspaceId) inMemoryClicks.delete(id);
    }
    for (const [id, conv] of Array.from(inMemoryConversions.entries())) {
      if (conv.workspaceId === workspaceId) inMemoryConversions.delete(id);
    }
    for (const [id, attr] of Array.from(inMemoryAttributions.entries())) {
      if (attr.workspaceId === workspaceId) inMemoryAttributions.delete(id);
    }
  }

  static async recordClickWithTelemetry(
    workspaceId: string,
    linkId: string,
    alias: string,
    clickInput: Partial<Click>,
    telemetryInput?: Partial<RawTelemetry>,
    riskInput?: Partial<RiskAssessment>
  ): Promise<{ click: Click; risk: RiskAssessment }> {
    const clickId = clickInput.id || "clk_" + Math.random().toString(36).substring(2, 10);
    const timestamp = clickInput.timestamp || new Date().toISOString();

    const click: Click = {
      id: clickId,
      workspaceId,
      linkId,
      alias,
      ip: clickInput.ip || "127.0.0.1",
      country: clickInput.country || "India",
      city: clickInput.city || "Mumbai",
      os: clickInput.os || "Unknown OS",
      browser: clickInput.browser || "Unknown Browser",
      device: clickInput.device || "Desktop",
      userAgent: clickInput.userAgent || "",
      timestamp
    };

    inMemoryClicks.set(clickId, click);

    if (telemetryInput) {
      const telemId = "telem_" + Math.random().toString(36).substring(2, 10);
      const rawTelem: RawTelemetry = {
        id: telemId,
        clickId,
        canvasHash: telemetryInput.canvasHash,
        webglVendor: telemetryInput.webglVendor,
        gpuRenderer: telemetryInput.gpuRenderer,
        screenResolution: telemetryInput.screenResolution,
        touchPoints: telemetryInput.touchPoints || 0,
        createdAt: timestamp
      };
      inMemoryRawTelemetry.set(telemId, rawTelem);
    }

    const riskId = "risk_" + Math.random().toString(36).substring(2, 10);
    const score = riskInput?.trafficQualityScore !== undefined ? riskInput.trafficQualityScore : 1.00;
    const category = score < 0.4 ? "High" : score < 0.7 ? "Medium" : "Low";

    const risk: RiskAssessment = {
      id: riskId,
      clickId,
      trafficQualityScore: score,
      riskCategory: category,
      suspiciousSignals: riskInput?.suspiciousSignals || [],
      createdAt: timestamp
    };
    inMemoryRiskAssessments.set(clickId, risk);

    if (isSupabaseConfigured()) {
      try {
        await supabase.from("clicks").insert([click]);
        await supabase.from("risk_assessments").insert([risk]);
      } catch (e) {
        console.warn("[RepositoryV2] Supabase click record error:", e);
      }
    }

    return { click, risk };
  }

  // Strict Idempotency & Last Eligible Touch Attribution Engine
  static async ingestConversionEvent(
    workspaceId: string,
    input: CreateConversionInput
  ): Promise<{ conversion: ConversionEvent; isDuplicate: boolean; attribution?: AttributionRecord }> {
    const idempotencyKey = generateIdempotencyKey(workspaceId, input.order_id, input.event);

    if (idempotencyStore.has(idempotencyKey)) {
      const existing = idempotencyStore.get(idempotencyKey)!;
      return { conversion: existing, isDuplicate: true };
    }

    if (isSupabaseConfigured()) {
      try {
        const { data } = await supabase
          .from("conversion_events")
          .select("*")
          .eq("idempotency_key", idempotencyKey)
          .single();

        if (data) {
          const existing = data as ConversionEvent;
          idempotencyStore.set(idempotencyKey, existing);
          return { conversion: existing, isDuplicate: true };
        }
      } catch {}
    }

    const conversionId = "conv_" + Math.random().toString(36).substring(2, 10);
    const timestamp = new Date().toISOString();

    const conversion: ConversionEvent = {
      id: conversionId,
      workspaceId,
      clickId: input.click_id,
      eventName: input.event,
      orderId: input.order_id,
      value: input.value || 0,
      currency: input.currency || "USD",
      idempotencyKey,
      metadata: input.metadata || {},
      timestamp
    };

    inMemoryConversions.set(conversionId, conversion);
    idempotencyStore.set(idempotencyKey, conversion);

    // Compute Last Eligible Touch Attribution
    const allClicks = Array.from(inMemoryClicks.values());
    const attribution = computeLastEligibleTouchAttribution(
      conversion,
      allClicks,
      inMemoryRiskAssessments,
      inMemoryLinks
    );

    if (attribution) {
      inMemoryAttributions.set(conversionId, attribution);
    }

    if (isSupabaseConfigured()) {
      try {
        await supabase.from("conversion_events").insert([conversion]);
        if (attribution) {
          await supabase.from("attributions").insert([attribution]);
        }
      } catch (e) {
        console.warn("[RepositoryV2] Supabase conversion ingestion error:", e);
      }
    }

    return { conversion, isDuplicate: false, attribution: attribution || undefined };
  }

  // Analytics Query 1: GET /api/analytics/campaigns
  static async getCampaignsAnalytics(workspaceId: string): Promise<CampaignAnalyticsSummary[]> {
    const campaigns = Array.from(inMemoryCampaigns.values()).filter((c) => c.workspaceId === workspaceId);
    const links = Array.from(inMemoryLinks.values()).filter((l) => l.workspaceId === workspaceId);
    const clicks = Array.from(inMemoryClicks.values()).filter((c) => c.workspaceId === workspaceId);
    const attributions = Array.from(inMemoryAttributions.values()).filter((a) => a.workspaceId === workspaceId);

    return campaigns.map((camp) => {
      const campLinks = links.filter((l) => l.campaignId === camp.id);
      const campLinkIds = new Set(campLinks.map((l) => l.id));
      const campClicks = clicks.filter((c) => campLinkIds.has(c.linkId));
      const campAttributions = attributions.filter((a) => campLinkIds.has(a.linkId));

      const metrics = calculateAnalyticsMetrics(campClicks, inMemoryRiskAssessments, campAttributions);

      return {
        campaignId: camp.id,
        campaignName: camp.name,
        utmSource: camp.utmSource,
        utmMedium: camp.utmMedium,
        utmCampaign: camp.utmCampaign,
        linksCount: campLinks.length,
        ...metrics,
      };
    });
  }

  // Analytics Query 2: GET /api/analytics/campaign/:id
  static async getSingleCampaignAnalytics(workspaceId: string, campaignId: string): Promise<CampaignAnalyticsSummary | null> {
    const camp = inMemoryCampaigns.get(campaignId);
    if (!camp || camp.workspaceId !== workspaceId) return null;

    const links = Array.from(inMemoryLinks.values()).filter((l) => l.campaignId === campaignId);
    const linkIds = new Set(links.map((l) => l.id));

    const clicks = Array.from(inMemoryClicks.values()).filter((c) => linkIds.has(c.linkId));
    const attributions = Array.from(inMemoryAttributions.values()).filter((a) => linkIds.has(a.linkId));

    const metrics = calculateAnalyticsMetrics(clicks, inMemoryRiskAssessments, attributions);

    return {
      campaignId: camp.id,
      campaignName: camp.name,
      utmSource: camp.utmSource,
      utmMedium: camp.utmMedium,
      utmCampaign: camp.utmCampaign,
      linksCount: links.length,
      ...metrics,
    };
  }

  // Analytics Query 3: GET /api/analytics/link/:id
  static async getSingleLinkAnalytics(workspaceId: string, linkId: string): Promise<LinkAnalyticsSummary | null> {
    const link = Array.from(inMemoryLinks.values()).find((l) => l.id === linkId || l.alias === linkId);
    if (!link || link.workspaceId !== workspaceId) return null;

    const clicks = Array.from(inMemoryClicks.values()).filter((c) => c.linkId === link.id);
    const attributions = Array.from(inMemoryAttributions.values()).filter((a) => a.linkId === link.id);

    const metrics = calculateAnalyticsMetrics(clicks, inMemoryRiskAssessments, attributions);

    return {
      linkId: link.id,
      alias: link.alias,
      originalUrl: link.originalUrl,
      shortUrl: link.shortUrl,
      ...metrics,
    };
  }

  static async purgeExpiredTelemetry(retentionDays = 14): Promise<number> {
    const cutoff = new Date(Date.now() - retentionDays * 86400 * 1000).toISOString();
    let purgedCount = 0;

    for (const [id, record] of Array.from(inMemoryRawTelemetry.entries())) {
      if (record.createdAt < cutoff) {
        inMemoryRawTelemetry.delete(id);
        purgedCount++;
      }
    }
    return purgedCount;
  }
}
