import { useMemo, useState } from "react";

/* PSS · Séance Psychologique — version complète à coller dans src/App.jsx */

const TROUBLES = {
  depression: { name: "Dépression", short: "DEP", color: "#378ADD" },
  ptsd: { name: "Stress post-traumatique", short: "TSPT", color: "#BA7517" },
  anxiety: { name: "Trouble anxieux", short: "ANX", color: "#0F6E9A" },
  borderline: { name: "Trouble borderline", short: "BPD", color: "#993556" },
  bipolar: { name: "Trouble bipolaire", short: "BIP", color: "#3B6D11" },
  ocd: { name: "TOC", short: "TOC", color: "#0F6E56" },
  schizo: { name: "Trouble psychotique", short: "PSY", color: "#A32D2D" },
  tdi: { name: "Dissociation / TDI", short: "DIS", color: "#534AB7" },
  addiction: { name: "Addiction / dépendance", short: "ADD", color: "#6B3A0F" },
  risk: { name: "Risque suicidaire / auto-agressif", short: "RISK", color: "#B00020" },
};

const SESSION_TYPES = ["1ère séance", "2ème séance", "3ème séance", "Suivi", "Urgence"];

const SESSION_STRUCTURE = {
  "1ère séance": ["Accueil", "Motif", "Antécédents", "État émotionnel", "Plan d'aide"],
  "2ème séance": ["Bilan", "Évolution", "Exercices", "Ajustement"],
  "3ème séance": ["Bilan", "Prévention", "Objectifs", "Suite"],
  Suivi: ["Bilan", "Évolution", "Difficultés", "Ajustements"],
  Urgence: ["Sécurité", "Risque", "Protection", "Plan de crise"],
};

const SYMPTOM_CATEGORIES = [
  {
    id: "humeur",
    title: "Humeur / émotions",
    icon: "🌧️",
    items: [
      { id: "d1", l: "Tristesse persistante", w: { depression: 3, ptsd: 1 } },
      { id: "d2", l: "Perte d'intérêt / plaisir", w: { depression: 3 } },
      { id: "d3", l: "Fatigue intense", w: { depression: 2, anxiety: 1, ptsd: 1 } },
      { id: "d4", l: "Culpabilité / honte", w: { depression: 2, ptsd: 2 } },
      { id: "bl5", l: "Vide intérieur", w: { borderline: 2, depression: 1 } },
      { id: "b2", l: "Alternance émotionnelle forte", w: { bipolar: 2, borderline: 2 } },
    ],
  },
  {
    id: "corps",
    title: "Réactions corporelles",
    icon: "💓",
    items: [
      { id: "a1", l: "Crises d'angoisse / panique", w: { anxiety: 3, ptsd: 1 } },
      { id: "p4", l: "Hypervigilance / sursauts", w: { ptsd: 3, anxiety: 1 } },
      { id: "d6", l: "Troubles du sommeil", w: { depression: 1, ptsd: 2, bipolar: 1, anxiety: 1 } },
      { id: "som1", l: "Tremblements / palpitations", w: { anxiety: 2, ptsd: 1 } },
      { id: "som2", l: "Tension corporelle / agitation", w: { anxiety: 2, ptsd: 1, bipolar: 1 } },
    ],
  },
  {
    id: "souvenirs",
    title: "Souvenirs / vécu traumatique",
    icon: "⚡",
    items: [
      { id: "p1", l: "Événement marquant ou traumatisant", w: { ptsd: 3, tdi: 1 } },
      { id: "p2", l: "Flashbacks / cauchemars", w: { ptsd: 3 } },
      { id: "p3", l: "Évitement des souvenirs / lieux / personnes", w: { ptsd: 2, anxiety: 1 } },
      { id: "t4", l: "Trauma répété ou ancien", w: { ptsd: 2, tdi: 2, borderline: 1 } },
    ],
  },
  {
    id: "pensees",
    title: "Pensées / perception",
    icon: "🧠",
    items: [
      { id: "o1", l: "Pensées intrusives répétées", w: { ocd: 3, anxiety: 1, ptsd: 1 } },
      { id: "o2", l: "Rituels / besoin de vérifier", w: { ocd: 3 } },
      { id: "s1", l: "Voix / hallucinations", w: { schizo: 3, tdi: 1, ptsd: 1 } },
      { id: "s2", l: "Idées délirantes / persécution", w: { schizo: 3 } },
      { id: "s3", l: "Discours ou pensée désorganisée", w: { schizo: 2, tdi: 1 } },
    ],
  },
  {
    id: "comportements",
    title: "Comportements observés",
    icon: "👁️",
    items: [
      { id: "beh1", l: "Repli / isolement", w: { depression: 2, ptsd: 1, schizo: 1 } },
      { id: "beh2", l: "Évitement / fuite", w: { anxiety: 2, ptsd: 2 } },
      { id: "beh3", l: "Impulsivité / réactions fortes", w: { borderline: 3, bipolar: 1 } },
      { id: "beh4", l: "Sur-adaptation / masque émotionnel", w: { ptsd: 1, depression: 1, borderline: 1 } },
      { id: "beh5", l: "Difficulté à poser des limites", w: { borderline: 2, anxiety: 1 } },
    ],
  },
  {
    id: "relations",
    title: "Relations / attachement",
    icon: "🫂",
    items: [
      { id: "bl1", l: "Peur de l'abandon / rejet", w: { borderline: 3, anxiety: 1 } },
      { id: "bl2", l: "Relations instables / conflictuelles", w: { borderline: 3 } },
      { id: "rel1", l: "Besoin excessif de validation", w: { borderline: 2, depression: 1 } },
      { id: "rel2", l: "Méfiance envers les autres", w: { ptsd: 2, anxiety: 1, schizo: 1 } },
    ],
  },
  {
    id: "energie",
    title: "Énergie / rythme",
    icon: "📈",
    items: [
      { id: "b1", l: "Énergie excessive soudaine", w: { bipolar: 3 } },
      { id: "b3", l: "Grandiosité / dépenses / projets multiples", w: { bipolar: 3 } },
      { id: "ene1", l: "Baisse forte de motivation", w: { depression: 2 } },
      { id: "ene2", l: "Surinvestissement / difficulté à s'arrêter", w: { anxiety: 1, bipolar: 1 } },
    ],
  },
  {
    id: "dissociation",
    title: "Mémoire / dissociation",
    icon: "🧩",
    items: [
      { id: "t1", l: "Amnésies / trous noirs", w: { tdi: 3, ptsd: 1 } },
      { id: "t2", l: "Impression de plusieurs identités", w: { tdi: 3 } },
      { id: "t3", l: "Dépersonnalisation / déréalisation", w: { tdi: 2, ptsd: 1 } },
      { id: "diss1", l: "Sensation d'être déconnecté de soi", w: { tdi: 2, ptsd: 1, depression: 1 } },
    ],
  },
  {
    id: "risque",
    title: "Sécurité / risque",
    icon: "🚨",
    danger: true,
    items: [
      { id: "d5", l: "Idées suicidaires / pensées de mort", w: { depression: 2, borderline: 2, bipolar: 1, risk: 4 } },
      { id: "risk1", l: "Plan / moyens disponibles", w: { risk: 5 } },
      { id: "risk2", l: "Isolement / absence personne ressource", w: { risk: 3 } },
      { id: "bl3", l: "Automutilation / conduite à risque", w: { borderline: 3, risk: 4 } },
    ],
  },
  {
    id: "addiction",
    title: "Consommation / dépendance",
    icon: "🧪",
    items: [
      { id: "ad1", l: "Consommation pour calmer / oublier", w: { addiction: 3, ptsd: 1, depression: 1 } },
      { id: "ad2", l: "Envies fortes / perte de contrôle", w: { addiction: 3 } },
      { id: "ad3", l: "Tentatives d'arrêt difficiles", w: { addiction: 2 } },
    ],
  },
];

