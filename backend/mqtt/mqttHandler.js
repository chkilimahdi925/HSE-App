const Device = require("../models/deviceModel");
const Reading = require("../models/readingModel");
const Sensor = require("../models/sensorModel");
const Alert = require("../models/alertModel");

const parsers = require("./parsers");
const { evaluateValues } = require("../services/alertRuleEngine");
const { markDeviceOnline } = require("../services/deviceHeartbeatMonitor");
const { getIo } = require("../socket/socket");

function safeParse(payload) {
  const s = payload.toString().trim();

  if (s.startsWith("{") || s.startsWith("[")) {
    try {
      return JSON.parse(s);
    } catch {
      return { value: s };
    }
  }

  const obj = {};
  for (const part of s.split(/[;,]+/)) {
    const [k, v] = part.split(/[:=]/).map((x) => x && x.trim());
    if (k && v) obj[k] = v;
  }

  if (Object.keys(obj).length > 0) return obj;

  return { value: s };
}

async function createFridgeTemperatureAlert({ device, reading, temperature }) {
  const FRIDGE_TEMP_MIN = Number(process.env.FRIDGE_TEMP_MIN || 0);
  const FRIDGE_TEMP_MAX = Number(process.env.FRIDGE_TEMP_MAX || 7);

  if (Number.isNaN(temperature)) return null;

  let title = "";
  let message = "";
  let severity = "warning";
  let threshold = null;

  if (temperature < FRIDGE_TEMP_MIN) {
    title = "Température frigo trop basse";
    message = `La température du frigo est de ${temperature}°C, inférieure au seuil minimum autorisé de ${FRIDGE_TEMP_MIN}°C.`;
    severity = "warning";
    threshold = FRIDGE_TEMP_MIN;
  }

  if (temperature > FRIDGE_TEMP_MAX) {
    title = "Température frigo trop élevée";
    message = `La température du frigo est de ${temperature}°C, supérieure au seuil maximum autorisé de ${FRIDGE_TEMP_MAX}°C. Risque de rupture de la chaîne du froid.`;
    severity = temperature >= 10 ? "critical" : "warning";
    threshold = FRIDGE_TEMP_MAX;
  }

  if (!title) return null;

  const existingAlert = await Alert.findOne({
    device: device._id,
    type: "threshold_breach",
    title,
    status: { $in: ["open", "acknowledged"] },
  });

  if (existingAlert) {
    return existingAlert;
  }

  const alert = await Alert.create({
    type: "threshold_breach",
    title,
    message,
    severity,
    status: "open",
    zone: device.zone,
    device: device._id,
    readingValue: temperature,
    threshold,
    isRead: false,
  });

  console.log(`🚨 Alerte créée: ${title} (${temperature}°C)`);

  const io = getIo();

  if (io) {
    const alertPayload = {
      _id: String(alert._id),
      type: alert.type,
      title: alert.title,
      message: alert.message,
      severity: alert.severity,
      status: alert.status,
      device: String(device._id),
      zone: device.zone ? String(device.zone) : null,
      readingValue: temperature,
      threshold,
      createdAt: alert.createdAt || new Date(),
    };

    io.emit("alert:new", alertPayload);
    io.to(`device:${device.deviceId}`).emit("alert:new", alertPayload);

    console.log(`📢 Socket.IO alert:new emitted for ${device.deviceId}`);
  }

  return alert;
}

async function mqttHandler(topic, payload) {
  try {
    const parts = topic.split("/");

    if (parts.length < 4) {
      console.warn(`⚠️ Invalid topic: ${topic}`);
      return;
    }

    const deviceId = parts[2];
    const channel = parts[3];

    if (channel !== "telemetry") return;

    const data = safeParse(payload);

    const sensorType = data.sensorType;
    if (!sensorType) {
      console.warn(`⚠️ Missing sensorType in payload for topic: ${topic}`);
      return;
    }

    const parser = parsers[sensorType];
    if (!parser) {
      console.warn(`⚠️ No parser for sensorType: ${sensorType}`);
      return;
    }

    const { values, raw } = parser(data);

    const device = await markDeviceOnline(deviceId);

    if (!device) {
      console.warn(`⚠️ Unknown device: ${deviceId}`);
      return;
    }

    const reading = await Reading.create({
      device: device._id,
      zone: device.zone,
      sensorType,
      values,
      raw,
    });

    await Sensor.updateMany(
      { device: device._id, type: sensorType },
      {
        $set: {
          status: "online",
          lastSeen: new Date(),
        },
      }
    );

    const temperature = Number(values.temperature);

    await createFridgeTemperatureAlert({
      device,
      reading,
      temperature,
    });

    const io = getIo();

    if (io) {
      const eventPayload = {
        deviceId,
        device: String(device._id),
        zone: device.zone ? String(device.zone) : null,
        sensorType,
        values,
        raw,
        readingId: String(reading._id),
        timestamp: reading.ts || reading.createdAt || new Date(),
      };

      io.emit("sensor:reading", eventPayload);
      io.to(`device:${deviceId}`).emit("sensor:reading", eventPayload);

      console.log(`📡 Socket.IO sensor:reading emitted for ${deviceId}`);
    }

    const alerts = await evaluateValues({
      values,
      device,
      zone: device.zone,
      sensor: undefined,
    });

    if (alerts.length) {
      console.log(`🚨 ${alerts.length} alert(s) triggered for ${deviceId}`);
    }

    console.log(`✅ Reading saved for ${deviceId} (${sensorType})`);
  } catch (error) {
    console.error("❌ mqttHandler error:", error.message);
  }
}

function publishDeviceCommand(deviceId, action, params = {}) {
  const client = require("./mqttClient");

  return new Promise((resolve, reject) => {
    if (!client || !client.connected) {
      return reject(new Error("MQTT client not connected"));
    }

    const topic = `hsemonitor/devices/${deviceId}/commands`;

    const message = {
      action,
      requestId: `req_${Date.now()}`,
      source: "admin-dashboard",
      timestamp: new Date().toISOString(),
      params,
    };

    client.publish(topic, JSON.stringify(message), { qos: 1 }, (err) => {
      if (err) return reject(err);

      console.log(`📤 Command sent to ${deviceId}: ${action}`);
      resolve({ topic, message });
    });
  });
}

module.exports = {
  mqttHandler,
  publishDeviceCommand,
};