import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { COLORS, SHADOWS } from '../../constants/theme';
import { ScreenHeader, Card } from '../../components/common';

const QuickAction = ({ icon, label, description, color, onPress }) => (
  <TouchableOpacity style={styles.actionCard} onPress={onPress} activeOpacity={0.85}>
    <View style={[styles.actionIcon, { backgroundColor: `${color}16` }]}>
      <Ionicons name={icon} size={23} color={color} />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={styles.actionLabel}>{label}</Text>
      <Text style={styles.actionDesc}>{description}</Text>
    </View>
    <Ionicons name="chevron-forward" size={18} color={COLORS.textLight} />
  </TouchableOpacity>
);

const TimelineItem = ({ title, text, icon, color, last }) => (
  <View style={styles.timelineRow}>
    <View style={styles.timelineRail}>
      <View style={[styles.timelineDot, { backgroundColor: color }]}>
        <Ionicons name={icon} size={14} color={COLORS.white} />
      </View>
      {!last && <View style={styles.timelineLine} />}
    </View>
    <View style={styles.timelineContent}>
      <Text style={styles.timelineTitle}>{title}</Text>
      <Text style={styles.timelineText}>{text}</Text>
    </View>
  </View>
);

const ManagerDashboard = ({ navigation }) => {
  const { user } = useAuth();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir';

  return (
    <View style={styles.container}>
      <ScreenHeader
        title={`${greeting}, ${user?.firstName || 'Manager'} 👋`}
        subtitle={`Manager HSE · ${user?.company?.name || 'HSE Company'}`}
      />

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <Card style={styles.heroCard}>
          <View style={styles.heroBadge}>
            <Ionicons name="compass-outline" size={22} color={COLORS.white} />
            <Text style={styles.heroBadgeText}>Pilotage HSE</Text>
          </View>
          <Text style={styles.heroTitle}>Organisez les priorités sécurité de votre équipe</Text>
          <Text style={styles.heroText}>
            Utilisez cet accueil pour orienter votre journée : suivre les incidents, planifier les audits, préparer les formations et vérifier les points critiques.
          </Text>
        </Card>

        <Text style={styles.sectionTitle}>Actions manager</Text>
        <QuickAction
          icon="alert-circle-outline"
          label="Suivre les incidents"
          description="Consulter et traiter les événements déclarés."
          color={COLORS.danger}
          onPress={() => navigation.navigate('Incidents')}
        />
        <QuickAction
          icon="clipboard-outline"
          label="Préparer un audit"
          description="Planifier ou consulter les audits HSE."
          color={COLORS.primary}
          onPress={() => navigation.navigate('Audits')}
        />
        <QuickAction
          icon="school-outline"
          label="Gérer les formations"
          description="Suivre les sessions et participants."
          color={COLORS.success}
          onPress={() => navigation.navigate('Trainings')}
        />
        <QuickAction
          icon="analytics-outline"
          label="Dashboard capteur"
          description="Voir le détail temps réel DHT11."
          color={COLORS.info}
          onPress={() => navigation.navigate('SensorDashboard')}
        />

        <Text style={styles.sectionTitle}>Plan de supervision</Text>
        <Card style={styles.timelineCard}>
          <TimelineItem
            icon="map-outline"
            color={COLORS.primary}
            title="Matin : contrôle terrain"
            text="Vérifier les zones sensibles, les accès et le respect des EPI."
          />
          <TimelineItem
            icon="people-outline"
            color={COLORS.info}
            title="Après-midi : suivi équipe"
            text="Analyser les observations remontées par les agents et prioriser les actions."
          />
          <TimelineItem
            icon="document-text-outline"
            color={COLORS.accent}
            title="Fin de journée : synthèse"
            text="Préparer les actions correctives, rapports et rappels HSE."
            last
          />
        </Card>

        <Text style={styles.sectionTitle}>Rappel management</Text>
        <Card style={styles.noteCard}>
          <Ionicons name="shield-checkmark-outline" size={30} color={COLORS.success} />
          <View style={{ flex: 1 }}>
            <Text style={styles.noteTitle}>Priorisez les risques critiques</Text>
            <Text style={styles.noteText}>Un bon suivi HSE commence par la réduction des situations dangereuses avant qu’elles deviennent des incidents.</Text>
          </View>
        </Card>

        <View style={styles.bottomPad} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1, padding: 16 },
  sectionTitle: { fontSize: 17, fontWeight: '900', color: COLORS.textPrimary, marginTop: 10, marginBottom: 12 },
  heroCard: { backgroundColor: COLORS.primary, borderRadius: 20, padding: 18, ...SHADOWS.medium },
  heroBadge: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.14)', marginBottom: 14 },
  heroBadgeText: { color: COLORS.white, fontWeight: '800', fontSize: 12 },
  heroTitle: { color: COLORS.white, fontSize: 20, fontWeight: '900', lineHeight: 27, marginBottom: 9 },
  heroText: { color: 'rgba(255,255,255,0.86)', fontSize: 14, lineHeight: 21 },
  actionCard: { backgroundColor: COLORS.card, borderRadius: 16, padding: 14, marginBottom: 12, flexDirection: 'row', alignItems: 'center', ...SHADOWS.small },
  actionIcon: { width: 48, height: 48, borderRadius: 15, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  actionLabel: { fontSize: 14, fontWeight: '900', color: COLORS.textPrimary, marginBottom: 3 },
  actionDesc: { fontSize: 12, color: COLORS.textSecondary, lineHeight: 17 },
  timelineCard: { paddingVertical: 6 },
  timelineRow: { flexDirection: 'row' },
  timelineRail: { alignItems: 'center', marginRight: 12 },
  timelineDot: { width: 30, height: 30, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  timelineLine: { flex: 1, width: 2, backgroundColor: COLORS.border, marginVertical: 4 },
  timelineContent: { flex: 1, paddingBottom: 18 },
  timelineTitle: { fontSize: 14, fontWeight: '900', color: COLORS.textPrimary, marginBottom: 4 },
  timelineText: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 19 },
  noteCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, borderLeftWidth: 4, borderLeftColor: COLORS.success },
  noteTitle: { fontSize: 14, fontWeight: '900', color: COLORS.textPrimary, marginBottom: 4 },
  noteText: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 20 },
  bottomPad: { height: 24 },
});

export default ManagerDashboard;
