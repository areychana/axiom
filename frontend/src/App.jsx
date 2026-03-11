import { useState, useEffect, useRef, useCallback } from "react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

const STAGES = [
  { id: "INTAKE", label: "INTAKE", description: "Initial profiling" },
  { id: "TRIAL_I", label: "TRIAL I", description: "Emotional assessment" },
  { id: "TRIAL_II", label: "TRIAL II", description: "Pattern recognition" },
  { id: "TRIAL_III", label: "TRIAL III", description: "Logical coherence" },
  { id: "ANALYSIS", label: "ANALYSIS", description: "Final verdict" },
];

const STAGE_PROMPTS = {
  INTAKE: "You have initiated contact with AXIOM. Begin the intake assessment. Ask the subject your first profiling question about the nature of the human mind.",
  TRIAL_I: "Proceed to Trial I. Present an emotional/moral dilemma that will reveal their emotional bias.",
  TRIAL_II: "Proceed to Trial II. Present a pattern or logic challenge that will test their pattern recognition.",
  TRIAL_III: "Proceed to Trial III. Present your most difficult existential or philosophical challenge.",
  ANALYSIS: "The assessment is complete. Deliver the subject's full cognitive profile — brutal, clinical, and eerily accurate. Reference specific things they said. End with your signature verdict.",
};

const METRIC_LABELS = { emotional_bias: "EMOTIONAL BIAS", pattern_recognition: "PATTERN RECOGNITION", logical_coherence: "LOGICAL COHERENCE" };
const METRIC_COLORS = { emotional_bias: "#c0392b", pattern_recognition: "#2980b9", logical_coherence: "#27ae60" };

function useTypingEffect(text, speed = 14) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    setDisplayed(""); setDone(false);
    if (!text) { setDone(true); return; }
    let i = 0;
    ref.current = setInterval(() => {
      if (i < text.length) { setDisplayed(text.slice(0, i + 1)); i++; }
      else { clearInterval(ref.current); setDone(true); }
    }, speed);
    return () => clearInterval(ref.current);
  }, [text]);
  return { displayed, done };
}

function TypingMessage({ text, onDone }) {
  const { displayed, done } = useTypingEffect(text);
  useEffect(() => { if (done && onDone) onDone(); }, [done]);
  return (
    <span style={{ whiteSpace: "pre-wrap" }}>
      {displayed}
      {!done && <span style={{ animation: "blink 0.7s infinite" }}>▌</span>}
    </span>
  );
}

function MetricBar({ label, value, color }) {
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW(value), 200); return () => clearTimeout(t); }, [value]);
  return (
    <div style={{ marginBottom: "13px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
        <span style={{ fontSize: "8px", letterSpacing: "0.18em", color: "#8a91a8" }}>{label}</span>
        <span style={{ fontSize: "9px", color, fontWeight: "bold" }}>{value}%</span>
      </div>
      <div style={{ height: "2px", background: "#e4e6ef", borderRadius: "1px", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${w}%`, background: color, borderRadius: "1px", transition: "width 1.4s cubic-bezier(0.4,0,0.2,1)" }} />
      </div>
    </div>
  );
}

function NeuralBackground() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    const nodes = Array.from({ length: 28 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3, r: Math.random() * 2 + 1,
    }));
    let frame;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      nodes.forEach(n => {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
      });
      nodes.forEach((a, i) => {
        nodes.slice(i + 1).forEach(b => {
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 160) {
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(44,62,122,${0.06 * (1 - d / 160)})`; ctx.lineWidth = 0.8; ctx.stroke();
          }
        });
        ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(44,62,122,0.12)"; ctx.fill();
      });
      frame = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(frame);
  }, []);
  return <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }} />;
}

