import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Colors from '@/constants/colors';

export function BloodBadge({ bloodGroup }: { bloodGroup: string }) {
  const colors: Record<string, string> = {
    'A+': '#FF6B6B', 'A-': '#FF8C8C',
    'B+': '#FF9A3C', 'B-': '#FFB366',
    'AB+': '#9B59B6', 'AB-': '#B07CC6',
    'O+': '#C62828', 'O-': '#E53935',
  };
  return (
    <View style={[sharedStyles.bloodBadge, { backgroundColor: colors[bloodGroup] || '#C62828' }]}>
      <Text style={sharedStyles.bloodBadgeText}>{bloodGroup}</Text>
    </View>
  );
}

export function UrgencyBadge({ level }: { level: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    critical: { bg: '#FEF2F2', text: '#C62828' },
    high: { bg: '#FFF5F5', text: '#E53935' },
    medium: { bg: '#FFFBEB', text: '#D97706' },
    low: { bg: '#F0FFF4', text: '#16A34A' },
  };
  const c = colors[level] || colors.medium;
  return (
    <View style={[sharedStyles.urgencyBadge, { backgroundColor: c.bg }]}>
      <MaterialCommunityIcons name="alarm-light" size={12} color={c.text} />
      <Text style={[sharedStyles.urgencyText, { color: c.text }]}>{level.toUpperCase()}</Text>
    </View>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const configs: Record<string, { bg: string; text: string; label: string }> = {
    pending: { bg: '#FFFBEB', text: '#D97706', label: 'Pending' },
    accepted: { bg: '#EFF6FF', text: '#2563EB', label: 'Accepted' },
    doctor_approved: { bg: '#F0FFF4', text: '#16A34A', label: 'Approved' },
    completed: { bg: '#F0FFF4', text: '#16A34A', label: 'Completed' },
    cancelled: { bg: '#F9FAFB', text: '#6B7280', label: 'Cancelled' },
  };
  const c = configs[status] || configs.pending;
  return (
    <View style={[sharedStyles.statusBadge, { backgroundColor: c.bg }]}>
      <Text style={[sharedStyles.statusText, { color: c.text }]}>{c.label}</Text>
    </View>
  );
}

export function StatCard({ icon, value, label, color }: {
  icon: string; value: string | number; label: string; color?: string;
}) {
  return (
    <View style={[sharedStyles.statCard, color ? { borderTopColor: color, borderTopWidth: 3 } : {}]}>
      <View style={[sharedStyles.statIconBox, { backgroundColor: (color || Colors.primary) + '20' }]}>
        <MaterialCommunityIcons name={icon as any} size={22} color={color || Colors.primary} />
      </View>
      <Text style={sharedStyles.statValue}>{value}</Text>
      <Text style={sharedStyles.statLabel}>{label}</Text>
    </View>
  );
}

export function SectionHeader({ title, action, onAction }: {
  title: string; action?: string; onAction?: () => void;
}) {
  return (
    <View style={sharedStyles.sectionHeaderRow}>
      <Text style={sharedStyles.sectionHeaderTitle}>{title}</Text>
      {action && onAction && (
        <Pressable onPress={onAction}>
          <Text style={sharedStyles.sectionHeaderAction}>{action}</Text>
        </Pressable>
      )}
    </View>
  );
}

export function EmptyState({ icon, title, subtitle }: {
  icon: string; title: string; subtitle?: string;
}) {
  return (
    <View style={sharedStyles.emptyState}>
      <View style={sharedStyles.emptyIconBox}>
        <MaterialCommunityIcons name={icon as any} size={40} color="#9BA3AF" />
      </View>
      <Text style={sharedStyles.emptyTitle}>{title}</Text>
      {subtitle && <Text style={sharedStyles.emptySubtitle}>{subtitle}</Text>}
    </View>
  );
}

export function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

const sharedStyles = StyleSheet.create({
  bloodBadge: {
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 8,
  },
  bloodBadgeText: { fontFamily: 'Inter_700Bold', fontSize: 13, color: '#fff' },
  urgencyBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
  },
  urgencyText: { fontFamily: 'Inter_700Bold', fontSize: 10 },
  statusBadge: {
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8,
  },
  statusText: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
  statCard: {
    flex: 1, backgroundColor: '#fff', borderRadius: 16,
    padding: 16, gap: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  statIconBox: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  statValue: { fontFamily: 'Inter_700Bold', fontSize: 24, color: '#1E1E1E' },
  statLabel: { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#9BA3AF' },
  sectionHeaderRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12,
  },
  sectionHeaderTitle: { fontFamily: 'Inter_700Bold', fontSize: 17, color: '#1E1E1E' },
  sectionHeaderAction: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#C62828' },
  emptyState: { alignItems: 'center', padding: 32, gap: 12 },
  emptyIconBox: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#F0F4F8', alignItems: 'center', justifyContent: 'center',
  },
  emptyTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 16, color: '#5A6070' },
  emptySubtitle: { fontFamily: 'Inter_400Regular', fontSize: 14, color: '#9BA3AF', textAlign: 'center' },
});
