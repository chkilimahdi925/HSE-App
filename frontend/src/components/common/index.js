import React, { useMemo, useState } from 'react';
import {
  View, Text, TouchableOpacity, ActivityIndicator,
  StyleSheet, Platform, StatusBar, Modal, Pressable, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SHADOWS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';

const ROLE_LABELS = {
  admin: 'Administrateur',
  manager: 'Manager HSE',
  agent: 'Agent HSE',
};

const ROLE_MENUS = {
  admin: [
    { route: 'Dashboard', label: 'Accueil', icon: 'home-outline' },
    { route: 'Users', label: 'Utilisateurs', icon: 'people-outline' },
    { route: 'Devices', label: 'Appareils IoT', icon: 'hardware-chip-outline' },
    { route: 'Sensors', label: 'Capteurs', icon: 'radio-outline' },
    { route: 'Zones', label: 'Zones', icon: 'map-outline' },
    { route: 'Alerts', label: 'Alertes', icon: 'warning-outline' },
    { route: 'Profile', label: 'Profil', icon: 'person-outline' },
  ],
  manager: [
    { route: 'Dashboard', label: 'Accueil', icon: 'home-outline' },
    { route: 'SensorDashboard', label: 'Dashboard capteur', icon: 'analytics-outline' },
    { route: 'Incidents', label: 'Incidents', icon: 'alert-circle-outline' },
    { route: 'Audits', label: 'Audits', icon: 'clipboard-outline' },
    { route: 'Trainings', label: 'Formations', icon: 'school-outline' },
    { route: 'Alerts', label: 'Alertes', icon: 'warning-outline' },
    { route: 'Profile', label: 'Profil', icon: 'person-outline' },
  ],
  agent: [
    { route: 'Dashboard', label: 'Accueil', icon: 'home-outline' },
    { route: 'SensorDashboard', label: 'Dashboard capteur', icon: 'analytics-outline' },
    { route: 'Observations', label: 'Observations', icon: 'eye-outline' },
    { route: 'Alerts', label: 'Alertes', icon: 'warning-outline' },
    { route: 'Notifications', label: 'Notifications', icon: 'notifications-outline' },
    { route: 'Profile', label: 'Profil', icon: 'person-outline' },
  ],
};

const DrawerMenu = ({ visible, onClose }) => {
  const navigation = useNavigation();
  const { user, logout } = useAuth();
  const items = useMemo(() => ROLE_MENUS[user?.role] || [], [user?.role]);

  const goTo = (route) => {
    onClose();
    setTimeout(() => navigation.navigate(route), 120);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={drawerStyles.overlay}>
        <Pressable style={drawerStyles.backdrop} onPress={onClose} />
        <View style={drawerStyles.panel}>
          <View style={drawerStyles.profileBox}>
            <View style={drawerStyles.avatar}>
              <Text style={drawerStyles.avatarText}>
                {(user?.firstName?.[0] || 'H')}{(user?.lastName?.[0] || 'S')}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={drawerStyles.name}>{user?.firstName} {user?.lastName}</Text>
              <Text style={drawerStyles.role}>{ROLE_LABELS[user?.role] || user?.role}</Text>
              <Text style={drawerStyles.company}>{user?.company?.name || 'HSE Company'}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={drawerStyles.closeBtn}>
              <Ionicons name="close" size={22} color={COLORS.white} />
            </TouchableOpacity>
          </View>

          <ScrollView style={drawerStyles.items} showsVerticalScrollIndicator={false}>
            {items.map((item) => (
              <TouchableOpacity key={item.route} style={drawerStyles.item} onPress={() => goTo(item.route)} activeOpacity={0.85}>
                <View style={drawerStyles.itemIcon}>
                  <Ionicons name={item.icon} size={21} color={COLORS.primary} />
                </View>
                <Text style={drawerStyles.itemText}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={18} color={COLORS.textLight} />
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={drawerStyles.footer}>
            <TouchableOpacity style={drawerStyles.logoutBtn} onPress={logout} activeOpacity={0.85}>
              <Ionicons name="log-out-outline" size={18} color={COLORS.danger} />
              <Text style={drawerStyles.logoutText}>Se déconnecter</Text>
            </TouchableOpacity>
            <Text style={drawerStyles.version}>© 2026 HSE Manager</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// ─── SCREEN HEADER ────────────────────────────────────
export const ScreenHeader = ({ title, subtitle, rightIcon, onRightPress, showBack, onBack, showMenu = true }) => {
  const [drawerVisible, setDrawerVisible] = useState(false);

  return (
    <View style={headerStyles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />
      <View style={headerStyles.content}>
        {showBack ? (
          <TouchableOpacity onPress={onBack} style={headerStyles.leftBtn}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
        ) : showMenu ? (
          <TouchableOpacity onPress={() => setDrawerVisible(true)} style={headerStyles.leftBtn}>
            <Ionicons name="menu" size={28} color={COLORS.white} />
          </TouchableOpacity>
        ) : null}

        <View style={headerStyles.textContainer}>
          <Text style={headerStyles.title}>{title}</Text>
          {subtitle && <Text style={headerStyles.subtitle}>{subtitle}</Text>}
        </View>

        {rightIcon && (
          <TouchableOpacity onPress={onRightPress} style={headerStyles.rightBtn}>
            <Ionicons name={rightIcon} size={24} color={COLORS.white} />
          </TouchableOpacity>
        )}
      </View>
      <DrawerMenu visible={drawerVisible} onClose={() => setDrawerVisible(false)} />
    </View>
  );
};

const headerStyles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.primary,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  content: { flexDirection: 'row', alignItems: 'center' },
  leftBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    marginRight: 12,
  },
  textContainer: { flex: 1 },
  title: { fontSize: 20, fontWeight: '800', color: COLORS.white },
  subtitle: { fontSize: 13, color: 'rgba(255,255,255,0.78)', marginTop: 2 },
  rightBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    marginLeft: 8,
  },
});

const drawerStyles = StyleSheet.create({
  overlay: { flex: 1, flexDirection: 'row' },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' },
  panel: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '82%',
    maxWidth: 340,
    backgroundColor: COLORS.white,
    ...SHADOWS.medium,
  },
  profileBox: {
    backgroundColor: COLORS.primary,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 24 : 60,
    paddingHorizontal: 18,
    paddingBottom: 22,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: { color: COLORS.white, fontWeight: '900', fontSize: 18 },
  name: { color: COLORS.white, fontSize: 16, fontWeight: '800' },
  role: { color: 'rgba(255,255,255,0.82)', fontSize: 12, marginTop: 2 },
  company: { color: 'rgba(255,255,255,0.66)', fontSize: 11, marginTop: 2 },
  closeBtn: { padding: 6 },
  items: { padding: 14 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },
  itemIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: COLORS.primary + '12',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemText: { flex: 1, fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  footer: { padding: 16, borderTopWidth: 1, borderTopColor: COLORS.border },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: COLORS.danger + '12',
    gap: 8,
  },
  logoutText: { color: COLORS.danger, fontWeight: '800' },
  version: { marginTop: 12, textAlign: 'center', fontSize: 11, color: COLORS.textLight },
});

// ─── STAT CARD ────────────────────────────────────────
export const StatCard = ({ label, value, icon, color = COLORS.primary, onPress }) => (
  <TouchableOpacity
    style={[statStyles.card, { borderLeftColor: color }]}
    onPress={onPress}
    activeOpacity={onPress ? 0.7 : 1}
  >
    <View style={[statStyles.iconBox, { backgroundColor: color + '18' }]}>
      <Ionicons name={icon} size={22} color={color} />
    </View>
    <View style={statStyles.textBox}>
      <Text style={statStyles.value}>{value ?? '—'}</Text>
      <Text style={statStyles.label}>{label}</Text>
    </View>
  </TouchableOpacity>
);

const statStyles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    marginBottom: 12,
    ...SHADOWS.small,
  },
  iconBox: { borderRadius: 14, padding: 12, marginRight: 14 },
  textBox: { flex: 1 },
  value: { fontSize: 24, fontWeight: '900', color: COLORS.textPrimary },
  label: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
});

