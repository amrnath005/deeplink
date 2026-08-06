"""User-Agent string parsing into structured DeviceInfo."""

import re
from typing import Optional
from pydantic import BaseModel


class DeviceInfo(BaseModel):
    user_agent: str
    browser: str = "Unknown"
    browser_version: Optional[str] = None
    os: str = "Unknown"
    os_version: Optional[str] = None
    device_type: str = "Desktop"  # Mobile, Tablet, Desktop, Bot
    platform: str = "Web"
    is_mobile: bool = False
    is_tablet: bool = False
    is_bot: bool = False


def parse_user_agent(ua_str: Optional[str]) -> DeviceInfo:
    """Parse User-Agent header into granular DeviceInfo object."""
    if not ua_str:
        return DeviceInfo(user_agent="")

    ua = ua_str.strip()

    # Device Type
    is_tablet = bool(re.search(r"iPad|Tablet|PlayBook|Nexus (7|9|10)|KFAPWI", ua, re.I))
    is_mobile = bool(re.search(r"Mobile|iPhone|iPod|Android|BlackBerry|IEMobile|Opera Mini", ua, re.I)) and not is_tablet
    device_type = "Tablet" if is_tablet else "Mobile" if is_mobile else "Desktop"

    # OS
    os = "Unknown"
    os_version = None
    if re.search(r"iPhone|iPad|iPod", ua, re.I):
        os = "iOS"
        match = re.search(r"OS (\d+[\._]\d+)", ua)
        if match:
            os_version = match.group(1).replace("_", ".")
    elif "Android" in ua:
        os = "Android"
        match = re.search(r"Android (\d+[\.\d]*)", ua)
        if match:
            os_version = match.group(1)
    elif "Macintosh" in ua or "Mac OS X" in ua:
        os = "macOS"
        match = re.search(r"Mac OS X (\d+[\._]\d+)", ua)
        if match:
            os_version = match.group(1).replace("_", ".")
    elif "Windows" in ua:
        os = "Windows"
        if "Windows NT 10.0" in ua:
            os_version = "10/11"
        elif "Windows NT 6.3" in ua:
            os_version = "8.1"
    elif "Linux" in ua:
        os = "Linux"

    # Browser
    browser = "Unknown"
    browser_version = None
    if "Chrome" in ua and "Edg" not in ua and "OPR" not in ua and "CriOS" not in ua:
        browser = "Chrome"
        match = re.search(r"Chrome/(\d+[\.\d]*)", ua)
        if match:
            browser_version = match.group(1)
    elif "CriOS" in ua:
        browser = "Chrome Mobile"
        match = re.search(r"CriOS/(\d+[\.\d]*)", ua)
        if match:
            browser_version = match.group(1)
    elif "Safari" in ua and "Chrome" not in ua:
        browser = "Safari"
        match = re.search(r"Version/(\d+[\.\d]*)", ua)
        if match:
            browser_version = match.group(1)
    elif "Firefox" in ua or "FxiOS" in ua:
        browser = "Firefox"
        match = re.search(r"(?:Firefox|FxiOS)/(\d+[\.\d]*)", ua)
        if match:
            browser_version = match.group(1)
    elif "Edg" in ua:
        browser = "Edge"
        match = re.search(r"Edg/(\d+[\.\d]*)", ua)
        if match:
            browser_version = match.group(1)

    return DeviceInfo(
        user_agent=ua,
        browser=browser,
        browser_version=browser_version,
        os=os,
        os_version=os_version,
        device_type=device_type,
        platform=os,
        is_mobile=is_mobile,
        is_tablet=is_tablet,
        is_bot=False,
    )
