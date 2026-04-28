import { useState, useEffect } from "react";

// ─── CONFIG ─────────────────────────────────────────────────────────────────
// Point this to your FastAPI backend URL
const API_BASE = "http://localhost:8000";

// ─── STYLES ─────────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Rajdhani:wght@400;500;600;700&family=Exo+2:wght@300;400;600;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:        #030712;
    --panel:     #0a0f1e;
    --border:    #1a2744;
    --accent:    #00d4ff;
    --accent2:   #7c3aed;
    --danger:    #ef4444;
    --warn:      #f59e0b;
    --safe:      #22c55e;
    --text:      #e2e8f0;
    --muted:     #64748b;
    --mono:      'Share Tech Mono', monospace;
    --ui:        'Rajdhani', sans-serif;
    --body:      'Exo 2', sans-serif;
  }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: var(--body);
    min-height: 100vh;
    overflow-x: hidden;
  }

  .grid-bg {
    position: fixed; inset: 0; z-index: 0;
    background-image:
      linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px);
    background-size: 40px 40px;
    pointer-events: none;
  }
  .grid-bg::after {
    content: '';
    position: absolute; inset: 0;
    background: radial-gradient(ellipse at 50% 0%, rgba(0,212,255,0.08) 0%, transparent 60%);
  }

  .app { position: relative; z-index: 1; max-width: 1200px; margin: 0 auto; padding: 0 24px 60px; }

  .header {
    padding: 32px 0 24px;
    border-bottom: 1px solid var(--border);
    margin-bottom: 40px;
    display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;
  }
  .logo { display: flex; align-items: center; gap: 16px; }
  .logo-icon {
    width: 48px; height: 48px;
    background: linear-gradient(135deg, var(--accent), var(--accent2));
    border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    font-size: 22px;
    box-shadow: 0 0 24px rgba(0,212,255,0.3);
  }
  .logo-text h1 {
    font-family: var(--ui);
    font-size: 22px; font-weight: 700; letter-spacing: 2px;
    color: var(--accent); text-transform: uppercase;
  }
  .logo-text p { font-family: var(--mono); font-size: 10px; color: var(--muted); letter-spacing: 1px; }
  .header-badges { display: flex; gap: 8px; flex-wrap: wrap; }
  .status-badge {
    font-family: var(--mono); font-size: 11px;
    padding: 6px 14px; border-radius: 20px;
    border: 1px solid var(--safe); color: var(--safe);
    display: flex; align-items: center; gap: 6px;
  }
  .free-badge {
    font-family: var(--mono); font-size: 11px;
    padding: 6px 14px; border-radius: 20px;
    border: 1px solid var(--warn); color: var(--warn);
    display: flex; align-items: center; gap: 6px;
  }
  .status-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--safe); animation: pulse 2s infinite; }
  @keyframes pulse { 0%,100%{opacity:1;} 50%{opacity:0.3;} }

  .phase-nav {
    display: flex; gap: 0; margin-bottom: 40px;
    border: 1px solid var(--border); border-radius: 12px; overflow: hidden;
  }
  .phase-btn {
    flex: 1; padding: 14px 8px;
    background: transparent; border: none; cursor: pointer;
    font-family: var(--ui); font-size: 13px; font-weight: 600;
    color: var(--muted); letter-spacing: 1px; text-transform: uppercase;
    transition: all 0.2s; position: relative;
    display: flex; flex-direction: column; align-items: center; gap: 4px;
  }
  .phase-btn.active { background: rgba(0,212,255,0.08); color: var(--accent); }
  .phase-btn.active::after {
    content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 2px;
    background: var(--accent);
  }
  .phase-num {
    font-family: var(--mono); font-size: 10px;
    padding: 2px 6px; border-radius: 4px; background: rgba(0,212,255,0.1);
  }
  .phase-btn.active .phase-num { background: rgba(0,212,255,0.2); }

  .input-panel {
    background: var(--panel); border: 1px solid var(--border);
    border-radius: 16px; padding: 32px; margin-bottom: 32px;
  }
  .panel-title {
    font-family: var(--ui); font-size: 11px; font-weight: 600;
    color: var(--accent); letter-spacing: 3px; text-transform: uppercase;
    margin-bottom: 24px; display: flex; align-items: center; gap: 8px;
  }
  .panel-title::before { content: '//'; color: var(--muted); }

  .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  @media(max-width:600px) { .form-grid { grid-template-columns: 1fr; } }

  .field { display: flex; flex-direction: column; gap: 6px; }
  .field label { font-family: var(--mono); font-size: 10px; color: var(--muted); letter-spacing: 1px; text-transform: uppercase; }
  .field input[type="text"], .field input[type="email"], .field select {
    background: rgba(255,255,255,0.03); border: 1px solid var(--border);
    border-radius: 8px; padding: 10px 14px; color: var(--text);
    font-family: var(--mono); font-size: 13px; outline: none; transition: border-color 0.2s; width: 100%;
  }
  .field input:focus, .field select:focus { border-color: var(--accent); }
  .field select option { background: var(--panel); }

  .checkbox-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 8px; }
  .checkbox-item {
    display: flex; align-items: center; gap: 10px;
    background: rgba(255,255,255,0.02); border: 1px solid var(--border);
    border-radius: 8px; padding: 10px 14px; cursor: pointer;
    transition: all 0.2s; font-family: var(--body); font-size: 13px;
  }
  .checkbox-item:hover { border-color: rgba(0,212,255,0.3); }
  .checkbox-item.checked { border-color: var(--danger); background: rgba(239,68,68,0.05); }
  .check-icon { width: 16px; height: 16px; border-radius: 4px; border: 1px solid var(--muted); flex-shrink: 0; display:flex; align-items:center; justify-content:center; font-size:10px; }
  .checkbox-item.checked .check-icon { background: var(--danger); border-color: var(--danger); }

  .scan-btn {
    width: 100%; padding: 16px;
    background: linear-gradient(135deg, var(--accent), var(--accent2));
    border: none; border-radius: 10px; cursor: pointer;
    font-family: var(--ui); font-size: 15px; font-weight: 700;
    color: white; letter-spacing: 2px; text-transform: uppercase;
    margin-top: 24px; transition: all 0.2s;
    box-shadow: 0 0 30px rgba(0,212,255,0.2);
    position: relative; overflow: hidden;
  }
  .scan-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 0 40px rgba(0,212,255,0.35); }
  .scan-btn:disabled { opacity: 0.6; cursor: not-allowed; }
  .scan-btn .shimmer {
    position: absolute; inset: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
    animation: shimmer 2s infinite;
  }
  @keyframes shimmer { 0%{transform:translateX(-100%);} 100%{transform:translateX(100%);} }

  .loading-screen {
    background: var(--panel); border: 1px solid var(--border); border-radius: 16px;
    padding: 60px 32px; text-align: center; margin-bottom: 32px;
  }
  .loading-title { font-family: var(--mono); font-size: 14px; color: var(--accent); margin-bottom: 8px; }
  .loading-sub { font-family: var(--mono); font-size: 11px; color: var(--muted); margin-bottom: 32px; }
  .loader { display: flex; flex-direction: column; gap: 12px; max-width: 400px; margin: 0 auto; }
  .loader-step { display: flex; align-items: center; gap: 12px; font-family: var(--mono); font-size: 11px; color: var(--muted); }
  .loader-step.active { color: var(--accent); }
  .loader-step.done { color: var(--safe); }
  .step-bar { flex: 1; height: 2px; background: var(--border); border-radius: 1px; overflow: hidden; }
  .step-fill { height: 100%; background: var(--accent); border-radius: 1px; transition: width 0.4s; }

  .results { display: flex; flex-direction: column; gap: 24px; }

  .result-panel {
    background: var(--panel); border: 1px solid var(--border); border-radius: 16px; padding: 28px;
    animation: fadeUp 0.4s ease both;
  }
  @keyframes fadeUp { from{opacity:0;transform:translateY(16px);} to{opacity:1;transform:none;} }

  .trust-hero { display: flex; align-items: center; gap: 40px; flex-wrap: wrap; }
  .trust-gauge { position: relative; width: 160px; height: 160px; flex-shrink: 0; }
  .trust-gauge svg { width: 100%; height: 100%; transform: rotate(-90deg); }
  .gauge-bg { fill: none; stroke: var(--border); stroke-width: 10; }
  .gauge-fill { fill: none; stroke-width: 10; stroke-linecap: round; transition: stroke-dashoffset 1s ease; }
  .gauge-label {
    position: absolute; inset: 0; display: flex; flex-direction: column;
    align-items: center; justify-content: center; font-family: var(--ui); text-align: center;
  }
  .gauge-num { font-size: 36px; font-weight: 800; line-height: 1; }
  .gauge-sub { font-size: 10px; color: var(--muted); font-family: var(--mono); letter-spacing: 1px; margin-top: 2px; }
  .trust-info { flex: 1; }
  .trust-band { display: inline-block; font-family: var(--ui); font-size: 13px; font-weight: 700; letter-spacing: 2px; padding: 4px 12px; border-radius: 6px; margin-bottom: 12px; }
  .trust-advice { font-size: 14px; color: var(--muted); line-height: 1.6; margin-bottom: 16px; }
  .breakdown-list { display: flex; flex-direction: column; gap: 8px; }
  .breakdown-item { background: rgba(255,255,255,0.02); border: 1px solid var(--border); border-radius: 8px; padding: 12px 16px; }
  .breakdown-item h4 { font-family: var(--ui); font-size: 12px; font-weight: 600; color: var(--accent); margin-bottom: 4px; }
  .breakdown-item p { font-family: var(--mono); font-size: 10px; color: var(--muted); }

  .exposure-zones { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; margin-top: 16px; }
  .zone-card { border-radius: 10px; padding: 14px; border: 1px solid; display: flex; flex-direction: column; gap: 4px; }
  .zone-card.HIGH { border-color: rgba(239,68,68,0.4); background: rgba(239,68,68,0.05); }
  .zone-card.CRITICAL { border-color: rgba(239,68,68,0.6); background: rgba(239,68,68,0.08); }
  .zone-card.MODERATE { border-color: rgba(245,158,11,0.4); background: rgba(245,158,11,0.05); }
  .zone-card.LOW { border-color: rgba(34,197,94,0.4); background: rgba(34,197,94,0.05); }
  .zone-name { font-family: var(--ui); font-size: 13px; font-weight: 600; }
  .zone-count { font-family: var(--mono); font-size: 22px; font-weight: 700; }
  .zone-badge { font-family: var(--mono); font-size: 9px; letter-spacing: 1px; padding: 2px 6px; border-radius: 4px; align-self: flex-start; margin-top: 4px; }
  .zone-card.HIGH .zone-badge { background: rgba(239,68,68,0.15); color: #ef4444; }
  .zone-card.CRITICAL .zone-badge { background: rgba(239,68,68,0.2); color: #f87171; }
  .zone-card.MODERATE .zone-badge { background: rgba(245,158,11,0.15); color: #f59e0b; }
  .zone-card.LOW .zone-badge { background: rgba(34,197,94,0.15); color: #22c55e; }
  .breach-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
  .breach-tag { font-family: var(--mono); font-size: 10px; padding: 4px 10px; border-radius: 20px; border: 1px solid rgba(239,68,68,0.3); color: #f87171; background: rgba(239,68,68,0.06); }
  .variant-list { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
  .variant-tag { font-family: var(--mono); font-size: 11px; padding: 4px 10px; border-radius: 6px; border: 1px solid var(--border); color: var(--muted); background: rgba(255,255,255,0.02); }

  .attack-bars { display: flex; flex-direction: column; gap: 12px; margin-top: 16px; }
  .attack-bar-row { display: flex; flex-direction: column; gap: 6px; }
  .attack-bar-label { display: flex; justify-content: space-between; font-family: var(--mono); font-size: 11px; }
  .attack-bar-label span:first-child { color: var(--text); }
  .attack-bar-track { height: 6px; background: var(--border); border-radius: 3px; overflow: hidden; }
  .attack-bar-fill { height: 100%; border-radius: 3px; transition: width 1s ease; }
  .fill-CRITICAL { background: linear-gradient(90deg, #ef4444, #f87171); }
  .fill-HIGH { background: linear-gradient(90deg, #f59e0b, #fbbf24); }
  .fill-MODERATE { background: linear-gradient(90deg, #6366f1, #818cf8); }
  .fill-LOW { background: linear-gradient(90deg, #22c55e, #4ade80); }
  .severity-chip { font-family: var(--mono); font-size: 9px; letter-spacing: 1px; padding: 2px 6px; border-radius: 4px; }
  .chip-CRITICAL { background: rgba(239,68,68,0.15); color: #ef4444; }
  .chip-HIGH { background: rgba(245,158,11,0.15); color: #f59e0b; }
  .chip-MODERATE { background: rgba(99,102,241,0.15); color: #818cf8; }
  .chip-LOW { background: rgba(34,197,94,0.15); color: #22c55e; }

  .attack-tabs { display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; }
  .atk-tab { font-family: var(--mono); font-size: 11px; letter-spacing: 1px; padding: 6px 14px; border-radius: 6px; cursor: pointer; border: 1px solid var(--border); color: var(--muted); background: transparent; transition: all 0.2s; }
  .atk-tab.active { border-color: var(--danger); color: var(--danger); background: rgba(239,68,68,0.07); }
  .attack-content { background: rgba(0,0,0,0.3); border: 1px solid rgba(239,68,68,0.2); border-radius: 10px; padding: 20px; font-family: var(--mono); font-size: 12px; line-height: 1.8; color: #fca5a5; white-space: pre-wrap; word-break: break-word; max-height: 260px; overflow-y: auto; }
  .threat-level-badge { display: inline-flex; align-items: center; gap: 6px; font-family: var(--ui); font-size: 14px; font-weight: 700; letter-spacing: 1px; padding: 8px 18px; border-radius: 8px; margin-bottom: 20px; }
  .threat-CRITICAL { background: rgba(239,68,68,0.15); border: 1px solid #ef4444; color: #ef4444; }
  .threat-HIGH { background: rgba(245,158,11,0.12); border: 1px solid #f59e0b; color: #f59e0b; }
  .threat-MODERATE { background: rgba(99,102,241,0.12); border: 1px solid #6366f1; color: #818cf8; }
  .threat-LOW { background: rgba(34,197,94,0.12); border: 1px solid #22c55e; color: #22c55e; }

  .warning-box { background: rgba(245,158,11,0.06); border: 1px solid rgba(245,158,11,0.3); border-radius: 10px; padding: 18px; margin-bottom: 20px; font-size: 14px; line-height: 1.7; color: #fcd34d; font-family: var(--body); }
  .quick-wins { display: flex; flex-direction: column; gap: 8px; margin-top: 16px; }
  .qw-item { display: flex; align-items: center; gap: 12px; background: rgba(255,255,255,0.02); border: 1px solid var(--border); border-radius: 8px; padding: 12px 16px; font-family: var(--body); font-size: 13px; }
  .qw-icon { font-size: 18px; }
  .qw-text { flex: 1; }
  .qw-urgency { font-family: var(--mono); font-size: 9px; letter-spacing: 1px; padding: 2px 7px; border-radius: 4px; }
  .urg-CRITICAL { background: rgba(239,68,68,0.15); color: #ef4444; }
  .urg-HIGH { background: rgba(245,158,11,0.15); color: #f59e0b; }
  .urg-MODERATE { background: rgba(99,102,241,0.15); color: #818cf8; }
  .action-steps { display: flex; flex-direction: column; gap: 8px; margin-top: 16px; }
  .action-step { display: flex; gap: 12px; align-items: flex-start; font-family: var(--body); font-size: 13px; line-height: 1.5; color: var(--text); }
  .step-num { width: 22px; height: 22px; border-radius: 50%; background: rgba(0,212,255,0.1); border: 1px solid rgba(0,212,255,0.3); color: var(--accent); font-family: var(--mono); font-size: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 1px; }

  .section-label { font-family: var(--mono); font-size: 10px; color: var(--muted); letter-spacing: 1px; margin: 12px 0 8px; text-transform: uppercase; display: flex; align-items: center; gap: 8px; }
  .section-label::after { content: ''; flex: 1; height: 1px; background: var(--border); }

  .error-box { background: rgba(239,68,68,0.06); border: 1px solid rgba(239,68,68,0.3); border-radius: 10px; padding: 20px; text-align: center; font-family: var(--mono); font-size: 13px; color: #f87171; margin-bottom: 24px; }
`;

function TrustGauge({ score, color }) {
  const r = 60;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return (
    <div className="trust-gauge">
      <svg viewBox="0 0 140 140">
        <circle className="gauge-bg" cx="70" cy="70" r={r} />
        <circle className="gauge-fill" cx="70" cy="70" r={r}
          stroke={color} strokeDasharray={circ} strokeDashoffset={offset} />
      </svg>
      <div className="gauge-label">
        <span className="gauge-num" style={{ color }}>{score}</span>
        <span className="gauge-sub">TRUST</span>
      </div>
    </div>
  );
}

export default function SPS() {
  const [phase, setPhase] = useState("input");
  const [loading, setLoading] = useState(false);
  const [loadStep, setLoadStep] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [attackTab, setAttackTab] = useState("email");

  const [form, setForm] = useState({
    name: "", email: "", username: "", phone: "",
    clicks_unknown_links: false, reuses_passwords: false,
    no_2fa: false, uses_public_wifi: false, social_media_active: false,
    tech_awareness: 3,
  });

  const loadSteps = [
    "Mapping data shadow across breach databases...",
    "Constructing behavioral digital twin...",
    "Running adversarial mirror engine (Gemini AI)...",
    "Generating defense countermeasures...",
    "Computing dynamic trust score...",
  ];

  useEffect(() => {
    let i = 0;
    if (loading) {
      const id = setInterval(() => { i++; setLoadStep(i); if (i >= loadSteps.length) clearInterval(id); }, 900);
      return () => clearInterval(id);
    }
  }, [loading]);

  function toggle(key) { setForm(f => ({ ...f, [key]: !f[key] })); }

  async function runAnalysis() {
    if (!form.name || !form.email) { setError("Name and email are required."); return; }
    setError(null); setLoading(true); setLoadStep(0); setResult(null);
    try {
      const res = await fetch(`${API_BASE}/api/full-analysis`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      setResult(data);
      setPhase("trust");
    } catch (e) {
      setError(`Analysis failed: ${e.message}. Make sure the backend is running on ${API_BASE}`);
    } finally {
      setLoading(false);
    }
  }

  const phases = [
    { id: "input",   label: "Profile Input",    num: "01" },
    { id: "trust",   label: "Trust Score",       num: "02" },
    { id: "shadow",  label: "Shadow Map",        num: "03" },
    { id: "vuln",    label: "Vulnerability",     num: "04" },
    { id: "attack",  label: "Attack Simulation", num: "05" },
    { id: "defense", label: "Defense Engine",    num: "06" },
  ];

  const checkboxes = [
    { key: "clicks_unknown_links", label: "Clicks unknown links" },
    { key: "reuses_passwords",     label: "Reuses passwords" },
    { key: "no_2fa",               label: "No 2FA enabled" },
    { key: "uses_public_wifi",     label: "Uses public Wi-Fi" },
    { key: "social_media_active",  label: "Active on social media" },
  ];

  const trust  = result?.trust_score;
  const shadow = result?.shadow_map;
  const vuln   = result?.vulnerability;
  const atk    = result?.attack_simulation;

  return (
    <>
      <style>{styles}</style>
      <div className="grid-bg" />
      <div className="app">

        <header className="header">
          <div className="logo">
            <div className="logo-icon">🛡️</div>
            <div className="logo-text">
              <h1>Sovereign Persona Sentinel</h1>
              <p>AI-DRIVEN CYBER DEFENSE FOR THE NEXT DIGITAL ERA</p>
            </div>
          </div>
          <div className="header-badges">
            
            
            
            <div className="status-badge"><div className="status-dot" /> SYSTEM ONLINE</div>
          </div>
        </header>

        <nav className="phase-nav">
          {phases.map(p => (
            <button key={p.id} className={`phase-btn ${phase === p.id ? "active" : ""}`}
              onClick={() => result ? setPhase(p.id) : setPhase("input")}>
              <span className="phase-num">{p.num}</span>
              {p.label}
            </button>
          ))}
        </nav>

        {error && <div className="error-box">⚠ {error}</div>}

        {phase === "input" && !loading && (
          <div className="input-panel">
            <div className="panel-title">Identity Profile Input</div>
            <div className="form-grid">
              <div className="field">
                <label>Full Name *</label>
                <input type="text" placeholder="John Doe" value={form.name}
                  onChange={e => setForm(f => ({...f, name: e.target.value}))} />
              </div>
              <div className="field">
                <label>Email Address *</label>
                <input type="email" placeholder="you@gmail.com" value={form.email}
                  onChange={e => setForm(f => ({...f, email: e.target.value}))} />
              </div>
              <div className="field">
                <label>Username</label>
                <input type="text" placeholder="john_doe99" value={form.username}
                  onChange={e => setForm(f => ({...f, username: e.target.value}))} />
              </div>
              <div className="field">
                <label>Phone Number</label>
                <input type="text" placeholder="+91 9876543210" value={form.phone}
                  onChange={e => setForm(f => ({...f, phone: e.target.value}))} />
              </div>
              <div className="field">
                <label>Tech Awareness Level (1–5)</label>
                <select value={form.tech_awareness}
                  onChange={e => setForm(f => ({...f, tech_awareness: parseInt(e.target.value)}))}>
                  <option value={1}>1 — Minimal</option>
                  <option value={2}>2 — Basic</option>
                  <option value={3}>3 — Average</option>
                  <option value={4}>4 — Tech-savvy</option>
                  <option value={5}>5 — Security-conscious</option>
                </select>
              </div>
              <div style={{gridColumn:"1/-1"}}>
                <div className="section-label">Risk Behaviour Flags</div>
                <div className="checkbox-grid">
                  {checkboxes.map(c => (
                    <label key={c.key} className={`checkbox-item ${form[c.key] ? "checked" : ""}`}
                      onClick={() => toggle(c.key)}>
                      <div className="check-icon">{form[c.key] ? "✓" : ""}</div>
                      {c.label}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <button className="scan-btn" onClick={runAnalysis}>
              <div className="shimmer" />
              ⚡ INITIATE FULL IDENTITY ANALYSIS
            </button>
          </div>
        )}

        {loading && (
          <div className="loading-screen">
            <div className="loading-title">ADVERSARIAL MIRROR ENGINE ACTIVE</div>
            <div className="loading-sub">Gemini AI simulating attacker intelligence against your profile...</div>
            <div className="loader">
              {loadSteps.map((s, i) => (
                <div key={i} className={`loader-step ${loadStep > i ? "done" : loadStep === i ? "active" : ""}`}>
                  <span>{loadStep > i ? "✓" : loadStep === i ? "▶" : "○"}</span>
                  <div className="step-bar">
                    <div className="step-fill" style={{width: loadStep > i ? "100%" : loadStep === i ? "60%" : "0%"}} />
                  </div>
                  <span style={{flex:2}}>{s}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {result && !loading && (
          <div className="results">

            {phase === "trust" && trust && (
              <div className="result-panel">
                <div className="panel-title">Dynamic Trust Score</div>
                <div className="trust-hero">
                  <TrustGauge score={trust.trust_score} color={trust.color} />
                  <div className="trust-info">
                    <div className="trust-band"
                      style={{background:`${trust.color}18`, color:trust.color, border:`1px solid ${trust.color}`}}>
                      {trust.emoji} {trust.band}
                    </div>
                    <p className="trust-advice">{trust.advice}</p>
                    <div className="breakdown-list">
                      {trust.breakdown.map((b, i) => (
                        <div key={i} className="breakdown-item">
                          <h4>{b.component} — {b.risk_contribution} risk pts</h4>
                          <p>{b.detail}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {phase === "shadow" && shadow && (
              <div className="result-panel">
                <div className="panel-title">Data Shadow Map</div>
                <p style={{color:"var(--muted)", fontSize:13, marginBottom:8}}>{shadow.summary}</p>
                <div className="exposure-zones">
                  {shadow.exposure_zones.map((z, i) => (
                    <div key={i} className={`zone-card ${z.risk}`}>
                      <div className="zone-name">{z.zone}</div>
                      <div className="zone-count" style={{color: z.risk==="CRITICAL"||z.risk==="HIGH" ? "var(--danger)" : "var(--warn)"}}>{z.count}</div>
                      <div className="zone-badge">{z.risk}</div>
                    </div>
                  ))}
                </div>
                <div className="section-label" style={{marginTop:20}}>Known Breach Databases</div>
                <div className="breach-tags">
                  {shadow.known_breaches.map((b, i) => <span key={i} className="breach-tag">{b}</span>)}
                </div>
                {shadow.email_variants_detected?.length > 0 && <>
                  <div className="section-label">Detected Email Variants</div>
                  <div className="variant-list">
                    {shadow.email_variants_detected.map((v, i) => <span key={i} className="variant-tag">{v}</span>)}
                  </div>
                </>}
              </div>
            )}

            {phase === "vuln" && vuln && (
              <div className="result-panel">
                <div className="panel-title">Behavioral Vulnerability Analysis</div>
                <div style={{marginBottom:20}}>
                  <span className={`threat-level-badge threat-${vuln.label}`}>
                    Vulnerability: {vuln.score}/100 — {vuln.label}
                  </span>
                </div>
                <div className="section-label">Attack Susceptibility by Vector</div>
                <div className="attack-bars">
                  {vuln.attack_susceptibility.map((a, i) => (
                    <div key={i} className="attack-bar-row">
                      <div className="attack-bar-label">
                        <span>{a.icon} {a.type}</span>
                        <span style={{display:"flex",alignItems:"center",gap:6}}>
                          <span className={`severity-chip chip-${a.severity}`}>{a.severity}</span>
                          <span style={{color:"var(--muted)"}}>{a.likelihood_percent}%</span>
                        </span>
                      </div>
                      <div className="attack-bar-track">
                        <div className={`attack-bar-fill fill-${a.severity}`} style={{width:`${a.likelihood_percent}%`}} />
                      </div>
                    </div>
                  ))}
                </div>
                {vuln.triggered_risk_factors.length > 0 && <>
                  <div className="section-label" style={{marginTop:20}}>Triggered Risk Factors</div>
                  <div className="quick-wins">
                    {vuln.triggered_risk_factors.map((f, i) => (
                      <div key={i} className="qw-item">
                        <span className="qw-icon">⚠️</span>
                        <span className="qw-text">{f.factor}</span>
                        <span className="qw-urgency urg-HIGH">+{f.points} pts</span>
                      </div>
                    ))}
                  </div>
                </>}
              </div>
            )}

            {phase === "attack" && atk && (
              <div className="result-panel">
                <div className="panel-title">Adversarial Attack Simulation</div>
                <div className={`threat-level-badge threat-${atk.threat_level}`}>
                  ⚡ THREAT LEVEL: {atk.threat_level}
                </div>
                <div className="attack-tabs">
                  <button className={`atk-tab ${attackTab==="email" ? "active":""}`} onClick={()=>setAttackTab("email")}>📧 Phishing Email</button>
                  <button className={`atk-tab ${attackTab==="vishing" ? "active":""}`} onClick={()=>setAttackTab("vishing")}>📞 Vishing Script</button>
                  <button className={`atk-tab ${attackTab==="social" ? "active":""}`} onClick={()=>setAttackTab("social")}>🎭 Social Hook</button>
                </div>
                <div className="attack-content">
                  {attackTab==="email"   && atk.attack.phishing_email}
                  {attackTab==="vishing" && atk.attack.vishing_script}
                  {attackTab==="social"  && atk.attack.social_engineering_hook}
                </div>
                <p style={{marginTop:12, fontSize:12, color:"var(--muted)", fontFamily:"var(--mono)"}}>
                  ⚠ Generated by Gemini AI for educational red-team simulation only.
                </p>
              </div>
            )}

            {phase === "defense" && atk && (
              <div className="result-panel">
                <div className="panel-title">Auto-Defense Engine Output</div>
                <div className="warning-box">
                  <strong>⚠ Personalized Warning:</strong><br />{atk.defense.personalized_warning}
                </div>
                <div className="section-label">Immediate Quick Wins</div>
                <div className="quick-wins">
                  {atk.defense.quick_wins.map((q, i) => (
                    <div key={i} className="qw-item">
                      <span className="qw-icon">{q.icon}</span>
                      <span className="qw-text">{q.action}</span>
                      <span className={`qw-urgency urg-${q.urgency}`}>{q.urgency}</span>
                    </div>
                  ))}
                </div>
                <div className="section-label" style={{marginTop:20}}>Action Plan</div>
                <div className="action-steps">
                  {atk.defense.action_plan.map((s, i) => (
                    <div key={i} className="action-step">
                      <div className="step-num">{i+1}</div>
                      <span>{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </>
  );
}
