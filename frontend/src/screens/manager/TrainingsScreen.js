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

const CATEGORIES = ['safety', 'environment', 'quality', 'security', 'other'];
const STATUSES = ['scheduled', 'completed', 'cancelled'];

const TrainingsScreen = () => {
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState(false);
  const [detailModal, setDetailModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', category: 'safety', description: '', provider: '', location: '', startDate: '', endDate: '', status: 'scheduled' });

  const fetchTrainings = async () => {
    try {
      setError(null);
      const res = await api.get(API_URLS.trainings.all);
      setTrainings(extractItems(res.data));
    } catch (err) {
      setError(getErrorMessage(err, 'Impossible de charger les formations'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchTrainings(); }, []);

  const handleCreate = async () => {
    if (!form.title.trim() || !form.startDate.trim()) {
      Alert.alert('Requis', 'Le titre et la date de début sont obligatoires');
      return;
    }
    setSaving(true);
    try {
      await api.post(API_URLS.trainings.create, form);
      setModal(false);
      setForm({ title: '', category: 'safety', description: '', provider: '', location: '', startDate: '', endDate: '', status: 'scheduled' });
      fetchTrainings();
    } catch (err) {
      Alert.alert('Erreur', getErrorMessage(err, 'Création échouée'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id) => {
    Alert.alert('Supprimer', 'Supprimer cette formation ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(API_URLS.trainings.delete(id));
            fetchTrainings();
          } catch (err) {
            Alert.alert('Erreur', getErrorMessage(err, 'Suppression impossible'));
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => { setSelected(item); setDetailModal(true); }} activeOpacity={0.85}>
      <View style={styles.cardRow}>
        <View style={styles.iconBox}><Ionicons name="school-outline" size={22} color={COLORS.success} /></View>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardMeta}>{item.category || 'safety'} · {item.provider || 'Prestataire N/A'}</Text>
          <View style={styles.bottomRow}>
            <StatusBadge status={item.status || 'scheduled'} />
            <View style={styles.participantsBadge}>
              <Ionicons name="people-outline" size={12} color={COLORS.textSecondary} />
              <Text style={styles.participantsText}>{item.participants?.length || 0} participant(s)</Text>
            </View>
          </View>
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
      <ScreenHeader title="Formations" subtitle={`${trainings.length} formation(s)`} rightIcon="add-circle-outline" onRightPress={() => setModal(true)} />
      {error ? (
        <ErrorView message={error} onRetry={fetchTrainings} />
      ) : (
        <FlatList
          data={trainings}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchTrainings(); }} colors={[COLORS.primary]} />}
          ListEmptyComponent={<EmptyState icon="school-outline" message="Aucune formation" subtitle="Appuyez sur + pour créer" />}
        />
      )}

      <Modal visible={modal} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Nouvelle formation</Text>
            <TouchableOpacity onPress={() => setModal(false)}><Ionicons name="close" size={26} color={COLORS.textPrimary} /></TouchableOpacity>
          </View>
          <ScrollView style={styles.modalBody}>
            <Text style={styles.label}>Titre *</Text>
            <TextInput style={styles.input} placeholder="Titre de la formation" value={form.title} onChangeText={(v) => setForm({ ...form, title: v })} />
            <Text style={styles.label}>Catégorie</Text>
            <View style={styles.chipRow}>
              {CATEGORIES.map((category) => (
                <TouchableOpacity key={category} style={[styles.chip, form.category === category && styles.chipActive]} onPress={() => setForm({ ...form, category })}>
                  <Text style={[styles.chipText, form.category === category && styles.chipTextActive]}>{category}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.label}>Prestataire</Text>
            <TextInput style={styles.input} placeholder="Nom du prestataire" value={form.provider} onChangeText={(v) => setForm({ ...form, provider: v })} />
            <Text style={styles.label}>Lieu</Text>
            <TextInput style={styles.input} placeholder="Salle / site" value={form.location} onChangeText={(v) => setForm({ ...form, location: v })} />
            <Text style={styles.label}>Date de début (ISO) *</Text>
            <TextInput style={styles.input} placeholder="2026-04-20T09:00:00.000Z" value={form.startDate} onChangeText={(v) => setForm({ ...form, startDate: v })} />
            <Text style={styles.label}>Date de fin (ISO)</Text>
            <TextInput style={styles.input} placeholder="2026-04-20T17:00:00.000Z" value={form.endDate} onChangeText={(v) => setForm({ ...form, endDate: v })} />
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
            <PrimaryButton title="Créer la formation" onPress={handleCreate} loading={saving} icon="checkmark-outline" />
            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </Modal>

      <Modal visible={detailModal} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Détail formation</Text>
            <TouchableOpacity onPress={() => setDetailModal(false)}><Ionicons name="close" size={26} color={COLORS.textPrimary} /></TouchableOpacity>
          </View>
          {selected && (
            <ScrollView style={styles.modalBody}>
              <Text style={styles.detailTitle}>{selected.title}</Text>
              <StatusBadge status={selected.status || 'scheduled'} />
              <Text style={styles.detailLabel}>Catégorie</Text>
              <Text style={styles.detailValue}>{selected.category || '—'}</Text>
              <Text style={styles.detailLabel}>Prestataire</Text>
              <Text style={styles.detailValue}>{selected.provider || '—'}</Text>
              <Text style={styles.detailLabel}>Lieu</Text>
              <Text style={styles.detailValue}>{selected.location || '—'}</Text>
              <Text style={styles.detailLabel}>Dates</Text>
              <Text style={styles.detailValue}>{selected.startDate ? new Date(selected.startDate).toLocaleString('fr-FR') : '—'}{selected.endDate ? ` → ${new Date(selected.endDate).toLocaleString('fr-FR')}` : ''}</Text>
              <Text style={styles.detailLabel}>Description</Text>
              <Text style={styles.detailValue}>{selected.description || '—'}</Text>
              <Text style={styles.detailLabel}>Participants</Text>
              {selected.participants?.length ? selected.participants.map((p, i) => (
                <View key={p._id || i} style={styles.participantRow}>
                  <Ionicons name="person-outline" size={16} color={COLORS.primary} />
                  <Text style={styles.participantName}>{p.employee?.fullName || 'Participant'}</Text>
                  <StatusBadge status={p.status || 'planned'} />
                </View>
              )) : <Text style={styles.detailValue}>Aucun participant</Text>}
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
  cardRow: { flexDirection: 'row', alignItems: 'flex-start' },
  iconBox: { width: 42, height: 42, borderRadius: 12, backgroundColor: COLORS.success + '15', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  cardTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  cardMeta: { fontSize: 12, color: COLORS.textSecondary, marginTop: 3 },
  bottomRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 10 },
  participantsBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  participantsText: { fontSize: 12, color: COLORS.textSecondary },
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
  participantRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: COLORS.background },
  participantName: { flex: 1, fontSize: 14, color: COLORS.textPrimary },
});

export default TrainingsScreen;
