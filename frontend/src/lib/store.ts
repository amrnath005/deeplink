/**
 * Unified DeepLink Pro Link & Click Data Store
 * Supports dual-mode: Local Memory + Supabase PostgreSQL Cloud Sync
 */
import { supabase, isSupabaseConfigured } from "./db";
import fs from "fs";
import path from "path";

export interface ClickRecord {
  id: string;
  linkId?: string;
  alias: string;
  timestamp: string;
  ip: string;
  country: string;
  city: string;
  timezone?: string;
  browser: string;
  os: string;
  device: string;
  botScore: number;
  botLabel?: string;
  riskScore?: number;
  proxyDetected?: boolean;
  torDetected?: boolean;
  language?: string;
  languages?: string;
  canvasHash?: string;
  gpuRenderer?: string;
  userAgent?: string;
}

export interface LinkRecord {
  id: string;
  alias: string;
  originalUrl: string;
  shortUrl: string;
  targetScheme?: string;
  fallbackUrl?: string;
  createdAt: string;
  expiresAt?: string;
  password?: string;
  qrCode?: string;
  clicks: number;
  clicksCount: number;
  userId?: string;
  clickRecords?: ClickRecord[];
}

export type LinkData = LinkRecord;

// In-Memory Fallback Cache
const inMemoryLinks: Map<string, LinkRecord> = new Map([
  [
    "rickroll",
    {
      id: "dl_rickroll_9f",
      alias: "rickroll",
      originalUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      shortUrl: "/rickroll",
      targetScheme: "vnd.youtube://dQw4w9WgXcQ",
      fallbackUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      createdAt: new Date().toISOString(),
      clicks: 1420,
      clicksCount: 1420,
      userId: "user_demo",
      qrCode: "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=http%3A%2F%2Flocalhost%3A3000%2Frickroll",
      clickRecords: []
    }
  ],
  [
    "spotify-demo",
    {
      id: "dl_spotify_7b",
      alias: "spotify-demo",
      originalUrl: "https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT",
      shortUrl: "/spotify-demo",
      targetScheme: "spotify:track:4cOdK2wGLETKBW3PvgPWqT",
      fallbackUrl: "https://open.spotify.com",
      createdAt: new Date().toISOString(),
      clicks: 840,
      clicksCount: 840,
      userId: "user_demo",
      qrCode: "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=http%3A%2F%2Flocalhost%3A3000%2Fspotify-demo",
      clickRecords: []
    }
  ]
]);

const inMemoryClicks: ClickRecord[] = [
  {
    id: "clk_108_1",
    linkId: "dl_rickroll_9f",
    alias: "rickroll",
    timestamp: new Date().toISOString(),
    ip: "117.250.253.225",
    country: "India",
    city: "Mumbai",
    timezone: "Asia/Kolkata",
    browser: "Chrome 124",
    os: "Windows 11",
    device: "Desktop",
    botScore: 0.0,
    canvasHash: "c_9f8a12b4",
    gpuRenderer: "Apple M3 / NVIDIA RTX 4090"
  }
];

// Local Disk Persistence System (Survivable across reboots without Supabase)
const DB_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DB_DIR, "deeplink_local_db.json");

function loadLocalDb() {
  try {
    if (typeof window === "undefined" && fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (parsed.links && Array.isArray(parsed.links)) {
        for (const l of parsed.links) {
          inMemoryLinks.set(l.alias, l);
        }
      }
      if (parsed.clicks && Array.isArray(parsed.clicks)) {
        inMemoryClicks.length = 0;
        inMemoryClicks.push(...parsed.clicks);
      }
    }
  } catch (e) {
    console.warn("[Store] Local disk load warning:", e);
  }
}

export function saveLocalDb() {
  try {
    if (typeof window === "undefined") {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }
      const data = {
        links: Array.from(inMemoryLinks.values()),
        clicks: inMemoryClicks,
        lastSaved: new Date().toISOString()
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
    }
  } catch (e) {
    console.warn("[Store] Local disk save warning:", e);
  }
}

// Automatically load local disk DB on startup
loadLocalDb();

export async function saveLink(linkInput: Partial<LinkRecord> & { originalUrl: string; baseUrl?: string }): Promise<LinkRecord> {
  const alias = linkInput.alias || Math.random().toString(36).substring(2, 8);
  const id = "dl_" + Math.random().toString(36).substring(2, 9);
  const createdAt = new Date().toISOString();
  const shortUrl = `/${alias}`;
  const origin = linkInput.baseUrl || "http://localhost:3000";
  const qrCode = linkInput.qrCode || `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(origin + shortUrl)}`;

  const newRecord: LinkRecord = {
    ...linkInput,
    id,
    alias,
    originalUrl: linkInput.originalUrl,
    shortUrl,
    qrCode,
    createdAt,
    clicks: linkInput.clicks || 0,
    clicksCount: linkInput.clicksCount || linkInput.clicks || 0,
    clickRecords: []
  };

  inMemoryLinks.set(alias, newRecord);
  saveLocalDb();

  if (isSupabaseConfigured()) {
    try {
      await supabase.from("links").insert([newRecord]);
    } catch (e) {
      console.warn("[Store] Supabase sync error, falling back to memory:", e);
    }
  }

  return newRecord;
}

