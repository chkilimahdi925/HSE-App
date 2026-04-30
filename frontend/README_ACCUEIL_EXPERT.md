# Version Accueil expert

Cette version remplace l'ancien accueil qui répétait les statistiques des modules par une page d'accueil plus professionnelle.

## Changements principaux

- Accueil Agent : mission HSE du jour, actions rapides, checklist terrain, conseil sécurité.
- Accueil Manager : pilotage HSE, actions manager, plan de supervision, rappel management.
- Accueil Admin : configuration rapide, ordre conseillé, bonnes pratiques sécurité.
- Le dashboard capteur reste dans son module dédié : Menu > Dashboard capteur.
- Les observations, alertes et notifications restent dans leurs modules dédiés.

## Lancement

```powershell
npm install
npx expo install --fix
npx expo start --lan -c
```

Si LAN ne marche pas :

```powershell
npx expo start --tunnel -c
```

## Backend

Garde le backend lancé sur :

```text
http://192.168.1.12:5000
```

Vérifie `app.json` si ton IP a changé.