// ─── LIVE DHT11 CARD ─────────────────────────────────
export const Dht11LiveCard = ({ reading, loading, onRefresh }) => {
  const values = reading?.values || reading?.raw || {};
  const temperature = values.temperature ?? values.t ?? null;
  const humidity = values.humidity ?? values.h ?? null;
  const date = reading?.ts || reading?.createdAt || reading?.updatedAt;
  const status = reading?.device?.status || 'offline';
  const isOnline = status === 'online';

  return (
    <Card style={dhtStyles.card}>
      <View style={dhtStyles.header}>
        <View>
          <Text style={dhtStyles.title}>Capteur DHT11</Text>
          <Text style={dhtStyles.subtitle}>ESP8266-01 · Température & humidité</Text>
        </View>
        <TouchableOpacity onPress={onRefresh} style={dhtStyles.refreshBtn} disabled={loading}>
          {loading ? <ActivityIndicator size="small" color={COLORS.primary} /> : <Ionicons name="refresh" size={20} color={COLORS.primary} />}
        </TouchableOpacity>
      </View>

      <View style={dhtStyles.metrics}>
        <View style={dhtStyles.metricBox}>
          <View style={[dhtStyles.metricIcon, { backgroundColor: COLORS.danger + '14' }]}>
            <Ionicons name="thermometer-outline" size={24} color={COLORS.danger} />
          </View>
          <Text style={dhtStyles.metricValue}>{temperature !== null && temperature !== undefined ? `${Number(temperature).toFixed(1)}°C` : '—'}</Text>
          <Text style={dhtStyles.metricLabel}>Température</Text>
        </View>

        <View style={dhtStyles.metricBox}>
          <View style={[dhtStyles.metricIcon, { backgroundColor: COLORS.info + '14' }]}>
            <Ionicons name="water-outline" size={24} color={COLORS.info} />
          </View>
          <Text style={dhtStyles.metricValue}>{humidity !== null && humidity !== undefined ? `${Number(humidity).toFixed(1)}%` : '—'}</Text>
          <Text style={dhtStyles.metricLabel}>Humidité</Text>
        </View>
      </View>

      <View style={dhtStyles.statusRow}>
        <View style={[dhtStyles.dot, { backgroundColor: isOnline ? COLORS.success : COLORS.warning }]} />
        <Text style={dhtStyles.statusText}>{isOnline ? 'Device online' : 'En attente de données'}</Text>
        <Text style={dhtStyles.timeText}>{date ? new Date(date).toLocaleString('fr-FR') : 'Aucune lecture'}</Text>
      </View>
    </Card>
  );
};

