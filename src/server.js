const express = require("express");
const cors = require("cors");
const path = require("path");
const { getHoroscope } = require("./horoscope");
const { generateHoroscopeAI } = require("./ai");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));

const USE_AI = process.env.USE_AI === "true";

app.post("/api/horoscope", async (req, res) => {
  try {
    const { dateOfBirth, gender, style, length } = req.body;
    if (!dateOfBirth) {
      return res.status(400).json({ error: "dateOfBirth is required (YYYY-MM-DD)" });
    }
    const d = new Date(dateOfBirth);
    if (isNaN(d)) {
      return res.status(400).json({ error: "dateOfBirth invalid" });
    }

    // Calcul local du signe + templates (toujours disponible)
    const base = getHoroscope({ birthDate: d, gender });

    // Optionnel: style/length fournis par le client (ex: 'romantique','short')
    const chosenStyle = style || "default";
    const chosenLength = length || "short";

    if (USE_AI) {
      const aiResult = await generateHoroscopeAI({
        sign: base.sign,
        gender,
        birthDate: dateOfBirth,
        style: chosenStyle,
        length: chosenLength
      });

      if (aiResult) {
        return res.json({
          sign: base.sign,
          predictions: {
            daily: aiResult.daily || base.predictions.daily,
            weekly: aiResult.weekly || base.predictions.weekly,
            monthly: aiResult.monthly || base.predictions.monthly,
            tip: aiResult.tip || ""
          },
          meta: { source: "openai", style: chosenStyle }
        });
      } else {
        // IA a échoué -> utiliser templates
        return res.json({
          sign: base.sign,
          predictions: base.predictions,
          meta: { source: "templates", note: "IA indisponible, modérée ou erreur" }
        });
      }
    } else {
      // Pas d'IA : template local
      return res.json({
        sign: base.sign,
        predictions: base.predictions,
        meta: { source: "templates" }
      });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

// fallback to index.html (SPA)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Horoscope app listening on http://localhost:${port} (USE_AI=${USE_AI})`);
});