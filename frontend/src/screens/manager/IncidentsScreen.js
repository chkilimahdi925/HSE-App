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
import { useAuth } from '../../context/AuthContext';
import { extractItems, getErrorMessage } from '../../utils/api';

const SEVERITY_COLORS = { low: COLORS.success, medium: COLORS.warning, high: COLORS.danger, critical: '#8B0000' };

const IncidentsScreen = () => {
  const { user } = useAuth();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [detailModal, setDetailModal] = useState(false);
  const [resolveModal, setResolveModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchIncidents = async () => {
    try {
      setError(null);
      const res = await api.get(API_URLS.incidentEvents.all);
      setIncidents(extractItems(res.data));
    } catch (err) {
      setError(getErrorMessage(err, 'Impossible de charger les incidents'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchIncidents(); }, []);

  const handleResolve = async () => {
    if (!selected?._id) return;
    setSaving(true);
    try {
      await api.patch(API_URLS.incidentEvents.resolve(selected._id), {
        status: 'closed',
        resolvedBy: user._id,
        notes,
      });
      setResolveModal(false);
      setDetailModal(false);
      setNotes('');
      fetchIncidents();
    } catch (err) {
      Alert.alert('Erreur', getErrorMessage(err, 'Impossible de résoudre l’incident'));
    } finally {
      setSaving(false);
    }
  };

  const renderItem = ({ item }) => {
    const color = SEVERITY_COLORS[item.severity] || COLORS.warning;
    return (
      <TouchableOpacity style={styles.card} onPress={() => { setSelected(item); setDetailModal(true); }} activeOpacity={0.85}>
        <View style={[styles.severityBar, { backgroundColor: color }]} />
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{item.title || item.type || 'Incident'}</Text>
            <StatusBadge status={item.status || 'open'} />
          </View>
          <Text style={styles.cardDesc} numberOfLines={2}>{item.description || item.message || 'Aucune description'}</Text>
          <View style={styles.cardFooter}>
            <View style={styles.metaRow}>
              <Ionicons name="location-outline" size={12} color={COLORS.textSecondary} />
              <Text style={styles.metaText}>{item.zone?.name || 'Zone inconnue'}</Text>
            </View>
            <Text style={styles.dateText}>{new Date(item.createdAt).toLocaleString('fr-FR')}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) return <LoadingView />;

  return (
    <View style={styles.container}>
      <ScreenHeader title="Incidents" subtitle={`${incidents.length} incident(s)`} />
      {error ? (
        <ErrorView message={error} onRetry={fetchIncidents} />
      ) : (
        <FlatList
          data={incidents}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchIncidents(); }} colors={[COLORS.primary]} />}
          ListEmptyComponent={<EmptyState icon="alert-circle-outline" message="Aucun incident" />}
        />
      )}

      <Modal visible={detailModal} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Détail incident</Text>
            <TouchableOpacity onPress={() => setDetailModal(false)}><Ionicons name="close" size={26} color={COLORS.textPrimary} /></TouchableOpacity>
          </View>
          {selected && (
            <ScrollView style={styles.modalBody}>
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Titre</Text>
                <Text style={styles.detailValue}>{selected.title || selected.type || 'Incident'}</Text>
              </View>
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Description</Text>
                <Text style={styles.detailValue}>{selected.description || selected.message || '—'}</Text>
              </View>
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Zone</Text>
                <Text style={styles.detailValue}>{selected.zone?.name || '—'}</Text>
              </View>
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Statut</Text>
                <StatusBadge status={selected.status || 'open'} />
              </View>
              {selected.status !== 'closed' && (
                <PrimaryButton title="Marquer comme résolu" onPress={() => setResolveModal(true)} icon="checkmark-done-outline" color={COLORS.success} />
              )}
              <View style={{ height: 40 }} />
            </ScrollView>
          )}
        </View>
      </Modal>

      <Modal visible={resolveModal} animationType="fade" transparent>
        <View style={styles.overlay}>
          <View style={styles.resolveCard}>
            <Text style={styles.resolveTitle}>Résoudre l'incident</Text>
            <Text style={styles.resolveLabel}>Notes de résolution (optionnel)</Text>
            <TextInput style={styles.resolveInput} placeholder="Décrivez les actions prises..." value={notes} onChangeText={setNotes} multiline numberOfLines={4} />
            <View style={styles.resolveActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setResolveModal(false)}><Text style={styles.cancelText}>Annuler</Text></TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={handleResolve}>{saving ? <Text style={styles.confirmText}>...</Text> : <Text style={styles.confirmText}>Confirmer</Text>}</TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  list: { padding: 16, flexGrow: 1 },
  card: { backgroundColor: COLORS.white, borderRadius: 12, marginBottom: 12, flexDirection: 'row', overflow: 'hidden', ...SHADOWS.small },
  severityBar: { width: 5 },
  cardContent: { flex: 1, padding: 14 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, gap: 8 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary, flex: 1 },
  cardDesc: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 10 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: COLORS.textSecondary },
  dateText: { fontSize: 11, color: COLORS.textLight },
  modal: { flex: 1, backgroundColor: COLORS.white },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  modalTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  modalBody: { padding: 20 },
  detailSection: { marginBottom: 20 },
  detailLabel: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  detailValue: { fontSize: 15, color: COLORS.textPrimary, fontWeight: '500' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  resolveCard: { backgroundColor: COLORS.white, borderRadius: 16, padding: 20 },
  resolveTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 16 },
  resolveLabel: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 8 },
  resolveInput: { borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 10, padding: 12, fontSize: 14, color: COLORS.textPrimary, height: 100, textAlignVertical: 'top', marginBottom: 16 },
  resolveActions: { flexDirection: 'row', gap: 12 },
  cancelBtn: { flex: 1, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 10, padding: 12, alignItems: 'center' },
  cancelText: { color: COLORS.textSecondary, fontWeight: '600' },
  confirmBtn: { flex: 1, backgroundColor: COLORS.success, borderRadius: 10, padding: 12, alignItems: 'center' },
  confirmText: { color: COLORS.white, fontWeight: '700' },
});

export default IncidentsScreen;