const dhtStyles = StyleSheet.create({
  card: { padding: 16, borderLeftWidth: 4, borderLeftColor: COLORS.info },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 16, color: COLORS.textPrimary, fontWeight: '900' },
  subtitle: { fontSize: 12, color: COLORS.textSecondary, marginTop: 3 },
  refreshBtn: { width: 38, height: 38, borderRadius: 12, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.primary + '10' },
  metrics: { flexDirection: 'row', gap: 12 },
  metricBox: { flex: 1, backgroundColor: COLORS.background, borderRadius: 14, padding: 14, alignItems: 'center' },
  metricIcon: { width: 46, height: 46, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  metricValue: { fontSize: 22, fontWeight: '900', color: COLORS.textPrimary },
  metricLabel: { fontSize: 12, color: COLORS.textSecondary, marginTop: 3 },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 14 },
  dot: { width: 9, height: 9, borderRadius: 5, marginRight: 7 },
  statusText: { fontSize: 12, color: COLORS.textPrimary, fontWeight: '700' },
  timeText: { marginLeft: 'auto', fontSize: 11, color: COLORS.textLight },
});

// ─── STATUS BADGE ─────────────────────────────────────
export const StatusBadge = ({ status }) => {
  const colors = {
    active: COLORS.success, inactive: COLORS.danger,
    pending: COLORS.warning, resolved: COLORS.info,
    open: COLORS.danger, closed: COLORS.success,
    online: COLORS.success, offline: COLORS.textSecondary,
    maintenance: COLORS.warning,
    'in-progress': COLORS.warning, low: COLORS.success,
    medium: COLORS.warning, high: COLORS.danger, critical: '#8B0000',
  };
  const bg = colors[status?.toLowerCase()] || COLORS.textSecondary;
  return (
    <View style={[badgeStyles.badge, { backgroundColor: bg + '22', borderColor: bg }]}> 
      <Text style={[badgeStyles.text, { color: bg }]}>{status?.toUpperCase?.() || 'N/A'}</Text>
    </View>
  );
};

