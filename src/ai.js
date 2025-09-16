// Couche IA améliorée : intégration des prompts sophistiqués, parsing robuste,
// modération optionnelle et cache mémoire simple.
// Usage : const { generateHoroscopeAI, clearAICache } = require('./ai');
// generateHoroscopeAI({ sign, gender, birthDate, style, length })

const OpenAI = require("openai");
const { buildPrompt } = require("./prompts");

const client = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

// Simple in-memory cache with TTL
const cache = new Map(); // key -> { value, expiresAt }
const DEFAULT_TTL = parseInt(process.env.AI_CACHE_TTL_SECONDS || "86400", 10); // default 24h

function makeCacheKey({ sign, style, length }) {
  // cache per sign+style+length per-day to limit costs; you can change granularity later
  const day = new Date().toISOString().slice(0, 10);
  return `${sign}::${style || "default"}::${length || "short"}::${day}`;
}

function getFromCache(key) {
  const hit = cache.get(key);
  if (!hit) return null;
  if (Date.now() > hit.expiresAt) {
    cache.delete(key);
    return null;
  }
  return hit.value;
}

function setCache(key, value, ttlSeconds = DEFAULT_TTL) {
  cache.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
}

function clearAICache() {
  cache.clear();
}

// Moderation helper (optional). Returns true if content is flagged.
async function isFlaggedByModeration(text) {
  if (!client) return false;
  if (process.env.USE_MODERATION !== "true") return false;

  try {
    const resp = await client.moderations.create({
      model: "omni-moderation-latest",
      input: text
    });
    const results = resp.results || resp; // depending on client version
    if (!results || !results[0]) return false;
    // result has 'categories' and 'category_scores' and 'flagged'
    return !!results[0].flagged;
  } catch (err) {
    console.warn("Moderation API error, treating as safe:", err?.message || err);
    // In case of moderation failure, do not block by default
    return false;
  }
}

// Try to extract JSON substring from a model response
function extractJSON(text) {
  if (!text || typeof text !== "string") return null;
  // Find first '{' and last '}' to extract a JSON object
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  const jsonText = text.slice(start, end + 1);
  try {
    return JSON.parse(jsonText);
  } catch (err) {
    return null;
  }
}

// Basic validation of the parsed object
function validatePredictionObject(obj) {
  if (!obj || typeof obj !== "object") return false;
  const keys = ["daily", "weekly", "monthly", "tip"];
  for (const k of keys) {
    if (!(k in obj)) return false;
    if (typeof obj[k] !== "string") return false;
    if (obj[k].trim().length === 0) return false;
  }
  return true;
}

/**
 * Generate horoscope via OpenAI with fallback & retries.
 * Returns parsed object { daily, weekly, monthly, tip } or null if not available.
 */
async function generateHoroscopeAI({ sign, gender, birthDate, style = "default", length = "short" } = {}) {
  if (!client) return null;

  const cacheKey = makeCacheKey({ sign, style, length });
  const cached = getFromCache(cacheKey);
  if (cached) return cached;

  const prompt = buildPrompt({ style, sign, gender, birthDate, length });

  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const temperature = parseFloat(process.env.AI_TEMPERATURE || "0.7");
  const max_tokens = parseInt(process.env.AI_MAX_TOKENS || "500", 10);

  // We'll attempt up to 2 times (initial + retry with stricter JSON instruction)
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      // On the second attempt, append an ultra-strict suffix asking only for JSON
      const userPrompt = attempt === 1
        ? prompt
        : prompt + "\n\nIMPORTANT: Réponds strictement par l'objet JSON demandé, sans aucun texte additionnel, et assure-toi que le JSON est valide.";

      const resp = await client.chat.completions.create({
        model,
        messages: [
          { role: "system", content: "Tu es un assistant spécialisé dans la rédaction d'horoscopes en français, respecte le format JSON demandé." },
          { role: "user", content: userPrompt }
        ],
        temperature,
        max_tokens
      });

      const text = resp?.choices?.[0]?.message?.content || resp?.choices?.[0]?.text || "";
      if (!text) {
        // try next attempt
        continue;
      }

      // Moderation: quickly check raw text (if enabled)
      if (process.env.USE_MODERATION === "true") {
        const flagged = await isFlaggedByModeration(text);
        if (flagged) {
          console.warn("IA output flagged by moderation, aborting AI response.");
          return null;
        }
      }

      // Try to parse JSON out of response
      let parsed = extractJSON(text);

      if (!parsed) {
        // Sometimes the model returns a few lines: try transform heuristics
        // Attempt to map lines to fields if structured with headers
        const lines = text.split(/\n+/).map(l => l.trim()).filter(Boolean);
        if (lines.length >= 3) {
          parsed = {
            daily: lines[0],
            weekly: lines[1] || "",
            monthly: lines[2] || "",
            tip: lines[3] || ""
          };
        }
      }

      if (!validatePredictionObject(parsed)) {
        // invalid result, retry if attempt 1, otherwise give up
        if (attempt === 1) continue;
        else return null;
      }

      // Moderation per-field (extra cautious)
      if (process.env.USE_MODERATION === "true") {
        const combined = `${parsed.daily}\n\n${parsed.weekly}\n\n${parsed.monthly}\n\n${parsed.tip}`;
        const flagged = await isFlaggedByModeration(combined);
        if (flagged) {
          console.warn("IA parsed fields flagged by moderation, aborting AI response.");
          return null;
        }
      }

      // Normalize/trimming
      const normalized = {
        daily: parsed.daily.trim(),
        weekly: parsed.weekly.trim(),
        monthly: parsed.monthly.trim(),
        tip: parsed.tip.trim()
      };

      // Cache and return
      setCache(cacheKey, normalized);
      return normalized;
    } catch (err) {
      console.error("Erreur appel IA (attempt " + attempt + "):", err?.message || err);
      // on error, try again once; otherwise break
      if (attempt === 2) break;
    }
  }

  // If we reach here, AI generation failed
  return null;
}

module.exports = { generateHoroscopeAI, clearAICache };