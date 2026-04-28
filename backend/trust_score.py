"""
Trust Score Engine
───────────────────
Aggregates shadow map exposure + behavioral vulnerability
into a dynamic 0–100 Trust Score (higher = safer).

No API key needed — pure Python math.
"""


def compute_trust_score(shadow: dict, vuln: dict) -> dict:
    """
    Trust Score = 100 - weighted combination of:
      - Shadow exposure risk  (40% weight)
      - Behavioral vulnerability (60% weight)
    """
    total_exposure = shadow.get("total_exposure_points", 0)
    shadow_risk    = min(100, total_exposure * 3)
    vuln_score     = vuln.get("score", 0)

    combined_risk = (shadow_risk * 0.4) + (vuln_score * 0.6)
    trust = max(0, round(100 - combined_risk))

    if trust >= 75:
        band   = "SECURE"
        color  = "#22c55e"
        emoji  = "🟢"
        advice = "Your digital identity is well-protected. Maintain your current habits."
    elif trust >= 50:
        band   = "MODERATE"
        color  = "#f59e0b"
        emoji  = "🟡"
        advice = "Some exposure detected. Address the flagged risk factors soon."
    elif trust >= 25:
        band   = "AT RISK"
        color  = "#ef4444"
        emoji  = "🔴"
        advice = "Significant exposure. Take immediate action on recommendations."
    else:
        band   = "CRITICAL"
        color  = "#dc2626"
        emoji  = "⛔"
        advice = "Your identity is highly exposed. Act NOW on all recommendations."

    breakdown = [
        {
            "component": "Data Shadow Exposure",
            "risk_contribution": round(shadow_risk * 0.4, 1),
            "detail": (
                f"{shadow.get('estimated_total_breach_count', 0)} breach datasets · "
                f"{shadow.get('dark_web_mentions', 0)} dark web mentions"
            ),
        },
        {
            "component": "Behavioral Vulnerability",
            "risk_contribution": round(vuln_score * 0.6, 1),
            "detail": (
                f"{len(vuln.get('triggered_risk_factors', []))} risky habits detected · "
                f"Top threat: {vuln.get('top_threat_vector', 'N/A')}"
            ),
        },
    ]

    return {
        "trust_score": trust,
        "band": band,
        "color": color,
        "emoji": emoji,
        "advice": advice,
        "breakdown": breakdown,
        "shadow_risk_score": round(shadow_risk),
        "vulnerability_score": vuln_score,
    }
