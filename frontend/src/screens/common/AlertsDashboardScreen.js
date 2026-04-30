import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import api from '../../api/axiosInstance';
import socket from '../../api/socket';
import { API_URLS } from '../../api/endpoints';
import { COLORS, SHADOWS } from '../../constants/theme';
import { ScreenHeader, StatusBadge, LoadingView, EmptyState, ErrorView, StatCard, Card } from '../../components/common';
import { extractItems, getErrorMessage } from '../../utils/api';

const SEVERITY_COLORS = {
  low: COLORS.success,
  medium: COLORS.warning,
  warning: COLORS.warning,
  high: COLORS.danger,
  critical: '#8B0000',
};

const SEVERITY_ICONS = {
  low: 'information-circle-outline',
  medium: 'warning-outline',
  warning: 'warning-outline',
  high: 'alert-circle-outline',
  critical: 'nuclear-outline',
};

const normalizeAlert = (alert) => ({
  ...alert,
  _id: String(alert?._id || alert?.id || `live-${Date.now()}`),
});

const AlertsDashboardScreen = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);

  const fetchAlerts = async () => {
    try {
      setError(null);
      const res = await api.get(API_URLS.alerts.all);
      setAlerts(extractItems(res.data).map(normalizeAlert));
    } catch (err) {
      setError(getErrorMessage(err, 'Impossible de charger les alertes'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  useEffect(() => {
    socket.connect();

    const onConnect = () => setSocketConnected(true);
    const onDisconnect = () => setSocketConnected(false);
    const onNewAlert = (newAlert) => {
      const alertItem = normalizeAlert(newAlert);
      setAlerts((prev) => {
        if (prev.some((item) => item._id === alertItem._id)) return prev;
        return [alertItem, ...prev];
      });
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('alert:new', onNewAlert);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('alert:new', onNewAlert);
      socket.disconnect();
    };
  }, []);

  const stats = useMemo(() => {
    const open = alerts.filter((a) => a.status === 'open').length;
    const acknowledged = alerts.filter((a) => a.status === 'acknowledged').length;
    const resolved = alerts.filter((a) => a.status === 'resolved').length;
    const critical = alerts.filter((a) => a.severity === 'critical' || a.severity === 'high').length;
    const unread = alerts.filter((a) => !a.isRead).length;

    return { total: alerts.length, open, acknowledged, resolved, critical, unread };
  }, [alerts]);

  const markAsRead = async (id) => {
    try {
      await api.patch(API_URLS.alerts.markRead(id));
      setAlerts((prev) => prev.map((a) => (a._id === id ? { ...a, isRead: true } : a)));
    } catch (err) {
      Alert.alert('Erreur', getErrorMessage(err, 'Impossible de marquer comme lu'));
    }
  };

  const acknowledgeAlert = async (id) => {
    try {
      await api.patch(API_URLS.alerts.acknowledge(id));
      setAlerts((prev) => prev.map((a) => (a._id === id ? { ...a, status: 'acknowledged', isRead: true } : a)));
    } catch (err) {
      Alert.alert('Erreur', getErrorMessage(err, 'Impossible de prendre en charge l’alerte'));
    }
  };

  const resolveAlert = async (id) => {
    try {
      await api.patch(API_URLS.alerts.resolve(id));
      setAlerts((prev) => prev.map((a) => (a._id === id ? { ...a, status: 'resolved', isRead: true } : a)));
    } catch (err) {
      Alert.alert('Erreur', getErrorMessage(err, 'Impossible de résoudre l’alerte'));
    }
  };

  const renderDashboard = () => (
    <View style={styles.dashboard}>
      <View style={styles.liveBox}>
        <View style={[styles.liveDot, { backgroundColor: socketConnected ? COLORS.success : COLORS.warning }]} />
        <Text style={styles.liveText}>{socketConnected ? 'Temps réel actif' : 'Connexion temps réel en attente'}</Text>
      </View>

      <View style={styles.grid}>
        <View style={styles.gridItem}>
          <StatCard label="Ouvertes" value={stats.open} icon="alert-circle-outline" color={COLORS.danger} />
        </View>
        <View style={styles.gridItem}>
          <StatCard label="Critiques" value={stats.critical} icon="warning-outline" color="#8B0000" />
        </View>
        <View style={styles.gridItem}>
          <StatCard label="En charge" value={stats.acknowledged} icon="hand-left-outline" color={COLORS.warning} />
        </View>
        <View style={styles.gridItem}>
          <StatCard label="Résolues" value={stats.resolved} icon="checkmark-circle-outline" color={COLORS.success} />
        </View>
      </View>

      <Card style={styles.ruleCard}>
        <View style={styles.ruleIcon}>
          <Ionicons name="thermometer-outline" size={22} color={COLORS.danger} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.ruleTitle}>Surveillance frigo</Text>
          <Text style={styles.ruleText}>Alerte automatique si température &lt; 0°C ou &gt; 7°C.</Text>
        </View>
      </Card>

      <Text style={styles.sectionTitle}>Dernières alertes</Text>
    </View>
  );

  const renderItem = ({ item }) => {
    const color = SEVERITY_COLORS[item.severity] || COLORS.info;
    const icon = SEVERITY_ICONS[item.severity] || 'alert-circle-outline';
    const valueText = item.readingValue !== undefined && item.readingValue !== null ? `${item.readingValue}°C` : null;
    const thresholdText = item.threshold !== undefined && item.threshold !== null ? `${item.threshold}°C` : null;

    return (
      <View style={[styles.card, !item.isRead && styles.cardUnread]}>
        <View style={[styles.iconBox, { backgroundColor: color + '18' }]}>
          <Ionicons name={icon} size={24} color={color} />
        </View>
        <View style={styles.content}>
          <View style={styles.row}>
            <Text style={styles.title} numberOfLines={2}>{item.title || item.message}</Text>
            {!item.isRead && <View style={styles.dot} />}
          </View>
          {item.message ? <Text style={styles.message} numberOfLines={3}>{item.message}</Text> : null}
          <Text style={styles.meta}>{item.type || 'Alerte'} · {item.zone?.name || 'Zone'} · {item.device?.name || item.device?.deviceId || 'Device'}</Text>
          {(valueText || thresholdText) && (
            <Text style={styles.measure}>Valeur: {valueText || '—'} · Seuil: {thresholdText || '—'}</Text>
          )}
          <Text style={styles.time}>{item.createdAt ? new Date(item.createdAt).toLocaleString('fr-FR') : 'Date inconnue'}</Text>
          <View style={styles.actions}>
            <StatusBadge status={item.status || 'open'} />
            <View style={styles.btnRow}>
              {!item.isRead && (
                <TouchableOpacity style={styles.actionBtn} onPress={() => markAsRead(item._id)}>
                  <Ionicons name="checkmark-done-outline" size={16} color={COLORS.primary} />
                  <Text style={styles.actionText}>Lire</Text>
                </TouchableOpacity>
              )}
              {item.status !== 'acknowledged' && item.status !== 'resolved' && (
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: COLORS.warning + '18' }]} onPress={() => acknowledgeAlert(item._id)}>
                  <Ionicons name="hand-left-outline" size={16} color={COLORS.warning} />
                  <Text style={[styles.actionText, { color: COLORS.warning }]}>Prendre en charge</Text>
                </TouchableOpacity>
              )}
              {item.status !== 'resolved' && (
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: COLORS.success + '18' }]} onPress={() => resolveAlert(item._id)}>
                  <Ionicons name="checkmark-circle-outline" size={16} color={COLORS.success} />
                  <Text style={[styles.actionText, { color: COLORS.success }]}>Résoudre</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </View>
    );
  };

  if (loading) return <LoadingView />;

  return (
    <View style={styles.container}>
      <ScreenHeader title="Alertes" subtitle={stats.unread > 0 ? `${stats.unread} non lue(s)` : 'Surveillance active'} />
      {error ? (
        <ErrorView message={error} onRetry={fetchAlerts} />
      ) : (
        <FlatList
          data={alerts}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          ListHeaderComponent={renderDashboard}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchAlerts(); }} colors={[COLORS.primary]} />}
          ListEmptyComponent={<EmptyState icon="shield-checkmark-outline" message="Aucune alerte" subtitle="Tout est sous contrôle." />}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  list: { padding: 16, flexGrow: 1 },
  dashboard: { marginBottom: 4 },
  liveBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary + '10', borderRadius: 14, padding: 12, marginBottom: 12 },
  liveDot: { width: 9, height: 9, borderRadius: 5, marginRight: 8 },
  liveText: { fontSize: 12, fontWeight: '800', color: COLORS.textPrimary },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -5 },
  gridItem: { width: '50%', paddingHorizontal: 5 },
  ruleCard: { flexDirection: 'row', alignItems: 'center' },
  ruleIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: COLORS.danger + '14', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  ruleTitle: { fontSize: 14, fontWeight: '900', color: COLORS.textPrimary },
  ruleText: { marginTop: 3, fontSize: 12, color: COLORS.textSecondary },
  sectionTitle: { fontSize: 16, fontWeight: '900', color: COLORS.textPrimary, marginTop: 6, marginBottom: 12 },
  card: { backgroundColor: COLORS.white, borderRadius: 14, padding: 14, marginBottom: 12, flexDirection: 'row', ...SHADOWS.small },
  cardUnread: { borderLeftWidth: 4, borderLeftColor: COLORS.danger },
  iconBox: { borderRadius: 12, padding: 10, marginRight: 12, alignSelf: 'flex-start' },
  content: { flex: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  title: { fontSize: 14, fontWeight: '900', color: COLORS.textPrimary, flex: 1, marginRight: 8 },
  message: { fontSize: 12, color: COLORS.textSecondary, marginTop: 5, lineHeight: 17 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.danger, marginTop: 4 },
  meta: { fontSize: 12, color: COLORS.textSecondary, marginTop: 6 },
  measure: { fontSize: 12, color: COLORS.textPrimary, fontWeight: '800', marginTop: 5 },
  time: { fontSize: 11, color: COLORS.textLight, marginTop: 3 },
  actions: { marginTop: 10 },
  btnRow: { flexDirection: 'row', gap: 8, marginTop: 8, flexWrap: 'wrap' },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.primary + '12', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  actionText: { fontSize: 12, color: COLORS.primary, fontWeight: '700' },
});

export default AlertsDashboardScreen;
