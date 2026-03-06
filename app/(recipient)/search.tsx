import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput, Pressable, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { BloodBadge, EmptyState } from '@/components/shared';
import { BloodGroup } from '@/contexts/AuthContext';

const BLOOD_GROUPS: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const ALL_FILTER = 'All';

export default function DonorSearch() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { donors, getOrCreateConversation } = useData();
  const [query, setQuery] = useState('');
  const [selectedBG, setSelectedBG] = useState<string>(ALL_FILTER);
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);

  if (!user) return null;

  const filteredDonors = useMemo(() => {
    return donors.filter(d => {
      if (d.id === user.id) return false;
      if (showAvailableOnly && !d.availability) return false;
      if (selectedBG !== ALL_FILTER && d.bloodGroup !== selectedBG) return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        return d.name.toLowerCase().includes(q) || d.city.toLowerCase().includes(q);
      }
      return true;
    });
  }, [donors, query, selectedBG, showAvailableOnly, user.id]);

  async function handleContact(donorId: string, donorName: string) {
    const convId = await getOrCreateConversation(donorId, donorName);
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#6A0000', '#C62828']}
        style={[styles.header, { paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 0) + 16 }]}
      >
        <Text style={styles.headerTitle}>Find Blood Donors</Text>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#9BA3AF" />
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder="Search by name or city..."
            placeholderTextColor="#9BA3AF"
            autoCorrect={false}
          />
          {query ? (
            <Pressable onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={20} color="#9BA3AF" />
            </Pressable>
          ) : null}
        </View>
      </LinearGradient>

      {/* Filters */}
      <View style={styles.filtersSection}>
        <View style={styles.bgFiltersRow}>
          {[ALL_FILTER, ...BLOOD_GROUPS].map(bg => (
            <Pressable
              key={bg}
              style={[styles.bgFilter, selectedBG === bg && styles.bgFilterActive]}
              onPress={() => setSelectedBG(bg)}
            >
              <Text style={[styles.bgFilterText, selectedBG === bg && styles.bgFilterTextActive]}>{bg}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.availRow}>
          <Pressable style={styles.availToggle} onPress={() => setShowAvailableOnly(!showAvailableOnly)}>
            <View style={[styles.checkbox, showAvailableOnly && styles.checkboxActive]}>
              {showAvailableOnly && <Ionicons name="checkmark" size={14} color="#fff" />}
            </View>
            <Text style={styles.availText}>Available only</Text>
          </Pressable>
          <Text style={styles.resultCount}>{filteredDonors.length} donors found</Text>
        </View>
      </View>

      <FlatList
        data={filteredDonors}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        ListEmptyComponent={
          <EmptyState icon="account-search" title="No donors found" subtitle="Try different filters or blood group" />
        }
        renderItem={({ item: donor }) => (
          <View style={styles.donorCard}>
            <View style={styles.donorTop}>
              <View style={styles.donorAvatar}>
                <Text style={styles.donorAvatarText}>{donor.name[0]}</Text>
                {donor.availability && <View style={styles.availDot} />}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.donorName}>{donor.name}</Text>
                <View style={styles.donorInfoRow}>
                  <Ionicons name="location" size={13} color="#9BA3AF" />
                  <Text style={styles.donorCity}>{donor.city}</Text>
                </View>
              </View>
              <BloodBadge bloodGroup={donor.bloodGroup} />
            </View>

            <View style={styles.donorStats}>
              <View style={styles.donorStat}>
                <Text style={styles.donorStatNum}>{donor.totalDonations || 0}</Text>
                <Text style={styles.donorStatLabel}>Donations</Text>
              </View>
              <View style={[styles.donorStat, styles.availabilityChip, donor.availability ? styles.availChipGreen : styles.availChipGray]}>
                <View style={[styles.availChipDot, { backgroundColor: donor.availability ? '#22C55E' : '#9BA3AF' }]} />
                <Text style={[styles.availChipText, { color: donor.availability ? '#16A34A' : '#9BA3AF' }]}>
                  {donor.availability ? 'Available' : 'Unavailable'}
                </Text>
              </View>
            </View>

            {donor.lastDonationDate && (
              <Text style={styles.lastDonation}>
                Last donation: {new Date(donor.lastDonationDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
              </Text>
            )}

            <Pressable
              style={[styles.contactBtn, !donor.availability && styles.contactBtnDisabled]}
              onPress={() => handleContact(donor.id, donor.name)}
            >
              <Ionicons name="chatbubble-outline" size={16} color={donor.availability ? '#C62828' : '#9BA3AF'} />
              <Text style={[styles.contactBtnText, !donor.availability && { color: '#9BA3AF' }]}>
                {donor.availability ? 'Send Request' : 'Unavailable'}
              </Text>
            </Pressable>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F9FB' },
  header: { paddingHorizontal: 16, paddingBottom: 20 },
  headerTitle: { fontFamily: 'Inter_700Bold', fontSize: 24, color: '#fff', marginBottom: 14 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
  },
  searchInput: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 15, color: '#1E1E1E' },
  filtersSection: { backgroundColor: '#fff', paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#F0F4F8' },
  bgFiltersRow: { flexDirection: 'row', flexWrap: 'nowrap', paddingHorizontal: 12, paddingTop: 12, paddingBottom: 8, gap: 8 },
  bgFilter: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    backgroundColor: '#F7F9FB', borderWidth: 1.5, borderColor: 'transparent',
  },
  bgFilterActive: { backgroundColor: '#FFF0F0', borderColor: '#C62828' },
  bgFilterText: { fontFamily: 'Inter_500Medium', fontSize: 13, color: '#5A6070' },
  bgFilterTextActive: { color: '#C62828', fontFamily: 'Inter_700Bold' },
  availRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 },
  availToggle: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  checkbox: {
    width: 20, height: 20, borderRadius: 5,
    borderWidth: 2, borderColor: '#E5E9EE',
    alignItems: 'center', justifyContent: 'center',
  },
  checkboxActive: { backgroundColor: '#C62828', borderColor: '#C62828' },
  availText: { fontFamily: 'Inter_500Medium', fontSize: 14, color: '#1E1E1E' },
  resultCount: { fontFamily: 'Inter_400Regular', fontSize: 13, color: '#9BA3AF' },
  donorCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  donorTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  donorAvatar: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: '#C62828', alignItems: 'center', justifyContent: 'center',
  },
  donorAvatarText: { fontFamily: 'Inter_700Bold', fontSize: 22, color: '#fff' },
  availDot: {
    position: 'absolute', bottom: 0, right: 0,
    width: 14, height: 14, borderRadius: 7, backgroundColor: '#22C55E',
    borderWidth: 2, borderColor: '#fff',
  },
  donorName: { fontFamily: 'Inter_700Bold', fontSize: 16, color: '#1E1E1E' },
  donorInfoRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  donorCity: { fontFamily: 'Inter_400Regular', fontSize: 13, color: '#9BA3AF' },
  donorStats: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  donorStat: { alignItems: 'center' },
  donorStatNum: { fontFamily: 'Inter_700Bold', fontSize: 18, color: '#1E1E1E' },
  donorStatLabel: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#9BA3AF' },
  availabilityChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
  },
  availChipGreen: { backgroundColor: '#F0FFF4' },
  availChipGray: { backgroundColor: '#F9FAFB' },
  availChipDot: { width: 6, height: 6, borderRadius: 3 },
  availChipText: { fontFamily: 'Inter_500Medium', fontSize: 12 },
  lastDonation: { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#9BA3AF', marginBottom: 12 },
  contactBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, borderWidth: 2, borderColor: '#C62828',
    paddingVertical: 10, borderRadius: 10,
  },
  contactBtnDisabled: { borderColor: '#E5E9EE' },
  contactBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#C62828' },
});
