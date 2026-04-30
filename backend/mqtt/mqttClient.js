// mqtt/mqttClient.js
const mqtt = require("mqtt");
const { mqttHandler } = require("./mqttHandler");

const mqttOptions = {
  clientId: "hse-mqtt-client-" + Math.random().toString(16).substr(2, 8),
  clean: true,
  connectTimeout: 10000,
  reconnectPeriod: 2000,

  // Required for HiveMQ Cloud. If you use a public broker without auth,
  // leave MQTT_USERNAME and MQTT_PASSWORD empty in .env.
  username: process.env.MQTT_USERNAME || undefined,
  password: process.env.MQTT_PASSWORD || undefined,
};

const isSecureMqtt = String(process.env.MQTT_BROKER_URL || "").startsWith("mqtts://");
if (isSecureMqtt) {
  mqttOptions.protocol = "mqtts";
  mqttOptions.port = 8883;
  mqttOptions.rejectUnauthorized = true;
}

const client = mqtt.connect(process.env.MQTT_BROKER_URL, mqttOptions);

client.on("connect", () => {
  console.log("🚀 MQTT connected");

  client.subscribe("hsemonitor/devices/+/telemetry", { qos: 1 });
  client.subscribe("hsemonitor/devices/+/status", { qos: 1 });
});

client.on("message", async (topic, payload, packet) => {
  const raw = payload.toString();
  console.log("📩 MQTT IN:", topic, "=>", raw);

  try {
    await mqttHandler(topic, payload, packet);
  } catch (err) {
    console.error("❌ MQTT handler error:", err.message);
  }
});

client.on("error", (err) => {
  console.error("❌ MQTT error:", err.message);
});

module.exports = client;
