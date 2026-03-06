import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth, UserRole } from '@/contexts/AuthContext';

const DEMO_ACCOUNTS = [
  { label: 'Donor', email: 'rahul@example.com', password: 'donor123' },
  { label: 'Recipient', email: 'meera@example.com', password: 'recipient123' },
  { label: 'Doctor', email: 'doctor@example.com', password: 'doctor123' },
  { label: 'Admin', email: 'admin@sanjeevani.com', password: 'admin123' },
];

function navigateForRole(role: UserRole) {
  switch (role) {
    case 'donor': router.replace('/(donor)'); break;
    case 'recipient': router.replace('/(recipient)'); break;
    case 'doctor': router.replace('/(doctor)'); break;
    case 'admin': router.replace('/(admin)'); break;
  }
}

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { login, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) navigateForRole(user.role);
  }, [user]);

  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      setError('Please enter email and password');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      await login(email.trim(), password);
    } catch (e: any) {
      setError(e.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDemoLogin(demoEmail: string, demoPass: string) {
    setIsLoading(true);
    setError('');
    try {
      await login(demoEmail, demoPass);
    } catch (e: any) {
      setError(e.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <View style={[styles.container, { paddingTop: Platform.OS === 'web' ? insets.top + 67 : insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <LinearGradient colors={['#6A0000', '#C62828']} style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </Pressable>
          <View style={styles.headerContent}>
            <View style={styles.logoCircle}>
              <MaterialCommunityIcons name="water" size={32} color="#fff" />
            </View>
            <Text style={styles.headerTitle}>Welcome Back</Text>
            <Text style={styles.headerSub}>Sign in to Sanjeevani</Text>
          </View>
        </LinearGradient>

        <View style={styles.form}>
          {error ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={16} color="#EF4444" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color="#9BA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                placeholderTextColor="#9BA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color="#9BA3AF" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                placeholderTextColor="#9BA3AF"
                secureTextEntry={!showPassword}
              />
              <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#9BA3AF" />
              </Pressable>
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [styles.loginButton, (pressed || isLoading) && { opacity: 0.8 }]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <LinearGradient colors={['#C62828', '#E53935']} style={styles.loginButtonGrad}>
              {isLoading ? <ActivityIndicator color="#fff" /> : (
                <>
                  <MaterialCommunityIcons name="login" size={20} color="#fff" />
                  <Text style={styles.loginButtonText}>Sign In</Text>
                </>
              )}
            </LinearGradient>
          </Pressable>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Quick Demo Login</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.demoGrid}>
            {DEMO_ACCOUNTS.map((acc) => (
              <Pressable
                key={acc.label}
                style={({ pressed }) => [styles.demoBtn, pressed && { opacity: 0.7 }]}
                onPress={() => handleDemoLogin(acc.email, acc.password)}
              >
                <Text style={styles.demoBtnText}>{acc.label}</Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.registerRow}>
            <Text style={styles.registerText}>Don't have an account? </Text>
            <Pressable onPress={() => router.replace('/(auth)/register')}>
              <Text style={styles.registerLink}>Sign Up</Text>
            </Pressable>
          </View>
        </View>
        <View style={{ height: insets.bottom + 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F9FB' },
  header: { paddingHorizontal: 20, paddingBottom: 36, paddingTop: 16 },
  backBtn: { marginBottom: 20 },
  headerContent: { alignItems: 'center', gap: 12 },
  logoCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)',
  },
  headerTitle: { fontSize: 28, fontFamily: 'Inter_700Bold', color: '#fff' },
  headerSub: { fontSize: 15, fontFamily: 'Inter_400Regular', color: 'rgba(255,255,255,0.8)' },
  form: { padding: 24, gap: 0 },
  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA',
    padding: 12, borderRadius: 10, marginBottom: 20,
  },
  errorText: { fontFamily: 'Inter_400Regular', fontSize: 14, color: '#EF4444', flex: 1 },
  inputGroup: { marginBottom: 16 },
  inputLabel: { fontFamily: 'Inter_500Medium', fontSize: 14, color: '#1E1E1E', marginBottom: 8 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#E5E9EE',
    borderRadius: 12, paddingHorizontal: 14, minHeight: 52,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 15, color: '#1E1E1E', paddingVertical: 14 },
  eyeBtn: { padding: 4 },
  loginButton: { marginTop: 8, borderRadius: 14, overflow: 'hidden' },
  loginButtonGrad: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, paddingVertical: 16, minHeight: 54,
  },
  loginButtonText: { fontFamily: 'Inter_700Bold', fontSize: 16, color: '#fff' },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 24 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E5E9EE' },
  dividerText: { fontFamily: 'Inter_400Regular', fontSize: 13, color: '#9BA3AF' },
  demoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  demoBtn: {
    flex: 1, minWidth: '45%',
    backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#FFC7C7',
    paddingVertical: 12, borderRadius: 12, alignItems: 'center',
  },
  demoBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#C62828' },
  registerRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  registerText: { fontFamily: 'Inter_400Regular', fontSize: 14, color: '#5A6070' },
  registerLink: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#C62828' },
});
