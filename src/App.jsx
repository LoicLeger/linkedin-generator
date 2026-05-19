import { useState } from "react";

const PRINCIPLES = [
  { id: "connaissance", label: "Connaissance", emoji: "📚", desc: "Partager un savoir technique ou réglementaire" },
  { id: "confiance", label: "Confiance", emoji: "🤝", desc: "Créer du lien, montrer ton humanité" },
  { id: "réussite", label: "Réussite", emoji: "🏆", desc: "Cas concret, résultat, transformation" },
];

const THEMES = [
  "Charges de copropriété", "Assemblée générale", "Travaux votés", "Syndic bénévole",
  "DPE collectif", "Rénovation énergétique", "Gestion des conflits", "Impayés",
  "Règlement de copropriété", "Fonds de travaux", "Contrat syndic", "Sinistre / assurance",
];

export default function App() {
  const [principle, setPrinciple] = useState("");
  const [theme, setTheme] = useState("");
  const [customTheme, setCustomTheme] = useState("");
  const [post, setPost] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [week] = useState(getCurrentWeek());

  function getCurrentWeek() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    return Math.ceil(((now - start) / 86400000 + start.getDay() + 1) / 7);
  }

  async function generatePost() {
    if (!principle || (!theme && !customTheme)) return;
    setLoading(true);
    setPost("");
    const finalTheme = customTheme || theme;
    const principleObj = PRINCIPLES.find(p => p.id === principle);

    const prompt = `Tu es un gestionnaire de copropriété avec 5 ans d'expérience, accessible et pédagogique. 
Tu écris un post LinkedIn en français basé sur le principe "${principleObj.label}" (${principleObj.desc}).
Le thème du post est : "${finalTheme}".

Règles STRICTES :
- Ton accessible, humain, pédagogique — jamais condescendant
- 150 à 220 mots maximum
- Commence par une accroche forte (1 phrase qui donne envie de lire)
- Structure claire : accroche → développement → enseignement ou appel à l'action
- Utilise des émojis avec parcimonie (2-3 max)
- Termine par une question ouverte pour engager la communauté
- PAS de hashtags génériques, 3 hashtags max très ciblés à la fin
- Pas de "En tant que gestionnaire..." en ouverture, sois original
- Le post doit refléter le principe "${principleObj.label}" de façon naturelle, pas forcée

Génère uniquement le post, sans introduction ni commentaire.`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      const raw = await res.text();
      let parsed;
      try {
        parsed = JSON.parse(raw);
      } catch {
        setPost("Erreur : réponse non-JSON reçue. Réessaie.");
        setLoading(false);
        return;
      }

      if (!res.ok) {
        setPost(`Erreur ${res.status} : ${parsed?.error?.message || raw}`);
        setLoading(false);
        return;
      }

      if (parsed?.error) {
        setPost(`Erreur API : ${parsed.error.message}`);
        setLoading(false);
        return;
      }

      const content = parsed?.content;
      if (Array.isArray(content)) {
        const text = content.filter(b => b.type === "text").map(b => b.text).join("");
        setPost(text.trim() || "Réponse vide, réessaie !");
      } else {
        setPost("Format de réponse inattendu. Réessaie !");
      }
    } catch (e) {
      setPost(`Erreur réseau : ${e.message}`);
    }
    setLoading(false);
  }

  function copyPost() {
    navigator.clipboard.writeText(post);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const canGenerate = principle && (theme || customTheme) && !loading;

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0a0a0f 0%, #0d1a2e 50%, #0a0a0f 100%)",
      fontFamily: "'Georgia', serif",
      color: "#e8e0d0",
    }}>
      <div style={{
        borderBottom: "1px solid rgba(196, 164, 100, 0.2)",
        padding: "32px 40px 24px",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "12px",
      }}>
        <div>
          <div style={{ fontSize: "11px", letterSpacing: "4px", color: "#c4a464", textTransform: "uppercase", marginBottom: "6px" }}>
            Générateur de contenu
          </div>
          <h1 style={{ margin: 0, fontSize: "clamp(22px, 4vw, 32px)", fontWeight: "normal", color: "#f0e8d8", letterSpacing: "-0.5px" }}>
            LinkedIn · Copropriété
          </h1>
        </div>
        <div style={{
          background: "rgba(196, 164, 100, 0.1)",
          border: "1px solid rgba(196, 164, 100, 0.3)",
          borderRadius: "6px",
          padding: "8px 16px",
          fontSize: "13px",
          color: "#c4a464",
          letterSpacing: "1px",
        }}>
          Semaine {week}
        </div>
      </div>

      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "40px 24px" }}>

        <div style={{ marginBottom: "36px" }}>
          <label style={{ display: "block", fontSize: "11px", letterSpacing: "3px", color: "#c4a464", textTransform: "uppercase", marginBottom: "16px" }}>
            01 — Principe du post
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
            {PRINCIPLES.map(p => (
              <button
                key={p.id}
                onClick={() => setPrinciple(p.id)}
                style={{
                  padding: "18px 12px",
                  border: principle === p.id ? "1px solid #c4a464" : "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  background: principle === p.id ? "rgba(196, 164, 100, 0.12)" : "rgba(255,255,255,0.03)",
                  color: principle === p.id ? "#f0e8d8" : "#9a9080",
                  cursor: "pointer",
                  textAlign: "center",
                  transition: "all 0.2s",
                  fontFamily: "'Georgia', serif",
                }}
              >
                <div style={{ fontSize: "22px", marginBottom: "6px" }}>{p.emoji}</div>
                <div style={{ fontWeight: "bold", fontSize: "14px", marginBottom: "4px" }}>{p.label}</div>
                <div style={{ fontSize: "11px", lineHeight: "1.4", opacity: 0.8 }}>{p.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: "36px" }}>
          <label style={{ display: "block", fontSize: "11px", letterSpacing: "3px", color: "#c4a464", textTransform: "uppercase", marginBottom: "16px" }}>
            02 — Thème
          </label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "16px" }}>
            {THEMES.map(t => (
              <button
                key={t}
                onClick={() => { setTheme(t); setCustomTheme(""); }}
                style={{
                  padding: "7px 14px",
                  border: theme === t ? "1px solid #c4a464" : "1px solid rgba(255,255,255,0.12)",
                  borderRadius: "20px",
                  background: theme === t ? "rgba(196, 164, 100, 0.12)" : "transparent",
                  color: theme === t ? "#f0e8d8" : "#7a7060",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontFamily: "'Georgia', serif",
                  transition: "all 0.2s",
                }}
              >
                {t}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Ou saisis un thème personnalisé…"
            value={customTheme}
            onChange={e => { setCustomTheme(e.target.value); setTheme(""); }}
            style={{
              width: "100%",
              padding: "12px 16px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "8px",
              color: "#e8e0d0",
              fontSize: "14px",
              fontFamily: "'Georgia', serif",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        <button
          onClick={generatePost}
          disabled={!canGenerate}
          style={{
            width: "100%",
            padding: "16px",
            background: canGenerate ? "linear-gradient(135deg, #c4a464, #a08040)" : "rgba(255,255,255,0.05)",
            border: "none",
            borderRadius: "8px",
            color: canGenerate ? "#0a0a0f" : "#4a4030",
            fontSize: "15px",
            fontFamily: "'Georgia', serif",
            fontWeight: "bold",
            letterSpacing: "1px",
            cursor: canGenerate ? "pointer" : "not-allowed",
            transition: "all 0.3s",
            marginBottom: "32px",
          }}
        >
          {loading ? "Génération en cours…" : "✦ Générer le post"}
        </button>

        {(loading || post) && (
          <div style={{
            border: "1px solid rgba(196, 164, 100, 0.25)",
            borderRadius: "10px",
            background: "rgba(196, 164, 100, 0.04)",
            overflow: "hidden",
          }}>
            <div style={{
              padding: "12px 20px",
              borderBottom: "1px solid rgba(196, 164, 100, 0.15)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}>
              <span style={{ fontSize: "11px", letterSpacing: "2px", color: "#c4a464", textTransform: "uppercase" }}>
                Post généré
              </span>
              {post && !loading && (
                <button
                  onClick={copyPost}
                  style={{
                    background: copied ? "rgba(100, 196, 130, 0.15)" : "rgba(196, 164, 100, 0.15)",
                    border: `1px solid ${copied ? "rgba(100, 196, 130, 0.4)" : "rgba(196, 164, 100, 0.4)"}`,
                    borderRadius: "5px",
                    color: copied ? "#64c482" : "#c4a464",
                    padding: "5px 12px",
                    fontSize: "12px",
                    cursor: "pointer",
                    fontFamily: "'Georgia', serif",
                    transition: "all 0.2s",
                  }}
                >
                  {copied ? "✓ Copié !" : "Copier"}
                </button>
              )}
            </div>
            <div style={{ padding: "24px 20px" }}>
              {loading ? (
                <div style={{ color: "#6a6050", fontStyle: "italic", textAlign: "center", padding: "20px 0" }}>
                  ✦ &nbsp; Rédaction en cours…
                </div>
              ) : (
                <p style={{ margin: 0, lineHeight: "1.75", fontSize: "15px", whiteSpace: "pre-wrap", color: "#d8d0c0" }}>
                  {post}
                </p>
              )}
            </div>
          </div>
        )}

        <div style={{
          marginTop: "40px",
          paddingTop: "24px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          fontSize: "12px",
          color: "#4a4030",
          textAlign: "center",
          lineHeight: "1.6",
        }}>
          Conseil : poste le mardi ou mercredi matin entre 8h et 10h pour maximiser ta portée.
        </div>
      </div>
    </div>
  );
}
