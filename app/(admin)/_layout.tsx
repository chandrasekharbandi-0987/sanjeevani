import React from 'react';
import { isLiquidGlassAvailable } from 'expo-glass-effect';
import { Tabs } from 'expo-router';
import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';
import { BlurView } from 'expo-blur';
import { Platform, StyleSheet, View, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

function NativeTabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Icon sf={{ default: 'house', selected: 'house.fill' }} />
        <Label>Dashboard</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="users">
        <Icon sf={{ default: 'person.2', selected: 'person.2.fill' }} />
        <Label>Users</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="analytics">
        <Icon sf={{ default: 'chart.bar', selected: 'chart.bar.fill' }} />
        <Label>Analytics</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <Icon sf={{ default: 'person', selected: 'person.fill' }} />
        <Label>Profile</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

function ClassicTabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const isIOS = Platform.OS === 'ios';
  const isWeb = Platform.OS === 'web';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#7C3AED',
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
      <Tabs.Screen name="index" options={{ title: 'Dashboard', tabBarIcon: ({ color }) => <Ionicons name="home" size={22} color={color} /> }} />
      <Tabs.Screen name="users" options={{ title: 'Users', tabBarIcon: ({ color }) => <Ionicons name="people" size={22} color={color} /> }} />
      <Tabs.Screen name="analytics" options={{ title: 'Analytics', tabBarIcon: ({ color }) => <Ionicons name="bar-chart" size={22} color={color} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({ color }) => <Ionicons name="person" size={22} color={color} /> }} />
    </Tabs>
  );
}

export default function AdminLayout() {
  if (isLiquidGlassAvailable()) return <NativeTabLayout />;
  return <ClassicTabLayout />;
}
