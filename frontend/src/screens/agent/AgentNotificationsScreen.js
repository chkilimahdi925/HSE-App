import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../api/axiosInstance';
import { API_URLS } from '../../api/endpoints';
import { COLORS, SHADOWS } from '../../constants/theme';
import { ScreenHeader, LoadingView, EmptyState, ErrorView } from '../../components/common';
import { extractItems, getErrorMessage } from '../../utils/api';

const AgentNotificationsScreen = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchNotifications = async () => {
    try {
      setError(null);
      const res = await api.get(API_URLS.userNotifications.all);
      setNotifications(extractItems(res.data));
    } catch (err) {
      setError(getErrorMessage(err, 'Impossible de charger les notifications'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchNotifications(); }, []);

  const markAsRead = async (id) => {
    try {
      await api.patch(API_URLS.userNotifications.markAsRead(id));
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
    } catch (err) {
      Alert.alert('Erreur', getErrorMessage(err, 'Impossible de marquer comme lu'));
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch(API_URLS.userNotifications.markAllAsRead);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      Alert.alert('Erreur', getErrorMessage(err, 'Impossible de marquer toutes comme lues'));
    }
  };

  const getIcon = (type) => {
    const icons = {
      alert: 'warning-outline',
      incident: 'alert-circle-outline',
      training: 'school-outline',
      audit: 'clipboard-outline',
      report: 'document-text-outline',
      general: 'notifications-outline',
    };
    return icons[type] || 'notifications-outline';
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={[styles.card, !item.isRead && styles.cardUnread]} onPress={() => !item.isRead && markAsRead(item._id)} activeOpacity={0.85}>
      <View style={[styles.iconBox, { backgroundColor: item.isRead ? COLORS.border + '44' : COLORS.primary + '18' }]}>
        <Ionicons name={getIcon(item.type)} size={22} color={item.isRead ? COLORS.textSecondary : COLORS.primary} />
      </View>
      <View style={styles.content}>
        <Text style={[styles.title, !item.isRead && styles.titleUnread]}>{item.title || item.notification?.title || 'Notification'}</Text>
        <Text style={styles.body} numberOfLines={2}>{item.body || item.message || item.notification?.message || ''}</Text>
        <Text style={styles.time}>{new Date(item.createdAt).toLocaleString('fr-FR')}</Text>
      </View>
      {!item.isRead && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  if (loading) return <LoadingView />;
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <View style={styles.container}>
      <ScreenHeader title="Notifications" subtitle={unreadCount > 0 ? `${unreadCount} non lue(s)` : 'Toutes lues'} rightIcon={unreadCount > 0 ? 'checkmark-done-outline' : undefined} onRightPress={markAllAsRead} />
      {error ? (
        <ErrorView message={error} onRetry={fetchNotifications} />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchNotifications(); }} colors={[COLORS.primary]} />}
          ListEmptyComponent={<EmptyState icon="notifications-off-outline" message="Aucune notification" />}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  list: { padding: 16, flexGrow: 1 },
  card: { backgroundColor: COLORS.white, borderRadius: 12, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', ...SHADOWS.small },
  cardUnread: { borderLeftWidth: 3, borderLeftColor: COLORS.primary },
  iconBox: { borderRadius: 10, padding: 10, marginRight: 12 },
  content: { flex: 1 },
  title: { fontSize: 14, fontWeight: '500', color: COLORS.textSecondary },
  titleUnread: { fontWeight: '700', color: COLORS.textPrimary },
  body: { fontSize: 13, color: COLORS.textSecondary, marginTop: 3 },
  time: { fontSize: 11, color: COLORS.textLight, marginTop: 4 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary, marginLeft: 8 },
});

export default AgentNotificationsScreen;
