"""URL validation and platform detection utilities."""

from urllib.parse import urlparse
from typing import Optional


def is_valid_url(url: str) -> bool:
    """Check if a string is a valid URL."""
    try:
        parsed = urlparse(str(url))
        return bool(parsed.scheme and parsed.netloc)
    except Exception:
        return False


PLATFORM_PATTERNS = {
    "youtube": ["youtube.com", "youtu.be", "youtube-nocookie.com"],
    "instagram": ["instagram.com", "instagr.am"],
    "facebook": ["facebook.com", "fb.me", "fb.com"],
    "spotify": ["spotify.com", "open.spotify.com"],
    "telegram": ["t.me", "telegram.org", "telegram.me"],
    "whatsapp": ["wa.me", "whatsapp.com", "api.whatsapp.com"],
    "linkedin": ["linkedin.com", "lnkd.in"],
    "x": ["x.com", "twitter.com", "t.co"],
    "discord": ["discord.com", "discord.gg", "discordapp.com"],
    "tiktok": ["tiktok.com", "vm.tiktok.com"],
    "snapchat": ["snapchat.com", "snap.com"],
    "pinterest": ["pinterest.com", "pin.it"],
    "google_maps": ["maps.google.com", "goo.gl/maps"],
    "apple_maps": ["maps.apple.com"],
    "play_store": ["play.google.com"],
    "app_store": ["apps.apple.com", "itunes.apple.com"],
}


def detect_platform(url: str) -> Optional[str]:
    """Detect the target platform from a URL."""
    url_lower = str(url).lower()
    for platform, domains in PLATFORM_PATTERNS.items():
        if any(domain in url_lower for domain in domains):
            return platform
    return None


def get_app_scheme(platform: str) -> Optional[str]:
    """Get the native app URI scheme for a platform."""
    schemes = {
        "youtube": "vnd.youtube://",
        "instagram": "instagram://",
        "facebook": "fb://",
        "spotify": "spotify://",
        "telegram": "tg://",
        "whatsapp": "whatsapp://",
        "linkedin": "linkedin://",
        "x": "twitter://",
        "discord": "discord://",
        "tiktok": "snssdk1233://",
        "snapchat": "snapchat://",
        "pinterest": "pinterest://",
        "google_maps": "comgooglemaps://",
        "apple_maps": "http://maps.apple.com/",
    }
    return schemes.get(platform)
