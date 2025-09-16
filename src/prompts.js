// Module de construction de prompts sophistiqués (FR) pour génération d'horoscopes.
// Export : buildPrompt({ style, sign, gender, birthDate, length })
// Styles disponibles: "default", "romantique", "pragmatique", "humoristique", "spirituel", "carriere"
// length: "short" | "medium" | "long"
// Usage: const { buildPrompt } = require('./prompts'); const prompt = buildPrompt({...});

const SCHEMA_INSTRUCTION = `
Réponds strictement en JSON valide. Objet attendu:
{
  "daily": "<1-3 phrases en français>",
  "weekly": "<1-3 phrases en français>",
  "monthly": "<1-3 phrases en français>",
  "tip": "<1 phrase pratique et courte en français>"
}
Ne fournis aucun texte hors de ce JSON. Si tu ajoutes des guillemets échappés, assure-toi que le JSON reste valide.
`;

const SAFETY_CONSTRAINTS = `
Contraintes de sécurité :
- N'offre jamais de conseils médicaux, juridiques, fiscaux ou d'investissement.
- Ne demande ni ne révèle d'informations personnelles sensibles.
- N'affirme jamais des faits vérifiables qui pourraient être faux (évite les dates/événements factuels non vérifiés).
- Sois bienveillant·e, réaliste et évite les promesses absolues.
`;

function buildFewShotExamples(style) {
  // Quelques exemples courts (FR) pour guider le modèle vers un JSON propre.
  // On fournit 2 exemples simples adaptables.
  const ex1 = {
    daily: "Aujourd'hui, tu te sens motivé·e et prêt·e à avancer sur un petit projet; profite de l'élan.",
    weekly: "Semaine active: des opportunités sociales apparaissent, privilégie l'écoute.",
    monthly: "Mois favorable aux fondations durables: planifie et établis des priorités.",
    tip: "Note une tâche réalisable chaque matin."
  };
  const ex2 = {
    daily: "Énergie modérée: prends le temps d'organiser ta journée avant d'agir.",
    weekly: "Des discussions importantes pourraient survenir; prépare tes arguments avec calme.",
    monthly: "Période de réévaluation: revois tes objectifs à moyen terme.",
    tip: "Respire profondément avant une décision majeure."
  };

  // Adapter le style en modifiant légèrement le langage ; on laisse le JSON inchangé
  if (style === "romantique") {
    ex1.daily = "Aujourd'hui, une attention tendre pourrait rapprocher quelqu'un de toi; laisse parler ton coeur.";
    ex2.weekly = "Les sentiments s'approfondissent; exprime ta vulnérabilité avec douceur.";
  } else if (style === "humoristique") {
    ex1.daily = "Ton magnétisme fait mouche — attention à ne pas déclencher une émeute d'admirateurs·rices.";
    ex2.weekly = "Semaine piquante: garde ton sens de l'humour pour désamorcer les quiproquos.";
  } else if (style === "pragmatique") {
    ex1.daily = "Fais une liste priorisée: une tâche terminée vaut mieux que dix idées.",
    ex2.weekly = "Semaine productive si tu délègues ce qui te pèse.",
  } else if (style === "spirituel") {
    ex1.daily = "Écoute ton intuition: un petit signe pourrait te guider.",
    ex2.weekly = "Temps de recueillement: prends un moment pour te recentrer.",
  } else if (style === "carriere") {
    ex1.daily = "Montre tes compétences avec humilité; un collègue remarquera ton travail.",
    ex2.weekly = "Semaine propice aux propositions: sois prêt·e à défendre une idée claire.",
  }

  return [
    `Exemple 1 (JSON attendu):\n${JSON.stringify(ex1, null, 2)}`,
    `Exemple 2 (JSON attendu):\n${JSON.stringify(ex2, null, 2)}`
  ].join("\n\n");
}

function buildIntro({ sign, gender, birthDate }) {
  const dob = birthDate ? new Date(birthDate).toISOString().split("T")[0] : "inconnue";
  const genderText = gender || "neutre";
  return `Données: signe="${sign}", date_de_naissance="${dob}", genre="${genderText}". Rédige en français.`;
}

function buildPrompt({ style = "default", sign = "Balance", gender = "neutre", birthDate = null, length = "short" } = {}) {
  // Choix de ton par style
  let toneInstruction = "";
  switch (style) {
    case "romantique":
      toneInstruction = "Ton: tendre, chaleureux, empathique. Met l'accent sur les relations et les émotions.";
      break;
    case "pragmatique":
      toneInstruction = "Ton: factuel, concis, orienté actions concrètes et priorités.";
      break;
    case "humoristique":
      toneInstruction = "Ton: léger, drôle, imagé; évite l'ironie blessante.";
      break;
    case "spirituel":
      toneInstruction = "Ton: contemplatif, inspirant, un peu métaphorique; privilégie l'intuition.";
      break;
    case "carriere":
      toneInstruction = "Ton: professionnel, orienté carrière, opportunités et stratégie.";
      break;
    default:
      toneInstruction = "Ton: bienveillant, clair et accessible.";
  }

  // Longueur demandée
  let lengthInstruction = "";
  if (length === "short") {
    lengthInstruction = "Chaque valeur (daily/weekly/monthly) doit faire 1 à 2 phrases.";
  } else if (length === "medium") {
    lengthInstruction = "Chaque valeur peut faire 1 à 3 phrases.";
  } else {
    lengthInstruction = "Chaque valeur peut faire 2 à 4 phrases.";
  }

  const fewShot = buildFewShotExamples(style);

  const promptParts = [
    "System: Tu es un·e astrologue professionnel·le et bienveillant·e qui rédige des horoscopes courts et utiles en français.",
    toneInstruction,
    lengthInstruction,
    SAFETY_CONSTRAINTS,
    "Important: Utilise les pronoms et le registre adaptés au paramètre 'genre' fourni; si 'neutre', privilégie un langage inclusif.",
    SCHEMA_INSTRUCTION,
    buildIntro({ sign, gender, birthDate }),
    "Exemples pour illustrer le format (few-shot):",
    fewShot,
    "Instruction finale: Produis uniquement l'objet JSON demandé. Ne fournis aucun commentaire additionnel."
  ];

  return promptParts.join("\n\n");
}

module.exports = { buildPrompt };