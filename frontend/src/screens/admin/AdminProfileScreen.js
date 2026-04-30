import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { COLORS, SHADOWS } from '../../constants/theme';
import { ScreenHeader } from '../../components/common';

const AdminProfileScreen = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Déconnexion', 'Voulez-vous vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Déconnecter', style: 'destructive', onPress: logout },
    ]);
  };

  const InfoRow = ({ icon, label, value }) => (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}><Ionicons name={icon} size={18} color="#8E44AD" /></View>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value || '—'}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScreenHeader title="Mon Profil" />
      <ScrollView>
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.firstName?.[0]}{user?.lastName?.[0]}</Text>
          </View>
          <Text style={styles.name}>{user?.firstName} {user?.lastName}</Text>
          <View style={styles.roleBadge}>
            <Ionicons name="shield-checkmark-outline" size={14} color={COLORS.white} />
            <Text style={styles.roleText}>ADMINISTRATEUR</Text>
          </View>
        </View>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Informations du compte</Text>
          <InfoRow icon="mail-outline" label="Email" value={user?.email} />
          <InfoRow icon="business-outline" label="Entreprise" value={user?.company?.name} />
          <InfoRow icon="calendar-outline" label="Membre depuis"
            value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : '—'} />
        </View>

        <View style={[styles.card, { backgroundColor: '#8E44AD' + '10', borderLeftWidth: 4, borderLeftColor: '#8E44AD' }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name="lock-open-outline" size={18} color="#8E44AD" />
            <Text style={[styles.sectionTitle, { color: '#8E44AD' }]}>Accès complet</Text>
          </View>
          <Text style={{ fontSize: 13, color: COLORS.textSecondary, marginTop: 4 }}>
            Vous avez accès à toutes les fonctionnalités de la plateforme HSE.
          </Text>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
          <Ionicons name="log-out-outline" size={20} color={COLORS.white} />
          <Text style={styles.logoutText}>Se déconnecter</Text>
        </TouchableOpacity>
        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  avatarSection: { alignItems: 'center', paddingVertical: 32, backgroundColor: '#8E44AD' },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)', marginBottom: 12,
  },
  avatarText: { fontSize: 28, fontWeight: '700', color: COLORS.white },
  name: { fontSize: 20, fontWeight: '700', color: COLORS.white, marginBottom: 8 },
  roleBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(0,0,0,0.2)', paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20,
  },
  roleText: { fontSize: 12, fontWeight: '700', color: COLORS.white, letterSpacing: 1 },
  card: { backgroundColor: COLORS.white, margin: 16, marginBottom: 0, borderRadius: 14, padding: 16, ...SHADOWS.small },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 16 },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.background },
  infoIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#8E44AD' + '12', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 11, color: COLORS.textLight, marginBottom: 2 },
  infoValue: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: COLORS.danger, margin: 16, marginTop: 24, borderRadius: 12, paddingVertical: 14,
  },
  logoutText: { fontSize: 15, fontWeight: '700', color: COLORS.white },
});

export default AdminProfileScreen;
