"""iOS Universal Links, Android Intent URLs, and Smart HTML redirect page builders."""

from typing import Optional
from app.core.platform_registry import PlatformConfig, get_platform
from app.core.user_agent_parser import DeviceInfo


def build_app_redirect_url(
    platform_key: Optional[str],
    original_url: str,
    device: DeviceInfo,
) -> dict:
    """Build optimal redirect response based on platform and device capability."""
    platform = get_platform(platform_key) if platform_key else None

    if not platform:
        return {
            "redirect_url": original_url,
            "strategy": "web_direct",
            "app_scheme": None,
            "html_launcher": None,
        }

    # Android Intent Builder
    if device.os == "Android" and platform.android_package:
        clean_url = original_url.replace("https://", "").replace("http://", "")
        intent_url = f"intent://{clean_url}#Intent;package={platform.android_package};scheme=https;S.browser_fallback_url={original_url};end"
        return {
            "redirect_url": intent_url,
            "strategy": "android_intent",
            "app_scheme": platform.scheme,
            "html_launcher": None,
        }

    # iOS Universal Link / URI Scheme
    if device.os == "iOS":
        return {
            "redirect_url": platform.scheme if platform.scheme else original_url,
            "strategy": "ios_universal_link",
            "app_scheme": platform.scheme,
            "html_launcher": None,
        }

    return {
        "redirect_url": original_url,
        "strategy": "web_direct",
        "app_scheme": platform.scheme,
        "html_launcher": None,
    }


def generate_smart_html_launcher(
    app_name: str,
    app_scheme: Optional[str],
    web_url: str,
    brand_color: str = "#22c55e",
) -> str:
    """Generate high-performance client-side JS launcher HTML with sub-20ms app auto-open."""
    scheme_json = f'"{app_scheme}"' if app_scheme else "null"
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Opening {app_name} — DeepLink Pro</title>
  <style>
    body {{ background: #0a0a0a; color: #fafafa; font-family: system-ui, -apple-system, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; }}
    .logo-glow {{ width: 72px; height: 72px; border-radius: 20px; background: {brand_color}20; border: 1px solid {brand_color}40; display: flex; align-items: center; justify-content: center; margin-bottom: 24px; box-shadow: 0 0 40px {brand_color}30; }}
    .spinner {{ width: 36px; height: 36px; border: 3px solid rgba(255,255,255,0.1); border-top-color: {brand_color}; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 20px auto; }}
    @keyframes spin {{ to {{ transform: rotate(360deg); }} }}
    a {{ color: {brand_color}; text-decoration: underline; font-weight: 500; }}
  </style>
</head>
<body>
  <div class="logo-glow">
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="{brand_color}" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
  </div>
  <div class="spinner"></div>
  <h2 style="margin:0 0 8px 0;font-size:1.5rem;font-weight:600;">Opening {app_name}...</h2>
  <p style="color:#a3a3a3;font-size:0.9rem;max-width:340px;margin:0 0 20px 0;">Sub-20ms edge latency redirect. Taking you straight to the native app.</p>
  <p style="color:#737373;font-size:0.85rem;">Didn't open automatically? <a id="manual-btn" href="{web_url}">Click here to open</a></p>

  <script>
    const appScheme = {scheme_json};
    const webUrl = "{web_url}";

    if (appScheme) {{
      window.location.href = appScheme;
      setTimeout(function() {{
        window.location.href = webUrl;
      }}, 1200);
    }} else {{
      window.location.href = webUrl;
    }}
  </script>
</body>
</html>"""
