import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { EmptyState, timeAgo } from '@/components/shared';

export default function AdminProfile() {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { notifications, allUsers, requests, donations, markNotificationRead, markAllNotificationsRead } = useData();

  if (!user) return null;

  const totalDonors = allUsers.filter(u => u.role === 'donor').length;
  const totalRecipients = allUsers.filter(u => u.role === 'recipient').length;
  const totalDoctors = allUsers.filter(u => u.role === 'doctor').length;
  const completedRequests = requests.filter(r => r.status === 'completed').length;

  const notifTypeColor: Record<string, string> = {
    request: '#C62828', accepted: '#2563EB', approved: '#7C3AED', completed: '#22C55E', general: '#9BA3AF',
  };
  const notifTypeIcon: Record<string, string> = {
    request: 'water', accepted: 'check-circle', approved: 'shield-check', completed: 'heart', general: 'bell',
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <LinearGradient
          colors={['#4C1D95', '#7C3AED']}
          style={[styles.header, { paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 0) + 16 }]}
        >
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{user.name[0]}</Text>
          </View>
          <Text style={styles.userName}>{user.name}</Text>
          <View style={styles.roleBadge}>
            <MaterialCommunityIcons name="shield-crown" size={14} color="#FFD700" />
            <Text style={styles.roleBadgeText}>Platform Administrator</Text>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          {/* Platform Stats */}
          <View style={styles.platformStatsCard}>
            <Text style={styles.platformStatsTitle}>Platform Summary</Text>
            <View style={styles.platformStatsGrid}>
              {[
                { label: 'Donors', value: totalDonors, color: '#C62828' },
                { label: 'Recipients', value: totalRecipients, color: '#2563EB' },
                { label: 'Doctors', value: totalDoctors, color: '#2EC4B6' },
                { label: 'Completed', value: completedRequests, color: '#22C55E' },
              ].map((s, i) => (
                <View key={i} style={styles.miniStat}>
                  <Text style={[styles.miniStatNum, { color: s.color }]}>{s.value}</Text>
                  <Text style={styles.miniStatLabel}>{s.label}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.infoCard}>
            {[
              { icon: 'mail-outline', label: 'Email', value: user.email },
              { icon: 'call-outline', label: 'Phone', value: user.phone },
              { icon: 'location-outline', label: 'City', value: user.city },
            ].map((item, i) => (
              <View key={i} style={[styles.infoRow, i < 2 && styles.infoRowBorder]}>
                <Ionicons name={item.icon as any} size={18} color="#9BA3AF" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoLabel}>{item.label}</Text>
                  <Text style={styles.infoValue}>{item.value}</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Notifications</Text>
            {notifications.some(n => !n.read) && (
              <Pressable onPress={markAllNotificationsRead}>
                <Text style={styles.markAllRead}>Mark all read</Text>
              </Pressable>
            )}
          </View>

          {notifications.length === 0 ? (
            <EmptyState icon="bell-off" title="No notifications" subtitle="System alerts will appear here" />
          ) : (
            notifications.map(notif => (
              <Pressable
                key={notif.id}
                style={[styles.notifCard, !notif.read && styles.notifCardUnread]}
                onPress={() => markNotificationRead(notif.id)}
              >
                <View style={[styles.notifIconBox, { backgroundColor: (notifTypeColor[notif.type] || '#9BA3AF') + '20' }]}>
                  <MaterialCommunityIcons name={notifTypeIcon[notif.type] as any || 'bell'} size={18} color={notifTypeColor[notif.type] || '#9BA3AF'} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.notifMsg}>{notif.message}</Text>
                  <Text style={styles.notifTime}>{timeAgo(notif.createdAt)}</Text>
                </View>
                {!notif.read && <View style={styles.unreadDot} />}
              </Pressable>
            ))
          )}

          <Pressable
            style={styles.logoutBtn}
            onPress={async () => { await logout(); router.replace('/'); }}
          >
            <MaterialCommunityIcons name="logout" size={20} color="#EF4444" />
            <Text style={styles.logoutText}>Sign Out</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F9FB' },
  header: { paddingHorizontal: 20, paddingBottom: 32, alignItems: 'center', gap: 12 },
  avatarCircle: { width: 88, height: 88, borderRadius: 44, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: 'rgba(255,255,255,0.4)' },
  avatarText: { fontFamily: 'Inter_700Bold', fontSize: 36, color: '#fff' },
  userName: { fontFamily: 'Inter_700Bold', fontSize: 22, color: '#fff' },
  roleBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  roleBadgeText: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#FFD700' },
  content: { padding: 16, gap: 16 },
  platformStatsCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  platformStatsTitle: { fontFamily: 'Inter_700Bold', fontSize: 15, color: '#1E1E1E', marginBottom: 14 },
  platformStatsGrid: { flexDirection: 'row', justifyContent: 'space-around' },
  miniStat: { alignItems: 'center', gap: 4 },
  miniStatNum: { fontFamily: 'Inter_700Bold', fontSize: 24 },
  miniStatLabel: { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#9BA3AF' },
  infoCard: { backgroundColor: '#fff', borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2, overflow: 'hidden' },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 },
  infoRowBorder: { borderBottomWidth: 1, borderBottomColor: '#F0F4F8' },
  infoLabel: { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#9BA3AF' },
  infoValue: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#1E1E1E', marginTop: 2 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontFamily: 'Inter_700Bold', fontSize: 17, color: '#1E1E1E' },
  markAllRead: { fontFamily: 'Inter_500Medium', fontSize: 13, color: '#7C3AED' },
  notifCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  notifCardUnread: { backgroundColor: '#F5F3FF', borderLeftWidth: 3, borderLeftColor: '#7C3AED' },
  notifIconBox: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  notifMsg: { fontFamily: 'Inter_500Medium', fontSize: 13, color: '#1E1E1E', lineHeight: 18 },
  notifTime: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#9BA3AF', marginTop: 4 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#7C3AED', marginTop: 4 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: '#FEF2F2', borderWidth: 1.5, borderColor: '#FECACA', padding: 16, borderRadius: 14 },
  logoutText: { fontFamily: 'Inter_700Bold', fontSize: 16, color: '#EF4444' },
});
