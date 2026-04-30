# HSE Mobile optimisé

## Modifications ajoutées

- Menu latéral en haut à gauche sur tous les écrans connectés.
- Suppression de la barre de navigation basse : navigation par menu hamburger.
- Tableau de bord avec carte temps réel DHT11 : température + humidité depuis `GET /api/readings/latest/device/esp8266-01`.
- Écran Admin `Capteurs` avec bouton pour ajouter rapidement le capteur DHT11 lié au device `esp8266-01`.
- Footer login mis à jour en 2026.
- `app.json` configuré pour téléphone réel : `http://192.168.1.12:5000`.
- Dépendances préparées pour Expo SDK 54 / Expo Go récent.

## Commandes

```powershell
cd "C:\Users\Guide Info\Downloads\HSEMobileApp-expert-ready"
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue
npm install
npx expo install --fix
npx expo start --lan -c
```

## Données nécessaires côté backend / MongoDB

Il faut au minimum :

- company créée et liée aux users
- zone créée
- device `esp8266-01` créé et lié à une zone
- capteur DHT11 créé via l'écran mobile Admin > Capteurs ou via l'API
- ESP8266 qui publie sur HiveMQ : `hsemonitor/devices/esp8266-01/telemetry`

## Commande PowerShell pour créer le capteur DHT11 via API

Remplace `DEVICE_OBJECT_ID` par `_id` du device `esp8266-01` dans MongoDB.

```powershell
$body = @{
  name = "DHT11 Température / Humidité"
  type = "dht11"
  device = "DEVICE_OBJECT_ID"
  threshold = 35
  unit = "°C / %"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/sensors" -Method POST -ContentType "application/json" -Body $body
```

Important : cette route est protégée, donc le plus simple est d'utiliser le bouton dans l'application mobile après connexion admin.
