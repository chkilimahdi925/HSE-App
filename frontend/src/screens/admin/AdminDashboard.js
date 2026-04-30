import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { COLORS, SHADOWS } from '../../constants/theme';
import { ScreenHeader, Card } from '../../components/common';

const AdminAction = ({ icon, title, text, color, onPress }) => (
  <TouchableOpacity style={styles.actionCard} onPress={onPress} activeOpacity={0.85}>
    <View style={[styles.actionIcon, { backgroundColor: `${color}16` }]}>
      <Ionicons name={icon} size={24} color={color} />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={styles.actionTitle}>{title}</Text>
      <Text style={styles.actionText}>{text}</Text>
    </View>
    <Ionicons name="chevron-forward" size={18} color={COLORS.textLight} />
  </TouchableOpacity>
);

const SetupStep = ({ number, title, text, color }) => (
  <View style={styles.stepRow}>
    <View style={[styles.stepNumber, { backgroundColor: color }]}>
      <Text style={styles.stepNumberText}>{number}</Text>
    </View>
    <View style={{ flex: 1 }}>
      <Text style={styles.stepTitle}>{title}</Text>
      <Text style={styles.stepText}>{text}</Text>
    </View>
  </View>
);

const AdminDashboard = ({ navigation }) => {
  const { user } = useAuth();

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Espace administration"
        subtitle={`Bonjour ${user?.firstName || 'Admin'} · ${user?.company?.name || 'HSE Company'}`}
      />

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <Card style={styles.heroCard}>
          <View style={styles.heroIcon}>
            <Ionicons name="settings-outline" size={28} color={COLORS.white} />
          </View>
          <Text style={styles.heroTitle}>Configurez votre environnement HSE</Text>
          <Text style={styles.heroText}>
            L’accueil admin sert à préparer les données de base : utilisateurs, appareils, capteurs et zones. Les détails métier restent dans chaque module.
          </Text>
        </Card>

        <Text style={styles.sectionTitle}>Configuration rapide</Text>
        <AdminAction
          icon="people-outline"
          title="Gérer les utilisateurs"
          text="Créer les comptes admin, manager et agent."
          color={COLORS.primary}
          onPress={() => navigation.navigate('Users')}
        />
        <AdminAction
          icon="hardware-chip-outline"
          title="Gérer les appareils IoT"
          text="Associer ESP8266, statut et zone de surveillance."
          color={COLORS.info}
          onPress={() => navigation.navigate('Devices')}
        />
        <AdminAction
          icon="radio-outline"
          title="Gérer les capteurs"
          text="Créer le DHT11 et ouvrir son dashboard depuis la liste."
          color={COLORS.success}
          onPress={() => navigation.navigate('Sensors')}
        />
        <AdminAction
          icon="map-outline"
          title="Gérer les zones"
          text="Définir les zones HSE et leur niveau de risque."
          color={COLORS.accent}
          onPress={() => navigation.navigate('Zones')}
        />

        <Text style={styles.sectionTitle}>Ordre conseillé</Text>
        <Card style={styles.stepsCard}>
          <SetupStep number="1" title="Créer les zones" text="Atelier, laboratoire, stockage ou salle machines." color={COLORS.accent} />
          <SetupStep number="2" title="Ajouter les appareils" text="Créer le device esp8266-01 et le lier à une zone." color={COLORS.info} />
          <SetupStep number="3" title="Ajouter les capteurs" text="Créer le DHT11 puis ouvrir son dashboard temps réel." color={COLORS.success} />
          <SetupStep number="4" title="Créer les utilisateurs" text="Associer chaque compte à HSE Company et au bon rôle." color={COLORS.primary} />
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1, padding: 16 },
  sectionTitle: { fontSize: 17, fontWeight: '900', color: COLORS.textPrimary, marginTop: 10, marginBottom: 12 },
  heroCard: { borderRadius: 20, padding: 18, backgroundColor: COLORS.primary, ...SHADOWS.medium },
  heroIcon: { width: 58, height: 58, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.15)', marginBottom: 14 },
  heroTitle: { fontSize: 20, fontWeight: '900', color: COLORS.white, lineHeight: 27, marginBottom: 8 },
  heroText: { fontSize: 14, color: 'rgba(255,255,255,0.86)', lineHeight: 21 },
  actionCard: { backgroundColor: COLORS.card, borderRadius: 16, padding: 14, marginBottom: 12, flexDirection: 'row', alignItems: 'center', ...SHADOWS.small },
  actionIcon: { width: 50, height: 50, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  actionTitle: { fontSize: 14, fontWeight: '900', color: COLORS.textPrimary, marginBottom: 3 },
  actionText: { fontSize: 12, color: COLORS.textSecondary, lineHeight: 17 },
  stepsCard: { paddingVertical: 8 },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 11 },
  stepNumber: { width: 32, height: 32, borderRadius: 11, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  stepNumberText: { color: COLORS.white, fontWeight: '900' },
  stepTitle: { fontSize: 14, fontWeight: '900', color: COLORS.textPrimary, marginBottom: 3 },
  stepText: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 19 },
  noteCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, borderLeftWidth: 4, borderLeftColor: COLORS.danger },
  noteTitle: { fontSize: 14, fontWeight: '900', color: COLORS.textPrimary, marginBottom: 5 },
  noteText: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 20 },
  bottomPad: { height: 24 },
});

export default AdminDashboard;
