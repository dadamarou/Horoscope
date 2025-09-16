// Logique pour déterminer le signe et générer des prévisions (FR)
function getZodiacSign(date) {
  const day = date.getDate();
  const month = date.getMonth() + 1; // 1-12

  // Ranges inclusive (startMonth,startDay) to (endMonth,endDay)
  const ranges = [
    { name: "Capricorne", start: [12, 22], end: [1, 19] },
    { name: "Verseau", start: [1, 20], end: [2, 18] },
    { name: "Poissons", start: [2, 19], end: [3, 20] },
    { name: "Bélier", start: [3, 21], end: [4, 19] },
    { name: "Taureau", start: [4, 20], end: [5, 20] },
    { name: "Gémeaux", start: [5, 21], end: [6, 20] },
    { name: "Cancer", start: [6, 21], end: [7, 22] },
    { name: "Lion", start: [7, 23], end: [8, 22] },
    { name: "Vierge", start: [8, 23], end: [9, 22] },
    { name: "Balance", start: [9, 23], end: [10, 22] },
    { name: "Scorpion", start: [10, 23], end: [11, 21] },
    { name: "Sagittaire", start: [11, 22], end: [12, 21] }
  ];

  for (const r of ranges) {
    const [sM, sD] = r.start;
    const [eM, eD] = r.end;

    if (sM === 12 && eM === 1) {
      // Capricorne crosses year boundary
      if ((month === 12 && day >= sD) || (month === 1 && day <= eD)) {
        return r.name;
      }
    } else {
      const afterStart = (month > sM) || (month === sM && day >= sD);
      const beforeEnd = (month < eM) || (month === eM && day <= eD);
      if (afterStart && beforeEnd) return r.name;
    }
  }
  return "Inconnu";
}

