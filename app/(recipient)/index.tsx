import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, TextInput, Platform, Modal,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { useData, UrgencyLevel } from '@/contexts/DataContext';
import { BloodBadge, UrgencyBadge, StatusBadge, StatCard, SectionHeader, EmptyState, timeAgo } from '@/components/shared';
import { BloodGroup } from '@/contexts/AuthContext';

const BLOOD_GROUPS: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const URGENCY_LEVELS: UrgencyLevel[] = ['critical', 'high', 'medium', 'low'];

export default function RecipientHome() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { requests, createRequest, unreadNotifications } = useData();
  const [showModal, setShowModal] = useState(false);

  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('O+');
  const [hospital, setHospital] = useState('');
  const [urgency, setUrgency] = useState<UrgencyLevel>('high');
  const [location, setLocation] = useState('');
  const [contact, setContact] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!user) return null;

  const myRequests = requests.filter(r => r.recipientId === user.id);
  const activeRequests = myRequests.filter(r => r.status !== 'completed' && r.status !== 'cancelled');
  const completedRequests = myRequests.filter(r => r.status === 'completed');

  async function submitRequest() {
    if (!hospital.trim() || !location.trim() || !contact.trim()) return;
    setIsSubmitting(true);
    try {
      await createRequest({
        recipientId: user!.id,
        recipientName: user!.name,
        bloodGroup,
        hospital: hospital.trim(),
        urgencyLevel: urgency,
        location: location.trim(),
        contactNumber: contact.trim(),
      });
      setShowModal(false);
      setHospital(''); setLocation(''); setContact('');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <LinearGradient
          colors={['#6A0000', '#C62828']}
          style={[styles.header, { paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 0) + 16 }]}
        >
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>Hello,</Text>
              <Text style={styles.userName}>{user.name}</Text>
            </View>
            <Pressable style={styles.notifBtn} onPress={() => router.push('/(recipient)/profile')}>
              <Ionicons name="notifications" size={22} color="#fff" />
              {unreadNotifications > 0 && (
                <View style={styles.notifDot}>
                  <Text style={styles.notifDotText}>{unreadNotifications}</Text>
                </View>
              )}
            </Pressable>
          </View>

          <View style={styles.hospitalInfo}>
            <MaterialCommunityIcons name="hospital-box" size={16} color="rgba(255,255,255,0.8)" />
            <Text style={styles.hospitalText}>{user.hospital || user.city}</Text>
            <BloodBadge bloodGroup={user.bloodGroup} />
          </View>
        </LinearGradient>

        <View style={styles.content}>
          <View style={styles.statsRow}>
            <StatCard icon="list" value={myRequests.length} label="Total Requests" color="#C62828" />
            <StatCard icon="clock-fast" value={activeRequests.length} label="Active" color="#F59E0B" />
            <StatCard icon="check-circle" value={completedRequests.length} label="Fulfilled" color="#22C55E" />
          </View>

          {/* Emergency CTA */}
          <Pressable onPress={() => setShowModal(true)}>
            <LinearGradient colors={['#C62828', '#8E0000']} style={styles.emergencyCTA}>
              <View style={styles.emergencyCTALeft}>
                <MaterialCommunityIcons name="alarm-light" size={32} color="#fff" />
                <View>
                  <Text style={styles.emergencyCTATitle}>Emergency Request</Text>
                  <Text style={styles.emergencyCTASub}>Find blood donors urgently</Text>
                </View>
              </View>
              <Ionicons name="arrow-forward-circle" size={36} color="rgba(255,255,255,0.8)" />
            </LinearGradient>
          </Pressable>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <Pressable style={styles.quickAction} onPress={() => router.push('/(recipient)/search')}>
              <View style={[styles.quickActionIcon, { backgroundColor: '#FFF0F0' }]}>
                <Ionicons name="search" size={22} color="#C62828" />
              </View>
              <Text style={styles.quickActionLabel}>Find Donors</Text>
            </Pressable>
            <Pressable style={styles.quickAction} onPress={() => router.push('/(recipient)/chat')}>
              <View style={[styles.quickActionIcon, { backgroundColor: '#EFF6FF' }]}>
                <Ionicons name="chatbubbles" size={22} color="#2563EB" />
              </View>
              <Text style={styles.quickActionLabel}>Messages</Text>
            </Pressable>
            <Pressable style={styles.quickAction} onPress={() => router.push('/(recipient)/requests')}>
              <View style={[styles.quickActionIcon, { backgroundColor: '#F0FFF4' }]}>
                <MaterialCommunityIcons name="clipboard-list" size={22} color="#16A34A" />
              </View>
              <Text style={styles.quickActionLabel}>My Requests</Text>
            </Pressable>
          </View>

          <SectionHeader title="Active Requests" action="View All" onAction={() => router.push('/(recipient)/requests')} />

          {activeRequests.length === 0 ? (
            <EmptyState icon="clipboard-text-off" title="No active requests" subtitle="Tap the Emergency button to request blood" />
          ) : (
            activeRequests.slice(0, 3).map(req => (
              <View key={req.id} style={styles.requestCard}>
                <View style={styles.requestTop}>
                  <BloodBadge bloodGroup={req.bloodGroup} />
                  <UrgencyBadge level={req.urgencyLevel} />
                  <StatusBadge status={req.status} />
                </View>
                <Text style={styles.reqHospital}>{req.hospital}</Text>
                <Text style={styles.reqTime}>{timeAgo(req.createdAt)}</Text>
                {req.acceptedByDonorName && (
                  <View style={styles.donorAccepted}>
                    <MaterialCommunityIcons name="account-heart" size={16} color="#2563EB" />
                    <Text style={styles.donorAcceptedText}>Donor: {req.acceptedByDonorName}</Text>
                  </View>
                )}
                {req.doctorApproval && (
                  <View style={styles.approvedRow}>
                    <MaterialCommunityIcons name="shield-check" size={14} color="#16A34A" />
                    <Text style={styles.approvedText}>Medically approved</Text>
                  </View>
                )}
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Emergency Request Modal */}
      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
        <View style={[styles.modal, { paddingTop: insets.top + 16 }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Emergency Blood Request</Text>
            <Pressable onPress={() => setShowModal(false)}>
              <Ionicons name="close" size={24} color="#1E1E1E" />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <View style={styles.modalContent}>
              <Text style={styles.fieldLabel}>Blood Group Needed</Text>
              <View style={styles.bgGrid}>
                {BLOOD_GROUPS.map(bg => (
                  <Pressable key={bg} style={[styles.bgBtn, bloodGroup === bg && styles.bgBtnActive]} onPress={() => setBloodGroup(bg)}>
                    <Text style={[styles.bgBtnText, bloodGroup === bg && styles.bgBtnTextActive]}>{bg}</Text>
                  </Pressable>
                ))}
              </View>

              <Text style={styles.fieldLabel}>Urgency Level</Text>
              <View style={styles.urgencyRow}>
                {URGENCY_LEVELS.map(u => (
                  <Pressable key={u} style={[styles.urgencyBtn, urgency === u && styles.urgencyBtnActive]} onPress={() => setUrgency(u)}>
                    <Text style={[styles.urgencyBtnText, urgency === u && styles.urgencyBtnTextActive]}>
                      {u.charAt(0).toUpperCase() + u.slice(1)}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {[
                { label: 'Hospital Name *', value: hospital, setter: setHospital, placeholder: 'Apollo Hospital' },
                { label: 'Location *', value: location, setter: setLocation, placeholder: 'Mumbai, Maharashtra' },
                { label: 'Contact Number *', value: contact, setter: setContact, placeholder: '+91 9876543210' },
              ].map(field => (
                <View key={field.label} style={{ marginBottom: 16 }}>
                  <Text style={styles.fieldLabel}>{field.label}</Text>
                  <TextInput
                    style={styles.input}
                    value={field.value}
                    onChangeText={field.setter}
                    placeholder={field.placeholder}
                    placeholderTextColor="#9BA3AF"
                  />
                </View>
              ))}

              <Pressable
                style={[styles.submitBtn, isSubmitting && { opacity: 0.7 }]}
                onPress={submitRequest}
                disabled={isSubmitting}
              >
                <LinearGradient colors={['#C62828', '#E53935']} style={styles.submitBtnGrad}>
                  <MaterialCommunityIcons name="alarm-light" size={20} color="#fff" />
                  <Text style={styles.submitBtnText}>Send Emergency Request</Text>
                </LinearGradient>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F9FB' },
  header: { paddingHorizontal: 20, paddingBottom: 24 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
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
  hospitalInfo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  hospitalText: { fontFamily: 'Inter_400Regular', fontSize: 13, color: 'rgba(255,255,255,0.8)', flex: 1 },
  content: { padding: 16, gap: 20 },
  statsRow: { flexDirection: 'row', gap: 10 },
  emergencyCTA: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 20, borderRadius: 18,
  },
  emergencyCTALeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  emergencyCTATitle: { fontFamily: 'Inter_700Bold', fontSize: 17, color: '#fff' },
  emergencyCTASub: { fontFamily: 'Inter_400Regular', fontSize: 13, color: 'rgba(255,255,255,0.8)' },
  quickActions: { flexDirection: 'row', gap: 12 },
  quickAction: { flex: 1, alignItems: 'center', gap: 8 },
  quickActionIcon: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  quickActionLabel: { fontFamily: 'Inter_500Medium', fontSize: 12, color: '#5A6070', textAlign: 'center' },
  requestCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  requestTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' },
  reqHospital: { fontFamily: 'Inter_700Bold', fontSize: 16, color: '#1E1E1E', marginBottom: 4 },
  reqTime: { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#9BA3AF', marginBottom: 8 },
  donorAccepted: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#EFF6FF', padding: 8, borderRadius: 8, marginTop: 4,
  },
  donorAcceptedText: { fontFamily: 'Inter_500Medium', fontSize: 13, color: '#2563EB' },
  approvedRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  approvedText: { fontFamily: 'Inter_500Medium', fontSize: 12, color: '#16A34A' },
  modal: { flex: 1, backgroundColor: '#fff' },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#F0F4F8',
  },
  modalTitle: { fontFamily: 'Inter_700Bold', fontSize: 20, color: '#1E1E1E' },
  modalContent: { padding: 20, gap: 4 },
  fieldLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#1E1E1E', marginBottom: 10, marginTop: 8 },
  bgGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  bgBtn: {
    width: 64, height: 40, borderRadius: 10,
    backgroundColor: '#F7F9FB', borderWidth: 2, borderColor: '#E5E9EE',
    alignItems: 'center', justifyContent: 'center',
  },
  bgBtnActive: { backgroundColor: '#C62828', borderColor: '#C62828' },
  bgBtnText: { fontFamily: 'Inter_700Bold', fontSize: 14, color: '#5A6070' },
  bgBtnTextActive: { color: '#fff' },
  urgencyRow: { flexDirection: 'row', gap: 8, marginBottom: 8, flexWrap: 'wrap' },
  urgencyBtn: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10,
    backgroundColor: '#F7F9FB', borderWidth: 2, borderColor: '#E5E9EE',
  },
  urgencyBtnActive: { backgroundColor: '#C62828', borderColor: '#C62828' },
  urgencyBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#5A6070' },
  urgencyBtnTextActive: { color: '#fff' },
  input: {
    backgroundColor: '#F7F9FB', borderWidth: 1.5, borderColor: '#E5E9EE',
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14,
    fontFamily: 'Inter_400Regular', fontSize: 15, color: '#1E1E1E',
  },
  submitBtn: { marginTop: 16, borderRadius: 14, overflow: 'hidden' },
  submitBtnGrad: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, paddingVertical: 16,
  },
  submitBtnText: { fontFamily: 'Inter_700Bold', fontSize: 16, color: '#fff' },
});
