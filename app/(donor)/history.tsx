import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { BloodBadge, EmptyState } from '@/components/shared';

export default function DonorHistory() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { donations } = useData();

  if (!user) return null;

  const myDonations = donations.filter(d => d.donorId === user.id);
  const totalLives = myDonations.reduce((sum, d) => sum + (d.livesImpacted || 0), 0);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#6A0000', '#C62828']}
        style={[styles.header, { paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 0) + 16 }]}
      >
        <Text style={styles.headerTitle}>Donation History</Text>
        <Text style={styles.headerSub}>Your journey of saving lives</Text>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{myDonations.length}</Text>
            <Text style={styles.statLabel}>Donations</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{totalLives}</Text>
            <Text style={styles.statLabel}>Lives Impacted</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{user.bloodGroup}</Text>
            <Text style={styles.statLabel}>Blood Type</Text>
          </View>
        </View>
      </LinearGradient>

      {myDonations.length > 0 && (
        <LinearGradient colors={['#2EC4B6', '#1A9B8F']} style={styles.impactBanner}>
          <MaterialCommunityIcons name="heart-multiple" size={24} color="#fff" />
          <Text style={styles.impactText}>
            You are a healthcare hero! Your donations may have saved up to {totalLives} lives.
          </Text>
        </LinearGradient>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
      >
        {myDonations.length === 0 ? (
          <EmptyState
            icon="water"
            title="No donations yet"
            subtitle="Accept a blood request to make your first donation and start saving lives!"
          />
        ) : (
          myDonations.map((donation, idx) => (
            <View key={donation.id} style={styles.timelineItem}>
              <View style={styles.timelineLeft}>
                <View style={styles.timelineDot}>
                  <MaterialCommunityIcons name="water" size={16} color="#fff" />
                </View>
                {idx < myDonations.length - 1 && <View style={styles.timelineLine} />}
              </View>
              <View style={styles.donationCard}>
                <View style={styles.cardTop}>
                  <BloodBadge bloodGroup={donation.bloodGroup} />
                  <View style={styles.completedBadge}>
                    <MaterialCommunityIcons name="check-circle" size={12} color="#16A34A" />
                    <Text style={styles.completedText}>Completed</Text>
                  </View>
                </View>
                <Text style={styles.hospitalName}>{donation.hospital}</Text>
                <Text style={styles.donationDate}>
                  {new Date(donation.donationDate).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'long', year: 'numeric',
                  })}
                </Text>
                {donation.recipientName && (
                  <Text style={styles.recipientText}>Recipient: {donation.recipientName}</Text>
                )}
                {donation.livesImpacted && (
                  <View style={styles.impactChip}>
                    <MaterialCommunityIcons name="heart" size={12} color="#C62828" />
                    <Text style={styles.impactChipText}>Up to {donation.livesImpacted} lives impacted</Text>
                  </View>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F9FB' },
  header: { paddingHorizontal: 20, paddingBottom: 28 },
  headerTitle: { fontFamily: 'Inter_700Bold', fontSize: 26, color: '#fff', marginBottom: 4 },
  headerSub: { fontFamily: 'Inter_400Regular', fontSize: 14, color: 'rgba(255,255,255,0.8)', marginBottom: 24 },
  statsRow: {
    flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 14, padding: 16,
  },
  statBox: { flex: 1, alignItems: 'center' },
  statNum: { fontFamily: 'Inter_700Bold', fontSize: 22, color: '#fff' },
  statLabel: { fontFamily: 'Inter_400Regular', fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)' },
  impactBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    margin: 16, padding: 16, borderRadius: 14,
  },
  impactText: { fontFamily: 'Inter_500Medium', fontSize: 13, color: '#fff', flex: 1, lineHeight: 18 },
  timelineItem: { flexDirection: 'row', marginBottom: 0 },
  timelineLeft: { alignItems: 'center', width: 40 },
  timelineDot: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: '#C62828',
    alignItems: 'center', justifyContent: 'center', marginTop: 8,
  },
  timelineLine: { width: 2, flex: 1, backgroundColor: '#FFC7C7', minHeight: 16, marginVertical: 4 },
  donationCard: {
    flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 16,
    marginLeft: 12, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  completedBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#F0FFF4', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
  },
  completedText: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: '#16A34A' },
  hospitalName: { fontFamily: 'Inter_700Bold', fontSize: 16, color: '#1E1E1E', marginBottom: 6 },
  donationDate: { fontFamily: 'Inter_400Regular', fontSize: 13, color: '#5A6070', marginBottom: 4 },
  recipientText: { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#9BA3AF', marginBottom: 8 },
  impactChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#FFF0F0', paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 8, alignSelf: 'flex-start',
  },
  impactChipText: { fontFamily: 'Inter_500Medium', fontSize: 12, color: '#C62828' },
});
