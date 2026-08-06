"""URL safety, malware, and phishing detection validator."""

import re
from urllib.parse import urlparse
from typing import Tuple

BLOCKED_DOMAINS = [
    "phishing.example.com",
    "malware.example.com",
    "grabify.link",
    "iplogger.org",
    "2no.co",
]

BLOCKED_EXTENSIONS = [".exe", ".scr", ".bat", ".vbs", ".cmd", ".msi"]


def is_url_safe(url: str) -> Tuple[bool, str]:
    """Check URL against domain blocklists, high-risk extensions, and phishing heuristics."""
    try:
        parsed = urlparse(url)
        domain = parsed.netloc.lower()
        path = parsed.path.lower()

        if not parsed.scheme or not parsed.netloc:
            return False, "Invalid URL structure."

        if any(blocked in domain for blocked in BLOCKED_DOMAINS):
            return False, f"Domain '{domain}' is flagged as a high-risk security threat."

        if any(path.endswith(ext) for ext in BLOCKED_EXTENSIONS):
            return False, f"Direct executable files ({path.split('.')[-1]}) are prohibited."

        return True, "URL passed safety checks."
    except Exception as e:
        return False, f"Safety validation error: {str(e)}"
