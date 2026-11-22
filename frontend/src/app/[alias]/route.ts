import { NextRequest, NextResponse } from "next/server";
import { getLink, recordClick } from "@/lib/store";
import { computeSmartRouting, LinkRoutingInput } from "@/lib/routing";

export async function GET(req: NextRequest, { params }: { params: Promise<{ alias: string }> }) {
  const { alias } = await params;
  const rawLink = await getLink(alias);

  const searchParams = req.nextUrl.searchParams;
  const providedPassword = searchParams.get("pwd") || undefined;
  const userAgent = req.headers.get("user-agent") || "";

  // 1. Execute Smart Routing Subsystem Engine
  const linkInput: LinkRoutingInput | null = rawLink
    ? {
        alias: rawLink.alias,
        originalUrl: rawLink.originalUrl,
        targetScheme: rawLink.targetScheme,
        fallbackUrl: rawLink.fallbackUrl,
        isActive: rawLink.isActive !== undefined ? rawLink.isActive : true,
        expiresAt: rawLink.expiresAt,
        password: rawLink.password
      }
    : null;

  const result = computeSmartRouting(linkInput, userAgent, searchParams, providedPassword);

  // 2. Handle Routing Errors Observably
  if (result.statusCode === 404) {
    return new Response(
      `<!DOCTYPE html>
      <html>
        <head><title>Link Not Found — DeepLink Pro</title><meta name="viewport" content="width=device-width, initial-scale=1"></head>
        <body style="background:#0a0a0a;color:#fafafa;font-family:sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;margin:0;text-align:center;">
          <h1 style="color:#ef4444;font-size:2rem;margin-bottom:0.5rem;">404 — Link Not Found</h1>
          <p style="color:#a3a3a3;margin-bottom:1.5rem;">The smart link <strong>/${alias}</strong> does not exist or has been removed.</p>
          <a href="/" style="background:#22c55e;color:#0a0a0a;padding:10px 20px;border-radius:99px;text-decoration:none;font-weight:600;">Return to Home</a>
        </body>
      </html>`,
      { headers: { "content-type": "text/html" }, status: 404 }
    );
  }

  if (result.statusCode === 410) {
    return new Response(
      `<!DOCTYPE html>
      <html>
        <head><title>Link Expired — DeepLink Pro</title><meta name="viewport" content="width=device-width, initial-scale=1"></head>
        <body style="background:#0a0a0a;color:#fafafa;font-family:sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;margin:0;text-align:center;">
          <h1 style="color:#eab308;font-size:2rem;margin-bottom:0.5rem;">Link Expired</h1>
          <p style="color:#a3a3a3;margin-bottom:1.5rem;">${result.errorMessage}</p>
          <a href="/" style="background:#22c55e;color:#0a0a0a;padding:10px 20px;border-radius:99px;text-decoration:none;font-weight:600;">Create New Link</a>
        </body>
      </html>`,
      { headers: { "content-type": "text/html" }, status: 410 }
    );
  }

  if (result.statusCode === 403 && linkInput?.password) {
    // Password Gate UI
    const isError = providedPassword !== undefined;
    return new Response(
      `<!DOCTYPE html>
      <html>
        <head>
          <title>Protected Smart Link — DeepLink Pro</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { background: #0a0a0a; color: #fafafa; font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
            .card { background: #111; border: 1px solid #222; border-radius: 24px; padding: 32px; max-width: 400px; width: 90%; text-align: center; box-shadow: 0 0 40px rgba(0,0,0,0.8); }
            input { width: 100%; height: 48px; border-radius: 12px; border: 1px solid #333; background: #1a1a1a; color: #fff; text-align: center; font-size: 1rem; margin-top: 16px; margin-bottom: 16px; outline: none; box-sizing: border-box; }
            input:focus { border-color: #22c55e; }
            button { width: 100%; height: 48px; border-radius: 12px; border: none; background: #22c55e; color: #0a0a0a; font-weight: 600; font-size: 1rem; cursor: pointer; }
            button:hover { background: #16a34a; }
            .err { color: #ef4444; font-size: 0.875rem; margin-bottom: 12px; }
          </style>
        </head>
        <body>
          <div class="card">
            <h2 style="margin:0 0 8px 0;font-size:1.5rem;">🔒 Password Protected</h2>
            <p style="color:#a3a3a3;font-size:0.9rem;margin:0;">Enter password to unlock <strong>/${alias}</strong></p>
            <form method="GET">
              <input type="password" name="pwd" placeholder="Enter password" required autoFocus />
              ${isError ? `<div class="err">Incorrect password. Please try again.</div>` : ""}
              <button type="submit">Unlock & Redirect</button>
            </form>
          </div>
        </body>
      </html>`,
      { headers: { "content-type": "text/html" }, status: 403 }
    );
  }

  if (result.statusCode === 403) {
    return new Response(
      `<!DOCTYPE html>
      <html>
        <head><title>Link Disabled — DeepLink Pro</title><meta name="viewport" content="width=device-width, initial-scale=1"></head>
        <body style="background:#0a0a0a;color:#fafafa;font-family:sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;margin:0;text-align:center;">
          <h1 style="color:#ef4444;font-size:2rem;margin-bottom:0.5rem;">Link Disabled</h1>
          <p style="color:#a3a3a3;margin-bottom:1.5rem;">This smart link has been disabled by the owner.</p>
        </body>
      </html>`,
      { headers: { "content-type": "text/html" }, status: 403 }
    );
  }

  if (result.statusCode === 400) {
    return new Response(
      `<!DOCTYPE html>
      <html>
        <head><title>Invalid Destination — DeepLink Pro</title><meta name="viewport" content="width=device-width, initial-scale=1"></head>
        <body style="background:#0a0a0a;color:#fafafa;font-family:sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;margin:0;text-align:center;">
          <h1 style="color:#ef4444;font-size:2rem;margin-bottom:0.5rem;">Security Warning</h1>
          <p style="color:#a3a3a3;margin-bottom:1.5rem;">${result.errorMessage}</p>
        </body>
      </html>`,
      { headers: { "content-type": "text/html" }, status: 400 }
    );
  }

  // 3. Log Operational Click Event with Detailed Device & Location Telemetry
  const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
  
  // Detailed Device & Platform Detection
  let deviceType = "Desktop / Laptop";
  let osName = "Desktop";
  let browserName = "Web Browser";

  if (/iPhone/i.test(userAgent)) {
    deviceType = "Apple iPhone (Mobile)";
    osName = "iOS";
  } else if (/iPad/i.test(userAgent)) {
    deviceType = "Apple iPad (Tablet)";
    osName = "iPadOS";
  } else if (/Android/i.test(userAgent)) {
    deviceType = "Android Smartphone (Mobile)";
    osName = "Android";
  } else if (/Macintosh|Mac OS X/i.test(userAgent)) {
    deviceType = "MacBook / iMac (Laptop)";
    osName = "macOS";
  } else if (/Windows/i.test(userAgent)) {
    deviceType = "Windows Laptop / PC";
    osName = "Windows 11";
  } else if (/Linux/i.test(userAgent)) {
    deviceType = "Linux PC / Laptop";
    osName = "Linux";
  }

  // Detect App & Browser Environment
  if (/Instagram/i.test(userAgent)) browserName = "Instagram App";
  else if (/Reddit|RedditApp/i.test(userAgent)) browserName = "Reddit App";
  else if (/Twitter|TwitterAndroid|Twitter for iPhone/i.test(userAgent)) browserName = "X (Twitter) App";
  else if (/TikTok|musical_ly/i.test(userAgent)) browserName = "TikTok App";
  else if (/FBAV|FBAN/i.test(userAgent)) browserName = "Facebook App";
  else if (/Edg/i.test(userAgent)) browserName = "Microsoft Edge";
  else if (/Chrome|CriOS/i.test(userAgent)) browserName = "Google Chrome";
  else if (/Safari/i.test(userAgent)) browserName = "Apple Safari";
  else if (/Firefox|FxiOS/i.test(userAgent)) browserName = "Mozilla Firefox";

  const isLocal = clientIp === "127.0.0.1" || clientIp === "::1" || clientIp.startsWith("192.168.") || clientIp.startsWith("172.");
  const country = req.headers.get("x-vercel-ip-country") || req.headers.get("cf-ipcountry") || (isLocal ? "Local Device" : "United States");
  const city = req.headers.get("x-vercel-ip-city") || (isLocal ? (deviceType.includes("Mobile") ? "Your Phone" : "Your Laptop") : "Global");

  await recordClick(alias, {
    id: result.clickId,
    userAgent,
    ip: clientIp,
    country,
    city,
    device: deviceType,
    os: osName,
    browser: browserName,
    botScore: /bot|crawl|spider|slurp|headless/i.test(userAgent) ? 0.95 : 0.05,
    botLabel: /bot|crawl|spider|slurp|headless/i.test(userAgent) ? "crawler_bot" : "human_user"
  });

  // 4. Serve HTML Launcher with Platform Schemes & Fallback Launcher
  const targetWebUrl = result.resolvedDestinationUrl;
  const targetAppScheme = result.appScheme;

  return new Response(
    `<!DOCTYPE html>
    <html>
      <head>
        <title>Redirecting — DeepLink Pro</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { background: #0a0a0a; color: #fafafa; font-family: system-ui, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; }
          .spinner { width: 44px; height: 44px; border: 4px solid rgba(34,197,94,0.2); border-top-color: #22c55e; border-radius: 50%; animation: spin 0.8s linear infinite; margin-bottom: 24px; }
          @keyframes spin { to { transform: rotate(360deg); } }
          a { color: #22c55e; text-decoration: underline; font-weight: 500; }
          .badge { font-size: 0.8rem; color: #a3a3a3; background: #171717; border: 1px solid #262626; padding: 6px 14px; border-radius: 99px; margin-top: 12px; display: inline-block; font-family: monospace; }
        </style>
      </head>
      <body>
        <div class="spinner"></div>
        <h2 style="margin:0 0 8px 0;font-size:1.25rem;">Routing Campaign Click...</h2>
        <p style="color:#737373;font-size:0.9rem;max-width:320px;margin:0 0 16px 0;">Resolving best mobile platform destination (${result.platform}).</p>
        ${result.context !== "Native Browser" ? `<div class="badge">In-App Webview Context: ${result.context}</div>` : ""}
        <p style="color:#a3a3a3;font-size:0.85rem;margin-top:20px;">If redirect does not trigger automatically, <a id="manual-link" href="${targetWebUrl}">click here</a>.</p>

        <script>
          const schemeUrl = ${targetAppScheme ? JSON.stringify(targetAppScheme) : "null"};
          const webUrl = ${JSON.stringify(targetWebUrl)};

          if (schemeUrl) {
            window.location.href = schemeUrl;
            setTimeout(function() {
              window.location.href = webUrl;
            }, 1200);
          } else {
            window.location.href = webUrl;
          }
        </script>
      </body>
    </html>`,
    { headers: { "content-type": "text/html" } }
  );
}
