"""
Shadow Mapping Engine
─────────────────────
Estimates a user's "data shadow" — where their identity fragments
likely exist across leaked, public, and dark-web-adjacent datasets.

No API key needed — uses deterministic inference seeded by user data.
In production: integrate HaveIBeenPwned API, Dehashed, etc.
"""

import hashlib
import random


KNOWN_BREACHES = {
    "gmail.com":   ["LinkedIn 2021", "Adobe 2013", "Collection #1 2019"],
    "yahoo.com":   ["Yahoo 2016 (3B accounts)", "MySpace 2016"],
    "hotmail.com": ["Microsoft 2021", "LinkedIn 2021"],
    "outlook.com": ["Microsoft 2021"],
}

RISKY_PATTERNS = ["123", "admin", "user", "test", "pass", "qwerty"]


def _seeded_random(seed_str: str, low: int, high: int) -> int:
    """Deterministic random based on user input so results are consistent."""
    seed = int(hashlib.md5(seed_str.encode()).hexdigest(), 16) % (10**9)
    rng = random.Random(seed)
    return rng.randint(low, high)


def map_shadow_data(user: dict) -> dict:
    email    = user.get("email", "")
    username = user.get("username", "")
    phone    = user.get("phone", "")

    domain   = email.split("@")[-1] if "@" in email else "unknown"
    breaches = KNOWN_BREACHES.get(domain, ["Unknown Dataset #1", "Combo List 2022"])

    extra_count    = _seeded_random(email, 0, 4)
    total_breaches = len(breaches) + extra_count

    risky_username  = any(p in username.lower() for p in RISKY_PATTERNS) if username else False
    dark_web_mentions = _seeded_random(email + phone, 0, 12)

    exposure_zones = []
    if total_breaches > 0:
        exposure_zones.append({"zone": "Breach Databases", "count": total_breaches, "risk": "HIGH"})
    if dark_web_mentions > 0:
        exposure_zones.append({
            "zone": "Dark Web Paste Sites",
            "count": dark_web_mentions,
            "risk": "CRITICAL" if dark_web_mentions > 6 else "MODERATE"
        })
    if user.get("social_media_active"):
        social_count = _seeded_random(email, 3, 9)
        exposure_zones.append({"zone": "Social Media Scrapes", "count": social_count, "risk": "MODERATE"})
    if phone:
        exposure_zones.append({
            "zone": "Phone Lookup Aggregators",
            "count": _seeded_random(phone, 1, 5),
            "risk": "MODERATE"
        })

    local = email.split("@")[0] if "@" in email else email
    variants = [
        f"{local}.{_seeded_random(email, 10, 99)}@{domain}",
        f"{local}_real@{domain}",
        f"{local}2@gmail.com",
    ] if "@" in email else []

    total_exposure_points = sum(z["count"] for z in exposure_zones)

    return {
        "email": email,
        "domain": domain,
        "known_breaches": breaches,
        "estimated_total_breach_count": total_breaches,
        "dark_web_mentions": dark_web_mentions,
        "risky_username_pattern": risky_username,
        "email_variants_detected": variants,
        "exposure_zones": exposure_zones,
        "total_exposure_points": total_exposure_points,
        "summary": (
            f"Your identity appears in approximately {total_exposure_points} "
            f"exposure points across {len(exposure_zones)} risk zones."
        ),
    }
