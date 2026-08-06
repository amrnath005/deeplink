"""Unit tests for bot detection, user agent parsing, and redirect engine strategies."""

import pytest
from app.core.user_agent_parser import parse_user_agent
from app.core.bot_detector import detect_bot
from app.core.platform_registry import get_platform


def test_user_agent_parsing_ios():
    ua = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1"
    info = parse_user_agent(ua)
    assert info.os == "iOS"
    assert info.device_type == "Mobile"
    assert info.browser == "Safari"


def test_user_agent_parsing_android():
    ua = "Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 Chrome/122.0.0.0 Mobile Safari/537.36"
    info = parse_user_agent(ua)
    assert info.os == "Android"
    assert info.device_type == "Mobile"
    assert info.browser == "Chrome"


def test_bot_detection_googlebot():
    ua = "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
    bot = detect_bot(ua)
    assert bot.is_bot is True
    assert bot.bot_label == "Googlebot"
    assert bot.bot_score == 1.0


def test_bot_detection_human():
    ua = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/122.0.0.0 Safari/537.36"
    bot = detect_bot(ua)
    assert bot.is_bot is False
    assert bot.bot_label == "human"


def test_platform_registry_lookup():
    yt = get_platform("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
    assert yt is not None
    assert yt.name == "YouTube"
    assert yt.scheme == "vnd.youtube://"
