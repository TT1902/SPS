"""
Defense Generator — Auto-Defense Builder
─────────────────────────────────────────
Uses Google Gemini 1.5 Flash (FREE) to generate personalized countermeasures
after the Adversarial Mirror Engine generates an attack.

Closes the loop: Attack → Test → Learn → DEFEND

FREE API: https://aistudio.google.com/app/apikey
"""

from gemini_client import ask_gemini


def generate_defense(attack: dict, user: dict) -> dict:
    """
    Given the generated attack package and user profile,
    produce a tailored defense plan using Gemini.
    """
    name           = user.get("name", "User")
    primary_vector = attack.get("primary_vector", "phishing")
    phishing_email = attack.get("phishing_email", "")

    # ── Personalized Warning ────────────────────────────────────────────────
    warning_prompt = f"""You are a cybersecurity expert reviewing a phishing simulation.
This phishing email was generated targeting {name} for security awareness training:

---
{phishing_email[:600]}
---

Write a SHORT, clear warning in exactly 3 sentences:
1. What makes this specific email dangerous
2. The specific red flag {name} should look for
3. What {name} should do instead of clicking

Be direct and practical. No fluff. No bullet points. Just 3 plain sentences."""

    personalized_warning = ask_gemini(warning_prompt, max_tokens=200)

    # ── Action Plan ─────────────────────────────────────────────────────────
    habits = []
    if user.get("clicks_unknown_links"):  habits.append("clicking unknown links")
    if user.get("reuses_passwords"):      habits.append("reusing passwords across sites")
    if user.get("no_2fa"):                habits.append("not using two-factor authentication")
    if user.get("uses_public_wifi"):      habits.append("using public WiFi without a VPN")
    if user.get("social_media_active"):   habits.append("sharing personal info on social media")

    habit_str = ", ".join(habits) if habits else "general risky online behaviour"

    action_prompt = f"""You are a cybersecurity advisor.
Generate exactly 5 specific, actionable security steps for {name} who has these risky habits: {habit_str}.
Their biggest vulnerability is: {primary_vector}.

Rules:
- Number each step (1. 2. 3. etc.)
- Each step must be one clear action sentence
- Be specific, not generic
- No introductions or conclusions
- Return only the 5 numbered steps"""

    action_raw = ask_gemini(action_prompt, max_tokens=300)

    # Parse numbered lines into a clean list
    action_steps = []
    for line in action_raw.split("\n"):
        line = line.strip()
        if line and line[0].isdigit():
            # Strip "1. " or "1) " prefix
            cleaned = line.lstrip("0123456789.)- ").strip()
            if cleaned:
                action_steps.append(cleaned)

    # Fallback if parsing fails
    if not action_steps:
        action_steps = [action_raw]

    # ── Static Quick Wins ────────────────────────────────────────────────────
    quick_wins = []
    if user.get("no_2fa"):
        quick_wins.append({"action": "Enable 2FA on all accounts right now", "urgency": "CRITICAL", "icon": "🔐"})
    if user.get("reuses_passwords"):
        quick_wins.append({"action": "Install Bitwarden (free) password manager", "urgency": "HIGH", "icon": "🗝️"})
    if user.get("clicks_unknown_links"):
        quick_wins.append({"action": "Install the free 'Link Shield' browser extension", "urgency": "HIGH", "icon": "🔗"})
    if user.get("uses_public_wifi"):
        quick_wins.append({"action": "Use ProtonVPN (free tier) on public networks", "urgency": "MODERATE", "icon": "📡"})
    quick_wins.append({"action": "Check haveibeenpwned.com for your email now", "urgency": "MODERATE", "icon": "🔍"})

    return {
        "personalized_warning": personalized_warning,
        "action_plan": action_steps,
        "quick_wins": quick_wins,
        "defense_summary": (
            f"Countermeasures generated against {primary_vector} attack. "
            f"{len(quick_wins)} immediate actions recommended."
        ),
    }
