import React from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { BloodBadge, UrgencyBadge, StatusBadge, EmptyState, timeAgo } from '@/components/shared';

export default function DoctorApprovals() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { requests, approveRequest, completeRequest } = useData();

  if (!user) return null;

  const relevantRequests = requests.filter(r =>
    r.status === 'accepted' || r.status === 'doctor_approved' || r.status === 'completed'
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0A5C5C', '#2EC4B6']}
        style={[styles.header, { paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 0) + 16 }]}
      >
        <Text style={styles.headerTitle}>Medical Approvals</Text>
        <Text style={styles.headerSub}>Review and approve blood donation requests</Text>
      </LinearGradient>

      <FlatList
        data={relevantRequests}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        ListEmptyComponent={
          <EmptyState icon="shield-check" title="No requests to review" subtitle="All accepted requests will appear here for your approval" />
        }
        renderItem={({ item: req }) => (
          <View style={styles.card}>
            <View style={styles.cardTop}>
              <BloodBadge bloodGroup={req.bloodGroup} />
              <UrgencyBadge level={req.urgencyLevel} />
              <StatusBadge status={req.status} />
              <Text style={styles.time}>{timeAgo(req.createdAt)}</Text>
            </View>

            <Text style={styles.hospital}>{req.hospital}</Text>

            <View style={styles.detailsGrid}>
              <View style={styles.detailBox}>
                <Text style={styles.detailLabel}>Patient</Text>
                <Text style={styles.detailValue}>{req.recipientName}</Text>
              </View>
              <View style={styles.detailBox}>
                <Text style={styles.detailLabel}>Donor</Text>
                <Text style={styles.detailValue}>{req.acceptedByDonorName || 'Not assigned'}</Text>
              </View>
              <View style={styles.detailBox}>
                <Text style={styles.detailLabel}>Blood Group</Text>
                <Text style={[styles.detailValue, { color: '#C62828' }]}>{req.bloodGroup}</Text>
              </View>
              <View style={styles.detailBox}>
                <Text style={styles.detailLabel}>Location</Text>
                <Text style={styles.detailValue}>{req.location}</Text>
              </View>
            </View>

            <View style={styles.contactRow}>
              <Ionicons name="call" size={14} color="#9BA3AF" />
              <Text style={styles.contactText}>{req.contactNumber}</Text>
            </View>

            {req.doctorApproval && req.doctorId === user.id && (
              <View style={styles.approvedByMe}>
                <MaterialCommunityIcons name="shield-check" size={16} color="#2EC4B6" />
                <Text style={styles.approvedByMeText}>You approved this request</Text>
              </View>
            )}

            {req.status === 'accepted' && !req.doctorApproval && req.acceptedByDonorId && (
              <View style={styles.actions}>
                <Pressable style={styles.approveBtn} onPress={() => approveRequest(req.id)}>
                  <MaterialCommunityIcons name="shield-check" size={18} color="#fff" />
                  <Text style={styles.approveBtnText}>Approve Donation</Text>
                </Pressable>
              </View>
            )}

            {req.status === 'doctor_approved' && (
              <View style={styles.actions}>
                <Pressable style={styles.completeBtn} onPress={() => completeRequest(req.id)}>
                  <Ionicons name="checkmark-circle" size={18} color="#fff" />
                  <Text style={styles.completeBtnText}>Mark as Completed</Text>
                </Pressable>
              </View>
            )}

            {req.status === 'completed' && (
              <View style={styles.completedBanner}>
                <MaterialCommunityIcons name="check-decagram" size={18} color="#16A34A" />
                <Text style={styles.completedText}>Donation successfully completed</Text>
              </View>
            )}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F9FB' },
  header: { paddingHorizontal: 20, paddingBottom: 24 },
  headerTitle: { fontFamily: 'Inter_700Bold', fontSize: 26, color: '#fff', marginBottom: 4 },
  headerSub: { fontFamily: 'Inter_400Regular', fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' },
  time: { marginLeft: 'auto' as any, fontFamily: 'Inter_400Regular', fontSize: 11, color: '#9BA3AF' },
  hospital: { fontFamily: 'Inter_700Bold', fontSize: 17, color: '#1E1E1E', marginBottom: 14 },
  detailsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 10 },
  detailBox: { minWidth: '45%' },
  detailLabel: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#9BA3AF', marginBottom: 2 },
  detailValue: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#1E1E1E' },
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  contactText: { fontFamily: 'Inter_400Regular', fontSize: 13, color: '#5A6070' },
  approvedByMe: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#F0FDFC', padding: 10, borderRadius: 10,
  },
  approvedByMeText: { fontFamily: 'Inter_500Medium', fontSize: 13, color: '#2EC4B6' },
  actions: { gap: 10 },
  approveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: '#2EC4B6', paddingVertical: 12, borderRadius: 10,
  },
  approveBtnText: { fontFamily: 'Inter_700Bold', fontSize: 14, color: '#fff' },
  completeBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: '#22C55E', paddingVertical: 12, borderRadius: 10,
  },
  completeBtnText: { fontFamily: 'Inter_700Bold', fontSize: 14, color: '#fff' },
  completedBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#F0FFF4', padding: 10, borderRadius: 10,
  },
  completedText: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#16A34A' },
});
