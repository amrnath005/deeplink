"""ID generation utilities."""

import secrets
import hashlib

from app.config import get_settings

settings = get_settings()


def generate_link_id(length: int = None) -> str:
    """Generate a cryptographically secure random link ID."""
    length = length or settings.LINK_ID_LENGTH
    alphabet = settings.LINK_ID_ALPHABET
    return "".join(secrets.choice(alphabet) for _ in range(length))


def generate_visitor_id(fingerprint_data: dict) -> str:
    """Generate a deterministic visitor ID from fingerprint data."""
    sorted_items = sorted(fingerprint_data.items())
    fingerprint_string = "|".join(f"{k}={v}" for k, v in sorted_items)
    return hashlib.sha256(fingerprint_string.encode()).hexdigest()[:32]


def generate_session_id() -> str:
    """Generate a random session ID."""
    return secrets.token_urlsafe(24)