const SYMPTOMS = SYMPTOM_CATEGORIES.flatMap((c) => c.items.map((i) => ({ ...i, cat: c.id })));

const OPENING_QS = {
  "1ère séance": [
    "Qu'est-ce qui vous amène aujourd'hui ?",
    "Depuis quand cela vous pèse-t-il ?",
    "Y a-t-il eu un déclencheur récent ?",
    "Avez-vous des antécédents médicaux / psychologiques ?",
    "Avez-vous un traitement en cours ?",
  ],
  "2ème séance": ["Depuis la dernière fois, comment ça va ?", "Exercices réalisés ?", "Moments difficiles cette semaine ?"],
  "3ème séance": ["Qu'est-ce qui a fonctionné ?", "Qu'est-ce qui reste difficile ?", "Changements dans le quotidien ?"],
  Suivi: ["Bilan depuis la dernière séance ?", "Progrès ou difficultés notables ?", "Nouveaux éléments à aborder ?"],
  Urgence: ["Vous sentez-vous en sécurité maintenant ?", "Pensées suicidaires / auto-agressives aujourd'hui ?", "Plan ou moyens disponibles ?"],
};

const DYNAMIC_QS = {
  d5: { label: "Idées suicidaires", qs: ["Plan précis ?", "Moyens disponibles ?", "Tentative passée ?", "Personne ressource ?"] },
  risk1: { label: "Risque immédiat", qs: ["Quels moyens sont accessibles ?", "Peut-on les éloigner maintenant ?", "Qui peut rester avec vous ?"] },
  bl3: { label: "Automutilation / impulsivité", qs: ["Fréquence ?", "Déclencheur principal ?", "Ce qui aide à redescendre ?"] },
  p2: { label: "Flashbacks / cauchemars", qs: ["Fréquence ?", "Déclencheurs ?", "Comment la personne gère ?"] },
  s1: { label: "Voix / hallucinations", qs: ["Que disent les voix / perceptions ?", "Ordres ou menaces ?", "Depuis quand ?"] },
  t1: { label: "Amnésies", qs: ["Durée des épisodes ?", "Ce que les autres rapportent ?", "Objets / notes inconnus ?"] },
};

