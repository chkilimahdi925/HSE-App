import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { COLORS, SHADOWS } from '../../constants/theme';
import { ScreenHeader, Card } from '../../components/common';

const SafetyTip = ({ icon, title, text, color }) => (
  <Card style={[styles.tipCard, { borderLeftColor: color }]}>
    <View style={[styles.tipIcon, { backgroundColor: `${color}18` }]}>
      <Ionicons name={icon} size={22} color={color} />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={styles.tipTitle}>{title}</Text>
      <Text style={styles.tipText}>{text}</Text>
    </View>
  </Card>
);

const QuickAction = ({ icon, label, color, onPress }) => (
  <TouchableOpacity style={styles.actionCard} onPress={onPress} activeOpacity={0.85}>
    <View style={[styles.actionIcon, { backgroundColor: `${color}16` }]}>
      <Ionicons name={icon} size={24} color={color} />
    </View>
    <Text style={styles.actionLabel}>{label}</Text>
  </TouchableOpacity>
);

const AgentDashboard = ({ navigation }) => {
  const { user } = useAuth();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir';

  return (
    <View style={styles.container}>
      <ScreenHeader
        title={`${greeting}, ${user?.firstName || 'Agent'} 👋`}
        subtitle={`Agent HSE · ${user?.company?.name || 'HSE Company'}`}
      />

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <Card style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View style={styles.heroIcon}>
              <Ionicons name="shield-checkmark-outline" size={30} color={COLORS.white} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroTitle}>Mission HSE du jour</Text>
              <Text style={styles.heroSubtitle}>Surveiller, signaler et prévenir les risques sur le terrain.</Text>
            </View>
          </View>
          <View style={styles.heroDivider} />
          <Text style={styles.heroText}>
            Faites une ronde rapide des zones sensibles, vérifiez les conditions de sécurité et créez une observation si vous détectez une situation à risque.
          </Text>
        </Card>

        <Text style={styles.sectionTitle}>Actions rapides</Text>
        <View style={styles.actionsGrid}>
          <QuickAction
            icon="eye-outline"
            label="Créer observation"
            color={COLORS.primary}
            onPress={() => navigation.navigate('Observations')}
          />
          <QuickAction
            icon="analytics-outline"
            label="Dashboard capteur"
            color={COLORS.info}
            onPress={() => navigation.navigate('SensorDashboard')}
          />
          <QuickAction
            icon="warning-outline"
            label="Voir alertes"
            color={COLORS.danger}
            onPress={() => navigation.navigate('Alerts')}
          />
          <QuickAction
            icon="notifications-outline"
            label="Notifications"
            color={COLORS.accent}
            onPress={() => navigation.navigate('Notifications')}
          />
        </View>

        <Text style={styles.sectionTitle}>Checklist terrain</Text>
        <Card style={styles.checklistCard}>
          {[
            'Port des EPI obligatoire avant intervention.',
            'Vérifier les zones de circulation et les obstacles.',
            'Signaler immédiatement toute situation dangereuse.',
            'Consulter les alertes avant de commencer la ronde.',
          ].map((item, index) => (
            <View key={item} style={[styles.checkRow, index !== 3 && styles.checkBorder]}>
              <View style={styles.checkIcon}>
                <Ionicons name="checkmark" size={15} color={COLORS.success} />
              </View>
              <Text style={styles.checkText}>{item}</Text>
            </View>
          ))}
        </Card>

        <Text style={styles.sectionTitle}>Conseil sécurité</Text>
        <SafetyTip
          icon="bulb-outline"
          title="Un risque signalé tôt évite un incident grave"
          text="Prenez une photo, décrivez clairement la situation et choisissez la zone concernée. Une observation précise accélère le traitement."
          color={COLORS.accent}
        />

        <SafetyTip
          icon="call-outline"
          title="Besoin d’assistance ?"
          text="Contactez votre manager HSE si une situation dépasse votre niveau d’intervention ou nécessite une action urgente."
          color={COLORS.info}
        />

        <View style={styles.bottomPad} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1, padding: 16 },
  sectionTitle: { fontSize: 17, fontWeight: '900', color: COLORS.textPrimary, marginTop: 10, marginBottom: 12 },
  heroCard: { backgroundColor: COLORS.primary, padding: 18, borderRadius: 20, ...SHADOWS.medium },
  heroTop: { flexDirection: 'row', alignItems: 'center' },
  heroIcon: { width: 58, height: 58, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.16)', alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  heroTitle: { color: COLORS.white, fontSize: 20, fontWeight: '900' },
  heroSubtitle: { color: 'rgba(255,255,255,0.78)', fontSize: 13, marginTop: 4, lineHeight: 18 },
  heroDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.15)', marginVertical: 14 },
  heroText: { color: 'rgba(255,255,255,0.9)', fontSize: 14, lineHeight: 21 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -6 },
  actionCard: { width: '50%', paddingHorizontal: 6, marginBottom: 12 },
  actionIcon: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  actionLabel: { fontSize: 13, fontWeight: '800', color: COLORS.textPrimary, lineHeight: 17 },
  checklistCard: { paddingVertical: 8 },
  checkRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  checkBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  checkIcon: { width: 26, height: 26, borderRadius: 9, backgroundColor: `${COLORS.success}14`, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  checkText: { flex: 1, fontSize: 13, color: COLORS.textSecondary, lineHeight: 19, fontWeight: '600' },
  tipCard: { borderLeftWidth: 4, flexDirection: 'row', alignItems: 'flex-start' },
  tipIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  tipTitle: { fontSize: 14, fontWeight: '900', color: COLORS.textPrimary, marginBottom: 5 },
  tipText: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 20 },
  bottomPad: { height: 24 },
});

export default AgentDashboard;
