/**
 * DeepLink Pro — Demo Sandbox Environment & Safeguard Subsystem
 * Mandates complete data isolation between demo datasets and real production workspaces.
 */

import { RepositoryV2 } from "./repository/store_v2";

export const DEMO_WORKSPACE_ID = "ws_demo_sandbox";
export const DEMO_WORKSPACE_SLUG = "demo-sandbox";

export interface DemoSeedSummary {
  workspaceId: string;
  campaignsCount: number;
  linksCount: number;
  clicksCount: number;
  conversionsCount: number;
  isDemoIsolated: boolean;
}

/**
 * Safeguard Helper: Verifies whether a given workspace ID belongs strictly to the Demo Sandbox.
 */
export function isDemoWorkspace(workspaceId: string): boolean {
  return workspaceId === DEMO_WORKSPACE_ID;
}

/**
 * Seed Controlled Demo Workspace Sandbox with structured, realistic campaigns, links, traffic & conversions.
 */
export async function seedDemoWorkspace(): Promise<DemoSeedSummary> {
  const now = Date.now();

  // 1. Create Isolated Demo Workspace Context
  await RepositoryV2.createWorkspace({
    id: DEMO_WORKSPACE_ID,
    name: "🎮 Demo Sandbox Workspace (Isolated)",
    slug: DEMO_WORKSPACE_SLUG,
  });

  // 2. Create Demo Campaigns
  const camp1 = await RepositoryV2.createCampaign({
    id: "camp_demo_summer",
    workspaceId: DEMO_WORKSPACE_ID,
    name: "Summer D2C Promo 2026",
    utmSource: "instagram",
    utmMedium: "paid_social",
    utmCampaign: "summer_app_launch",
  });

  const camp2 = await RepositoryV2.createCampaign({
    id: "camp_demo_tiktok",
    workspaceId: DEMO_WORKSPACE_ID,
    name: "TikTok Creator Flash Sale",
    utmSource: "tiktok",
    utmMedium: "creator_influencer",
    utmCampaign: "flash_drop",
  });

  // 3. Create Demo Smart Links
  const link1 = await RepositoryV2.createLink({
    id: "dl_demo_summer_app",
    workspaceId: DEMO_WORKSPACE_ID,
    campaignId: camp1.id,
    alias: "demo-summer",
    originalUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    shortUrl: "/demo-summer",
    targetScheme: "youtube://watch?v=dQw4w9WgXcQ",
    isActive: true,
  });

  const link2 = await RepositoryV2.createLink({
    id: "dl_demo_tiktok_sale",
    workspaceId: DEMO_WORKSPACE_ID,
    campaignId: camp2.id,
    alias: "demo-tiktok",
    originalUrl: "https://spotify.com/album/4aawaye9218",
    shortUrl: "/demo-tiktok",
    targetScheme: "spotify:album:4aawaye9218",
    isActive: true,
  });

  // 4. Record Example Traffic (Human, Suspicious, High-Risk)
  const click1 = await RepositoryV2.recordClickWithTelemetry(
    DEMO_WORKSPACE_ID,
    link1.id,
    link1.alias,
    {
      id: "clk_demo_human_1",
      userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4) Mobile Safari/604.1",
      ip: "117.250.253.225",
      country: "India",
      os: "iOS",
      browser: "Mobile Safari",
      device: "iPhone",
      timestamp: new Date(now - 1000 * 60 * 120).toISOString(), // 2 hours ago
    },
    { canvasHash: "canvas_human_99", touchPoints: 5 },
    { trafficQualityScore: 0.95, suspiciousSignals: [] } // Low Risk Human
  );

  const click2 = await RepositoryV2.recordClickWithTelemetry(
    DEMO_WORKSPACE_ID,
    link1.id,
    link1.alias,
    {
      id: "clk_demo_proxy_2",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0.0.0",
      ip: "185.220.101.5",
      country: "Germany",
      os: "Windows",
      browser: "Chrome",
      device: "Desktop",
      timestamp: new Date(now - 1000 * 60 * 45).toISOString(), // 45 mins ago
    },
    { canvasHash: "canvas_proxy_11", touchPoints: 0 },
    { trafficQualityScore: 0.55, suspiciousSignals: ["proxy_or_vpn", "abnormal_request_rate"] } // Suspicious Traffic
  );

  const click3 = await RepositoryV2.recordClickWithTelemetry(
    DEMO_WORKSPACE_ID,
    link2.id,
    link2.alias,
    {
      id: "clk_demo_bot_3",
      userAgent: "Mozilla/5.0 (X11; Linux x86_64) HeadlessChrome/124.0.0.0",
      ip: "10.0.0.99",
      country: "US",
      os: "Linux",
      browser: "HeadlessChrome",
      device: "Desktop",
      timestamp: new Date(now - 1000 * 60 * 10).toISOString(), // 10 mins ago
    },
    { canvasHash: "canvas_bot_00", touchPoints: 0 },
    { trafficQualityScore: 0.10, suspiciousSignals: ["automation_signature", "headless_browser"] } // High Risk Bot
  );

  // 5. Record Example Conversions
  await RepositoryV2.ingestConversionEvent(DEMO_WORKSPACE_ID, {
    event: "purchase",
    click_id: click1.click.id,
    order_id: "ORD_DEMO_SALE_001",
    value: 249,
    currency: "USD",
  });

  await RepositoryV2.ingestConversionEvent(DEMO_WORKSPACE_ID, {
    event: "signup",
    click_id: click1.click.id,
    order_id: "ORD_DEMO_SIGNUP_002",
    value: 0,
    currency: "USD",
  });

  return {
    workspaceId: DEMO_WORKSPACE_ID,
    campaignsCount: 2,
    linksCount: 2,
    clicksCount: 3,
    conversionsCount: 2,
    isDemoIsolated: true,
  };
}

/**
 * Reset Mechanism: Purges all demo data and re-seeds the clean sandbox state.
 */
export async function resetDemoWorkspace(): Promise<DemoSeedSummary> {
  await RepositoryV2.clearWorkspaceData(DEMO_WORKSPACE_ID);
  return seedDemoWorkspace();
}
