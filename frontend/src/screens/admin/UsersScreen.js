import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  Alert, RefreshControl, Modal, ScrollView, TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../api/axiosInstance';
import { API_URLS } from '../../api/endpoints';
import { COLORS, SHADOWS } from '../../constants/theme';
import { ScreenHeader, LoadingView, EmptyState, ErrorView, PrimaryButton } from '../../components/common';
import { extractItems, getErrorMessage } from '../../utils/api';

const ROLE_COLORS = { admin: '#8E44AD', manager: COLORS.primary, agent: COLORS.success };
const ROLE_ICONS = { admin: 'shield-outline', manager: 'briefcase-outline', agent: 'person-outline' };

const UsersScreen = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [createModal, setCreateModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', role: 'agent' });
  const [search, setSearch] = useState('');

  const fetchUsers = async () => {
    try {
      setError(null);
      const res = await api.get(API_URLS.users.all);
      setUsers(extractItems(res.data));
    } catch (err) {
      setError(getErrorMessage(err, 'Impossible de charger les utilisateurs'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleCreate = async () => {
    const { firstName, lastName, email, password } = form;
    if (!firstName || !lastName || !email || !password) {
      Alert.alert('Champs requis', 'Tous les champs marqués * sont obligatoires');
      return;
    }
    setSaving(true);
    try {
      await api.post(API_URLS.users.create, form);
      setCreateModal(false);
      setForm({ firstName: '', lastName: '', email: '', password: '', role: 'agent' });
      fetchUsers();
    } catch (err) {
      Alert.alert('Erreur', getErrorMessage(err, 'Création échouée'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id, name) => {
    Alert.alert('Supprimer', `Supprimer ${name} ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(API_URLS.users.delete(id));
            fetchUsers();
          } catch (err) {
            Alert.alert('Erreur', getErrorMessage(err, 'Suppression impossible'));
          }
        },
      },
    ]);
  };

  const filtered = users.filter((u) => `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(search.toLowerCase()));

  const renderItem = ({ item }) => {
    const color = ROLE_COLORS[item.role] || COLORS.info;
    const icon = ROLE_ICONS[item.role] || 'person-outline';
    return (
      <View style={styles.card}>
        <View style={[styles.avatar, { backgroundColor: color + '18' }]}>
          <Text style={[styles.avatarText, { color }]}>{item.firstName?.[0]}{item.lastName?.[0]}</Text>
        </View>
        <View style={styles.content}>
          <Text style={styles.name}>{item.firstName} {item.lastName}</Text>
          <Text style={styles.email}>{item.email}</Text>
          <View style={styles.roleBadge}>
            <Ionicons name={icon} size={12} color={color} />
            <Text style={[styles.roleText, { color }]}>{item.role?.toUpperCase()}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => handleDelete(item._id, `${item.firstName} ${item.lastName}`)} style={styles.deleteBtn}>
          <Ionicons name="trash-outline" size={18} color={COLORS.danger} />
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) return <LoadingView />;

  return (
    <View style={styles.container}>
      <ScreenHeader title="Utilisateurs" subtitle={`${users.length} utilisateur(s)`} rightIcon="person-add-outline" onRightPress={() => setCreateModal(true)} />

      <View style={styles.searchWrapper}>
        <Ionicons name="search-outline" size={18} color={COLORS.textSecondary} style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un utilisateur..."
          placeholderTextColor={COLORS.textLight}
          value={search}
          onChangeText={setSearch}
        />
        {search ? (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={COLORS.textSecondary} />
          </TouchableOpacity>
        ) : null}
      </View>

      {error ? (
        <ErrorView message={error} onRetry={fetchUsers} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchUsers(); }} colors={[COLORS.primary]} />}
          ListEmptyComponent={<EmptyState icon="people-outline" message="Aucun utilisateur trouvé" />}
        />
      )}

      <Modal visible={createModal} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Nouvel utilisateur</Text>
            <TouchableOpacity onPress={() => setCreateModal(false)}><Ionicons name="close" size={26} color={COLORS.textPrimary} /></TouchableOpacity>
          </View>
          <ScrollView style={styles.modalBody}>
            <Text style={styles.label}>Prénom *</Text>
            <TextInput style={styles.input} placeholder="Prénom" value={form.firstName} onChangeText={(v) => setForm({ ...form, firstName: v })} />
            <Text style={styles.label}>Nom *</Text>
            <TextInput style={styles.input} placeholder="Nom" value={form.lastName} onChangeText={(v) => setForm({ ...form, lastName: v })} />
            <Text style={styles.label}>Email *</Text>
            <TextInput style={styles.input} placeholder="email@exemple.com" value={form.email} onChangeText={(v) => setForm({ ...form, email: v })} keyboardType="email-address" autoCapitalize="none" />
            <Text style={styles.label}>Mot de passe *</Text>
            <TextInput style={styles.input} placeholder="Min. 6 caractères" value={form.password} onChangeText={(v) => setForm({ ...form, password: v })} secureTextEntry />
            <Text style={styles.label}>Rôle</Text>
            <View style={styles.chipRow}>
              {['agent', 'manager', 'admin'].map((r) => (
                <TouchableOpacity key={r} style={[styles.chip, form.role === r && { ...styles.chipActive, backgroundColor: ROLE_COLORS[r] }]} onPress={() => setForm({ ...form, role: r })}>
                  <Text style={[styles.chipText, form.role === r && styles.chipTextActive]}>{r}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <PrimaryButton title="Créer l'utilisateur" onPress={handleCreate} loading={saving} icon="person-add-outline" />
            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  searchWrapper: {
    flexDirection: 'row', alignItems: 'center', margin: 16,
    backgroundColor: COLORS.white, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, ...SHADOWS.small,
  },
  searchInput: { flex: 1, fontSize: 14, color: COLORS.textPrimary },
  list: { paddingHorizontal: 16, paddingBottom: 16, flexGrow: 1 },
  card: { backgroundColor: COLORS.white, borderRadius: 12, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', ...SHADOWS.small },
  avatar: { width: 46, height: 46, borderRadius: 23, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { fontSize: 16, fontWeight: '700' },
  content: { flex: 1 },
  name: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  email: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  roleBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  roleText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  deleteBtn: { padding: 8 },
  modal: { flex: 1, backgroundColor: COLORS.white },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  modalTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  modalBody: { padding: 20 },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 8, marginTop: 16 },
  input: { borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 10, padding: 12, fontSize: 14, color: COLORS.textPrimary, backgroundColor: COLORS.background },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: { borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 7, marginRight: 8 },
  chipActive: { borderColor: 'transparent' },
  chipText: { fontSize: 13, color: COLORS.textSecondary, textTransform: 'capitalize' },
  chipTextActive: { color: COLORS.white, fontWeight: '700' },
});

export default UsersScreen;
