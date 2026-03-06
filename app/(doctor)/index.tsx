import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { BloodBadge, UrgencyBadge, StatusBadge, StatCard, SectionHeader, EmptyState, timeAgo } from '@/components/shared';

export default function DoctorHome() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { requests, approveRequest, completeRequest, unreadNotifications } = useData();

  if (!user) return null;

  const pendingApprovals = requests.filter(r => r.status === 'accepted' && !r.doctorApproval);
  const approvedByMe = requests.filter(r => r.doctorId === user.id);
  const completedByMe = requests.filter(r => r.doctorId === user.id && r.status === 'completed');

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <LinearGradient
          colors={['#0A5C5C', '#2EC4B6']}
          style={[styles.header, { paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 0) + 16 }]}
        >
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>Doctor Dashboard</Text>
              <Text style={styles.userName}>Dr. {user.name}</Text>
            </View>
            <Pressable style={styles.notifBtn} onPress={() => router.push('/(doctor)/profile')}>
              <Ionicons name="notifications" size={22} color="#fff" />
              {unreadNotifications > 0 && (
                <View style={styles.notifDot}>
                  <Text style={styles.notifDotText}>{unreadNotifications}</Text>
                </View>
              )}
            </Pressable>
          </View>

          <View style={styles.hospitalInfo}>
            <MaterialCommunityIcons name="hospital-building" size={16} color="rgba(255,255,255,0.8)" />
            <Text style={styles.hospitalText}>{user.hospital}</Text>
          </View>
          {user.licenseNumber && (
            <Text style={styles.licenseText}>License: {user.licenseNumber}</Text>
          )}
        </LinearGradient>

        <View style={styles.content}>
          <View style={styles.statsRow}>
            <StatCard icon="clock-alert" value={pendingApprovals.length} label="Pending" color="#F59E0B" />
            <StatCard icon="shield-check" value={approvedByMe.length} label="Approved" color="#2EC4B6" />
            <StatCard icon="check-circle" value={completedByMe.length} label="Completed" color="#22C55E" />
          </View>

          {pendingApprovals.length > 0 && (
            <View style={styles.alertBanner}>
              <MaterialCommunityIcons name="alarm-light" size={20} color="#D97706" />
              <Text style={styles.alertText}>
                {pendingApprovals.length} request{pendingApprovals.length !== 1 ? 's' : ''} need{pendingApprovals.length === 1 ? 's' : ''} your medical approval
              </Text>
              <Pressable onPress={() => router.push('/(doctor)/approvals')}>
                <Text style={styles.alertAction}>Review</Text>
              </Pressable>
            </View>
          )}

          <SectionHeader title="Pending Approvals" action="View All" onAction={() => router.push('/(doctor)/approvals')} />

          {pendingApprovals.length === 0 ? (
            <EmptyState icon="shield-check" title="All caught up!" subtitle="No pending requests require your approval" />
          ) : (
            pendingApprovals.slice(0, 3).map(req => (
              <View key={req.id} style={styles.reqCard}>
                <View style={styles.reqTop}>
                  <BloodBadge bloodGroup={req.bloodGroup} />
                  <UrgencyBadge level={req.urgencyLevel} />
                  <StatusBadge status={req.status} />
                </View>
                <Text style={styles.reqHospital}>{req.hospital}</Text>
                <View style={styles.reqInfoRow}>
                  <Text style={styles.reqInfoText}>Patient: {req.recipientName}</Text>
                  <Text style={styles.reqInfoText}>Donor: {req.acceptedByDonorName}</Text>
                </View>
                <Text style={styles.reqTime}>{timeAgo(req.createdAt)}</Text>
                <View style={styles.reqActions}>
                  <Pressable style={styles.approveBtn} onPress={() => approveRequest(req.id)}>
                    <MaterialCommunityIcons name="shield-check" size={18} color="#fff" />
                    <Text style={styles.approveBtnText}>Approve Donation</Text>
                  </Pressable>
                  <Pressable style={styles.completeBtn} onPress={() => completeRequest(req.id)}>
                    <Ionicons name="checkmark-circle" size={18} color="#16A34A" />
                    <Text style={styles.completeBtnText}>Mark Complete</Text>
                  </Pressable>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F9FB' },
  header: { paddingHorizontal: 20, paddingBottom: 24 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  greeting: { fontFamily: 'Inter_400Regular', fontSize: 13, color: 'rgba(255,255,255,0.8)' },
  userName: { fontFamily: 'Inter_700Bold', fontSize: 22, color: '#fff' },
  notifBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center',
  },
  notifDot: {
    position: 'absolute', top: -2, right: -2,
    backgroundColor: '#FF6B6B', borderRadius: 8, minWidth: 16, height: 16,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3,
  },
  notifDotText: { fontFamily: 'Inter_700Bold', fontSize: 10, color: '#fff' },
  hospitalInfo: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  hospitalText: { fontFamily: 'Inter_500Medium', fontSize: 14, color: 'rgba(255,255,255,0.9)' },
  licenseText: { fontFamily: 'Inter_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.6)' },
  content: { padding: 16, gap: 20 },
  statsRow: { flexDirection: 'row', gap: 10 },
  alertBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#FFFBEB', borderWidth: 1.5, borderColor: '#FCD34D',
    borderRadius: 12, padding: 14,
  },
  alertText: { fontFamily: 'Inter_500Medium', fontSize: 13, color: '#D97706', flex: 1 },
  alertAction: { fontFamily: 'Inter_700Bold', fontSize: 13, color: '#D97706' },
  reqCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  reqTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' },
  reqHospital: { fontFamily: 'Inter_700Bold', fontSize: 16, color: '#1E1E1E', marginBottom: 8 },
  reqInfoRow: { gap: 4, marginBottom: 8 },
  reqInfoText: { fontFamily: 'Inter_400Regular', fontSize: 13, color: '#5A6070' },
  reqTime: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#9BA3AF', marginBottom: 12 },
  reqActions: { gap: 10 },
  approveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: '#2EC4B6', paddingVertical: 12, borderRadius: 10,
  },
  approveBtnText: { fontFamily: 'Inter_700Bold', fontSize: 14, color: '#fff' },
  completeBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: '#F0FFF4', borderWidth: 1.5, borderColor: '#86EFAC',
    paddingVertical: 12, borderRadius: 10,
  },
  completeBtnText: { fontFamily: 'Inter_700Bold', fontSize: 14, color: '#16A34A' },
});
