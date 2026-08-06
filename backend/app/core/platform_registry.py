"""Registry of supported target platforms, schemes, package names, and store fallbacks."""

from typing import Dict, Optional, List
from pydantic import BaseModel


class PlatformConfig(BaseModel):
    name: str
    domains: List[str]
    scheme: str
    ios_bundle_id: Optional[str] = None
    android_package: Optional[str] = None
    app_store_url: Optional[str] = None
    play_store_url: Optional[str] = None
    brand_color: str = "#22c55e"


PLATFORMS: Dict[str, PlatformConfig] = {
    "youtube": PlatformConfig(
        name="YouTube",
        domains=["youtube.com", "youtu.be", "youtube-nocookie.com"],
        scheme="vnd.youtube://",
        ios_bundle_id="com.google.ios.youtube",
        android_package="com.google.android.youtube",
        app_store_url="https://apps.apple.com/app/id544007664",
        play_store_url="https://play.google.com/store/apps/details?id=com.google.android.youtube",
        brand_color="#FF0000",
    ),
    "instagram": PlatformConfig(
        name="Instagram",
        domains=["instagram.com", "instagr.am"],
        scheme="instagram://",
        ios_bundle_id="com.burbn.instagram",
        android_package="com.instagram.android",
        app_store_url="https://apps.apple.com/app/id389801252",
        play_store_url="https://play.google.com/store/apps/details?id=com.instagram.android",
        brand_color="#E4405F",
    ),
    "facebook": PlatformConfig(
        name="Facebook",
        domains=["facebook.com", "fb.me", "fb.com"],
        scheme="fb://",
        ios_bundle_id="com.facebook.Facebook",
        android_package="com.facebook.katana",
        app_store_url="https://apps.apple.com/app/id284882215",
        play_store_url="https://play.google.com/store/apps/details?id=com.facebook.katana",
        brand_color="#1877F2",
    ),
    "spotify": PlatformConfig(
        name="Spotify",
        domains=["spotify.com", "open.spotify.com"],
        scheme="spotify://",
        ios_bundle_id="com.spotify.client",
        android_package="com.spotify.music",
        app_store_url="https://apps.apple.com/app/id324684580",
        play_store_url="https://play.google.com/store/apps/details?id=com.spotify.music",
        brand_color="#1DB954",
    ),
    "telegram": PlatformConfig(
        name="Telegram",
        domains=["t.me", "telegram.org", "telegram.me"],
        scheme="tg://",
        ios_bundle_id="ph.telegra.Telegraph",
        android_package="org.telegram.messenger",
        app_store_url="https://apps.apple.com/app/id686449807",
        play_store_url="https://play.google.com/store/apps/details?id=org.telegram.messenger",
        brand_color="#26A5E4",
    ),
    "whatsapp": PlatformConfig(
        name="WhatsApp",
        domains=["wa.me", "whatsapp.com", "api.whatsapp.com"],
        scheme="whatsapp://",
        ios_bundle_id="net.whatsapp.WhatsApp",
        android_package="com.whatsapp",
        app_store_url="https://apps.apple.com/app/id310633997",
        play_store_url="https://play.google.com/store/apps/details?id=com.whatsapp",
        brand_color="#25D366",
    ),
    "linkedin": PlatformConfig(
        name="LinkedIn",
        domains=["linkedin.com", "lnkd.in"],
        scheme="linkedin://",
        ios_bundle_id="com.linkedin.LinkedIn",
        android_package="com.linkedin.android",
        app_store_url="https://apps.apple.com/app/id288429040",
        play_store_url="https://play.google.com/store/apps/details?id=com.linkedin.android",
        brand_color="#0A66C2",
    ),
    "x": PlatformConfig(
        name="X (Twitter)",
        domains=["x.com", "twitter.com", "t.co"],
        scheme="twitter://",
        ios_bundle_id="com.atebits.Tweetie2",
        android_package="com.twitter.android",
        app_store_url="https://apps.apple.com/app/id333903271",
        play_store_url="https://play.google.com/store/apps/details?id=com.twitter.android",
        brand_color="#000000",
    ),
    "discord": PlatformConfig(
        name="Discord",
        domains=["discord.com", "discord.gg", "discordapp.com"],
        scheme="discord://",
        ios_bundle_id="com.hammerandchisel.discord",
        android_package="com.discord",
        app_store_url="https://apps.apple.com/app/id985746746",
        play_store_url="https://play.google.com/store/apps/details?id=com.discord",
        brand_color="#5865F2",
    ),
    "tiktok": PlatformConfig(
        name="TikTok",
        domains=["tiktok.com", "vm.tiktok.com"],
        scheme="snssdk1233://",
        ios_bundle_id="com.zhiliaoapp.musically",
        android_package="com.zhiliaoapp.musically",
        app_store_url="https://apps.apple.com/app/id835599320",
        play_store_url="https://play.google.com/store/apps/details?id=com.zhiliaoapp.musically",
        brand_color="#FF0050",
    ),
    "snapchat": PlatformConfig(
        name="Snapchat",
        domains=["snapchat.com", "snap.com"],
        scheme="snapchat://",
        ios_bundle_id="com.toyopagroup.picaboo",
        android_package="com.snapchat.android",
        app_store_url="https://apps.apple.com/app/id447188370",
        play_store_url="https://play.google.com/store/apps/details?id=com.snapchat.android",
        brand_color="#FFFC00",
    ),
    "pinterest": PlatformConfig(
        name="Pinterest",
        domains=["pinterest.com", "pin.it"],
        scheme="pinterest://",
        ios_bundle_id="com.pinterest",
        android_package="com.pinterest",
        app_store_url="https://apps.apple.com/app/id429047995",
        play_store_url="https://play.google.com/store/apps/details?id=com.pinterest",
        brand_color="#BD081C",
    ),
    "google_maps": PlatformConfig(
        name="Google Maps",
        domains=["maps.google.com", "goo.gl/maps"],
        scheme="comgooglemaps://",
        ios_bundle_id="com.google.Maps",
        android_package="com.google.android.apps.maps",
        app_store_url="https://apps.apple.com/app/id585027354",
        play_store_url="https://play.google.com/store/apps/details?id=com.google.android.apps.maps",
        brand_color="#4285F4",
    ),
    "apple_maps": PlatformConfig(
        name="Apple Maps",
        domains=["maps.apple.com"],
        scheme="http://maps.apple.com/",
        ios_bundle_id="com.apple.Maps",
        app_store_url="https://apps.apple.com/app/id915051089",
        brand_color="#007AFF",
    ),
}


def get_platform(name_or_url: str) -> Optional[PlatformConfig]:
    """Find platform by key name or URL domain match."""
    key = name_or_url.lower()
    if key in PLATFORMS:
        return PLATFORMS[key]

    for p in PLATFORMS.values():
        if any(domain in key for domain in p.domains):
            return p
    return None
