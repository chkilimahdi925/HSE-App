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

const RISK_COLORS = { low: COLORS.success, medium: COLORS.warning, high: COLORS.danger };
const RISK_LEVELS = ['low', 'medium', 'high'];

const ZonesScreen = () => {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [createModal, setCreateModal] = useState(false);
  const [detailModal, setDetailModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', riskLevel: 'low' });

  const fetchZones = async () => {
    try {
      setError(null);
      const res = await api.get(API_URLS.zones.all);
      setZones(extractItems(res.data));
    } catch (err) {
      setError(getErrorMessage(err, 'Impossible de charger les zones'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchZones(); }, []);

  const handleCreate = async () => {
    if (!form.name.trim()) {
      Alert.alert('Requis', 'Le nom est obligatoire');
      return;
    }
    setSaving(true);
    try {
      await api.post(API_URLS.zones.create, {
        name: form.name.trim(),
        description: form.description,
        riskLevel: form.riskLevel,
      });
      setCreateModal(false);
      setForm({ name: '', description: '', riskLevel: 'low' });
      fetchZones();
    } catch (err) {
      Alert.alert('Erreur', getErrorMessage(err, 'Création échouée'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id, name) => {
    Alert.alert('Supprimer', `Supprimer la zone "${name}" ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(API_URLS.zones.delete(id));
            fetchZones();
          } catch (err) {
            Alert.alert('Erreur', getErrorMessage(err, 'Suppression impossible'));
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.card, { borderLeftColor: RISK_COLORS[item.riskLevel] || COLORS.info }]}
      onPress={() => { setSelected(item); setDetailModal(true); }}
      activeOpacity={0.85}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.iconBox, { backgroundColor: (RISK_COLORS[item.riskLevel] || COLORS.info) + '15' }]}>
          <Ionicons name="map-outline" size={20} color={RISK_COLORS[item.riskLevel] || COLORS.info} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.zoneName}>{item.name}</Text>
          <Text style={styles.zoneMeta}>Risque: {item.riskLevel?.toUpperCase()}</Text>
        </View>
        <TouchableOpacity onPress={() => handleDelete(item._id, item.name)} style={{ padding: 6 }}>
          <Ionicons name="trash-outline" size={18} color={COLORS.danger} />
        </TouchableOpacity>
      </View>
      <View style={styles.cardFooter}>
        <Text style={styles.statText}>{item.description || 'Sans description'}</Text>
        <StatusBadge status={item.isActive === false ? 'inactive' : 'active'} />
      </View>
    </TouchableOpacity>
  );

  if (loading) return <LoadingView />;

  return (
    <View style={styles.container}>
      <ScreenHeader title="Zones" subtitle={`${zones.length} zone(s)`} rightIcon="add-circle-outline" onRightPress={() => setCreateModal(true)} />
      {error ? (
        <ErrorView message={error} onRetry={fetchZones} />
      ) : (
        <FlatList
          data={zones}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchZones(); }} colors={[COLORS.primary]} />}
          ListEmptyComponent={<EmptyState icon="map-outline" message="Aucune zone configurée" subtitle="Appuyez sur + pour créer" />}
        />
      )}

      <Modal visible={createModal} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Nouvelle zone</Text>
            <TouchableOpacity onPress={() => setCreateModal(false)}><Ionicons name="close" size={26} color={COLORS.textPrimary} /></TouchableOpacity>
          </View>
          <ScrollView style={styles.modalBody}>
            <Text style={styles.label}>Nom *</Text>
            <TextInput style={styles.input} placeholder="Nom de la zone" value={form.name} onChangeText={(v) => setForm({ ...form, name: v })} />
            <Text style={styles.label}>Niveau de risque</Text>
            <View style={styles.chipRow}>
              {RISK_LEVELS.map((r) => (
                <TouchableOpacity key={r} style={[styles.chip, form.riskLevel === r && { ...styles.chipActive, backgroundColor: RISK_COLORS[r] }]} onPress={() => setForm({ ...form, riskLevel: r })}>
                  <Text style={[styles.chipText, form.riskLevel === r && styles.chipTextActive]}>{r}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.label}>Description</Text>
            <TextInput style={[styles.input, { height: 80, textAlignVertical: 'top' }]} placeholder="Description..." value={form.description} onChangeText={(v) => setForm({ ...form, description: v })} multiline />
            <PrimaryButton title="Créer la zone" onPress={handleCreate} loading={saving} icon="checkmark-outline" />
            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </Modal>

      <Modal visible={detailModal} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Détail zone</Text>
            <TouchableOpacity onPress={() => setDetailModal(false)}><Ionicons name="close" size={26} color={COLORS.textPrimary} /></TouchableOpacity>
          </View>
          {selected && (
            <ScrollView style={styles.modalBody}>
              <Text style={styles.detailTitle}>{selected.name}</Text>
              <View style={[styles.riskTag, { backgroundColor: (RISK_COLORS[selected.riskLevel] || COLORS.info) + '18' }]}>
                <Text style={[styles.riskText, { color: RISK_COLORS[selected.riskLevel] || COLORS.info }]}>
                  RISQUE: {selected.riskLevel?.toUpperCase()}
                </Text>
              </View>
              <Text style={styles.detailLabel}>Description</Text>
              <Text style={styles.detailValue}>{selected.description || '—'}</Text>
              <Text style={styles.detailLabel}>Statut</Text>
              <StatusBadge status={selected.isActive === false ? 'inactive' : 'active'} />
              <View style={{ height: 40 }} />
            </ScrollView>
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  list: { padding: 16, flexGrow: 1 },
  card: { backgroundColor: COLORS.white, borderRadius: 12, padding: 14, marginBottom: 12, borderLeftWidth: 4, ...SHADOWS.small },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  iconBox: { width: 42, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  zoneName: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  zoneMeta: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 14 },
  statText: { fontSize: 12, color: COLORS.textSecondary, flex: 1 },
  modal: { flex: 1, backgroundColor: COLORS.white },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  modalTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  modalBody: { padding: 20 },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 8, marginTop: 16 },
  input: { borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 10, padding: 12, fontSize: 14, color: COLORS.textPrimary, backgroundColor: COLORS.background },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: { borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, marginRight: 8, marginBottom: 8 },
  chipActive: { borderColor: 'transparent' },
  chipText: { fontSize: 12, color: COLORS.textSecondary },
  chipTextActive: { color: COLORS.white, fontWeight: '600' },
  detailTitle: { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 8 },
  detailLabel: { fontSize: 12, color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 16, marginBottom: 4 },
  detailValue: { fontSize: 15, color: COLORS.textPrimary },
  riskTag: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  riskText: { fontWeight: '700', fontSize: 12 },
});

export default ZonesScreen;
