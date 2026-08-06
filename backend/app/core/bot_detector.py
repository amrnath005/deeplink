"""Bot detection engine with 25+ crawler, scraper, and headless browser patterns."""

import re
from typing import Tuple, Optional
from pydantic import BaseModel


class BotCheckResult(BaseModel):
    is_bot: bool
    bot_score: float  # 0.0 (human) to 1.0 (certain bot)
    bot_label: str    # human, likely_human, crawler, bot, headless_browser


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


def detect_bot(user_agent: Optional[str]) -> BotCheckResult:
    """Evaluate User-Agent for bot indicators and assign bot confidence score."""
    if not user_agent:
        return BotCheckResult(is_bot=True, bot_score=0.9, bot_label="empty_user_agent")

    ua = user_agent.strip()

    for pattern, name, score in BOT_PATTERNS:
        if re.search(pattern, ua, re.I):
            return BotCheckResult(
                is_bot=score >= 0.7,
                bot_score=score,
                bot_label=name,
            )

    return BotCheckResult(
        is_bot=False,
        bot_score=0.0,
        bot_label="human",
    )
