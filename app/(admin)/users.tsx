import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, TextInput, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useData } from '@/contexts/DataContext';
import { EmptyState } from '@/components/shared';

const ROLE_FILTERS = ['All', 'donor', 'recipient', 'doctor', 'admin'];
const ROLE_COLORS: Record<string, string> = {
  donor: '#C62828', recipient: '#2563EB', doctor: '#2EC4B6', admin: '#7C3AED',
};
const ROLE_ICONS: Record<string, string> = {
  donor: 'water', recipient: 'hospital-box', doctor: 'stethoscope', admin: 'shield-crown',
};

export default function AdminUsers() {
  const insets = useSafeAreaInsets();
  const { allUsers } = useData();
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');

  const filtered = allUsers.filter(u => {
    if (roleFilter !== 'All' && u.role !== roleFilter) return false;
    if (query.trim()) {
      const q = query.toLowerCase();
      return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.city.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#4C1D95', '#7C3AED']}
        style={[styles.header, { paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 0) + 16 }]}
      >
        <Text style={styles.headerTitle}>User Management</Text>
        <Text style={styles.headerSub}>{allUsers.length} registered users</Text>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#9BA3AF" />
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder="Search users..."
            placeholderTextColor="#9BA3AF"
            autoCorrect={false}
          />
          {query ? <Pressable onPress={() => setQuery('')}><Ionicons name="close-circle" size={18} color="#9BA3AF" /></Pressable> : null}
        </View>
      </LinearGradient>

      <View style={styles.filtersRow}>
        {ROLE_FILTERS.map(f => (
          <Pressable
            key={f}
            style={[styles.filterBtn, roleFilter === f && styles.filterBtnActive]}
            onPress={() => setRoleFilter(f)}
          >
            <Text style={[styles.filterBtnText, roleFilter === f && styles.filterBtnTextActive]}>
              {f === 'All' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        ListEmptyComponent={<EmptyState icon="account-off" title="No users found" subtitle="Try a different search or filter" />}
        renderItem={({ item: u }) => (
          <View style={styles.userCard}>
            <View style={[styles.userAvatar, { backgroundColor: ROLE_COLORS[u.role] || '#9BA3AF' }]}>
              <Text style={styles.userAvatarText}>{u.name[0]}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.userNameRow}>
                <Text style={styles.userName}>{u.name}</Text>
                <View style={[styles.rolePill, { backgroundColor: (ROLE_COLORS[u.role] || '#9BA3AF') + '20' }]}>
                  <MaterialCommunityIcons name={ROLE_ICONS[u.role] as any || 'account'} size={12} color={ROLE_COLORS[u.role] || '#9BA3AF'} />
                  <Text style={[styles.rolePillText, { color: ROLE_COLORS[u.role] || '#9BA3AF' }]}>
                    {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                  </Text>
                </View>
              </View>
              <Text style={styles.userEmail}>{u.email}</Text>
              <View style={styles.userMeta}>
                <View style={styles.metaItem}>
                  <Ionicons name="location" size={12} color="#9BA3AF" />
                  <Text style={styles.metaText}>{u.city}</Text>
                </View>
                <View style={[styles.bgPill]}>
                  <Text style={styles.bgPillText}>{u.bloodGroup}</Text>
                </View>
                {u.role === 'donor' && (
                  <View style={[styles.availPill, { backgroundColor: u.availability ? '#F0FFF4' : '#F9FAFB' }]}>
                    <View style={[styles.availDot, { backgroundColor: u.availability ? '#22C55E' : '#9BA3AF' }]} />
                    <Text style={[styles.availText, { color: u.availability ? '#16A34A' : '#9BA3AF' }]}>
                      {u.availability ? 'Available' : 'Unavailable'}
                    </Text>
                  </View>
                )}
                {u.role === 'doctor' && u.hospital && (
                  <Text style={styles.metaText}>{u.hospital}</Text>
                )}
              </View>
              {u.totalDonations !== undefined && u.role === 'donor' && (
                <Text style={styles.donationCount}>{u.totalDonations} donations</Text>
              )}
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F9FB' },
  header: { paddingHorizontal: 16, paddingBottom: 20 },
  headerTitle: { fontFamily: 'Inter_700Bold', fontSize: 24, color: '#fff', marginBottom: 4 },
  headerSub: { fontFamily: 'Inter_400Regular', fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: 14 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11,
  },
  searchInput: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 14, color: '#1E1E1E' },
  filtersRow: {
    flexDirection: 'row', gap: 8, padding: 12, paddingTop: 12, paddingBottom: 8,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F0F4F8', flexWrap: 'wrap',
  },
  filterBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: '#F7F9FB', borderWidth: 1.5, borderColor: 'transparent' },
  filterBtnActive: { backgroundColor: '#F5F3FF', borderColor: '#7C3AED' },
  filterBtnText: { fontFamily: 'Inter_500Medium', fontSize: 13, color: '#5A6070' },
  filterBtnTextActive: { color: '#7C3AED', fontFamily: 'Inter_700Bold' },
  userCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  userAvatar: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  userAvatarText: { fontFamily: 'Inter_700Bold', fontSize: 22, color: '#fff' },
  userNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 3, flexWrap: 'wrap' },
  userName: { fontFamily: 'Inter_700Bold', fontSize: 15, color: '#1E1E1E' },
  rolePill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  rolePillText: { fontFamily: 'Inter_600SemiBold', fontSize: 11 },
  userEmail: { fontFamily: 'Inter_400Regular', fontSize: 13, color: '#9BA3AF', marginBottom: 8 },
  userMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  metaText: { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#9BA3AF' },
  bgPill: { backgroundColor: '#FFF0F0', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  bgPillText: { fontFamily: 'Inter_700Bold', fontSize: 12, color: '#C62828' },
  availPill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  availDot: { width: 6, height: 6, borderRadius: 3 },
  availText: { fontFamily: 'Inter_500Medium', fontSize: 11 },
  donationCount: { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#9BA3AF', marginTop: 4 },
});
