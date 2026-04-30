import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl, Alert, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import api from '../../api/axiosInstance';
import { API_URLS } from '../../api/endpoints';
import { COLORS, SHADOWS } from '../../constants/theme';
import { ScreenHeader, EmptyState, ErrorView, LoadingView, StatusBadge, PrimaryButton, Card } from '../../components/common';
import { extractItems, getErrorMessage } from '../../utils/api';

const DHT_DEVICE_ID = 'esp8266-01';

const SensorsScreen = () => {
  const navigation = useNavigation();
  const [sensors, setSensors] = useState([]);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const dhtSensor = useMemo(
    () => sensors.find((s) => s.type === 'dht11' || s.device?.deviceId === DHT_DEVICE_ID),
    [sensors]
  );

  const dhtDevice = useMemo(
    () => devices.find((d) => d.deviceId === DHT_DEVICE_ID) || devices[0],
    [devices]
  );

  const fetchData = async () => {
    try {
      setError(null);
      const [sensorRes, deviceRes] = await Promise.all([
        api.get(API_URLS.sensors.all),
        api.get(API_URLS.devices.all),
      ]);
      setSensors(extractItems(sensorRes.data));
      setDevices(extractItems(deviceRes.data));
    } catch (err) {
      setError(getErrorMessage(err, 'Impossible de charger les capteurs'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openSensorDashboard = (sensor) => {
    const device = sensor?.device || dhtDevice;
    const deviceId = device?.deviceId || DHT_DEVICE_ID;

    navigation.navigate('SensorDashboard', {
      sensor,
      sensorId: sensor?._id,
      device,
      deviceId,
      title: sensor?.name || 'DHT11 Température / Humidité',
    });
  };

  const createDht11Sensor = async () => {
    const device = dhtDevice;

    if (!device?._id) {
      Alert.alert('Device manquant', 'Créez d’abord le device ESP8266-01 et associez-le à une zone.');
      return;
    }

    if (!device?.zone?._id && !device?.zone) {
      Alert.alert('Zone manquante', 'Le device ESP8266-01 doit être rattaché à une zone avant de créer le capteur.');
      return;
    }

    if (dhtSensor?._id) {
      Alert.alert('Capteur déjà créé', 'Le capteur DHT11 existe déjà. Ouvrir son dashboard ?', [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Ouvrir', onPress: () => openSensorDashboard(dhtSensor) },
      ]);
      return;
    }

    setSaving(true);
    try {
      const res = await api.post(API_URLS.sensors.create, {
        name: 'DHT11 Température / Humidité',
        type: 'dht11',
        device: device._id,
        threshold: 35,
        unit: '°C / %',
      });
      Alert.alert('Succès', 'Capteur DHT11 ajouté.');
      await fetchData();
      openSensorDashboard(res.data);
    } catch (err) {
      Alert.alert('Erreur', getErrorMessage(err, 'Création du capteur impossible'));
    } finally {
      setSaving(false);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity activeOpacity={0.86} onPress={() => openSensorDashboard(item)}>
      <Card style={styles.card}>
        <View style={styles.row}>
          <View style={styles.iconBox}>
            <Ionicons name={item.type === 'dht11' ? 'thermometer-outline' : 'radio-outline'} size={24} color={COLORS.info} />
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.titleRow}>
              <Text style={styles.name}>{item.name}</Text>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
            </View>
            <Text style={styles.meta}>{item.type} · {item.device?.deviceId || item.device?.name || 'Device'} · {item.zone?.name || 'Zone'}</Text>
            <View style={styles.bottomRow}>
              <StatusBadge status={item.status || 'offline'} />
              <Text style={styles.unit}>{item.unit || '—'}</Text>
              <Text style={styles.liveHint}>Voir dashboard</Text>
            </View>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  if (loading) return <LoadingView />;

  return (
    <View style={styles.container}>
      <ScreenHeader title="Capteurs" subtitle="Appuyez sur un capteur pour voir son dashboard temps réel" rightIcon="add-circle-outline" onRightPress={createDht11Sensor} />
      <View style={styles.actionBox}>
        <Text style={styles.actionTitle}>Capteur principal du PFE</Text>
        <Text style={styles.actionText}>Le DHT11 est lié au device {DHT_DEVICE_ID}. Après création, touchez le capteur pour ouvrir température/humidité en direct.</Text>
        <PrimaryButton title="Ajouter DHT11" icon="add-outline" onPress={createDht11Sensor} loading={saving} />
      </View>
      {error ? (
        <ErrorView message={error} onRetry={fetchData} />
      ) : (
        <FlatList
          data={sensors}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} colors={[COLORS.primary]} />}
          ListEmptyComponent={<EmptyState icon="radio-outline" message="Aucun capteur" subtitle="Appuyez sur Ajouter DHT11 pour créer le capteur principal." />}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  actionBox: { margin: 16, marginBottom: 0, padding: 16, borderRadius: 16, backgroundColor: COLORS.white, ...SHADOWS.small },
  actionTitle: { fontSize: 15, fontWeight: '900', color: COLORS.textPrimary },
  actionText: { fontSize: 12, color: COLORS.textSecondary, marginTop: 4, marginBottom: 10, lineHeight: 18 },
  list: { padding: 16, flexGrow: 1 },
  card: { marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  iconBox: { width: 48, height: 48, borderRadius: 15, backgroundColor: COLORS.info + '12', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  name: { flex: 1, fontSize: 15, fontWeight: '800', color: COLORS.textPrimary },
  meta: { fontSize: 12, color: COLORS.textSecondary, marginTop: 3 },
  bottomRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8, flexWrap: 'wrap' },
  unit: { fontSize: 12, color: COLORS.textLight },
  liveHint: { fontSize: 11, fontWeight: '800', color: COLORS.primary },
});

export default SensorsScreen;