const templates = {
  "Bélier": {
    day: [
      "Aujourd'hui tu te sens plein·e d'énergie: profite pour avancer sur un projet.",
      "Ton enthousiasme attire l'attention, mais attention à la précipitation."
    ],
    week: [
      "Semaine dynamique: de belles opportunités sociales arrivent.",
      "Garde le cap, quelques tensions peuvent apparaître au travail."
    ],
    month: [
      "Mois favorable pour initier des changements. Fais confiance à ton instinct.",
      "Une période de prise de décision: priorise ce qui compte."
    ]
  },
  "Taureau": {
    day: [
      "Journée stable: une bonne occasion de consolider ce que tu as construit.",
      "Prends soin de toi, un moment de détente te fera du bien."
    ],
    week: [
      "Finances et confort au centre: évite les dépenses impulsives.",
      "Relations solides cette semaine, cultive la patience."
    ],
    month: [
      "Mois propice à la maturation d'un projet concret.",
      "Bons résultats si tu rends le travail quotidien plus efficace."
    ]
  },
  "Gémeaux": {
    day: [
      "Communiquer t'apportera des avantages aujourd'hui.",
      "Curiosité en hausse: renseigne-toi avant de t'engager."
    ],
    week: [
      "Rencontres intéressantes à prévoir; sois attentif·ve aux détails.",
      "Esprit vif: une opportunité d'apprentissage se présente."
    ],
    month: [
      "Mois favorable pour étendre ton réseau et apprendre.",
      "Chromie mentale intense: organise tes idées pour les concrétiser."
    ]
  },
  "Cancer": {
    day: [
      "Émotions sensibles: protège ton espace personnel.",
      "Un geste affectueux renforcera un lien important."
    ],
    week: [
      "Famille et foyer en focus; une bonne discussion résoudra des tensions.",
      "Instinct protecteur utile: soutiens quelqu'un qui en a besoin."
    ],
    month: [
      "Mois pour consolider le sentiment de sécurité et planifier.",
      "Travail sur les racines émotionnelles: guérison possible."
    ]
  },
  "Lion": {
    day: [
      "Charisme au rendez-vous: ose te montrer.",
      "Attention à l'ego: briller sans écraser les autres."
    ],
    week: [
      "Projets créatifs en lumière; bonne semaine pour présenter tes idées.",
      "Relations se dynamisent: prends l'initiative."
    ],
    month: [
      "Mois pour assumer une position de leadership.",
      "Succès probable si tu combines ambition et générosité."
    ]
  },
  "Vierge": {
    day: [
      "Détails et organisation t'aident aujourd'hui.",
      "Un tri personnel te fera du bien: nettoie ce qui encombre."
    ],
    week: [
      "Productivité en hausse; évite la sur-critique.",
      "Opportunités d'amélioration: adopte une méthode simple."
    ],
    month: [
      "Amélioration progressive: persévérance récompensée.",
      "Faire le point sur ta routine apporte des bénéfices durables."
    ]
  },
  "Balance": {
    day: [
      "Recherche d'équilibre: privilégie des compromis justes.",
      "Esthétique et relations sont favorisées aujourd'hui."
    ],
    week: [
      "Négociations positives: écoute et diplomatie payent.",
      "Harmonie possible si tu exprimes clairement tes besoins."
    ],
    month: [
      "Mois idéal pour rééquilibrer vie pro/perso.",
      "Projets collaboratifs avancent bien avec coopération."
    ]
  },
  "Scorpion": {
    day: [
      "Intensité émotionnelle: transforme-la en concentration.",
      "Discrétion recommandée, surtout dans les confidences."
    ],
    week: [
      "Période de révélations: sois prêt·e à t'adapter.",
      "Puissance de transformation: laisse partir ce qui te freine."
    ],
    month: [
      "Mois pour creuser en profondeur un sujet important.",
      "Changements profonds à l'horizon: accompagne-les avec lucidité."
    ]
  },
  "Sagittaire": {
    day: [
      "Goût d'aventure: une petite escapade te fera du bien.",
      "Optimisme contagieux: partage tes projets."
    ],
    week: [
      "Apprentissage et voyages (même imaginaires) favorisés.",
      "Chance dans les connexions lointaines: sois à l'écoute."
    ],
    month: [
      "Mois pour élargir tes horizons et viser plus grand.",
      "Opportunités d'évolution si tu restes ouvert·e et honnête."
    ]
  },
  "Capricorne": {
    day: [
      "Discipline et sérieux: aujourd'hui tu fais avancer le concret.",
      "Patience: les résultats viendront si tu persistes."
    ],
    week: [
      "Responsabilités accrues; accepte-les stratégiquement.",
      "Progrès constants si tu planifies chaque étape."
    ],
    month: [
      "Mois où la construction sur le long terme est favorisée.",
      "Investis dans ce qui portera ses fruits plus tard."
    ]
  },
  "Verseau": {
    day: [
      "Idées originales fusent: note tout.",
      "Besoin d'autonomie: préserve ton espace créatif."
    ],
    week: [
      "Projets innovants avancent: collabore avec des esprits libres.",
      "Ton point de vue apporte des solutions inédites."
    ],
    month: [
      "Mois propice aux changements progressifs et aux expérimentations.",
      "Implication sociale forte: engage-toi pour une cause."
    ]
  },
  "Poissons": {
    day: [
      "Sensibilité accrue: l'art et l'intuition t'aident.",
      "Rêverie productive: canalise-la en création."
    ],
    week: [
      "Empathie favorise les relations profondes.",
      "Attention à la dispersion: clarifie une idée avant d'agir."
    ],
    month: [
      "Mois pour nourrir ton monde intérieur et ta créativité.",
      "Soins personnels et repos productifs recommandés."
    ]
  }
};

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generatePredictions(sign, gender) {
  // gender: 'homme'|'femme'|'autre' (on peut l'utiliser plus tard)
  const signTemplates = templates[sign] || templates["Balance"];
  return {
    sign,
    daily: pickRandom(signTemplates.day),
    weekly: pickRandom(signTemplates.week),
    monthly: pickRandom(signTemplates.month)
  };
}

function getHoroscope({ birthDate, gender }) {
  if (!(birthDate instanceof Date) || isNaN(birthDate)) {
    throw new Error("Date de naissance invalide");
  }
  const sign = getZodiacSign(birthDate);
  const predictions = generatePredictions(sign, gender);
  return {
    sign,
    predictions
  };
}

module.exports = { getHoroscope };