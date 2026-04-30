import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  Alert, RefreshControl, Modal, ScrollView, TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../api/axiosInstance';
import { API_URLS } from '../../api/endpoints';
import { COLORS, SHADOWS } from '../../constants/theme';
import { ScreenHeader, StatusBadge, LoadingView, EmptyState, ErrorView, PrimaryButton, Card } from '../../components/common';
import { extractItems, getErrorMessage } from '../../utils/api';

const AUDIT_TYPES = ['internal', 'external', 'safety', 'environment', 'compliance'];
const STATUSES = ['planned', 'in_progress', 'completed', 'cancelled'];

const AuditsScreen = () => {
  const [audits, setAudits] = useState([]);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [createModal, setCreateModal] = useState(false);
  const [detailModal, setDetailModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', type: 'safety', description: '', zone: '', scheduledDate: '', status: 'planned' });

  const fetchAudits = async () => {
    try {
      setError(null);
      const [auditsRes, zonesRes] = await Promise.all([
        api.get(API_URLS.audits.all),
        api.get(API_URLS.zones.all),
      ]);
      setAudits(extractItems(auditsRes.data));
      setZones(extractItems(zonesRes.data));
    } catch (err) {
      setError(getErrorMessage(err, 'Impossible de charger les audits'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchAudits(); }, []);

  const handleCreate = async () => {
    if (!form.title.trim()) {
      Alert.alert('Requis', 'Le titre est obligatoire');
      return;
    }
    setSaving(true);
    try {
      await api.post(API_URLS.audits.create, {
        title: form.title.trim(),
        type: form.type,
        description: form.description,
        zone: form.zone || undefined,
        scheduledDate: form.scheduledDate || undefined,
        status: form.status,
      });
      setCreateModal(false);
      setForm({ title: '', type: 'safety', description: '', zone: '', scheduledDate: '', status: 'planned' });
      fetchAudits();
    } catch (err) {
      Alert.alert('Erreur', getErrorMessage(err, 'Création échouée'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id) => {
    Alert.alert('Supprimer', 'Supprimer cet audit ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(API_URLS.audits.delete(id));
            fetchAudits();
          } catch (err) {
            Alert.alert('Erreur', getErrorMessage(err, 'Suppression impossible'));
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => { setSelected(item); setDetailModal(true); }} activeOpacity={0.85}>
      <View style={styles.cardHeader}>
        <View style={styles.iconBox}><Ionicons name="clipboard-outline" size={22} color={COLORS.primary} /></View>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardMeta}>{item.type} · {item.zone?.name || 'Sans zone'}</Text>
          <View style={styles.bottomRow}><StatusBadge status={item.status || 'planned'} /></View>
        </View>
        <TouchableOpacity onPress={() => handleDelete(item._id)} style={{ padding: 4 }}>
          <Ionicons name="trash-outline" size={18} color={COLORS.danger} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (loading) return <LoadingView />;

  return (
    <View style={styles.container}>
      <ScreenHeader title="Audits" subtitle={`${audits.length} audit(s)`} rightIcon="add-circle-outline" onRightPress={() => setCreateModal(true)} />
      {error ? (
        <ErrorView message={error} onRetry={fetchAudits} />
      ) : (
        <FlatList
          data={audits}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchAudits(); }} colors={[COLORS.primary]} />}
          ListEmptyComponent={<EmptyState icon="clipboard-outline" message="Aucun audit" subtitle="Appuyez sur + pour créer" />}
        />
      )}

      <Modal visible={createModal} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Nouvel audit</Text>
            <TouchableOpacity onPress={() => setCreateModal(false)}><Ionicons name="close" size={26} color={COLORS.textPrimary} /></TouchableOpacity>
          </View>
          <ScrollView style={styles.modalBody}>
            <Text style={styles.label}>Titre *</Text>
            <TextInput style={styles.input} placeholder="Titre de l'audit" value={form.title} onChangeText={(v) => setForm({ ...form, title: v })} />
            <Text style={styles.label}>Type</Text>
            <View style={styles.chipRow}>
              {AUDIT_TYPES.map((t) => (
                <TouchableOpacity key={t} style={[styles.chip, form.type === t && styles.chipActive]} onPress={() => setForm({ ...form, type: t })}>
                  <Text style={[styles.chipText, form.type === t && styles.chipTextActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.label}>Zone</Text>
            <View style={styles.chipRow}>
              {zones.map((zone) => (
                <TouchableOpacity key={zone._id} style={[styles.chip, form.zone === zone._id && styles.chipActive]} onPress={() => setForm({ ...form, zone: zone._id })}>
                  <Text style={[styles.chipText, form.zone === zone._id && styles.chipTextActive]}>{zone.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput style={styles.input} placeholder="Ou collez l'ID de zone" value={form.zone} onChangeText={(v) => setForm({ ...form, zone: v })} />
            <Text style={styles.label}>Date planifiée (ISO)</Text>
            <TextInput style={styles.input} placeholder="2026-04-20T09:00:00.000Z" value={form.scheduledDate} onChangeText={(v) => setForm({ ...form, scheduledDate: v })} />
            <Text style={styles.label}>Statut</Text>
            <View style={styles.chipRow}>
              {STATUSES.map((status) => (
                <TouchableOpacity key={status} style={[styles.chip, form.status === status && styles.chipActive]} onPress={() => setForm({ ...form, status })}>
                  <Text style={[styles.chipText, form.status === status && styles.chipTextActive]}>{status}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.label}>Description</Text>
            <TextInput style={[styles.input, { height: 80, textAlignVertical: 'top' }]} placeholder="Description..." value={form.description} onChangeText={(v) => setForm({ ...form, description: v })} multiline />
            <PrimaryButton title="Créer l'audit" onPress={handleCreate} loading={saving} icon="checkmark-outline" />
            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </Modal>

      <Modal visible={detailModal} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Détail audit</Text>
            <TouchableOpacity onPress={() => setDetailModal(false)}><Ionicons name="close" size={26} color={COLORS.textPrimary} /></TouchableOpacity>
          </View>
          {selected && (
            <ScrollView style={styles.modalBody}>
              <Text style={styles.detailTitle}>{selected.title}</Text>
              <StatusBadge status={selected.status || 'planned'} />
              <Text style={styles.detailLabel}>Type</Text>
              <Text style={styles.detailValue}>{selected.type}</Text>
              <Text style={styles.detailLabel}>Zone</Text>
              <Text style={styles.detailValue}>{selected.zone?.name || '—'}</Text>
              <Text style={styles.detailLabel}>Date planifiée</Text>
              <Text style={styles.detailValue}>{selected.scheduledDate ? new Date(selected.scheduledDate).toLocaleString('fr-FR') : '—'}</Text>
              <Text style={styles.detailLabel}>Description</Text>
              <Text style={styles.detailValue}>{selected.description || '—'}</Text>
              {Array.isArray(selected.findings) && selected.findings.length > 0 && (
                <>
                  <Text style={styles.detailLabel}>Findings</Text>
                  {selected.findings.map((finding) => (
                    <Card key={finding._id} style={{ marginTop: 8 }}>
                      <Text style={{ fontWeight: '700', color: COLORS.textPrimary }}>{finding.title}</Text>
                      <Text style={{ color: COLORS.textSecondary, marginTop: 4 }}>{finding.description || 'Sans description'}</Text>
                    </Card>
                  ))}
                </>
              )}
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
  card: { backgroundColor: COLORS.white, borderRadius: 12, padding: 14, marginBottom: 12, ...SHADOWS.small },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  iconBox: { width: 42, height: 42, borderRadius: 12, backgroundColor: COLORS.primary + '15', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  cardTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  cardMeta: { fontSize: 12, color: COLORS.textSecondary, marginTop: 3 },
  bottomRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 10 },
  modal: { flex: 1, backgroundColor: COLORS.white },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  modalTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  modalBody: { padding: 20 },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 8, marginTop: 16 },
  input: { borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 10, padding: 12, fontSize: 14, color: COLORS.textPrimary, backgroundColor: COLORS.background },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: { borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, marginRight: 8, marginBottom: 8 },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: 12, color: COLORS.textSecondary },
  chipTextActive: { color: COLORS.white, fontWeight: '600' },
  detailTitle: { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 8 },
  detailLabel: { fontSize: 12, color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 16, marginBottom: 4 },
  detailValue: { fontSize: 15, color: COLORS.textPrimary },
});

export default AuditsScreen;