export const createLink = saveLink;

export async function getLink(alias: string): Promise<LinkRecord | null> {
  if (inMemoryLinks.has(alias)) {
    return inMemoryLinks.get(alias)!;
  }

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.from("links").select("*").eq("alias", alias).single();
      if (data && !error) {
        inMemoryLinks.set(alias, data as LinkRecord);
        return data as LinkRecord;
      }
    } catch (e) {
      console.warn("[Store] Supabase lookup error:", e);
    }
  }

  return null;
}

export async function getAllLinks(): Promise<LinkRecord[]> {
  const links = Array.from(inMemoryLinks.values());

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.from("links").select("*");
      if (data && !error && data.length > 0) {
        return data as LinkRecord[];
      }
    } catch (e) {
      console.warn("[Store] Supabase getAllLinks error:", e);
    }
  }

  return links;
}

export async function recordClick(alias: string, clickData: Partial<ClickRecord>): Promise<ClickRecord> {
  const link = await getLink(alias);
  const clickId = "clk_" + Math.random().toString(36).substring(2, 9);
  
  const record: ClickRecord = {
    id: clickId,
    linkId: link?.id,
    alias,
    timestamp: new Date().toISOString(),
    ip: clickData.ip || "127.0.0.1",
    country: clickData.country || "India",
    city: clickData.city || "Mumbai",
    timezone: clickData.timezone || "Asia/Kolkata",
    browser: clickData.browser || "Unknown Browser",
    os: clickData.os || "Unknown OS",
    device: clickData.device || "Desktop",
    botScore: clickData.botScore || 0,
    botLabel: clickData.botLabel || "human",
    riskScore: clickData.riskScore || 0,
    proxyDetected: clickData.proxyDetected || false,
    torDetected: clickData.torDetected || false,
    language: clickData.language || "en-US",
    languages: clickData.languages || "en-US",
    canvasHash: clickData.canvasHash || "c_9f8a12",
    gpuRenderer: clickData.gpuRenderer || "Intel Iris Direct3D11",
    userAgent: clickData.userAgent || ""
  };

  inMemoryClicks.push(record);

  if (link) {
    link.clicks = (link.clicks || 0) + 1;
    link.clicksCount = link.clicks;
    if (!link.clickRecords) link.clickRecords = [];
    link.clickRecords.push(record);
    inMemoryLinks.set(alias, link);
  }
  saveLocalDb();

  if (isSupabaseConfigured()) {
    try {
      await supabase.from("clicks").insert([record]);
      if (link) {
        await supabase.from("links").update({ clicks: link.clicks, clicksCount: link.clicksCount }).eq("alias", alias);
      }
    } catch (e) {
      console.warn("[Store] Supabase click record error:", e);
    }
  }

  return record;
}

export async function getRecentClicks(): Promise<ClickRecord[]> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.from("clicks").select("*").order("timestamp", { ascending: false }).limit(100);
      if (data && !error && data.length > 0) {
        return data as ClickRecord[];
      }
    } catch (e) {
      console.warn("[Store] Supabase getRecentClicks error:", e);
    }
  }

  return [...inMemoryClicks].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function exportToCsvString(): { linksCsv: string; clicksCsv: string } {
  // Links CSV
  const linksHeaders = ["ID", "Alias", "Original URL", "Target Scheme", "Clicks", "Created At", "QR Code"];
  const linksRows = Array.from(inMemoryLinks.values()).map((l) => [
    `"${l.id}"`,
    `"${l.alias}"`,
    `"${l.originalUrl.replace(/"/g, '""')}"`,
    `"${(l.targetScheme || "").replace(/"/g, '""')}"`,
    l.clicks || 0,
    `"${l.createdAt}"`,
    `"${l.qrCode || ""}"`
  ].join(","));
  const linksCsv = [linksHeaders.join(","), ...linksRows].join("\n");

  // Clicks CSV
  const clicksHeaders = ["Click ID", "Alias", "Timestamp", "IP", "Country", "City", "Device", "OS", "Browser", "Bot Score", "Risk Score"];
  const clicksRows = inMemoryClicks.map((c) => [
    `"${c.id}"`,
    `"${c.alias}"`,
    `"${c.timestamp}"`,
    `"${c.ip}"`,
    `"${c.country}"`,
    `"${c.city}"`,
    `"${c.device}"`,
    `"${c.os}"`,
    `"${c.browser}"`,
    c.botScore || 0,
    c.riskScore || 0
  ].join(","));
  const clicksCsv = [clicksHeaders.join(","), ...clicksRows].join("\n");

  return { linksCsv, clicksCsv };
}
