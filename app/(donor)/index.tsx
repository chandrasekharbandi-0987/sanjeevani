import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Platform,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { BloodBadge, UrgencyBadge, StatusBadge, StatCard, SectionHeader, EmptyState, timeAgo } from '@/components/shared';

export default function DonorHome() {
  const insets = useSafeAreaInsets();
  const { user, updateUser } = useAuth();
  const { requests, donations, unreadNotifications, acceptRequest, notifications } = useData();

  if (!user) return null;

  const myDonations = donations.filter(d => d.donorId === user.id);
  const pendingRequests = requests.filter(r => r.status === 'pending');
  const myActiveRequests = requests.filter(r => r.acceptedByDonorId === user.id && r.status !== 'completed' && r.status !== 'cancelled');
  const totalLives = myDonations.reduce((sum, d) => sum + (d.livesImpacted || 0), 0);
  const recentNotifs = notifications.filter(n => !n.read).slice(0, 3);

  async function toggleAvailability() {
    await updateUser({ availability: !user.availability });
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Header */}
        <LinearGradient
          colors={['#6A0000', '#C62828']}
          style={[styles.header, { paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 0) + 16 }]}
        >
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>Good {getGreeting()}</Text>
              <Text style={styles.userName}>{user.name}</Text>
            </View>
            <Pressable style={styles.notifBtn} onPress={() => router.push('/(donor)/profile')}>
              <Ionicons name="notifications" size={22} color="#fff" />
              {unreadNotifications > 0 && (
                <View style={styles.notifDot}>
                  <Text style={styles.notifDotText}>{unreadNotifications}</Text>
                </View>
              )}
            </Pressable>
          </View>

          {/* Availability Toggle */}
          <Pressable style={styles.availabilityCard} onPress={toggleAvailability}>
            <View style={styles.availabilityLeft}>
              <View style={[styles.availabilityDot, { backgroundColor: user.availability ? '#22C55E' : '#9BA3AF' }]} />
              <View>
                <Text style={styles.availabilityTitle}>
                  {user.availability ? 'Available to Donate' : 'Not Available'}
                </Text>
                <Text style={styles.availabilityHint}>Tap to toggle your status</Text>
              </View>
            </View>
            <View style={[styles.toggle, user.availability && styles.toggleActive]}>
              <View style={[styles.toggleKnob, user.availability && styles.toggleKnobActive]} />
            </View>
          </Pressable>

          <View style={styles.bloodGroupRow}>
            <BloodBadge bloodGroup={user.bloodGroup} />
            <View style={styles.cityRow}>
              <Ionicons name="location" size={14} color="rgba(255,255,255,0.8)" />
              <Text style={styles.cityText}>{user.city}</Text>
            </View>
            <Text style={styles.donorBadge}>{myDonations.length} donations</Text>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          {/* Stats */}
          <View style={styles.statsRow}>
            <StatCard icon="water" value={myDonations.length} label="Donations" color="#C62828" />
            <StatCard icon="heart" value={totalLives} label="Lives Impacted" color="#FF6B6B" />
            <StatCard icon="clock-outline" value={myActiveRequests.length} label="Active" color="#2EC4B6" />
          </View>

          {/* Motivational Banner */}
          {myDonations.length > 0 && (
            <LinearGradient colors={['#2EC4B6', '#1A9B8F']} style={styles.motivationBanner}>
              <MaterialCommunityIcons name="heart-pulse" size={28} color="#fff" />
              <View style={{ flex: 1 }}>
                <Text style={styles.motivationTitle}>Amazing Impact!</Text>
                <Text style={styles.motivationText}>
                  Your {myDonations.length} donation{myDonations.length !== 1 ? 's' : ''} may have saved up to {totalLives} lives!
                </Text>
              </View>
            </LinearGradient>
          )}

          {/* Alerts */}
          {recentNotifs.length > 0 && (
            <View>
              <SectionHeader title="New Alerts" action="See All" onAction={() => router.push('/(donor)/profile')} />
              {recentNotifs.map(n => (
                <View key={n.id} style={styles.notifCard}>
                  <View style={styles.notifIconBox}>
                    <MaterialCommunityIcons name="bell" size={18} color="#C62828" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.notifMsg}>{n.message}</Text>
                    <Text style={styles.notifTime}>{timeAgo(n.createdAt)}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Emergency Requests */}
          <SectionHeader
            title="Emergency Requests"
            action="View All"
            onAction={() => router.push('/(donor)/requests')}
          />

          {pendingRequests.length === 0 ? (
            <EmptyState icon="water-off" title="No pending requests" subtitle="Check back later for emergency requests" />
          ) : (
            pendingRequests.slice(0, 3).map(req => (
              <View key={req.id} style={styles.requestCard}>
                <View style={styles.requestCardTop}>
                  <BloodBadge bloodGroup={req.bloodGroup} />
                  <UrgencyBadge level={req.urgencyLevel} />
                  <Text style={styles.requestTime}>{timeAgo(req.createdAt)}</Text>
                </View>
                <Text style={styles.requestHospital}>{req.hospital}</Text>
                <View style={styles.requestLocation}>
                  <Ionicons name="location" size={14} color="#9BA3AF" />
                  <Text style={styles.requestLocationText}>{req.location}</Text>
                </View>
                <Text style={styles.requestContact}>Contact: {req.contactNumber}</Text>
                {user.bloodGroup === req.bloodGroup || req.bloodGroup === 'O-' || user.bloodGroup === 'O-' ? (
                  <View style={styles.requestActions}>
                    <Pressable
                      style={styles.acceptBtn}
                      onPress={() => acceptRequest(req.id)}
                    >
                      <MaterialCommunityIcons name="check-circle" size={18} color="#fff" />
                      <Text style={styles.acceptBtnText}>Accept & Donate</Text>
                    </Pressable>
                  </View>
                ) : (
                  <View style={styles.incompatibleBadge}>
                    <Ionicons name="information-circle" size={14} color="#9BA3AF" />
                    <Text style={styles.incompatibleText}>Blood group incompatible</Text>
                  </View>
                )}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Morning';
  if (h < 17) return 'Afternoon';
  return 'Evening';
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F9FB' },
  header: { paddingHorizontal: 20, paddingBottom: 24 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  greeting: { fontFamily: 'Inter_400Regular', fontSize: 14, color: 'rgba(255,255,255,0.8)' },
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
  availabilityCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 14,
    padding: 14, marginBottom: 16,
  },
  availabilityLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  availabilityDot: { width: 10, height: 10, borderRadius: 5 },
  availabilityTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 15, color: '#fff' },
  availabilityHint: { fontFamily: 'Inter_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.7)' },
  toggle: { width: 48, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.3)', padding: 2 },
  toggleActive: { backgroundColor: '#22C55E' },
  toggleKnob: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#fff' },
  toggleKnobActive: { transform: [{ translateX: 20 }] },
  bloodGroupRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cityRow: { flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1 },
  cityText: { fontFamily: 'Inter_400Regular', fontSize: 13, color: 'rgba(255,255,255,0.8)' },
  donorBadge: { fontFamily: 'Inter_500Medium', fontSize: 12, color: 'rgba(255,255,255,0.7)' },
  content: { padding: 16, gap: 20 },
  statsRow: { flexDirection: 'row', gap: 10 },
  motivationBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    padding: 16, borderRadius: 16,
  },
  motivationTitle: { fontFamily: 'Inter_700Bold', fontSize: 15, color: '#fff' },
  motivationText: { fontFamily: 'Inter_400Regular', fontSize: 13, color: 'rgba(255,255,255,0.9)', lineHeight: 18 },
  notifCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    backgroundColor: '#FFF0F0', borderRadius: 12, padding: 12,
    marginBottom: 8, borderLeftWidth: 3, borderLeftColor: '#C62828',
  },
  notifIconBox: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
  },
  notifMsg: { fontFamily: 'Inter_500Medium', fontSize: 13, color: '#1E1E1E', lineHeight: 18 },
  notifTime: { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#9BA3AF', marginTop: 2 },
  requestCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  requestCardTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  requestTime: { marginLeft: 'auto' as any, fontFamily: 'Inter_400Regular', fontSize: 12, color: '#9BA3AF' },
  requestHospital: { fontFamily: 'Inter_700Bold', fontSize: 16, color: '#1E1E1E', marginBottom: 6 },
  requestLocation: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  requestLocationText: { fontFamily: 'Inter_400Regular', fontSize: 13, color: '#5A6070' },
  requestContact: { fontFamily: 'Inter_500Medium', fontSize: 13, color: '#5A6070', marginBottom: 12 },
  requestActions: { flexDirection: 'row', gap: 10 },
  acceptBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: '#C62828', paddingVertical: 12, borderRadius: 10,
  },
  acceptBtnText: { fontFamily: 'Inter_700Bold', fontSize: 14, color: '#fff' },
  incompatibleBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#F9FAFB', padding: 8, borderRadius: 8,
  },
  incompatibleText: { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#9BA3AF' },
});
