import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  Alert, RefreshControl, Modal, ScrollView, TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../api/axiosInstance';
import { API_URLS } from '../../api/endpoints';
import { COLORS, SHADOWS } from '../../constants/theme';
import { ScreenHeader, StatusBadge, LoadingView, EmptyState, ErrorView, PrimaryButton } from '../../components/common';
import { extractItems, getErrorMessage } from '../../utils/api';

const DevicesScreen = () => {
  const [devices, setDevices] = useState([]);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [createModal, setCreateModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ deviceId: '', name: '', zone: '', description: '' });

  const fetchDevices = async () => {
    try {
      setError(null);
      const [devicesRes, zonesRes] = await Promise.all([
        api.get(API_URLS.devices.all),
        api.get(API_URLS.zones.all),
      ]);
      setDevices(extractItems(devicesRes.data));
      setZones(extractItems(zonesRes.data));
    } catch (err) {
      setError(getErrorMessage(err, 'Impossible de charger les appareils'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchDevices(); }, []);

  const handleCreate = async () => {
    if (!form.deviceId || !form.zone) {
      Alert.alert('Requis', 'L’identifiant deviceId et la zone sont obligatoires');
      return;
    }
    setSaving(true);
    try {
      await api.post(API_URLS.devices.create, form);
      setCreateModal(false);
      setForm({ deviceId: '', name: '', zone: '', description: '' });
      fetchDevices();
    } catch (err) {
      Alert.alert('Erreur', getErrorMessage(err, 'Création échouée'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id, name) => {
    Alert.alert('Supprimer', `Supprimer "${name}" ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(API_URLS.devices.delete(id));
            fetchDevices();
          } catch (err) {
            Alert.alert('Erreur', getErrorMessage(err, 'Suppression impossible'));
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.iconBox}>
        <Ionicons name="hardware-chip-outline" size={24} color={COLORS.info} />
      </View>
      <View style={styles.content}>
        <Text style={styles.deviceName}>{item.name || item.deviceId}</Text>
        <Text style={styles.deviceMeta}>deviceId: {item.deviceId}</Text>
        <View style={styles.bottomRow}>
          <StatusBadge status={item.status || 'offline'} />
          {item.zone && (
            <View style={styles.zoneTag}>
              <Ionicons name="location-outline" size={12} color={COLORS.textSecondary} />
              <Text style={styles.zoneText}>{item.zone?.name || item.zone}</Text>
            </View>
          )}
        </View>
      </View>
      <TouchableOpacity onPress={() => handleDelete(item._id, item.name || item.deviceId)} style={{ padding: 8 }}>
        <Ionicons name="trash-outline" size={18} color={COLORS.danger} />
      </TouchableOpacity>
    </View>
  );

  if (loading) return <LoadingView />;

  return (
    <View style={styles.container}>
      <ScreenHeader title="Appareils IoT" subtitle={`${devices.length} appareil(s)`} rightIcon="add-circle-outline" onRightPress={() => setCreateModal(true)} />
      {error ? (
        <ErrorView message={error} onRetry={fetchDevices} />
      ) : (
        <FlatList
          data={devices}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchDevices(); }} colors={[COLORS.primary]} />}
          ListEmptyComponent={<EmptyState icon="hardware-chip-outline" message="Aucun appareil enregistré" subtitle="Appuyez sur + pour ajouter" />}
        />
      )}

      <Modal visible={createModal} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Nouvel appareil</Text>
            <TouchableOpacity onPress={() => setCreateModal(false)}><Ionicons name="close" size={26} color={COLORS.textPrimary} /></TouchableOpacity>
          </View>
          <ScrollView style={styles.modalBody}>
            <Text style={styles.label}>Device ID *</Text>
            <TextInput style={styles.input} placeholder="Ex: ESP32-001" value={form.deviceId} onChangeText={(v) => setForm({ ...form, deviceId: v })} />
            <Text style={styles.label}>Nom</Text>
            <TextInput style={styles.input} placeholder="Nom de l'appareil" value={form.name} onChangeText={(v) => setForm({ ...form, name: v })} />
            <Text style={styles.label}>Zone *</Text>
            <View style={styles.chipRow}>
              {zones.map((zone) => (
                <TouchableOpacity key={zone._id} style={[styles.chip, form.zone === zone._id && styles.chipActive]} onPress={() => setForm({ ...form, zone: zone._id })}>
                  <Text style={[styles.chipText, form.zone === zone._id && styles.chipTextActive]}>{zone.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput style={styles.input} placeholder="Ou collez l'ID de zone" value={form.zone} onChangeText={(v) => setForm({ ...form, zone: v })} />
            <Text style={styles.label}>Description</Text>
            <TextInput style={[styles.input, { height: 80, textAlignVertical: 'top' }]} placeholder="Description..." value={form.description} onChangeText={(v) => setForm({ ...form, description: v })} multiline />
            <PrimaryButton title="Ajouter l'appareil" onPress={handleCreate} loading={saving} icon="add-outline" color={COLORS.info} />
            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  list: { padding: 16, flexGrow: 1 },
  card: { backgroundColor: COLORS.white, borderRadius: 12, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'flex-start', ...SHADOWS.small },
  iconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: COLORS.info + '15', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  content: { flex: 1 },
  deviceName: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  deviceMeta: { fontSize: 12, color: COLORS.textSecondary, marginTop: 3 },
  bottomRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 },
  zoneTag: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  zoneText: { fontSize: 12, color: COLORS.textSecondary },
  modal: { flex: 1, backgroundColor: COLORS.white },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  modalTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  modalBody: { padding: 20 },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 8, marginTop: 16 },
  input: { borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 10, padding: 12, fontSize: 14, color: COLORS.textPrimary, backgroundColor: COLORS.background },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: { borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, marginRight: 8, marginBottom: 8 },
  chipActive: { backgroundColor: COLORS.info, borderColor: COLORS.info },
  chipText: { fontSize: 12, color: COLORS.textSecondary },
  chipTextActive: { color: COLORS.white, fontWeight: '600' },
});

export default DevicesScreen;