const badgeStyles = StyleSheet.create({
  badge: {
    borderRadius: 6, borderWidth: 1,
    paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start',
  },
  text: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
});

// ─── LOADING SPINNER ─────────────────────────────────
export const LoadingView = ({ message = 'Chargement...' }) => (
  <View style={loadStyles.container}>
    <ActivityIndicator size="large" color={COLORS.primary} />
    <Text style={loadStyles.text}>{message}</Text>
  </View>
);

const loadStyles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  text: { marginTop: 12, color: COLORS.textSecondary, fontSize: 14 },
});

// ─── EMPTY STATE ─────────────────────────────────────
export const EmptyState = ({ icon = 'folder-open-outline', message = 'Aucun élément', subtitle }) => (
  <View style={emptyStyles.container}>
    <Ionicons name={icon} size={56} color={COLORS.border} />
    <Text style={emptyStyles.message}>{message}</Text>
    {subtitle && <Text style={emptyStyles.subtitle}>{subtitle}</Text>}
  </View>
);

const emptyStyles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  message: { fontSize: 16, color: COLORS.textSecondary, fontWeight: '600', marginTop: 16 },
  subtitle: { fontSize: 13, color: COLORS.textLight, marginTop: 6, textAlign: 'center' },
});

// ─── ERROR VIEW ───────────────────────────────────────
export const ErrorView = ({ message, onRetry }) => (
  <View style={errorStyles.container}>
    <Ionicons name="alert-circle-outline" size={52} color={COLORS.danger} />
    <Text style={errorStyles.message}>{message}</Text>
    {onRetry && (
      <TouchableOpacity style={errorStyles.btn} onPress={onRetry}>
        <Text style={errorStyles.btnText}>Réessayer</Text>
      </TouchableOpacity>
    )}
  </View>
);

const errorStyles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  message: { fontSize: 15, color: COLORS.textSecondary, marginTop: 12, textAlign: 'center' },
  btn: {
    marginTop: 20, backgroundColor: COLORS.primary,
    paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8,
  },
  btnText: { color: COLORS.white, fontWeight: '600' },
});

// ─── PRIMARY BUTTON ───────────────────────────────────
export const PrimaryButton = ({ title, onPress, loading, disabled, color, icon }) => (
  <TouchableOpacity
    style={[btnStyles.btn, { backgroundColor: color || COLORS.primary }, disabled && btnStyles.disabled]}
    onPress={onPress}
    disabled={disabled || loading}
    activeOpacity={0.8}
  >
    {loading ? (
      <ActivityIndicator color={COLORS.white} size="small" />
    ) : (
      <View style={btnStyles.inner}>
        {icon && <Ionicons name={icon} size={18} color={COLORS.white} style={{ marginRight: 6 }} />}
        <Text style={btnStyles.text}>{title}</Text>
      </View>
    )}
  </TouchableOpacity>
);

const btnStyles = StyleSheet.create({
  btn: {
    borderRadius: 10, paddingVertical: 14, alignItems: 'center',
    justifyContent: 'center', marginVertical: 4,
  },
  inner: { flexDirection: 'row', alignItems: 'center' },
  text: { color: COLORS.white, fontWeight: '700', fontSize: 15 },
  disabled: { opacity: 0.6 },
});

// ─── CARD WRAPPER ─────────────────────────────────────
export const Card = ({ children, style, onPress }) => {
  if (onPress) {
    return (
      <TouchableOpacity style={[cardStyles.card, style]} onPress={onPress} activeOpacity={0.85}>
        {children}
      </TouchableOpacity>
    );
  }
  return <View style={[cardStyles.card, style]}>{children}</View>;
};

const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    ...SHADOWS.small,
  },
});
