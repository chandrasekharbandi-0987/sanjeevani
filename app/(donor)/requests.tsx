import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { BloodBadge, UrgencyBadge, StatusBadge, SectionHeader, EmptyState, timeAgo } from '@/components/shared';

const FILTERS = ['All', 'Pending', 'My Accepted', 'Completed'];

export default function DonorRequests() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { requests, acceptRequest, declineRequest } = useData();
  const [filter, setFilter] = useState('All');

  if (!user) return null;

  const filteredRequests = requests.filter(r => {
    if (filter === 'All') return r.status === 'pending' || r.acceptedByDonorId === user.id;
    if (filter === 'Pending') return r.status === 'pending';
    if (filter === 'My Accepted') return r.acceptedByDonorId === user.id;
    if (filter === 'Completed') return r.status === 'completed' && r.acceptedByDonorId === user.id;
    return true;
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#6A0000', '#C62828']}
        style={[styles.header, { paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 0) + 16 }]}
      >
        <Text style={styles.headerTitle}>Blood Requests</Text>
        <Text style={styles.headerSub}>Help save lives near you</Text>
      </LinearGradient>

      <View style={styles.filtersRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}>
          {FILTERS.map(f => (
            <Pressable
              key={f}
              style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
              onPress={() => setFilter(f)}
            >
              <Text style={[styles.filterBtnText, filter === f && styles.filterBtnTextActive]}>{f}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
      >
        {filteredRequests.length === 0 ? (
          <EmptyState icon="water-off" title="No requests found" subtitle="Check back later for emergency blood requests" />
        ) : (
          filteredRequests.map(req => (
            <View key={req.id} style={styles.card}>
              <View style={styles.cardTop}>
                <BloodBadge bloodGroup={req.bloodGroup} />
                <UrgencyBadge level={req.urgencyLevel} />
                <StatusBadge status={req.status} />
                <Text style={styles.timeText}>{timeAgo(req.createdAt)}</Text>
              </View>

              <Text style={styles.hospital}>{req.hospital}</Text>

              <View style={styles.infoRow}>
                <Ionicons name="location" size={14} color="#9BA3AF" />
                <Text style={styles.infoText}>{req.location}</Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="person" size={14} color="#9BA3AF" />
                <Text style={styles.infoText}>{req.recipientName}</Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="call" size={14} color="#9BA3AF" />
                <Text style={styles.infoText}>{req.contactNumber}</Text>
              </View>

              {req.doctorApproval && (
                <View style={styles.approvedBadge}>
                  <MaterialCommunityIcons name="shield-check" size={14} color="#16A34A" />
                  <Text style={styles.approvedText}>Medically Approved by {req.doctorName}</Text>
                </View>
              )}

              {req.status === 'pending' && (
                <View style={styles.actions}>
                  <Pressable style={styles.declineBtn} onPress={() => declineRequest(req.id)}>
                    <Text style={styles.declineBtnText}>Decline</Text>
                  </Pressable>
                  <Pressable style={styles.acceptBtn} onPress={() => acceptRequest(req.id)}>
                    <MaterialCommunityIcons name="check-circle" size={18} color="#fff" />
                    <Text style={styles.acceptBtnText}>Accept</Text>
                  </Pressable>
                </View>
              )}

              {req.status === 'accepted' && req.acceptedByDonorId === user.id && (
                <View style={styles.acceptedBadge}>
                  <Ionicons name="checkmark-circle" size={16} color="#2563EB" />
                  <Text style={styles.acceptedText}>You accepted this request. Awaiting doctor approval.</Text>
                </View>
              )}

              {req.status === 'doctor_approved' && req.acceptedByDonorId === user.id && (
                <View style={[styles.acceptedBadge, { backgroundColor: '#F0FFF4' }]}>
                  <MaterialCommunityIcons name="shield-check" size={16} color="#16A34A" />
                  <Text style={[styles.acceptedText, { color: '#16A34A' }]}>Ready for donation! Go to {req.hospital}</Text>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F9FB' },
  header: { paddingHorizontal: 20, paddingBottom: 24 },
  headerTitle: { fontFamily: 'Inter_700Bold', fontSize: 26, color: '#fff', marginBottom: 4 },
  headerSub: { fontFamily: 'Inter_400Regular', fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  filtersRow: { paddingVertical: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F0F4F8' },
  filterBtn: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    backgroundColor: '#F0F4F8', borderWidth: 1.5, borderColor: 'transparent',
  },
  filterBtnActive: { backgroundColor: '#FFF0F0', borderColor: '#C62828' },
  filterBtnText: { fontFamily: 'Inter_500Medium', fontSize: 13, color: '#5A6070' },
  filterBtnTextActive: { color: '#C62828', fontFamily: 'Inter_600SemiBold' },
  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' },
  timeText: { marginLeft: 'auto' as any, fontFamily: 'Inter_400Regular', fontSize: 11, color: '#9BA3AF' },
  hospital: { fontFamily: 'Inter_700Bold', fontSize: 17, color: '#1E1E1E', marginBottom: 10 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  infoText: { fontFamily: 'Inter_400Regular', fontSize: 13, color: '#5A6070' },
  approvedBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#F0FFF4', padding: 8, borderRadius: 8, marginTop: 8,
  },
  approvedText: { fontFamily: 'Inter_500Medium', fontSize: 12, color: '#16A34A' },
  actions: { flexDirection: 'row', gap: 10, marginTop: 12 },
  declineBtn: {
    flex: 1, paddingVertical: 11, borderRadius: 10,
    backgroundColor: '#F9FAFB', borderWidth: 1.5, borderColor: '#E5E9EE', alignItems: 'center',
  },
  declineBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#5A6070' },
  acceptBtn: {
    flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: '#C62828', paddingVertical: 11, borderRadius: 10,
  },
  acceptBtnText: { fontFamily: 'Inter_700Bold', fontSize: 14, color: '#fff' },
  acceptedBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#EFF6FF', padding: 10, borderRadius: 10, marginTop: 10,
  },
  acceptedText: { fontFamily: 'Inter_500Medium', fontSize: 12, color: '#2563EB', flex: 1 },
});