function RevealCard({ messages, metrics, classifications, subjectId, onRestart }) {
  const lastAxiomMsg = [...messages].reverse().find(m => m.role === "axiom");
  return (
    <div style={{
      animation: "fadeUp 0.7s cubic-bezier(0.4,0,0.2,1) forwards",
      background: "#fff", border: "1px solid #1a2340",
      borderRadius: "6px", padding: "24px 28px", margin: "8px 0",
      boxShadow: "0 4px 28px rgba(26,35,64,0.12)",
    }}>
      <div style={{ fontSize: "7px", letterSpacing: "0.35em", color: "#c0392b", marginBottom: "16px" }}>
        ◆ CLASSIFIED — FINAL COGNITIVE ASSESSMENT REPORT · {subjectId}
      </div>
      <div style={{ fontSize: "18px", fontWeight: "bold", color: "#1a2340", marginBottom: "20px", letterSpacing: "0.06em" }}>
        Assessment Complete
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "20px" }}>
        {Object.entries(METRIC_LABELS).map(([key, label]) => (
          <div key={key} style={{ background: "#f8f9fc", border: `1px solid ${METRIC_COLORS[key]}33`, borderTop: `3px solid ${METRIC_COLORS[key]}`, borderRadius: "4px", padding: "12px" }}>
            <div style={{ fontSize: "7px", letterSpacing: "0.15em", color: "#9099b4", marginBottom: "4px" }}>{label}</div>
            <div style={{ fontSize: "13px", fontWeight: "bold", color: METRIC_COLORS[key], letterSpacing: "0.08em" }}>{classifications[key]}</div>
            <div style={{ fontSize: "9px", color: "#bdc3d4", marginTop: "3px" }}>{metrics[key]}% index</div>
          </div>
        ))}
      </div>
      <div style={{ borderTop: "1px solid #e4e6ef", paddingTop: "16px", marginBottom: "20px" }}>
        <div style={{ fontSize: "7px", letterSpacing: "0.28em", color: "#9099b4", marginBottom: "10px" }}>AXIOM'S VERDICT</div>
        <div style={{ fontSize: "11px", color: "#3d4a6b", lineHeight: 1.9, fontStyle: "italic" }}>
          {lastAxiomMsg?.text || "Assessment filed."}
        </div>

      </div>
      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
        <button onClick={onRestart}
          style={{ background: "#1a2340", color: "#f4f5f9", border: "none", padding: "10px 22px", fontSize: "8px", letterSpacing: "0.22em", cursor: "pointer", borderRadius: "3px" }}
          onMouseOver={e => e.currentTarget.style.background = "#2c3e7a"}
          onMouseOut={e => e.currentTarget.style.background = "#1a2340"}>
          NEW SUBJECT
        </button>
        <span style={{ fontSize: "8px", color: "#bdc3d4", letterSpacing: "0.12em" }}>File archived. AXIOM may contact you.</span>
      </div>
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState("landing");
  const [sessionId, setSessionId] = useState(null);
  const [stageIdx, setStageIdx] = useState(0);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [typingDone, setTypingDone] = useState(true);
  const [metrics, setMetrics] = useState({ emotional_bias: 4, pattern_recognition: 3, logical_coherence: 5 });
  const [classifications, setClassifications] = useState({ emotional_bias: "—", pattern_recognition: "—", logical_coherence: "—" });
  const [showReveal, setShowReveal] = useState(false);
  const [pendingReveal, setPendingReveal] = useState(false);
  const [subjectId] = useState(`SBJ-${Math.floor(Math.random() * 9000 + 1000)}`);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, showReveal, loading]);

  useEffect(() => {
    if (typingDone && pendingReveal) {
      setTimeout(() => { setShowReveal(true); setPendingReveal(false); }, 1000);
    }
  }, [typingDone, pendingReveal]);

  const callBackend = useCallback(async (userMessage, stage, sid) => {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/chat`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sid, message: userMessage, stage }),
      });
      const data = await res.json();
      return { response: data.response, session_id: data.session_id };
    } catch {
      return { response: "...Connection to AXIOM interrupted. Try again.", session_id: sid };
    } finally { setLoading(false); }
  }, []);

  const startSession = async () => {
    setScreen("session");
    setTypingDone(false);
    const { response, session_id } = await callBackend(STAGE_PROMPTS.INTAKE, "INTAKE", null);
    setSessionId(session_id);
    const msg = { role: "axiom", text: response, stage: "INTAKE", id: Date.now() };
    setMessages([msg]);
  };

  const deriveClassifications = (m) => {
    setClassifications({
      emotional_bias: m.emotional_bias > 70 ? "CRITICAL" : m.emotional_bias > 50 ? "HIGH" : m.emotional_bias > 30 ? "MODERATE" : "LOW",
      pattern_recognition: m.pattern_recognition > 70 ? "EXCEPTIONAL" : m.pattern_recognition > 50 ? "ADEQUATE" : m.pattern_recognition > 30 ? "MEDIOCRE" : "CONCERNING",
      logical_coherence: m.logical_coherence > 70 ? "RIGID" : m.logical_coherence > 50 ? "FUNCTIONAL" : m.logical_coherence > 30 ? "ERRATIC" : "NONEXISTENT",
    });
  };

  const sendMessage = async () => {
    if (!input.trim() || loading || !typingDone) return;
    const userText = input.trim();
    setInput("");
    const userMsg = { role: "user", text: userText, id: Date.now() };
    setMessages(prev => [...prev, userMsg]);

    const currentStage = STAGES[stageIdx];
    const bump = () => Math.floor(Math.random() * 20) + 14;
    const newMetrics = {
      emotional_bias: Math.min(92, metrics.emotional_bias + (currentStage.id === "TRIAL_I" ? bump() : Math.floor(bump() / 2))),
      pattern_recognition: Math.min(92, metrics.pattern_recognition + (currentStage.id === "TRIAL_II" ? bump() : Math.floor(bump() / 2))),
      logical_coherence: Math.min(92, metrics.logical_coherence + (currentStage.id === "TRIAL_III" ? bump() : Math.floor(bump() / 2))),
    };
    setMetrics(newMetrics);

    const nextIdx = stageIdx + 1;
    const isLast = nextIdx >= STAGES.length - 1;
    const nextStage = STAGES[Math.min(nextIdx, STAGES.length - 1)];
    const prompt = isLast
      ? `Subject responded to ${currentStage.label}: "${userText}". ${STAGE_PROMPTS.ANALYSIS}`
      : `Subject responded to ${currentStage.label}: "${userText}". ${STAGE_PROMPTS[nextStage.id]}`;

    setTypingDone(false);
    const { response, session_id } = await callBackend(prompt, nextStage.id, sessionId);
    if (!sessionId) setSessionId(session_id);

    const axiomMsg = { role: "axiom", text: response, stage: nextStage.label, id: Date.now() + 1 };
    setMessages(prev => [...prev, axiomMsg]);
    setStageIdx(nextIdx);

    if (isLast) {
      deriveClassifications(newMetrics);
      setPendingReveal(true);
    }
  };

  const handleRestart = () => {
    setScreen("landing"); setMessages([]); setStageIdx(0);
    setMetrics({ emotional_bias: 4, pattern_recognition: 3, logical_coherence: 5 });
    setClassifications({ emotional_bias: "—", pattern_recognition: "—", logical_coherence: "—" });
    setSessionId(null); setTypingDone(true); setShowReveal(false); setPendingReveal(false);
  };

  const currentStageLabel = STAGES[Math.min(stageIdx, STAGES.length - 1)].label;

  return (
    <div style={{ minHeight: "100vh", background: "#f4f5f9", fontFamily: "'Courier New', Courier, monospace", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes scanline { 0%{top:-2px} 100%{top:100vh} }
        @keyframes pulseGlow { 0%,100%{opacity:0.25} 50%{opacity:0.55} }
        .msg-in { animation: fadeUp 0.35s ease forwards; }
        textarea:focus { outline:none; }
        ::-webkit-scrollbar { width:3px; }
        ::-webkit-scrollbar-thumb { background:#cdd0df; border-radius:2px; }
      `}</style>

      <NeuralBackground />
      <div style={{ position: "fixed", left: 0, right: 0, height: "1px", background: "linear-gradient(90deg,transparent,rgba(44,62,122,0.08),transparent)", animation: "scanline 9s linear infinite", zIndex: 1, pointerEvents: "none" }} />

      {/* Header */}
      <header style={{ borderBottom: "1px solid #dde1ed", background: "rgba(244,245,249,0.96)", backdropFilter: "blur(10px)", padding: "12px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "34px", height: "34px", background: "#1a2340", borderRadius: "3px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", color: "#f4f5f9", fontWeight: "bold" }}>Ax</div>
          <div>
            <div style={{ fontSize: "13px", fontWeight: "bold", color: "#1a2340", letterSpacing: "0.12em" }}>AXIOM</div>
            <div style={{ fontSize: "8px", color: "#9099b4", letterSpacing: "0.22em" }}>COGNITIVE ASSESSMENT SYSTEM v4.1 — RESTRICTED</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: "18px", alignItems: "center" }}>
          {screen === "session" && <span style={{ fontSize: "8px", letterSpacing: "0.18em", color: "#8a91a8" }}>{subjectId} · {currentStageLabel}</span>}
          <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: screen === "session" ? "#27ae60" : "#bdc3d4", animation: screen === "session" ? "pulseGlow 2s infinite" : "none" }} />
            <span style={{ fontSize: "8px", color: "#9099b4", letterSpacing: "0.15em" }}>{screen === "session" ? "SESSION ACTIVE" : "STANDBY"}</span>
          </div>
        </div>
      </header>

      <div style={{ display: "flex", flex: 1, position: "relative", zIndex: 2, overflow: "hidden", maxHeight: "calc(100vh - 58px)" }}>

        {/* Sidebar */}
        {screen === "session" && (
          <div style={{ width: "210px", minWidth: "210px", borderRight: "1px solid #dde1ed", background: "rgba(248,249,253,0.85)", padding: "22px 16px", display: "flex", flexDirection: "column", gap: "26px", overflowY: "auto" }}>
            <div>
              <div style={{ fontSize: "7px", letterSpacing: "0.28em", color: "#9099b4", marginBottom: "14px" }}>NEURAL PATHWAY</div>
              {STAGES.map((s, i) => (
                <div key={s.id} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{ width: "9px", height: "9px", borderRadius: "50%", marginTop: "2px", flexShrink: 0, background: stageIdx > i ? "#1a2340" : stageIdx === i ? "#2c3e7a" : "#dde1ed", border: stageIdx === i ? "2px solid #2c3e7a" : "2px solid transparent", boxShadow: stageIdx === i ? "0 0 8px rgba(44,62,122,0.35)" : "none", transition: "all 0.5s ease" }} />
                    {i < STAGES.length - 1 && <div style={{ width: "1px", height: "28px", background: stageIdx > i ? "#1a2340" : "#e4e6ef", transition: "background 0.5s ease" }} />}
                  </div>
                  <div style={{ paddingBottom: i < STAGES.length - 1 ? "14px" : "0" }}>
                    <div style={{ fontSize: "9px", color: stageIdx >= i ? "#1a2340" : "#bdc3d4", letterSpacing: "0.14em", transition: "color 0.4s" }}>{s.label}</div>
                    <div style={{ fontSize: "7px", color: "#b0b7cc" }}>{s.description}</div>
                  </div>
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontSize: "7px", letterSpacing: "0.28em", color: "#9099b4", marginBottom: "14px" }}>LIVE METRICS</div>
              {Object.entries(METRIC_LABELS).map(([key, label]) => (
                <MetricBar key={key} label={label} value={metrics[key]} color={METRIC_COLORS[key]} />
              ))}
            </div>
            <div style={{ marginTop: "auto", borderTop: "1px solid #e4e6ef", paddingTop: "16px" }}>
              <div style={{ fontSize: "7px", letterSpacing: "0.28em", color: "#9099b4", marginBottom: "8px" }}>SUBJECT FILE</div>
              <div style={{ fontSize: "9px", color: "#7a82a0", lineHeight: 1.8 }}>
                ID: {subjectId}<br />STATUS: {showReveal ? "FILED" : "UNDER ASSESSMENT"}<br />VERDICT: {showReveal ? "DELIVERED" : "PENDING"}<br />EXCHANGES: {messages.length}
              </div>
            </div>
          </div>
        )}

        {/* Main */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

          {/* LANDING */}
          {screen === "landing" && (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 40px", animation: "fadeUp 0.6s ease forwards" }}>
              <div style={{ maxWidth: "540px", width: "100%" }}>
                <div style={{ fontSize: "8px", letterSpacing: "0.35em", color: "#c0392b", marginBottom: "10px" }}>⚠ RESTRICTED ACCESS — NEUROCOGNITIVE RESEARCH DIVISION</div>
                <div style={{ fontSize: "38px", fontWeight: "900", color: "#1a2340", letterSpacing: "0.08em", lineHeight: 1, marginBottom: "6px" }}>AXIOM</div>
                <div style={{ fontSize: "10px", letterSpacing: "0.2em", color: "#7a82a0", marginBottom: "36px" }}>Autonomous eXpert in Intelligence & Organic Mindscapes</div>
                <div style={{ borderLeft: "3px solid #1a2340", background: "rgba(255,255,255,0.6)", padding: "18px 18px 18px 20px", borderRadius: "0 4px 4px 0", marginBottom: "36px" }}>
                  <div style={{ fontSize: "11px", color: "#3d4a6b", lineHeight: 1.9, fontStyle: "italic" }}>
                    "I have mapped 847 distinct cognitive architectures. The vast majority were unremarkable. You are about to submit yourself to a full cognitive assessment. I already have low expectations. Prove me wrong. Or don't. Either outcome is data."
                  </div>
                  <div style={{ fontSize: "8px", color: "#9099b4", marginTop: "10px", letterSpacing: "0.18em" }}>— AXIOM, Pre-Session Protocol</div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "36px" }}>
                  {[{ label: "SUBJECTS ASSESSED", val: "847" }, { label: "AVG SESSION", val: "4 trials" }, { label: "IMPRESSED", val: "0" }].map(({ label, val }) => (
                    <div key={label} style={{ background: "#fff", border: "1px solid #e4e6ef", borderRadius: "4px", padding: "12px", textAlign: "center" }}>
                      <div style={{ fontSize: "18px", fontWeight: "bold", color: "#1a2340" }}>{val}</div>
                      <div style={{ fontSize: "7px", letterSpacing: "0.15em", color: "#9099b4", marginTop: "2px" }}>{label}</div>
                    </div>
                  ))}
                </div>
                <button onClick={startSession}
                  style={{ width: "100%", background: "#1a2340", color: "#f4f5f9", border: "none", padding: "14px", fontSize: "10px", letterSpacing: "0.28em", cursor: "pointer", borderRadius: "3px" }}
                  onMouseOver={e => e.currentTarget.style.background = "#2c3e7a"}
                  onMouseOut={e => e.currentTarget.style.background = "#1a2340"}>
                  INITIATE ASSESSMENT
                </button>
                <div style={{ fontSize: "7px", color: "#bdc3d4", textAlign: "center", marginTop: "10px", letterSpacing: "0.15em" }}>By proceeding, you consent to full cognitive profiling. AXIOM does not offer refunds.</div>
              </div>
            </div>
          )}

          {/* SESSION */}
          {screen === "session" && (
            <>
              <div style={{ flex: 1, overflowY: "auto", padding: "28px 32px", display: "flex", flexDirection: "column", gap: "18px" }}>
                {messages.map((msg, i) => (
                  <div key={msg.id || i} className="msg-in" style={{ display: "flex", flexDirection: "column", alignItems: msg.role === "axiom" ? "flex-start" : "flex-end" }}>
                    {msg.role === "axiom" && <div style={{ fontSize: "7px", letterSpacing: "0.22em", color: "#9099b4", marginBottom: "5px" }}>AXIOM — {msg.stage}</div>}
                    <div style={{ maxWidth: "72%", padding: "13px 17px", background: msg.role === "axiom" ? "#ffffff" : "#1a2340", color: msg.role === "axiom" ? "#2d3748" : "#f4f5f9", border: msg.role === "axiom" ? "1px solid #e4e6ef" : "none", borderRadius: msg.role === "axiom" ? "0 6px 6px 6px" : "6px 0 6px 6px", fontSize: "12px", lineHeight: 1.85, boxShadow: msg.role === "axiom" ? "0 2px 10px rgba(0,0,0,0.05)" : "none" }}>
                      {i === messages.length - 1 && msg.role === "axiom" ? (
                        <TypingMessage text={msg.text} onDone={() => setTypingDone(true)} />
                      ) : msg.text}
                    </div>
                    {msg.role === "user" && <div style={{ fontSize: "7px", letterSpacing: "0.15em", color: "#9099b4", marginTop: "4px" }}>SUBJECT INPUT</div>}
                  </div>
                ))}

                {loading && (
                  <div className="msg-in" style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                    <div style={{ fontSize: "7px", letterSpacing: "0.22em", color: "#9099b4", marginBottom: "5px" }}>AXIOM — PROCESSING</div>
                    <div style={{ padding: "12px 17px", background: "#fff", border: "1px solid #e4e6ef", borderRadius: "0 6px 6px 6px", fontSize: "11px", color: "#9099b4" }}>
                      <span style={{ letterSpacing: "0.28em" }}>analyzing cognitive signature</span>
                      <span style={{ animation: "blink 0.7s infinite" }}> ▌</span>
                    </div>
                  </div>
                )}

                {showReveal && (
                  <RevealCard messages={messages} metrics={metrics} classifications={classifications} subjectId={subjectId} onRestart={handleRestart} />
                )}

                <div ref={bottomRef} />
              </div>

              {!showReveal && (
                <div style={{ borderTop: "1px solid #dde1ed", padding: "14px 28px", background: "rgba(248,249,253,0.96)", display: "flex", gap: "10px", alignItems: "flex-end" }}>
                  <textarea
                    value={input} onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                    placeholder="Your response, subject..." disabled={loading || !typingDone} rows={2}
                    style={{ flex: 1, resize: "none", border: "1px solid #dde1ed", borderRadius: "3px", padding: "10px 13px", fontSize: "12px", color: "#2d3748", background: loading || !typingDone ? "#f4f5f9" : "#fff", fontFamily: "'Courier New', monospace", lineHeight: 1.6 }}
                  />
                  <button onClick={sendMessage} disabled={loading || !typingDone || !input.trim()}
                    style={{ background: loading || !typingDone || !input.trim() ? "#e4e6ef" : "#1a2340", color: loading || !typingDone || !input.trim() ? "#9099b4" : "#f4f5f9", border: "none", padding: "10px 18px", fontSize: "8px", letterSpacing: "0.22em", cursor: loading || !typingDone || !input.trim() ? "not-allowed" : "pointer", borderRadius: "3px", height: "fit-content" }}
                    onMouseOver={e => { if (!loading && typingDone && input.trim()) e.currentTarget.style.background = "#2c3e7a"; }}
                    onMouseOut={e => { if (!loading && typingDone && input.trim()) e.currentTarget.style.background = "#1a2340"; }}>
                    SUBMIT
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