const GUIDE = {
  depression: {
    flag: null,
    reco: "Suivi psychologique recommandé, journal d'humeur et reprise progressive d'activités positives.",
    exercises: ["Activation comportementale", "Identifier une pensée négative automatique", "Auto-bienveillance", "Cohérence cardiaque 5/5 3 min"],
    homework: ["Journal d'humeur matin/soir", "Une activité plaisante par jour", "Rythme de sommeil régulier", "Contacter une personne de confiance"],
  },
  ptsd: {
    flag: null,
    reco: "Suivi recommandé autour du stress post-traumatique, ancrage et repérage des déclencheurs.",
    exercises: ["Ancrage 5-4-3-2-1", "Cohérence cardiaque 5/5 3 min", "Relaxation musculaire progressive", "Psychoéducation post-trauma"],
    homework: ["Journal des déclencheurs", "Respiration 2×/jour", "Objet ou lieu sécurisant identifié"],
  },
  borderline: {
    flag: "Évaluer immédiatement idées suicidaires et automutilation si présents.",
    reco: "Suivi rapproché recommandé, plan de crise et travail sur la régulation émotionnelle.",
    exercises: ["TIPP", "Mindfulness", "Identifier émotion avant impulsion", "Ancrage sensoriel"],
    homework: ["Journal émotionnel", "Plan de crise écrit", "Pratiquer une compétence par jour"],
  },
  bipolar: {
    flag: null,
    reco: "Suivi spécialisé conseillé si alternance nette des phases hautes/basses, surveillance sommeil et humeur.",
    exercises: ["Baromètre d'humeur", "Signaux avant-coureurs", "Psychoéducation cycles / rythme"],
    homework: ["Journal humeur + sommeil", "Rythme de vie stable", "Limiter alcool / substances"],
  },
  tdi: {
    flag: "Progressivité : ne pas forcer l'accès aux parties.",
    reco: "Suivi progressif recommandé, stabilisation et ancrage en priorité.",
    exercises: ["Ancrage 5-4-3-2-1", "Journal de co-conscience", "Lieu sûr intérieur", "Respiration consciente"],
    homework: ["Journal commun", "Noter épisodes d'amnésie", "Ancrage aux premiers signes"],
  },
  schizo: {
    flag: "Orientation psychiatrique recommandée pour évaluation spécialisée.",
    reco: "Évaluation psychiatrique recommandée en cas de perceptions non partagées ou pensée désorganisée.",
    exercises: ["Psychoéducation douce", "Ancrage pendant hallucinations", "Restructuration légère", "Objectif social concret"],
    homework: ["Journal hallucinations", "Objectif social hebdomadaire", "Noter prise / oublis traitement"],
  },
  ocd: {
    flag: null,
    reco: "Suivi recommandé autour du cercle obsession-compulsion, exercices gradués sans forcer.",
    exercises: ["Psychoéducation cercle TOC", "EPR légère", "Défusion cognitive", "Technique du nuage"],
    homework: ["Journal obsessions", "Retarder un rituel de 5 min", "Défusion quotidienne"],
  },
  anxiety: {
    flag: null,
    reco: "Suivi anxiété recommandé, respiration guidée et journal des crises.",
    exercises: ["Respiration carrée", "Ancrage corporel", "Déconstruction pensée catastrophique"],
    homework: ["Respiration avant situations craintes", "Journal des crises", "Échelle anxiété quotidienne"],
  },
  addiction: {
    flag: null,
    reco: "Suivi recommandé pour repérer la fonction de la consommation et préparer une réduction sécurisée.",
    exercises: ["Analyse fonctionnelle ABC", "Plan déclencheurs", "Échelle motivationnelle"],
    homework: ["Journal des envies", "Retarder 10 min", "Activité de remplacement"],
  },
  risk: {
    flag: "Priorité sécurité : plan/moyens/intentions, personne ressource, non-isolement.",
    reco: "Priorité à la sécurisation immédiate, non-isolement et réévaluation rapprochée.",
    exercises: ["Sécurisation immédiate", "Identifier personne ressource", "Plan de crise simple"],
    homework: ["Éviter isolement en crise", "Contacter proche / soutien", "Éloigner moyens dangereux"],
  },
};

const todayFR = () => new Date().toLocaleDateString("fr-FR");
const isoDate = () => new Date().toISOString().slice(0, 10);

function computeScores(checkedMap) {
  const base = Object.fromEntries(Object.keys(TROUBLES).map((k) => [k, 0]));
  SYMPTOMS.forEach((s) => {
    if (checkedMap[s.id]) {
      Object.entries(s.w).forEach(([k, w]) => {
        base[k] = (base[k] || 0) + w;
      });
    }
  });
  return base;
}

function rank(scores) {
  return Object.entries(scores).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]);
}

function Section({ title, right, children }) {
  return (
    <section style={styles.card}>
      <div style={styles.cardHead}>
        <h3 style={styles.h3}>{title}</h3>
        {right}
      </div>
      {children}
    </section>
  );
}

function Field({ label, helper, children }) {
  return (
    <label style={styles.field}>
      <span style={styles.label}>{label}</span>
      {helper && <span style={styles.helper}>{helper}</span>}
      {children}
    </label>
  );
}

function QAItem({ q, state, onCheck, onChange }) {
  return (
    <div style={styles.qaItem}>
      <label style={styles.qaLabel}>
        <input type="checkbox" checked={!!state?.checked} onChange={(e) => onCheck(e.target.checked)} />
        <span>{q}</span>
      </label>
      <textarea value={state?.answer || ""} onChange={(e) => onChange(e.target.value)} placeholder="Réponse courte du patient…" style={styles.textareaAnswer} rows={2} />
    </div>
  );
}

