```markdown
# Horoscope App (exemple) — IA

Ce dépôt contient un exemple d'application d'horoscope avec une option "couche IA" pour enrichir les prévisions.

Nouveautés :
- Si `USE_AI=true` et `OPENAI_API_KEY` est défini, le serveur essaiera de générer des horoscopes via l'API OpenAI.
- Si l'IA échoue ou n'est pas configurée, le serveur revient aux templates locaux (comportement par défaut).

Configuration :
1. Copier `.env.example` en `.env` et renseigner `OPENAI_API_KEY` si besoin.
2. Installer les dépendances :
   npm install
3. Lancer :
   npm start
4. Ouvrir http://localhost:3000

Sécurité et bonnes pratiques :
- Ne pas exposer de conseils médicaux/juridiques/fiscaux.
- Mettre en place un système de quotas/rate limiting si ton service devient public.
- Ajouter une étape de modération (OpenAI Moderation API) si tu veux filtrer la sortie avant affichage.

Améliorations possibles :
- Historique utilisateurs et personnalisation (DB).
- Prompt engineering pour varier ton, long/short, langage familier/formel.
- Utiliser un modèle local ou un service alternatif (Hugging Face) si tu veux éviter dépendance cloud.
```