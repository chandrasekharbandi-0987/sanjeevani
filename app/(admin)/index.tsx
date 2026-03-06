import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { SectionHeader, timeAgo } from '@/components/shared';
import { BloodBadge, UrgencyBadge, StatusBadge } from '@/components/shared';

export default function AdminDashboard() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { requests, donations, allUsers } = useData();

  if (!user) return null;

  const totalDonors = allUsers.filter(u => u.role === 'donor').length;
  const totalRecipients = allUsers.filter(u => u.role === 'recipient').length;
  const totalDoctors = allUsers.filter(u => u.role === 'doctor').length;
  const activeRequests = requests.filter(r => r.status !== 'completed' && r.status !== 'cancelled');
  const completedRequests = requests.filter(r => r.status === 'completed');
  const recentRequests = requests.slice(0, 5);
  const recentUsers = allUsers.slice(0, 5);

  const roleColors: Record<string, string> = {
    donor: '#C62828', recipient: '#2563EB', doctor: '#2EC4B6', admin: '#7C3AED',
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <LinearGradient
          colors={['#4C1D95', '#7C3AED']}
          style={[styles.header, { paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 0) + 16 }]}
        >
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>Admin Panel</Text>
              <Text style={styles.userName}>{user.name}</Text>
            </View>
            <View style={styles.adminBadge}>
              <MaterialCommunityIcons name="shield-crown" size={18} color="#FFD700" />
              <Text style={styles.adminBadgeText}>Admin</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          {/* Overview Stats */}
          <View style={styles.statsSection}>
            <Text style={styles.sectionLabel}>Overview</Text>
            <View style={styles.statsGrid}>
              {[
                { label: 'Total Users', value: allUsers.length, icon: 'account-group', color: '#7C3AED' },
                { label: 'Donors', value: totalDonors, icon: 'water', color: '#C62828' },
                { label: 'Recipients', value: totalRecipients, icon: 'hospital-box', color: '#2563EB' },
                { label: 'Doctors', value: totalDoctors, icon: 'stethoscope', color: '#2EC4B6' },
                { label: 'Total Requests', value: requests.length, icon: 'clipboard-list', color: '#F59E0B' },
                { label: 'Completed', value: completedRequests.length, icon: 'check-circle', color: '#22C55E' },
                { label: 'Active', value: activeRequests.length, icon: 'clock-fast', color: '#EF4444' },
                { label: 'Donations', value: donations.length, icon: 'heart-pulse', color: '#EC4899' },
              ].map((stat, i) => (
                <View key={i} style={[styles.statCard, { borderLeftColor: stat.color, borderLeftWidth: 3 }]}>
                  <View style={[styles.statIcon, { backgroundColor: stat.color + '20' }]}>
                    <MaterialCommunityIcons name={stat.icon as any} size={20} color={stat.color} />
                  </View>
                  <Text style={styles.statNum}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Quick Actions */}
          <View>
            <Text style={styles.sectionLabel}>Quick Actions</Text>
            <View style={styles.quickActionsGrid}>
              <Pressable style={styles.qaCard} onPress={() => router.push('/(admin)/users')}>
                <MaterialCommunityIcons name="account-group" size={26} color="#7C3AED" />
                <Text style={styles.qaLabel}>Manage Users</Text>
              </Pressable>
              <Pressable style={styles.qaCard} onPress={() => router.push('/(admin)/analytics')}>
                <MaterialCommunityIcons name="chart-bar" size={26} color="#C62828" />
                <Text style={styles.qaLabel}>Analytics</Text>
              </Pressable>
            </View>
          </View>

          {/* Recent Requests */}
          <View>
            <SectionHeader title="Recent Requests" action="See All" onAction={() => router.push('/(admin)/analytics')} />
            {recentRequests.map(req => (
              <View key={req.id} style={styles.reqRow}>
                <BloodBadge bloodGroup={req.bloodGroup} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.reqHospital} numberOfLines={1}>{req.hospital}</Text>
                  <Text style={styles.reqTime}>{timeAgo(req.createdAt)}</Text>
                </View>
                <UrgencyBadge level={req.urgencyLevel} />
                <StatusBadge status={req.status} />
              </View>
            ))}
          </View>

          {/* Recent Users */}
          <View>
            <SectionHeader title="Recent Users" action="Manage" onAction={() => router.push('/(admin)/users')} />
            {recentUsers.map(u => (
              <View key={u.id} style={styles.userRow}>
                <View style={[styles.userAvatar, { backgroundColor: roleColors[u.role] || '#C62828' }]}>
                  <Text style={styles.userAvatarText}>{u.name[0]}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.userName2}>{u.name}</Text>
                  <Text style={styles.userEmail}>{u.email}</Text>
                </View>
                <View style={[styles.rolePill, { backgroundColor: (roleColors[u.role] || '#C62828') + '20' }]}>
                  <Text style={[styles.rolePillText, { color: roleColors[u.role] || '#C62828' }]}>
                    {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F9FB' },
  header: { paddingHorizontal: 20, paddingBottom: 24 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  greeting: { fontFamily: 'Inter_400Regular', fontSize: 13, color: 'rgba(255,255,255,0.8)' },
  userName: { fontFamily: 'Inter_700Bold', fontSize: 22, color: '#fff' },
  adminBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
  },
  adminBadgeText: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#FFD700' },
  content: { padding: 16, gap: 24 },
  statsSection: { gap: 12 },
  sectionLabel: { fontFamily: 'Inter_700Bold', fontSize: 16, color: '#1E1E1E' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statCard: {
    width: '47%', backgroundColor: '#fff', borderRadius: 14, padding: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  statIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  statNum: { fontFamily: 'Inter_700Bold', fontSize: 22, color: '#1E1E1E' },
  statLabel: { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#9BA3AF', marginTop: 2 },
  quickActionsGrid: { flexDirection: 'row', gap: 12 },
  qaCard: {
    flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 20, alignItems: 'center', gap: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  qaLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#1E1E1E' },
  reqRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  reqHospital: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#1E1E1E' },
  reqTime: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#9BA3AF', marginTop: 2 },
  userRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  userAvatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  userAvatarText: { fontFamily: 'Inter_700Bold', fontSize: 18, color: '#fff' },
  userName2: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#1E1E1E' },
  userEmail: { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#9BA3AF', marginTop: 2 },
  rolePill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  rolePillText: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
});
