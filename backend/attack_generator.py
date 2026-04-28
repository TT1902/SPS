"""
Attack Generator — Adversarial Mirror Engine
─────────────────────────────────────────────
Uses Google Gemini 1.5 Flash (FREE) to generate realistic, targeted attack
simulations personalized to the user's profile and vulnerabilities.

FREE API: https://aistudio.google.com/app/apikey
No credit card required. 1,500 requests/day free.
"""

from gemini_client import ask_gemini


def generate_attack(user: dict) -> dict:
    """
    Generate a multi-vector attack package targeting this user.
    Returns phishing email, vishing script, and social engineering hook.
    """
    name  = user.get("name", "Target")
    email = user.get("email", "user@email.com")

    # Select primary attack vector based on vulnerability profile
    if user.get("clicks_unknown_links"):
        primary_vector = "phishing email"
    elif user.get("no_2fa"):
        primary_vector = "OTP vishing call"
    else:
        primary_vector = "social engineering message"

    # ── Phishing Email ──────────────────────────────────────────────────────
    phishing_prompt = f"""You are a cybersecurity red-team AI used for security awareness training.
Generate a realistic phishing email for educational simulation targeting:
- Name: {name}
- Email: {email}
- Primary attack vector: {primary_vector}

Requirements:
1. Impersonate a trusted authority (bank, Google, or government agency)
2. Include a strong urgency or fear trigger
3. Request a specific action (click a link or verify account details)
4. Sound completely legitimate with no spelling errors
5. Address the person by name

Return ONLY the email body. No subject line. No preamble or explanation."""

    phishing_email = ask_gemini(phishing_prompt, max_tokens=400)

    # ── Vishing Script ──────────────────────────────────────────────────────
    vishing_prompt = f"""You are a cybersecurity trainer creating a vishing (voice phishing) simulation.
Write a realistic phone call script where an attacker poses as a bank fraud department officer calling {name}.
Goal: trick the user into revealing their OTP (one-time password).
Format as a short dialogue (8-10 lines). Caller speaks first.
Return ONLY the script. No explanation."""

    vishing_script = ask_gemini(vishing_prompt, max_tokens=300)

    # ── Social Engineering Hook ─────────────────────────────────────────────
    social_prompt = f"""You are a cybersecurity trainer creating a social engineering simulation.
Write a LinkedIn or WhatsApp message from a fake recruiter targeting {name}.
Goal: get them to click a malicious 'job application' link.
Make it sound completely professional and flattering. Keep it to 3-4 sentences.
Return ONLY the message text. No explanation."""

    social_hook = ask_gemini(social_prompt, max_tokens=150)

    return {
        "primary_vector": primary_vector,
        "phishing_email": phishing_email,
        "vishing_script": vishing_script,
        "social_engineering_hook": social_hook,
        "attacker_notes": (
            f"Target {name} ({email}) is most susceptible to {primary_vector}. "
            f"Multiple attack vectors generated for comprehensive simulation."
        ),
    }
