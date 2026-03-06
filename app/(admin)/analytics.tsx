import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useData } from '@/contexts/DataContext';

function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const percent = max > 0 ? (value / max) * 100 : 0;
  return (
    <View style={pb.track}>
      <View style={[pb.fill, { width: `${percent}%` as any, backgroundColor: color }]} />
    </View>
  );
}
const pb = StyleSheet.create({ track: { height: 10, backgroundColor: '#F0F4F8', borderRadius: 6, overflow: 'hidden' }, fill: { height: 10, borderRadius: 6 } });

export default function AdminAnalytics() {
  const insets = useSafeAreaInsets();
  const { requests, donations, allUsers } = useData();

  const donors = allUsers.filter(u => u.role === 'donor');
  const recipients = allUsers.filter(u => u.role === 'recipient');
  const doctors = allUsers.filter(u => u.role === 'doctor');

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const bloodGroupData = bloodGroups.map(bg => ({
    bg,
    count: requests.filter(r => r.bloodGroup === bg).length,
  })).filter(d => d.count > 0).sort((a, b) => b.count - a.count);
  const maxBgCount = Math.max(...bloodGroupData.map(d => d.count), 1);

  const statusData = [
    { label: 'Pending', count: requests.filter(r => r.status === 'pending').length, color: '#3B82F6' },
    { label: 'Accepted', count: requests.filter(r => r.status === 'accepted').length, color: '#F59E0B' },
    { label: 'Approved', count: requests.filter(r => r.status === 'doctor_approved').length, color: '#2EC4B6' },
    { label: 'Completed', count: requests.filter(r => r.status === 'completed').length, color: '#22C55E' },
    { label: 'Cancelled', count: requests.filter(r => r.status === 'cancelled').length, color: '#EF4444' },
  ];
  const maxStatusCount = Math.max(...statusData.map(d => d.count), 1);

  const urgencyData = [
    { label: 'Critical', count: requests.filter(r => r.urgencyLevel === 'critical').length, color: '#EF4444' },
    { label: 'High', count: requests.filter(r => r.urgencyLevel === 'high').length, color: '#F97316' },
    { label: 'Medium', count: requests.filter(r => r.urgencyLevel === 'medium').length, color: '#EAB308' },
    { label: 'Low', count: requests.filter(r => r.urgencyLevel === 'low').length, color: '#22C55E' },
  ];
  const maxUrgency = Math.max(...urgencyData.map(d => d.count), 1);

  const availableDonors = donors.filter(u => u.availability).length;
  const avgDonations = donors.length > 0 ? (donations.length / donors.length).toFixed(1) : '0';

  const cityDonors: Record<string, number> = {};
  donors.forEach(u => { cityDonors[u.city] = (cityDonors[u.city] || 0) + 1; });
  const topCities = Object.entries(cityDonors).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxCity = Math.max(...topCities.map(c => c[1]), 1);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <LinearGradient
          colors={['#4C1D95', '#7C3AED']}
          style={[styles.header, { paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 0) + 16 }]}
        >
          <Text style={styles.headerTitle}>Analytics</Text>
          <Text style={styles.headerSub}>Platform performance at a glance</Text>
        </LinearGradient>

        <View style={styles.content}>
          {/* Key Metrics */}
          <View style={styles.metricsGrid}>
            {[
              { icon: 'account-group', label: 'Total Users', value: allUsers.length, color: '#7C3AED' },
              { icon: 'heart-pulse', label: 'Total Donations', value: donations.length, color: '#C62828' },
              { icon: 'account-check', label: 'Available Donors', value: availableDonors, color: '#22C55E' },
              { icon: 'chart-timeline-variant', label: 'Avg Donations/Donor', value: avgDonations, color: '#F59E0B' },
            ].map((m, i) => (
              <View key={i} style={[styles.metricCard, { borderTopColor: m.color, borderTopWidth: 3 }]}>
                <MaterialCommunityIcons name={m.icon as any} size={22} color={m.color} />
                <Text style={[styles.metricValue, { color: m.color }]}>{m.value}</Text>
                <Text style={styles.metricLabel}>{m.label}</Text>
              </View>
            ))}
          </View>

          {/* Users by Role */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Users by Role</Text>
            {[
              { label: 'Donors', count: donors.length, color: '#C62828' },
              { label: 'Recipients', count: recipients.length, color: '#2563EB' },
              { label: 'Doctors', count: doctors.length, color: '#2EC4B6' },
            ].map((r, i) => (
              <View key={i} style={styles.barRow}>
                <Text style={styles.barLabel}>{r.label}</Text>
                <ProgressBar value={r.count} max={Math.max(donors.length, recipients.length, doctors.length, 1)} color={r.color} />
                <Text style={styles.barValue}>{r.count}</Text>
              </View>
            ))}
          </View>

          {/* Requests by Blood Group */}
          {bloodGroupData.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Requests by Blood Group</Text>
              {bloodGroupData.map((d, i) => (
                <View key={i} style={styles.barRow}>
                  <Text style={[styles.barLabel, { color: '#C62828', fontFamily: 'Inter_700Bold', minWidth: 36 }]}>{d.bg}</Text>
                  <ProgressBar value={d.count} max={maxBgCount} color="#C62828" />
                  <Text style={styles.barValue}>{d.count}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Request Status */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Request Status Distribution</Text>
            {statusData.map((s, i) => (
              <View key={i} style={styles.barRow}>
                <Text style={styles.barLabel}>{s.label}</Text>
                <ProgressBar value={s.count} max={maxStatusCount} color={s.color} />
                <Text style={styles.barValue}>{s.count}</Text>
              </View>
            ))}
          </View>

          {/* Urgency Breakdown */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Urgency Level Breakdown</Text>
            {urgencyData.map((u, i) => (
              <View key={i} style={styles.barRow}>
                <Text style={styles.barLabel}>{u.label}</Text>
                <ProgressBar value={u.count} max={maxUrgency} color={u.color} />
                <Text style={styles.barValue}>{u.count}</Text>
              </View>
            ))}
          </View>

          {/* Top Cities */}
          {topCities.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Top Cities by Donors</Text>
              {topCities.map(([city, count], i) => (
                <View key={i} style={styles.barRow}>
                  <Text style={styles.barLabel} numberOfLines={1}>{city}</Text>
                  <ProgressBar value={count} max={maxCity} color="#7C3AED" />
                  <Text style={styles.barValue}>{count}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F9FB' },
  header: { paddingHorizontal: 20, paddingBottom: 24 },
  headerTitle: { fontFamily: 'Inter_700Bold', fontSize: 26, color: '#fff', marginBottom: 4 },
  headerSub: { fontFamily: 'Inter_400Regular', fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  content: { padding: 16, gap: 16 },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  metricCard: {
    width: '47%', backgroundColor: '#fff', borderRadius: 14, padding: 16, alignItems: 'center', gap: 6,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  metricValue: { fontFamily: 'Inter_700Bold', fontSize: 26 },
  metricLabel: { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#9BA3AF', textAlign: 'center' },
  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16, gap: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  cardTitle: { fontFamily: 'Inter_700Bold', fontSize: 15, color: '#1E1E1E', marginBottom: 4 },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  barLabel: { fontFamily: 'Inter_500Medium', fontSize: 13, color: '#5A6070', width: 76 },
  barValue: { fontFamily: 'Inter_700Bold', fontSize: 13, color: '#1E1E1E', width: 28, textAlign: 'right' },
});
