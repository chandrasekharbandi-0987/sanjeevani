import React from 'react';
import { isLiquidGlassAvailable } from 'expo-glass-effect';
import { Tabs } from 'expo-router';
import { NativeTabs, Icon, Label, Badge } from 'expo-router/unstable-native-tabs';
import { BlurView } from 'expo-blur';
import { Platform, StyleSheet, View } from 'react-native';
import { useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useData } from '@/contexts/DataContext';

function NativeTabLayout() {
  const { unreadNotifications } = useData();
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Icon sf={{ default: 'house', selected: 'house.fill' }} />
        <Label>Home</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="requests">
        <Icon sf={{ default: 'drop', selected: 'drop.fill' }} />
        <Label>Requests</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="history">
        <Icon sf={{ default: 'clock', selected: 'clock.fill' }} />
        <Label>History</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="chat">
        <Icon sf={{ default: 'message', selected: 'message.fill' }} />
        <Label>Chat</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <Icon sf={{ default: 'person', selected: 'person.fill' }} />
        <Label>Profile</Label>
        {unreadNotifications > 0 && <Badge>{unreadNotifications}</Badge>}
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

function ClassicTabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const isIOS = Platform.OS === 'ios';
  const isWeb = Platform.OS === 'web';
  const { unreadNotifications } = useData();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#C62828',
        tabBarInactiveTintColor: isDark ? '#888' : '#9BA3AF',
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: isIOS ? 'transparent' : isDark ? '#000' : '#fff',
          borderTopWidth: isWeb ? 1 : 0,
          borderTopColor: isDark ? '#333' : '#E5E9EE',
          elevation: 0,
          ...(isWeb ? { height: 84 } : {}),
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView intensity={100} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
          ) : isWeb ? (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: isDark ? '#000' : '#fff' }]} />
          ) : null,
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ({ color }) => <Ionicons name="home" size={22} color={color} /> }} />
      <Tabs.Screen name="requests" options={{ title: 'Requests', tabBarIcon: ({ color }) => <Ionicons name="water" size={22} color={color} /> }} />
      <Tabs.Screen name="history" options={{ title: 'History', tabBarIcon: ({ color }) => <Ionicons name="time" size={22} color={color} /> }} />
      <Tabs.Screen name="chat" options={{ title: 'Chat', tabBarIcon: ({ color }) => <Ionicons name="chatbubble" size={22} color={color} /> }} />
      <Tabs.Screen name="profile" options={{
        title: 'Profile',
        tabBarIcon: ({ color }) => <Ionicons name="person" size={22} color={color} />,
        tabBarBadge: unreadNotifications > 0 ? unreadNotifications : undefined,
      }} />
    </Tabs>
  );
}

export default function DonorLayout() {
  if (isLiquidGlassAvailable()) return <NativeTabLayout />;
  return <ClassicTabLayout />;
}
