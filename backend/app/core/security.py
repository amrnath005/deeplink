"""Security utilities for JWT token creation, verification, and API Key hashing."""

import os
import hmac
import hashlib
import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any
from pydantic import BaseModel

SECRET_KEY = os.getenv("SECRET_KEY", "enterprise-super-secret-deeplink-platform-key-change-in-prod")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days


class TokenData(BaseModel):
    user_id: str
    email: str
    role: str = "user"


def hash_password(password: str) -> str:
    """Hash password using SHA-256 with salt."""
    salt = "deeplink_salt_2026"
    return hashlib.sha256(f"{salt}{password}".encode("utf-8")).hexdigest()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify plain password against hash."""
    return hash_password(plain_password) == hashed_password


def generate_api_key() -> str:
    """Generate secure enterprise API key."""
    return f"dlp_live_{secrets.token_hex(24)}"


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Create JWT bearer token."""
    import orjson
    import base64

    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": int(expire.timestamp())})

    header = {"alg": ALGORITHM, "typ": "JWT"}

    header_b64 = base64.urlsafe_b64encode(orjson.dumps(header)).decode("utf-8").rstrip("=")
    payload_b64 = base64.urlsafe_b64encode(orjson.dumps(to_encode)).decode("utf-8").rstrip("=")

    signature_input = f"{header_b64}.{payload_b64}".encode("utf-8")
    signature = hmac.new(SECRET_KEY.encode("utf-8"), signature_input, hashlib.sha256).digest()
    signature_b64 = base64.urlsafe_b64encode(signature).decode("utf-8").rstrip("=")

    return f"{header_b64}.{payload_b64}.{signature_b64}"
