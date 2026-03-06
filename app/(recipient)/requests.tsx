import React from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { BloodBadge, UrgencyBadge, StatusBadge, EmptyState, timeAgo } from '@/components/shared';

export default function RecipientRequests() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { requests } = useData();

  if (!user) return null;
  const myRequests = requests.filter(r => r.recipientId === user.id);

  const STATUS_STEPS = ['pending', 'accepted', 'doctor_approved', 'completed'];
  const STATUS_LABELS: Record<string, string> = {
    pending: 'Request Sent',
    accepted: 'Donor Found',
    doctor_approved: 'Doctor Approved',
    completed: 'Donation Complete',
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#6A0000', '#C62828']}
        style={[styles.header, { paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 0) + 16 }]}
      >
        <Text style={styles.headerTitle}>My Requests</Text>
        <Text style={styles.headerSub}>{myRequests.length} blood requests</Text>
      </LinearGradient>

      <FlatList
        data={myRequests}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        ListEmptyComponent={
          <EmptyState icon="clipboard-text-off" title="No requests yet" subtitle="Go to Home to create an emergency blood request" />
        }
        renderItem={({ item: req }) => {
          const stepIdx = STATUS_STEPS.indexOf(req.status);
          return (
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <BloodBadge bloodGroup={req.bloodGroup} />
                <UrgencyBadge level={req.urgencyLevel} />
                <StatusBadge status={req.status} />
                <Text style={styles.time}>{timeAgo(req.createdAt)}</Text>
              </View>

              <Text style={styles.hospital}>{req.hospital}</Text>

              <View style={styles.infoRow}>
                <Ionicons name="location" size={13} color="#9BA3AF" />
                <Text style={styles.infoText}>{req.location}</Text>
              </View>

              {/* Progress */}
              {req.status !== 'cancelled' && (
                <View style={styles.progressSection}>
                  <View style={styles.progressSteps}>
                    {STATUS_STEPS.map((step, i) => (
                      <React.Fragment key={step}>
                        <View style={styles.progressStep}>
                          <View style={[
                            styles.progressDot,
                            i <= stepIdx ? styles.progressDotActive : styles.progressDotInactive,
                          ]}>
                            {i < stepIdx && <Ionicons name="checkmark" size={10} color="#fff" />}
                            {i === stepIdx && <View style={styles.progressDotInner} />}
                          </View>
                          <Text style={[
                            styles.progressLabel,
                            i <= stepIdx ? styles.progressLabelActive : styles.progressLabelInactive,
                          ]} numberOfLines={2}>
                            {STATUS_LABELS[step]}
                          </Text>
                        </View>
                        {i < STATUS_STEPS.length - 1 && (
                          <View style={[styles.progressLine, i < stepIdx && styles.progressLineActive]} />
                        )}
                      </React.Fragment>
                    ))}
                  </View>
                </View>
              )}

              {req.acceptedByDonorName && (
                <View style={styles.donorBox}>
                  <View style={styles.donorAvatar}>
                    <Text style={styles.donorAvatarText}>{req.acceptedByDonorName[0]}</Text>
                  </View>
                  <View>
                    <Text style={styles.donorLabel}>Donor</Text>
                    <Text style={styles.donorName}>{req.acceptedByDonorName}</Text>
                  </View>
                </View>
              )}

              {req.doctorName && (
                <View style={styles.doctorBox}>
                  <MaterialCommunityIcons name="shield-check" size={16} color="#16A34A" />
                  <Text style={styles.doctorText}>Approved by Dr. {req.doctorName}</Text>
                </View>
              )}

              {req.status === 'completed' && (
                <View style={styles.completedBanner}>
                  <MaterialCommunityIcons name="heart" size={20} color="#C62828" />
                  <Text style={styles.completedText}>Request fulfilled successfully!</Text>
                </View>
              )}
            </View>
          );
        }}
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
  hospital: { fontFamily: 'Inter_700Bold', fontSize: 16, color: '#1E1E1E', marginBottom: 6 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 14 },
  infoText: { fontFamily: 'Inter_400Regular', fontSize: 13, color: '#5A6070' },
  progressSection: { marginBottom: 12 },
  progressSteps: { flexDirection: 'row', alignItems: 'flex-start' },
  progressStep: { flex: 1, alignItems: 'center', gap: 6 },
  progressDot: {
    width: 22, height: 22, borderRadius: 11,
    alignItems: 'center', justifyContent: 'center',
  },
  progressDotActive: { backgroundColor: '#C62828' },
  progressDotInactive: { backgroundColor: '#E5E9EE', borderWidth: 2, borderColor: '#E5E9EE' },
  progressDotInner: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff' },
  progressLabel: { fontFamily: 'Inter_400Regular', fontSize: 9, textAlign: 'center', lineHeight: 13 },
  progressLabelActive: { color: '#C62828', fontFamily: 'Inter_600SemiBold' },
  progressLabelInactive: { color: '#9BA3AF' },
  progressLine: { flex: 1, height: 2, backgroundColor: '#E5E9EE', marginTop: 10 },
  progressLineActive: { backgroundColor: '#C62828' },
  donorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#F7F9FB', padding: 10, borderRadius: 10, marginBottom: 8,
  },
  donorAvatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#C62828', alignItems: 'center', justifyContent: 'center',
  },
  donorAvatarText: { fontFamily: 'Inter_700Bold', fontSize: 16, color: '#fff' },
  donorLabel: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#9BA3AF' },
  donorName: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#1E1E1E' },
  doctorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#F0FFF4', padding: 8, borderRadius: 8, marginBottom: 8,
  },
  doctorText: { fontFamily: 'Inter_500Medium', fontSize: 12, color: '#16A34A' },
  completedBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#FFF0F0', padding: 12, borderRadius: 10,
  },
  completedText: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#C62828' },
});
