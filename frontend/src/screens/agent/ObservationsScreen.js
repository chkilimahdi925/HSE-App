import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  Modal, TextInput, Alert, RefreshControl, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../api/axiosInstance';
import { API_URLS } from '../../api/endpoints';
import { COLORS, SHADOWS } from '../../constants/theme';
import { ScreenHeader, StatusBadge, LoadingView, EmptyState, ErrorView, PrimaryButton } from '../../components/common';
import { useAuth } from '../../context/AuthContext';
import { extractItems, getErrorMessage } from '../../utils/api';

const severityColor = { low: COLORS.success, medium: COLORS.warning, high: COLORS.danger, critical: '#8B0000' };

const ObservationsScreen = () => {
  const { user } = useAuth();
  const [observations, setObservations] = useState([]);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', severity: 'low', zone: '' });
  const [saving, setSaving] = useState(false);

  const fetchObservations = async () => {
    try {
      setError(null);
      const [obsRes, zonesRes] = await Promise.all([
        api.get(API_URLS.observations.all),
        api.get(API_URLS.zones.all),
      ]);
      setObservations(extractItems(obsRes.data));
      setZones(extractItems(zonesRes.data));
    } catch (err) {
      setError(getErrorMessage(err, 'Impossible de charger les observations'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchObservations(); }, []);

  const handleCreate = async () => {
    if (!form.title.trim() || !form.description.trim() || !form.zone) {
      Alert.alert('Champs requis', 'Titre, description et zone sont obligatoires.');
      return;
    }
    setSaving(true);
    try {
      await api.post(API_URLS.observations.create, {
        title: form.title.trim(),
        description: form.description.trim(),
        severity: form.severity,
        zone: form.zone,
        reportedBy: user._id,
      });
      setModalVisible(false);
      setForm({ title: '', description: '', severity: 'low', zone: '' });
      fetchObservations();
    } catch (err) {
      Alert.alert('Erreur', getErrorMessage(err, 'Impossible de créer l’observation'));
    } finally {
      setSaving(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardMeta}>{new Date(item.createdAt).toLocaleDateString('fr-FR')}</Text>
        </View>
        <View style={[styles.severityDot, { backgroundColor: severityColor[item.severity] || COLORS.info }]} />
      </View>
      <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
      <View style={styles.cardFooter}>
        <StatusBadge status={item.status || 'open'} />
        {item.zone && <Text style={styles.zoneText}>📍 {item.zone?.name || item.zone}</Text>}
      </View>
    </View>
  );

  if (loading) return <LoadingView />;

  return (
    <View style={styles.container}>
      <ScreenHeader title="Mes observations" subtitle={`${observations.length} observation(s)`} rightIcon="add-circle-outline" onRightPress={() => setModalVisible(true)} />

      {error ? (
        <ErrorView message={error} onRetry={fetchObservations} />
      ) : (
        <FlatList
          data={observations}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchObservations(); }} colors={[COLORS.primary]} />}
          ListEmptyComponent={<EmptyState icon="eye-off-outline" message="Aucune observation" subtitle="Appuyez sur + pour créer une observation" />}
        />
      )}

      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Nouvelle observation</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={26} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalBody}>
            <Text style={styles.label}>Titre *</Text>
            <TextInput style={styles.input} placeholder="Titre de l'observation" value={form.title} onChangeText={(v) => setForm({ ...form, title: v })} />

            <Text style={styles.label}>Description *</Text>
            <TextInput style={[styles.input, styles.textarea]} placeholder="Décrivez l'observation..." value={form.description} onChangeText={(v) => setForm({ ...form, description: v })} multiline numberOfLines={4} />

            <Text style={styles.label}>Zone *</Text>
            <View style={styles.chipRow}>
              {zones.map((zone) => (
                <TouchableOpacity key={zone._id} style={[styles.chip, form.zone === zone._id && styles.chipActive]} onPress={() => setForm({ ...form, zone: zone._id })}>
                  <Text style={[styles.chipText, form.zone === zone._id && styles.chipTextActive]}>{zone.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput style={styles.input} placeholder="Ou collez l'ID de zone" value={form.zone} onChangeText={(v) => setForm({ ...form, zone: v })} />

            <Text style={styles.label}>Sévérité</Text>
            <View style={styles.chipRow}>
              {['low', 'medium', 'high', 'critical'].map((s) => (
                <TouchableOpacity key={s} style={[styles.chip, form.severity === s && { ...styles.chipActive, backgroundColor: severityColor[s] }]} onPress={() => setForm({ ...form, severity: s })}>
                  <Text style={[styles.chipText, form.severity === s && styles.chipTextActive]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <PrimaryButton title="Enregistrer" onPress={handleCreate} loading={saving} icon="checkmark-outline" />
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
  card: { backgroundColor: COLORS.white, borderRadius: 12, padding: 14, marginBottom: 12, ...SHADOWS.small },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  cardMeta: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
  severityDot: { width: 12, height: 12, borderRadius: 6, marginTop: 4 },
  cardDesc: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 10 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  zoneText: { fontSize: 12, color: COLORS.textSecondary },
  modal: { flex: 1, backgroundColor: COLORS.white },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  modalTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  modalBody: { padding: 20 },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 8, marginTop: 16 },
  input: { borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 10, padding: 12, fontSize: 14, color: COLORS.textPrimary, backgroundColor: COLORS.background },
  textarea: { height: 100, textAlignVertical: 'top' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: { borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, marginRight: 8, marginBottom: 8 },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: 12, color: COLORS.textSecondary, textTransform: 'capitalize' },
  chipTextActive: { color: COLORS.white, fontWeight: '600' },
});

export default ObservationsScreen;
