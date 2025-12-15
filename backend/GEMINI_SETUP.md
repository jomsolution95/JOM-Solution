# 🤖 Comment configurer l'IA (Google Gemini)

Pour que les fonctionnalités d'IA (Résumé de CV, Analyse ATS) fonctionnent réellement, vous avez besoin d'une clé API valide. Heureusement, c'est **gratuit** pour un usage standard.

## 📝 Étapes à suivre

1. **Accéder à Google AI Studio**
   - Rendez-vous sur cette page : [👉 Google AI Studio - Get API Key](https://aistudio.google.com/app/apikey)

2. **Générer la clé**
   - Connectez-vous avec votre compte Google.
   - Cliquez sur le gros bouton bleu **"Create API key"**.
   - Choisissez **"Create API key in new project"**.

3. **Copier la clé**
   - Une fenêtre va s'ouvrir avec votre clé (une longue suite de caractères commençant par `AIza...`).
   - Copiez cette clé.

4. **Configurer votre projet**
   - Revenez ici dans votre éditeur.
   - Ouvrez le fichier `backend/.env`.
   - Vous verrez une ligne comme celle-ci :
     ```env
     GEMINI_API_KEY=AIzaSy_REMPLACER_PAR_VOTRE_CLE
     ```
   - Remplacez `AIzaSy_REMPLACER_PAR_VOTRE_CLE` par la clé que vous venez de copier.
   - **Sauvegardez le fichier.**

✅ **C'est tout !** L'IA fonctionnera immédiatement après (parfois un redémarrage du terminal backend `npm run start:dev` est nécessaire si ça ne marche pas tout de suite).
