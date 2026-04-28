"""
Sovereign Persona Sentinel (SPS) - Backend API
FastAPI server exposing all core endpoints

LLM: Google Gemini 1.5 Flash (FREE tier — no credit card needed)
Get your free key at: https://aistudio.google.com/app/apikey
Free limits: 15 requests/min, 1500 requests/day — more than enough for hackathon
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import uvicorn

from attack_generator import generate_attack
from vulnerability_engine import compute_vulnerability_score
from defense_generator import generate_defense
from shadow_mapper import map_shadow_data
from trust_score import compute_trust_score

app = FastAPI(title="Sovereign Persona Sentinel API", version="1.0.0")

# Allow React frontend to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────
# Request / Response Models
# ─────────────────────────────────────────────

class UserProfile(BaseModel):
    name: str
    email: str
    username: Optional[str] = ""
    phone: Optional[str] = ""
    clicks_unknown_links: bool = False
    reuses_passwords: bool = False
    no_2fa: bool = False
    tech_awareness: int = 3          # 1 (low) → 5 (high)
    social_media_active: bool = False
    uses_public_wifi: bool = False

# ─────────────────────────────────────────────
# Routes
# ─────────────────────────────────────────────

@app.get("/")
def root():
    return {"status": "SPS API running", "version": "1.0.0", "llm": "Google Gemini 1.5 Flash (Free)"}


@app.post("/api/shadow-map")
def shadow_map(user: UserProfile):
    """Phase 1 – Shadow Mapping Engine"""
    result = map_shadow_data(user.dict())
    return result


@app.post("/api/simulate-attack")
def simulate_attack(user: UserProfile):
    """Phase 2 & 3 – Adversarial Mirror Engine"""
    vulnerability = compute_vulnerability_score(user.dict())
    attack = generate_attack(user.dict())
    defense = generate_defense(attack, user.dict())

    outcome = "CRITICAL" if vulnerability["score"] >= 70 else \
              "HIGH"     if vulnerability["score"] >= 45 else \
              "MODERATE" if vulnerability["score"] >= 25 else "LOW"

    return {
        "vulnerability": vulnerability,
        "attack": attack,
        "defense": defense,
        "threat_level": outcome,
    }


@app.post("/api/trust-score")
def trust_score(user: UserProfile):
    """Phase 5 – Dynamic Trust Score Engine"""
    shadow = map_shadow_data(user.dict())
    vuln   = compute_vulnerability_score(user.dict())
    score  = compute_trust_score(shadow, vuln)
    return score


@app.post("/api/full-analysis")
def full_analysis(user: UserProfile):
    """Runs all phases in one call — used by the dashboard."""
    shadow     = map_shadow_data(user.dict())
    vuln       = compute_vulnerability_score(user.dict())
    trust      = compute_trust_score(shadow, vuln)
    attack     = generate_attack(user.dict())
    defense    = generate_defense(attack, user.dict())

    outcome = "CRITICAL" if vuln["score"] >= 70 else \
              "HIGH"     if vuln["score"] >= 45 else \
              "MODERATE" if vuln["score"] >= 25 else "LOW"

    return {
        "shadow_map": shadow,
        "vulnerability": vuln,
        "trust_score": trust,
        "attack_simulation": {
            "attack": attack,
            "defense": defense,
            "threat_level": outcome,
        },
    }


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
