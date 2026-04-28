from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os

from shadow_mapper import map_shadow_data
from vulnerability_engine import compute_vulnerability_score
from trust_score import compute_trust_score
from attack_generator import generate_attack
from defense_generator import generate_defense

app = FastAPI(title="Sovereign Persona Sentinel API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class UserProfile(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    habits: List[str] = []
    awareness_level: int = 5

@app.get("/")
def root():
    return {"status": "SPS API running"}

@app.post("/api/shadow-map")
def shadow_map(user: UserProfile):
    try:
        return map_shadow_data(user.dict())
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/trust-score")
def trust_score_endpoint(user: UserProfile):
    try:
        vulnerability = compute_vulnerability_score(user.dict())
        shadow = map_shadow_data(user.dict())
        return compute_trust_score(shadow, vulnerability)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/full-analysis")
def full_analysis(user: UserProfile):
    try:
        user_data = user.dict()
        shadow = map_shadow_data(user_data)
        vulnerability = compute_vulnerability_score(user_data)
        trust = compute_trust_score(shadow, vulnerability)

        try:
            attack = generate_attack(user_data, vulnerability)
        except Exception:
            attack = "AI temporarily unavailable"

        try:
            defense = generate_defense(user_data, attack)
        except Exception:
            defense = "Defense unavailable"

        return {
            "shadow": shadow,
            "vulnerability": vulnerability,
            "trust_score": trust,
            "attack": attack,
            "defense": defense,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port)