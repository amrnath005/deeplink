"""Bot detection engine with 25+ crawler, scraper, headless browser patterns, and anonymizer risk scoring."""

import re
from typing import Tuple, Optional, Dict, Any
from pydantic import BaseModel


class BotCheckResult(BaseModel):
    is_bot: bool
    bot_score: float  # 0.0 (human) to 1.0 (certain bot)
    bot_label: str    # human, likely_human, crawler, bot, headless_browser
    risk_score: float = 0.0
    proxy_detected: bool = False
    tor_detected: bool = False
    vpn_detected: bool = False


BOT_PATTERNS = [
    # Search Engine Crawlers
    (r"Googlebot|Google-Site-Verification|Mediapartners-Google", "Googlebot", 1.0),
    (r"bingbot|msnbot|BingPreview", "Bingbot", 1.0),
    (r"Baiduspider", "Baiduspider", 1.0),
    (r"YandexBot|YandexImages", "YandexBot", 1.0),
    (r"DuckDuckBot", "DuckDuckBot", 1.0),
    (r"Applebot", "Applebot", 1.0),

    # Social Media Crawlers & Unfurlers
    (r"facebookexternalhit|facebookcatalog", "Facebook Crawler", 1.0),
    (r"Twitterbot", "Twitterbot", 1.0),
    (r"LinkedInBot", "LinkedInBot", 1.0),
    (r"Slackbot|Slack-ImgProxy", "Slackbot", 1.0),
    (r"Discordbot", "Discordbot", 1.0),
    (r"TelegramBot", "TelegramBot", 1.0),
    (r"WhatsApp", "WhatsApp Crawler", 1.0),
    (r"Pinterestbot", "Pinterestbot", 1.0),

    # SEO Tools & Scrapers
    (r"ahrefsbot", "AhrefsBot", 1.0),
    (r"SemrushBot", "SemrushBot", 1.0),
    (r"MJ12bot", "MJ12bot", 1.0),
    (r"DotBot", "DotBot", 1.0),

    # Automation & Headless Frameworks
    (r"HeadlessChrome", "Headless Chrome", 1.0),
    (r"Playwright", "Playwright Automation", 1.0),
    (r"Puppeteer", "Puppeteer Automation", 1.0),
    (r"Selenium", "Selenium Automation", 1.0),
    (r"Cypress", "Cypress Automation", 1.0),
    (r"PhantomJS", "PhantomJS", 1.0),

    # HTTP Client Libraries
    (r"curl/", "cURL", 0.9),
    (r"Wget/", "Wget", 0.9),
    (r"python-requests|python-urllib|httpx", "Python HTTP Client", 0.95),
    (r"Go-http-client", "Go HTTP Client", 0.95),
    (r"axios|node-fetch", "Node.js HTTP Client", 0.9),
]


def detect_bot(user_agent: Optional[str], headers: Optional[Dict[str, str]] = None) -> BotCheckResult:
    """Evaluate User-Agent and HTTP headers for bot & anonymizer proxy/TOR indicators."""
    headers_clean = {k.lower(): v for k, v in (headers or {}).items()}

    tor_detected = "x-tor-exit-node" in headers_clean or "cf-connecting-ip-is-tor" in headers_clean
    proxy_detected = "via" in headers_clean or "x-proxy-id" in headers_clean or "forwarded" in headers_clean

    risk_score = 0.0
    if tor_detected:
        risk_score += 0.8
    if proxy_detected:
        risk_score += 0.4

    if not user_agent:
        return BotCheckResult(
            is_bot=True,
            bot_score=0.9,
            bot_label="empty_user_agent",
            risk_score=min(1.0, risk_score + 0.9),
            proxy_detected=proxy_detected,
            tor_detected=tor_detected,
        )

    ua = user_agent.strip()

    for pattern, name, score in BOT_PATTERNS:
        if re.search(pattern, ua, re.I):
            return BotCheckResult(
                is_bot=score >= 0.7,
                bot_score=score,
                bot_label=name,
                risk_score=min(1.0, risk_score + score),
                proxy_detected=proxy_detected,
                tor_detected=tor_detected,
            )

    return BotCheckResult(
        is_bot=False,
        bot_score=0.0,
        bot_label="human",
        risk_score=min(1.0, risk_score),
        proxy_detected=proxy_detected,
        tor_detected=tor_detected,
    )
