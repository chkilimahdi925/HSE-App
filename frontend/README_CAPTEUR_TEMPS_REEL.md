# HSE Mobile - Capteur DHT11 temps reel

## Nouveautes

- L'ecran `Capteurs` de l'admin contient maintenant le dashboard capteur.
- Quand un admin appuie sur un capteur, l'application ouvre le dashboard temps reel du capteur.
- Le dashboard lit la derniere temperature/humidite du device associe au capteur.
- Mise a jour automatique toutes les 3 secondes.
- Manager et agent gardent aussi l'acces au dashboard capteur depuis le menu.

## Flux temps reel

ESP8266 + DHT11 -> HiveMQ Cloud -> Backend Node.js -> MongoDB `readings` -> Mobile Expo

Le mobile ne lit pas directement le DHT11. Il lit le backend.
Le backend recoit MQTT puis enregistre dans `readings`.
L'application mobile rafraichit automatiquement la derniere lecture.

## Topic MQTT attendu

hsemonitor/devices/esp8266-01/telemetry

Payload attendu :

{
  "deviceId": "esp8266-01",
  "sensorType": "dht11",
  "temperature": 25.4,
  "humidity": 62.0,
  "timestamp": 123456
}

## Donnees MongoDB necessaires

1. `companies` : HSE Company
2. `users` : admin/manager/agent avec `company: ObjectId(...)`
3. `zones` : au moins une zone creee depuis l'app web ou mobile
4. `devices` : un device avec `deviceId: esp8266-01`, `zone` et `company`
5. `sensors` : un capteur DHT11 cree depuis Admin -> Capteurs -> Ajouter DHT11

## Lancement

npm install
npx expo install --fix
npx expo start --lan -c

Backend obligatoire dans un autre terminal :

nodemon

