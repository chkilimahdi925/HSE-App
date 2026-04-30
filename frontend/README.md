# 📱 HSE Mobile App - React Native (Expo)

Application mobile HSE (Santé, Sécurité, Environnement) connectée au backend Node.js/MongoDB.

---

## 🗂️ Structure du projet

```
HSEMobileApp/
├── App.js                          ← Point d'entrée
├── app.json                        ← Config Expo
├── package.json
├── babel.config.js
└── src/
    ├── api/
    │   ├── axiosInstance.js        ← Axios + gestion cookie JWT
    │   └── endpoints.js            ← Toutes les URLs API
    ├── constants/
    │   └── theme.js                ← Couleurs, ombres
    ├── context/
    │   └── AuthContext.js          ← État global d'authentification
    ├── navigation/
    │   ├── AppNavigator.js         ← Routeur principal (par rôle)
    │   ├── AgentNavigator.js       ← Tabs Agent
    │   ├── ManagerNavigator.js     ← Tabs Manager
    │   └── AdminNavigator.js       ← Tabs Admin
    ├── components/
    │   └── common/index.js         ← Composants réutilisables
    └── screens/
        ├── auth/
        │   └── LoginScreen.js
        ├── agent/
        │   ├── AgentDashboard.js
        │   ├── ObservationsScreen.js
        │   ├── AlertsScreen.js
        │   ├── AgentNotificationsScreen.js
        │   └── AgentProfileScreen.js
        ├── manager/
        │   ├── ManagerDashboard.js
        │   ├── IncidentsScreen.js
        │   ├── AuditsScreen.js
        │   ├── TrainingsScreen.js
        │   └── ManagerProfileScreen.js
        └── admin/
            ├── AdminDashboard.js
            ├── UsersScreen.js
            ├── DevicesScreen.js
            ├── ZonesScreen.js
            └── AdminProfileScreen.js
```

---

## ✅ Fonctionnalités par rôle

| Rôle        | Fonctionnalités                                                          |
|-------------|--------------------------------------------------------------------------|
| **Agent**   | Dashboard, Observations (CRUD), Alertes (lire/prendre en charge), Notifications, Profil |
| **Manager** | Dashboard, Incidents (voir/résoudre), Audits (CRUD), Formations (CRUD), Profil |
| **Admin**   | Dashboard stats, Utilisateurs (CRUD), Appareils IoT (CRUD), Zones (CRUD), Profil |

---

## 🚀 Étapes d'installation

### Étape 1 — Prérequis

Installez les outils suivants si ce n'est pas déjà fait :

```bash
# Node.js (v18+) — https://nodejs.org
node --version

# Expo CLI
npm install -g expo-cli

# Pour Android : Android Studio + émulateur configuré
# Pour iOS (Mac uniquement) : Xcode + simulateur
```

---

### Étape 2 — Installer les dépendances

```bash
cd HSEMobileApp
npm install
```

---

### Étape 3 — Configurer l'URL du backend

Ouvrez le fichier `src/api/endpoints.js` et modifiez `BASE_URL` selon votre environnement :

```js
// ✅ Émulateur Android
export const BASE_URL = 'http://10.0.2.2:5000';

// ✅ Simulateur iOS (Mac)
export const BASE_URL = 'http://localhost:5000';

// ✅ Vrai appareil physique (remplacez par votre IP locale)
export const BASE_URL = 'http://192.168.1.100:5000';
// Trouvez votre IP : Windows → ipconfig | Mac/Linux → ifconfig
```

---

### Étape 4 — Démarrer le backend

```bash
# Dans le dossier hsebackend-main
npm install
# Créez un fichier .env avec :
# MONGODB_URI=mongodb://localhost:27017/hse
# JWT_SECRET=votre_secret_jwt
# PORT=5000
npm start
```

---

### Étape 5 — Lancer l'application

```bash
# Dans le dossier HSEMobileApp
npm start

# Puis choisissez :
#  a → ouvrir sur Android
#  i → ouvrir sur iOS
#  w → ouvrir dans le navigateur (web)
```

Ou directement :
```bash
npm run android   # Lance sur Android
npm run ios       # Lance sur iOS (Mac seulement)
```

---

### Étape 6 — Se connecter

Utilisez les identifiants d'un utilisateur existant dans votre base MongoDB.  
L'application redirige automatiquement vers l'interface selon le rôle (`admin`, `manager`, `agent`).

---

## 🔐 Authentification

Le backend utilise des **cookies JWT** (`access_token`).  
Sur mobile, les cookies ne sont pas gérés automatiquement — l'app :
1. Extrait le token du header `Set-Cookie` après le login
2. Le stocke dans `AsyncStorage`
3. L'injecte manuellement dans chaque requête via `Cookie: access_token=...`

---

## 🛠️ Dépendances principales

| Package                        | Rôle                         |
|-------------------------------|------------------------------|
| `expo`                        | Framework React Native        |
| `@react-navigation/*`         | Navigation entre écrans       |
| `axios`                       | Requêtes HTTP                 |
| `@react-native-async-storage` | Stockage du token             |
| `@expo/vector-icons`          | Icônes Ionicons               |

---

## ❗ Problèmes fréquents

| Problème                    | Solution                                                        |
|-----------------------------|------------------------------------------------------------------|
| `Network Error`             | Vérifiez l'URL dans `endpoints.js` + que le backend tourne      |
| `401 Unauthorized`          | Token expiré → reconnectez-vous                                 |
| Émulateur Android ne répond | Utilisez `10.0.2.2` au lieu de `localhost`                       |
| iOS bloque HTTP             | Ajoutez `NSAllowsArbitraryLoads` dans `app.json` si nécessaire  |
| `Metro bundler` crash       | `npx expo start --clear` pour vider le cache                    |

---

## 📡 APIs utilisées

| Endpoint                    | Méthodes       | Rôle                    |
|-----------------------------|----------------|-------------------------|
| `/api/auth/*`               | POST, GET       | Authentification        |
| `/api/observations/*`       | GET, POST, PATCH| Observations agent      |
| `/api/alerts/*`             | GET, PATCH      | Alertes                 |
| `/api/incidentEvents/*`     | GET, PATCH      | Incidents manager       |
| `/api/audits/*`             | GET, POST, DEL  | Audits                  |
| `/api/trainings/*`          | GET, POST, DEL  | Formations              |
| `/api/users/*`              | GET, POST, DEL  | Gestion utilisateurs    |
| `/api/devices/*`            | GET, POST, DEL  | Appareils IoT           |
| `/api/zones/*`              | GET, POST, DEL  | Zones                   |
| `/api/user-notifications/*` | GET, PATCH      | Notifications           |
