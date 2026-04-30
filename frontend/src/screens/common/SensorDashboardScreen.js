import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl, AppState } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axiosInstance';
import { API_URLS } from '../../api/endpoints';
import { COLORS } from '../../constants/theme';
import { ScreenHeader, Dht11LiveCard, StatCard, Card, LoadingView, ErrorView, StatusBadge, EmptyState } from '../../components/common';
import { extractItems, getErrorMessage } from '../../utils/api';

const DEFAULT_DEVICE_ID = 'esp8266-01';
const LIVE_REFRESH_MS = 30000;

const getReadingValues = (reading) => {
  const values = reading?.values || reading?.raw || reading || {};
  return {
    temperature: values.temperature ?? values.t ?? null,
    humidity: values.humidity ?? values.h ?? null,
    date: reading?.ts || reading?.createdAt || reading?.updatedAt || reading?.timestamp,
  };
};

const getDeviceIdFromSensor = (sensor) => sensor?.device?.deviceId || sensor?.deviceId || DEFAULT_DEVICE_ID;

const SensorDashboardScreen = ({ route, navigation }) => {
  const { user } = useAuth();
  const routeSensor = route?.params?.sensor || null;
  const routeDevice = route?.params?.device || null;
  const routeDeviceId = route?.params?.deviceId || getDeviceIdFromSensor(routeSensor);

  const [latestReading, setLatestReading] = useState(null);
  const [history, setHistory] = useState([]);
  const [sensor, setSensor] = useState(routeSensor);
  const [device, setDevice] = useState(routeDevice);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [liveLoading, setLiveLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const intervalRef = useRef(null);

  const deviceId = device?.deviceId || routeDeviceId || getDeviceIdFromSensor(sensor) || DEFAULT_DEVICE_ID;
  const companyName = user?.company?.name || 'HSE Company';
  const title = route?.params?.title || sensor?.name || 'DHT11 Température / Humidité';

  const averages = useMemo(() => {
    const readings = history.map(getReadingValues).filter((r) => r.temperature !== null || r.humidity !== null);
    if (!readings.length) return { temperature: null, humidity: null };

    const tempValues = readings.map((r) => Number(r.temperature)).filter((v) => !Number.isNaN(v));
    const humValues = readings.map((r) => Number(r.humidity)).filter((v) => !Number.isNaN(v));

    return {
      temperature: tempValues.length ? tempValues.reduce((a, b) => a + b, 0) / tempValues.length : null,
      humidity: humValues.length ? humValues.reduce((a, b) => a + b, 0) / humValues.length : null,
    };
  }, [history]);

  const fetchLatest = useCallback(async (silent = false) => {
    if (!silent) setLiveLoading(true);
    try {
      const res = await api.get(API_URLS.readings.latestByDevice(deviceId));
      setLatestReading(res.data);
      setLastUpdate(new Date());
      return res.data;
    } catch (_) {
      setLatestReading(null);
      return null;
    } finally {
      if (!silent) setLiveLoading(false);
    }
  }, [deviceId]);

  const fetchData = useCallback(async () => {
    try {
      setError(null);

      const [latestRes, historyRes, sensorsRes, devicesRes] = await Promise.allSettled([
        api.get(API_URLS.readings.latestByDevice(deviceId)),
        api.get(API_URLS.readings.historyByDevice(deviceId)),
        api.get(API_URLS.sensors.all),
        api.get(API_URLS.devices.all),
      ]);

      if (latestRes.status === 'fulfilled') {
        setLatestReading(latestRes.value.data);
        setLastUpdate(new Date());
      } else {
        setLatestReading(null);
      }

      setHistory(historyRes.status === 'fulfilled' ? extractItems(historyRes.value.data).slice(0, 10) : []);

      if (sensorsRes.status === 'fulfilled') {
        const sensors = extractItems(sensorsRes.value.data);
        const selectedSensor = sensors.find((s) =>
          s._id === route?.params?.sensorId ||
          s.device?.deviceId === deviceId ||
          s.deviceId === deviceId ||
          s.type === 'dht11'
        );
        setSensor(selectedSensor || routeSensor || sensors[0] || null);
      }

      if (devicesRes.status === 'fulfilled') {
        const devices = extractItems(devicesRes.value.data);
        setDevice(devices.find((d) => d.deviceId === deviceId) || routeDevice || null);
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Impossible de charger le dashboard capteur'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [deviceId, route?.params?.sensorId, routeDevice, routeSensor]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      fetchLatest(true);
    }, LIVE_REFRESH_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchLatest]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') fetchLatest(true);
    });
    return () => sub.remove();
  }, [fetchLatest]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  if (loading) return <LoadingView />;

  const lastUpdateLabel = lastUpdate ? lastUpdate.toLocaleTimeString('fr-FR') : 'en attente';

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Dashboard capteur"
        subtitle={`${title} · ${companyName}`}
        showBack={Boolean(navigation?.canGoBack?.())}
        onBack={() => navigation.goBack()}
      />
      <ScrollView
        style={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
      >
        {error && <ErrorView message={error} onRetry={fetchData} />}

        <View style={styles.liveBanner}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>Mise à jour automatique toutes les {LIVE_REFRESH_MS / 1000}s</Text>
          <Text style={styles.liveTime}>Dernière : {lastUpdateLabel}</Text>
        </View>

        <Text style={styles.sectionTitle}>Lecture temps réel</Text>
        <Dht11LiveCard reading={latestReading} loading={liveLoading} onRefresh={() => fetchLatest(false)} />

        <Text style={styles.sectionTitle}>Résumé capteur</Text>
        <StatCard
          label="Moyenne température"
          value={averages.temperature !== null ? `${averages.temperature.toFixed(1)}°C` : '—'}
          icon="thermometer-outline"
          color={COLORS.danger}
        />
        <StatCard
          label="Moyenne humidité"
          value={averages.humidity !== null ? `${averages.humidity.toFixed(1)}%` : '—'}
          icon="water-outline"
          color={COLORS.info}
        />
        <StatCard
          label="Historique lectures"
          value={history.length}
          icon="time-outline"
          color={COLORS.primary}
        />

        <Text style={styles.sectionTitle}>Configuration</Text>
        <Card>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Device</Text>
            <Text style={styles.infoValue}>{device?.name || 'ESP8266 DHT11'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Device ID</Text>
            <Text style={styles.infoValue}>{deviceId}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Capteur</Text>
            <Text style={styles.infoValue}>{sensor?.name || title}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Type</Text>
            <Text style={styles.infoValue}>{sensor?.type || 'dht11'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Zone</Text>
            <Text style={styles.infoValue}>{sensor?.zone?.name || device?.zone?.name || '—'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Statut</Text>
            <StatusBadge status={device?.status || sensor?.status || 'offline'} />
          </View>
        </Card>

        <Text style={styles.sectionTitle}>Dernières lectures</Text>
        {history.length ? (
          history.map((item, index) => {
            const values = getReadingValues(item);
            return (
              <Card key={item._id || index}>
                <View style={styles.readingRow}>
                  <View>
                    <Text style={styles.readingTitle}>Lecture #{index + 1}</Text>
                    <Text style={styles.readingDate}>{values.date ? new Date(values.date).toLocaleString('fr-FR') : 'Date inconnue'}</Text>
                  </View>
                  <View style={styles.readingValues}>
                    <Text style={styles.temp}>{values.temperature !== null ? `${Number(values.temperature).toFixed(1)}°C` : '—'}</Text>
                    <Text style={styles.hum}>{values.humidity !== null ? `${Number(values.humidity).toFixed(1)}%` : '—'}</Text>
                  </View>
                </View>
              </Card>
            );
          })
        ) : (
          <EmptyState
            icon="analytics-outline"
            message="Aucune lecture disponible"
            subtitle="Les valeurs s'affichent dès que l'ESP8266 envoie les données via HiveMQ."
          />
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1, padding: 16 },
  liveBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    backgroundColor: COLORS.primary + '10',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },
  liveDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: '#22C55E' },
  liveText: { color: COLORS.textPrimary, fontSize: 12, fontWeight: '800' },
  liveTime: { color: COLORS.textSecondary, fontSize: 11, fontWeight: '600' },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 12, marginTop: 8 },
  infoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  infoLabel: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '600' },
  infoValue: { color: COLORS.textPrimary, fontSize: 13, fontWeight: '800', maxWidth: '60%', textAlign: 'right' },
  readingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  readingTitle: { fontSize: 14, fontWeight: '800', color: COLORS.textPrimary },
  readingDate: { fontSize: 11, color: COLORS.textLight, marginTop: 4 },
  readingValues: { alignItems: 'flex-end' },
  temp: { fontSize: 15, fontWeight: '900', color: COLORS.danger },
  hum: { fontSize: 13, fontWeight: '800', color: COLORS.info, marginTop: 4 },
});

export default SensorDashboardScreen;