export default function App() {
  const [patient, setPatient] = useState("");
  const [psy, setPsy] = useState("");
  const [date, setDate] = useState(isoDate());
  const [stype, setStype] = useState("1ère séance");
  const [motif, setMotif] = useState("");
  const [accompagnant, setAccompagnant] = useState("");

  const [etatEmotionnel, setEtatEmotionnel] = useState("");
  const [comportement, setComportement] = useState("");
  const [observation, setObservation] = useState("");
  const [recommandation, setRecommandation] = useState("");
  const [commentaire, setCommentaire] = useState("");

  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState("humeur");
  const [symChecked, setSymChecked] = useState({});
  const [qaState, setQaState] = useState({});
  const [exState, setExState] = useState({});
  const [hwState, setHwState] = useState({});
  const [notes, setNotes] = useState("");

  const scores = useMemo(() => computeScores(symChecked), [symChecked]);
  const ranked = useMemo(() => rank(scores), [scores]);
  const maxScore = Math.max(...Object.values(scores), 1);
  const topKey = ranked[0]?.[0] || null;
  const guide = topKey ? GUIDE[topKey] : null;
  const showRisk = scores.risk >= 1;

  const checkedSymptoms = useMemo(() => SYMPTOMS.filter((s) => symChecked[s.id]).map((s) => s.l), [symChecked]);
  const activeDyn = useMemo(() => Object.entries(DYNAMIC_QS).filter(([id]) => symChecked[id]).map(([id, d]) => ({ id, ...d })), [symChecked]);

  const visibleCategories = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return SYMPTOM_CATEGORIES;
    return SYMPTOM_CATEGORIES.map((cat) => ({ ...cat, items: cat.items.filter((item) => item.l.toLowerCase().includes(q)) })).filter((cat) => cat.items.length > 0);
  }, [search]);

  const currentCat = visibleCategories.find((c) => c.id === activeCat) || visibleCategories[0] || SYMPTOM_CATEGORIES[0];
  const structure = SESSION_STRUCTURE[stype] || [];

  const toggleSym = (id) => setSymChecked((p) => ({ ...p, [id]: !p[id] }));
  const setQA = (key, patch) => setQaState((p) => ({ ...p, [key]: { ...(p[key] || {}), ...patch } }));
  const toggleEx = (k) => setExState((p) => ({ ...p, [k]: !p[k] }));
  const toggleHw = (k) => setHwState((p) => ({ ...p, [k]: !p[k] }));

  const selectedExercises = guide?.exercises.filter((_, i) => exState[`ex_${topKey}_${i}`]) || [];
  const selectedHomework = guide?.homework.filter((_, i) => hwState[`hw_${topKey}_${i}`]) || [];

  const getQAReport = () => {
    const opening = (OPENING_QS[stype] || OPENING_QS.Suivi)
      .map((q, i) => {
        const s = qaState[`sq_${i}`] || {};
        if (!s.checked && !s.answer) return null;
        return `- ${q}${s.answer ? `\n  Réponse : ${s.answer}` : ""}`;
      })
      .filter(Boolean);

    const dyn = activeDyn.flatMap(({ id, label, qs }) => {
      const lines = qs
        .map((q, i) => {
          const s = qaState[`dyn_${id}_${i}`] || {};
          if (!s.checked && !s.answer) return null;
          return `- ${q}${s.answer ? `\n  Réponse : ${s.answer}` : ""}`;
        })
        .filter(Boolean);
      return lines.length ? [`${label} :`, ...lines] : [];
    });

    return { opening, dyn };
  };

  const generateDocumentation = () => {
    const orientation = topKey ? TROUBLES[topKey].name : "Non déterminée";
    const { opening, dyn } = getQAReport();

    return [
      "COMPTE RENDU PSYCHOLOGIQUE — PSS / SAMC",
      "====================================================",
      `Patient : ${patient || "Non renseigné"}`,
      `Date de la séance : ${date || todayFR()}`,
      `Psychologue en charge du suivi : ${psy || "Non renseigné"}`,
      `Type de séance : ${stype}`,
      `Motif de consultation : ${motif || "Non renseigné"}`,
      `Accompagnant / tiers présent : ${accompagnant || "Non renseigné"}`,
      "",
      "1. ÉTAT ÉMOTIONNEL",
      etatEmotionnel || "Non renseigné.",
      "",
      "2. COMPORTEMENT OBSERVÉ",
      comportement || "Non renseigné.",
      "",
      "3. SYMPTÔMES / SIGNES RELEVÉS",
      checkedSymptoms.length ? checkedSymptoms.map((s) => `- ${s}`).join("\n") : "Aucun symptôme coché.",
      "",
      "4. ORIENTATION CLINIQUE INDICATIVE",
      `Orientation principale suggérée par l'outil : ${orientation}.`,
      showRisk ? "⚠ Priorité sécurité : risque suicidaire / auto-agressif à explorer et sécuriser." : "Aucun indicateur de risque immédiat coché dans l'outil.",
      guide?.flag ? `Point de vigilance : ${guide.flag}` : "",
      "",
      "5. QUESTIONS ABORDÉES EN SÉANCE",
      opening.length ? opening.join("\n") : "Questions d'ouverture non renseignées.",
      dyn.length ? `\nQuestions complémentaires :\n${dyn.join("\n")}` : "",
      "",
      "6. OBSERVATION DU PSYCHOLOGUE",
      observation || notes || "Non renseigné.",
      "",
      "7. EXERCICES EFFECTUÉS / PROPOSÉS",
      selectedExercises.length ? selectedExercises.map((e) => `- ${e}`).join("\n") : "Aucun exercice coché en séance.",
      "",
      "8. RECOMMANDATIONS / EXERCICES À DOMICILE",
      recommandation || guide?.reco || "Non renseigné.",
      selectedHomework.length ? `\nExercices à domicile :\n${selectedHomework.map((h) => `- ${h}`).join("\n")}` : "",
      "",
      "9. COMMENTAIRE / SUIVI",
      commentaire || "Non renseigné.",
      "",
      "10. CONCLUSION",
      `Le patient a été reçu dans le cadre d'une ${stype.toLowerCase()}. Les éléments recueillis justifient ${showRisk ? "une vigilance immédiate et un suivi rapproché" : "la poursuite d'un suivi adapté à son état émotionnel et à son évolution"}.`,
      "====================================================",
    ].filter(Boolean).join("\n");
  };

  const samcRow = useMemo(() => {
    return [
      patient || "",
      date || "",
      psy || "",
      stype || "",
      etatEmotionnel || "",
      comportement || "",
      observation || notes || "",
      recommandation || guide?.reco || "",
      commentaire || "",
      
    ];
  }, [patient, date, psy, stype, etatEmotionnel, comportement, observation, notes, recommandation, guide, commentaire]);

  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("Copié dans le presse-papiers !");
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      alert("Copié dans le presse-papiers !");
    }
  };

  const copySamcRow = () => copyText(samcRow.join("\t"));
  const copyDocumentation = () => copyText(generateDocumentation());

  const exportTxt = () => {
    const blob = new Blob([generateDocumentation()], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `CR_PSS_${(patient || "patient").replace(/\s+/g, "_")}_${date || todayFR()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetAll = () => {
    setPatient("");
    setPsy("");
    setDate(isoDate());
    setStype("1ère séance");
    setMotif("");
    setAccompagnant("");
    setEtatEmotionnel("");
    setComportement("");
    setObservation("");
    setRecommandation("");
    setCommentaire("");
    setSearch("");
    setActiveCat("humeur");
    setSymChecked({});
    setQaState({});
    setExState({});
    setHwState({});
    setNotes("");
  };

  return (
    <div style={styles.wrap}>
      <header style={styles.header}>
        <div>
          <div style={styles.kicker}>SAMC · PSS</div>
          <h1 style={styles.h1}>Séance psychologique</h1>
          <p style={styles.headerP}>Interface rapide pour remplir la séance, générer la ligne tableau et le compte rendu complet.</p>
        </div>
        <div style={styles.headerRight}>
          <button style={styles.btnGhost} onClick={resetAll}>Réinitialiser</button>
          <button style={styles.btnSecondary} onClick={copyDocumentation}>Copier compte rendu</button>
          <button style={styles.btnPrimary} onClick={copySamcRow}>Copier ligne SAMC</button>
        </div>
      </header>

      <main style={styles.main}>
        <div>
          <Section title="1. Séance" right={<div style={styles.steps}>{structure.map((s, i) => <span key={s} style={styles.step}><b>{i + 1}</b>{s}</span>)}</div>}>
            <div style={styles.grid3}>
              <Field label="Nom et prénom"><input style={styles.input} value={patient} onChange={(e) => setPatient(e.target.value)} placeholder="Ex : Aaron Jones" /></Field>
              <Field label="Psychologue"><input style={styles.input} value={psy} onChange={(e) => setPsy(e.target.value)} placeholder="Ex : Dr. Lookman" /></Field>
              <Field label="Date"><input style={styles.input} type="date" value={date} onChange={(e) => setDate(e.target.value)} /></Field>
            </div>
            <div style={styles.grid3}>
              <Field label="Type de séance"><select style={styles.input} value={stype} onChange={(e) => setStype(e.target.value)}>{SESSION_TYPES.map((t) => <option key={t}>{t}</option>)}</select></Field>
              <Field label="Motif court"><input style={styles.input} value={motif} onChange={(e) => setMotif(e.target.value)} placeholder="Trauma, anxiété, deuil…" /></Field>
              <Field label="Accompagnant"><input style={styles.input} value={accompagnant} onChange={(e) => setAccompagnant(e.target.value)} placeholder="Non / nom du tiers" /></Field>
            </div>
          </Section>

          <Section title="2. Symptômes rapides" right={<span style={styles.counter}>{checkedSymptoms.length} coché(s)</span>}>
            <div style={styles.searchRow}>
              <input style={styles.input} value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un symptôme…" />
            </div>
            <div style={styles.symptomLayout}>
              <div style={styles.catList}>
                {visibleCategories.map((cat) => {
                  const count = cat.items.filter((i) => symChecked[i.id]).length;
                  return (
                    <button key={cat.id} onClick={() => setActiveCat(cat.id)} style={{ ...styles.catBtn, ...(currentCat.id === cat.id ? styles.catBtnActive : {}), ...(cat.danger ? styles.catDanger : {}) }}>
                      <span><b>{cat.icon} {cat.title}</b><small>{cat.desc}</small></span>
                      {count > 0 && <b style={styles.catCount}>{count}</b>}
                    </button>
                  );
                })}
              </div>
              <div style={styles.symptomPanel}>
                <div style={styles.panelTitle}>{currentCat.icon} {currentCat.title}</div>
                <p style={styles.panelDesc}>{currentCat.desc}</p>
                <div style={styles.chipsGrid}>
                  {currentCat.items.map((s) => (
                    <button key={s.id} onClick={() => toggleSym(s.id)} style={{ ...styles.symptomChip, ...(symChecked[s.id] ? styles.symptomChipOn : {}) }}>
                      <span style={styles.checkboxFake}>{symChecked[s.id] ? "✓" : ""}</span>
                      {s.l}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Section>

          <Section title={`3. Questions — ${stype}`}>
            {(OPENING_QS[stype] || OPENING_QS.Suivi).map((q, i) => (
              <QAItem key={i} q={q} state={qaState[`sq_${i}`]} onCheck={(val) => setQA(`sq_${i}`, { checked: val })} onChange={(val) => setQA(`sq_${i}`, { answer: val })} />
            ))}
          </Section>

          {activeDyn.length > 0 && (
            <Section title="4. Questions complémentaires déclenchées">
              {activeDyn.map(({ id, label, qs }) => (
                <div key={id} style={styles.dynBlock}>
                  <div style={styles.dynHead}>{label}</div>
                  {qs.map((q, i) => (
                    <QAItem key={i} q={q} state={qaState[`dyn_${id}_${i}`]} onCheck={(val) => setQA(`dyn_${id}_${i}`, { checked: val })} onChange={(val) => setQA(`dyn_${id}_${i}`, { answer: val })} />
                  ))}
                </div>
              ))}
            </Section>
          )}

          <Section title="5. Notes libres">
            <textarea style={styles.notes} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes cliniques libres, éléments marquants, contexte RP…" />
          </Section>

          <Section title="6. Cases du tableau SAMC PSS">
            <p style={styles.help}>À remplir après les symptômes et les réponses. Ces champs servent à générer la ligne du tableau PSS.</p>
            <div style={styles.grid2}>
              <Field label="État émotionnel" helper="Ressenti dominant du patient : anxieux, triste, stable, sidéré…"><textarea style={styles.textarea} value={etatEmotionnel} onChange={(e) => setEtatEmotionnel(e.target.value)} placeholder="Ex : anxieux mais stable, triste, lucide…" /></Field>
              <Field label="Comportement observé" helper="Ce qu'on voit en séance : agitation, retrait, hypervigilance, coopération…"><textarea style={styles.textarea} value={comportement} onChange={(e) => setComportement(e.target.value)} placeholder="Ex : hypervigilant, calme, évitant, agité…" /></Field>
              <Field label="Observation du psychologue" helper="Analyse clinique courte / hypothèse / éléments importants"><textarea style={styles.textarea} value={observation} onChange={(e) => setObservation(e.target.value)} placeholder="Ex : symptômes évocateurs d'un stress post-traumatique…" /></Field>
              <Field label="Recommandation" helper="Conseils, exercices, suivi conseillé, orientation"><textarea style={styles.textarea} value={recommandation} onChange={(e) => setRecommandation(e.target.value)} placeholder="Ex : suivi recommandé, exercices d'ancrage, journal émotionnel…" /></Field>
            </div>
            <Field label="Commentaire" helper="Conclusion pratique de séance : implication du patient, suite prévue, point à surveiller, questionnaire, fin de suivi…"><textarea style={styles.textareaWide} value={commentaire} onChange={(e) => setCommentaire(e.target.value)} placeholder="Ex : récit complet réalisé, patient coopératif, exercices mis en place, point à refaire / questionnaire prévu…" /></Field>
          </Section>
        </div>

        <aside style={styles.aside}>
          <Section title="Orientation" right={topKey ? <span style={{ ...styles.badge, color: TROUBLES[topKey].color, borderColor: TROUBLES[topKey].color }}>{TROUBLES[topKey].short}</span> : null}>
            {showRisk && <div style={styles.alertDanger}>Priorité sécurité : risque à explorer immédiatement.</div>}
            {topKey ? <div style={styles.alertInfo}>Orientation principale : <b>{TROUBLES[topKey].name}</b></div> : <div style={styles.alertMuted}>Coche des signes par catégories pour obtenir une orientation.</div>}
            {guide?.flag && <div style={styles.alertWarn}>{guide.flag}</div>}
            {ranked.slice(0, 4).map(([k, v]) => {
              const d = TROUBLES[k];
              const pct = Math.round((v / maxScore) * 100);
              return (
                <div key={k} style={styles.scoreLine}>
                  <div style={styles.scoreHead}><span>{d.name}</span><small>{v} pts</small></div>
                  <div style={styles.bar}><div style={{ ...styles.fill, width: `${pct}%`, background: d.color }} /></div>
                </div>
              );
            })}
          </Section>

          {guide && (
            <Section title="Exercices proposés">
              <p style={styles.muted}>Séance</p>
              {guide.exercises.map((e, i) => {
                const k = `ex_${topKey}_${i}`;
                return <label key={k} style={styles.checkLine}><input type="checkbox" checked={!!exState[k]} onChange={() => toggleEx(k)} />{e}</label>;
              })}
              <p style={styles.muted}>Maison</p>
              {guide.homework.map((h, i) => {
                const k = `hw_${topKey}_${i}`;
                return <label key={k} style={styles.checkLine}><input type="checkbox" checked={!!hwState[k]} onChange={() => toggleHw(k)} />{h}</label>;
              })}
            </Section>
          )}

          <Section title="Compte rendu">
            <pre style={styles.reportBox}>{generateDocumentation()}</pre>
            <div style={styles.actionRow}>
              <button style={styles.btnSecondary} onClick={copyDocumentation}>Copier</button>
              <button style={styles.btnGhostDark} onClick={exportTxt}>Exporter .txt</button>
            </div>
          </Section>

          <Section title="Ligne tableau SAMC">
            <div style={styles.tablePreview}>
              <b>Nom et Prénom</b><span>{patient || "—"}</span>
              <b>Date</b><span>{date || "—"}</span>
              <b>Psychologue</b><span>{psy || "—"}</span>
              <b>Type</b><span>{stype}</span>
              <b>État émotionnel</b><span>{etatEmotionnel || "—"}</span>
              <b>Comportement</b><span>{comportement || "—"}</span>
              <b>Observation</b><span>{observation || notes || "—"}</span>
              <b>Recommandation</b><span>{recommandation || guide?.reco || "—"}</span>
              <b>Commentaire</b><span>{commentaire || "—"}</span>
              <b>Documentation</b><span>Compte rendu complet généré</span>
            </div>
            <button style={styles.btnPrimaryFull} onClick={copySamcRow}>Copier la ligne complète</button>
            <p style={styles.help}>À coller directement dans ton tableau : chaque colonne se remplit automatiquement.</p>
          </Section>
        </aside>
      </main>
    </div>
  );
}

const styles = {
  wrap: { fontFamily: "Inter, system-ui, Arial, sans-serif", color: "#2d161e", background: "#f5eee8", minHeight: "100vh" },
  header: { position: "sticky", top: 0, zIndex: 10, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 22px", background: "linear-gradient(135deg, #2d161e, #4c0f2e)", color: "white", boxShadow: "0 8px 24px rgba(45,22,30,.20)" },
  kicker: { fontSize: 12, letterSpacing: ".12em", textTransform: "uppercase", color: "#e1c4b6", fontWeight: 700 },
  h1: { margin: "2px 0", fontSize: 24, lineHeight: 1.1 },
  headerP: { margin: 0, color: "#f1ddd4", fontSize: 13 },
  headerRight: { display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" },
  main: { maxWidth: 1440, margin: "0 auto", padding: 20, display: "grid", gridTemplateColumns: "minmax(0, 1.08fr) minmax(420px, .92fr)", gap: 18 },
  aside: { position: "sticky", top: 92, alignSelf: "start" },
  card: { background: "rgba(255,250,246,.92)", border: "1px solid #dcc7bd", borderRadius: 20, padding: 16, boxShadow: "0 10px 26px rgba(45,22,30,.08)", marginBottom: 16 },
  cardHead: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 12 },
  h3: { margin: 0, fontSize: 17, color: "#4c0f2e" },
  grid3: { display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12, marginBottom: 12 },
  grid2: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 },
  field: { display: "flex", flexDirection: "column", gap: 6, marginTop: 10 },
  label: { fontSize: 12, color: "#7a6468", fontWeight: 800 },
  helper: { fontSize: 11, color: "#9c8187", lineHeight: 1.35 },
  input: { width: "100%", boxSizing: "border-box", padding: "11px 12px", border: "1px solid #d7bfb4", borderRadius: 12, background: "white", color: "#2d161e", fontSize: 14, outline: "none" },
  textarea: { width: "100%", boxSizing: "border-box", minHeight: 88, padding: "10px 12px", border: "1px solid #d7bfb4", borderRadius: 12, background: "white", color: "#2d161e", fontSize: 14, resize: "vertical" },
  textareaWide: { width: "100%", boxSizing: "border-box", minHeight: 80, padding: "10px 12px", border: "1px solid #d7bfb4", borderRadius: 12, background: "white", color: "#2d161e", fontSize: 14, resize: "vertical" },
  notes: { width: "100%", boxSizing: "border-box", minHeight: 120, padding: 12, border: "1px solid #d7bfb4", borderRadius: 14, background: "white", fontSize: 14, resize: "vertical" },
  steps: { display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" },
  step: { display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 10px", borderRadius: 999, background: "#ead3c8", color: "#3b1a25", fontSize: 12, whiteSpace: "nowrap" },
  searchRow: { marginBottom: 12 },
  counter: { fontSize: 12, fontWeight: 800, background: "#4c0f2e", color: "white", borderRadius: 999, padding: "5px 9px" },
  symptomLayout: { display: "grid", gridTemplateColumns: "255px 1fr", gap: 12 },
  catList: { display: "flex", flexDirection: "column", gap: 8 },
  catBtn: { border: "1px solid #e3d0c7", background: "#fff", color: "#3b1a25", borderRadius: 14, padding: "10px 11px", textAlign: "left", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, fontWeight: 700 },
  catBtnActive: { background: "#4c0f2e", color: "white", borderColor: "#4c0f2e", boxShadow: "0 8px 18px rgba(76,15,46,.18)" },
  catDanger: { borderColor: "#e6a8b0" },
  catCount: { minWidth: 22, height: 22, borderRadius: 999, background: "rgba(255,255,255,.28)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 12 },
  symptomPanel: { border: "1px solid #eadbd5", background: "#fff", borderRadius: 16, padding: 14 },
  panelTitle: { fontWeight: 900, color: "#4c0f2e", marginBottom: 4, fontSize: 20 },
  panelDesc: { marginTop: 0, color: "#7a6468", fontSize: 13 },
  chipsGrid: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 },
  symptomChip: { border: "1px solid #e0cbc2", background: "#fffaf6", borderRadius: 14, padding: "11px 12px", display: "flex", alignItems: "center", gap: 9, textAlign: "left", cursor: "pointer", color: "#2d161e", fontWeight: 700, minHeight: 50 },
  symptomChipOn: { background: "#efe0e7", borderColor: "#4c0f2e", color: "#4c0f2e" },
  checkboxFake: { width: 20, height: 20, flex: "0 0 20px", borderRadius: 6, background: "#f1e4dd", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 900 },
  qaItem: { marginBottom: 10, padding: 10, borderRadius: 14, border: "1px solid #eadbd5", background: "white" },
  qaLabel: { display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 8, fontWeight: 700 },
  textareaAnswer: { display: "block", width: "100%", boxSizing: "border-box", minHeight: 46, resize: "vertical", fontSize: 13, padding: "8px 10px", border: "1px solid #d8c2b8", borderRadius: 10, background: "#fbfbfb", color: "#222", lineHeight: 1.5 },
  dynBlock: { marginBottom: 12 },
  dynHead: { fontSize: 12, fontWeight: 900, color: "#4c0f2e", textTransform: "uppercase", letterSpacing: ".05em", padding: "7px 10px", background: "#efe3dc", borderRadius: 10, marginBottom: 8 },
  badge: { border: "1px solid", borderRadius: 999, padding: "5px 9px", fontSize: 12, fontWeight: 900, background: "white" },
  alertDanger: { background: "#f7d7dc", color: "#8a1f2d", border: "1px solid #dfaab3", borderRadius: 14, padding: 11, marginBottom: 9, fontSize: 14, fontWeight: 800 },
  alertWarn: { background: "#f8ead8", color: "#8d4e11", border: "1px solid #e6c89f", borderRadius: 14, padding: 11, marginBottom: 9, fontSize: 14 },
  alertInfo: { background: "#dff0e8", color: "#2e6b4f", border: "1px solid #add5c1", borderRadius: 14, padding: 11, marginBottom: 9, fontSize: 14 },
  alertMuted: { background: "#eee3dc", color: "#6f5a5f", border: "1px solid #dcc8bf", borderRadius: 14, padding: 11, marginBottom: 9, fontSize: 14 },
  scoreLine: { margin: "10px 0" },
  scoreHead: { display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 5, color: "#4c0f2e", fontWeight: 800 },
  bar: { height: 8, background: "#eadbd5", borderRadius: 999, overflow: "hidden" },
  fill: { height: "100%", width: "0%", transition: "width .2s ease" },
  muted: { margin: "10px 0 6px", color: "#7a6468", fontSize: 12, fontWeight: 900, textTransform: "uppercase" },
  checkLine: { display: "flex", alignItems: "center", gap: 8, background: "white", border: "1px solid #eadbd5", borderRadius: 12, padding: 10, marginBottom: 7, fontSize: 14, cursor: "pointer" },
  tablePreview: { display: "grid", gridTemplateColumns: "140px 1fr", gap: "8px 10px", fontSize: 13, background: "white", border: "1px solid #eadbd5", borderRadius: 14, padding: 12, marginBottom: 10 },
  help: { margin: "8px 0 12px", fontSize: 12, color: "#7a6468" },
  reportBox: { whiteSpace: "pre-wrap", background: "white", border: "1px solid #d8c2b8", borderRadius: 14, padding: 12, maxHeight: 390, overflow: "auto", fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace", fontSize: 12, lineHeight: 1.55 },
  actionRow: { display: "flex", gap: 8, marginTop: 10 },
  btnPrimary: { border: "none", borderRadius: 14, padding: "11px 15px", background: "#b20d5d", color: "white", fontWeight: 900, cursor: "pointer" },
  btnPrimaryFull: { width: "100%", border: "none", borderRadius: 14, padding: "12px 15px", background: "#b20d5d", color: "white", fontWeight: 900, cursor: "pointer" },
  btnSecondary: { border: "none", borderRadius: 14, padding: "11px 15px", background: "#7a4357", color: "white", fontWeight: 900, cursor: "pointer" },
  btnGhost: { border: "1px solid rgba(255,255,255,.28)", borderRadius: 14, padding: "11px 15px", background: "rgba(255,255,255,.18)", color: "white", fontWeight: 900, cursor: "pointer" },
  btnGhostDark: { border: "1px solid #cbb4aa", borderRadius: 14, padding: "11px 15px", background: "white", color: "#4c0f2e", fontWeight: 900, cursor: "pointer" },
};
