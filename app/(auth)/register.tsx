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
import { useAuth, UserRole, BloodGroup, RegisterData } from '@/contexts/AuthContext';

const BLOOD_GROUPS: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const ROLES: { value: UserRole; label: string; icon: string; desc: string }[] = [
  { value: 'donor', label: 'Donor', icon: 'water', desc: 'Offer blood donation' },
  { value: 'recipient', label: 'Recipient', icon: 'hospital-box', desc: 'Request blood urgently' },
  { value: 'doctor', label: 'Doctor', icon: 'stethoscope', desc: 'Verify & approve donations' },
];

function navigateForRole(role: UserRole) {
  switch (role) {
    case 'donor': router.replace('/(donor)'); break;
    case 'recipient': router.replace('/(recipient)'); break;
    case 'doctor': router.replace('/(doctor)'); break;
    case 'admin': router.replace('/(admin)'); break;
  }
}

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const { register, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<UserRole>('donor');
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('O+');
  const [city, setCity] = useState('');
  const [hospital, setHospital] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [availability, setAvailability] = useState(true);
  const [emergencyContact, setEmergencyContact] = useState('');

  useEffect(() => {
    if (user) navigateForRole(user.role);
  }, [user]);

  async function handleRegister() {
    if (!name.trim() || !email.trim() || !phone.trim() || !password.trim() || !city.trim()) {
      setError('Please fill all required fields');
      return;
    }
    if (role === 'doctor' && (!hospital.trim() || !licenseNumber.trim())) {
      setError('Please fill hospital and license number');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const data: RegisterData = {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        role,
        bloodGroup,
        city: city.trim(),
        hospital: hospital.trim() || undefined,
        licenseNumber: licenseNumber.trim() || undefined,
        availability: role === 'donor' ? availability : undefined,
        emergencyContact: emergencyContact.trim() || undefined,
      };
      await register(data);
    } catch (e: any) {
      setError(e.message || 'Registration failed');
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
            <Text style={styles.headerTitle}>Join Sanjeevani</Text>
            <Text style={styles.headerSub}>Create your account</Text>
          </View>
        </LinearGradient>

        <View style={styles.form}>
          {error ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={16} color="#EF4444" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* ROLE SELECT */}
          <View style={styles.sectionLabel}>
            <Text style={styles.sectionLabelText}>I want to</Text>
          </View>
          <View style={styles.rolesRow}>
            {ROLES.map((r) => (
              <Pressable
                key={r.value}
                style={[styles.roleCard, role === r.value && styles.roleCardActive]}
                onPress={() => setRole(r.value)}
              >
                <MaterialCommunityIcons
                  name={r.icon as any}
                  size={24}
                  color={role === r.value ? '#fff' : '#C62828'}
                />
                <Text style={[styles.roleLabel, role === r.value && styles.roleLabelActive]}>{r.label}</Text>
                <Text style={[styles.roleDesc, role === r.value && styles.roleDescActive]}>{r.desc}</Text>
              </Pressable>
            ))}
          </View>

          {/* BASIC INFO */}
          <View style={styles.sectionLabel}>
            <Text style={styles.sectionLabelText}>Personal Details</Text>
          </View>

          <InputField label="Full Name *" value={name} onChangeText={setName} placeholder="John Doe" icon="person-outline" />
          <InputField label="Email Address *" value={email} onChangeText={setEmail} placeholder="john@example.com" icon="mail-outline" keyboardType="email-address" autoCapitalize="none" />
          <InputField label="Phone Number *" value={phone} onChangeText={setPhone} placeholder="+91 9876543210" icon="call-outline" keyboardType="phone-pad" />

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Password *</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color="#9BA3AF" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                value={password}
                onChangeText={setPassword}
                placeholder="Create a strong password"
                placeholderTextColor="#9BA3AF"
                secureTextEntry={!showPassword}
              />
              <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#9BA3AF" />
              </Pressable>
            </View>
          </View>

          <InputField label="City *" value={city} onChangeText={setCity} placeholder="Mumbai" icon="location-outline" />

          {/* BLOOD GROUP */}
          <View style={styles.sectionLabel}>
            <Text style={styles.sectionLabelText}>Blood Group *</Text>
          </View>
          <View style={styles.bloodGroupGrid}>
            {BLOOD_GROUPS.map((bg) => (
              <Pressable
                key={bg}
                style={[styles.bgBtn, bloodGroup === bg && styles.bgBtnActive]}
                onPress={() => setBloodGroup(bg)}
              >
                <Text style={[styles.bgBtnText, bloodGroup === bg && styles.bgBtnTextActive]}>{bg}</Text>
              </Pressable>
            ))}
          </View>

          {/* ROLE-SPECIFIC */}
          {(role === 'donor') && (
            <>
              <View style={styles.sectionLabel}>
                <Text style={styles.sectionLabelText}>Donor Info</Text>
              </View>
              <Pressable style={styles.toggleRow} onPress={() => setAvailability(!availability)}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.toggleLabel}>Available to donate now</Text>
                  <Text style={styles.toggleDesc}>Toggle if you can donate within 2 weeks</Text>
                </View>
                <View style={[styles.toggle, availability && styles.toggleActive]}>
                  <View style={[styles.toggleKnob, availability && styles.toggleKnobActive]} />
                </View>
              </Pressable>
            </>
          )}

          {(role === 'recipient') && (
            <>
              <View style={styles.sectionLabel}>
                <Text style={styles.sectionLabelText}>Recipient Info</Text>
              </View>
              <InputField label="Hospital Name" value={hospital} onChangeText={setHospital} placeholder="Apollo Hospital" icon="business-outline" />
              <InputField label="Emergency Contact" value={emergencyContact} onChangeText={setEmergencyContact} placeholder="+91 9876543210" icon="call-outline" keyboardType="phone-pad" />
            </>
          )}

          {(role === 'doctor') && (
            <>
              <View style={styles.sectionLabel}>
                <Text style={styles.sectionLabelText}>Medical Details</Text>
              </View>
              <InputField label="Hospital Name *" value={hospital} onChangeText={setHospital} placeholder="Lilavati Hospital" icon="business-outline" />
              <InputField label="Medical License Number *" value={licenseNumber} onChangeText={setLicenseNumber} placeholder="MH-DOC-2024-001" icon="card-outline" autoCapitalize="characters" />
            </>
          )}

          <Pressable
            style={({ pressed }) => [styles.registerButton, (pressed || isLoading) && { opacity: 0.8 }]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            <LinearGradient colors={['#C62828', '#E53935']} style={styles.registerButtonGrad}>
              {isLoading ? <ActivityIndicator color="#fff" /> : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color="#fff" />
                  <Text style={styles.registerButtonText}>Create Account</Text>
                </>
              )}
            </LinearGradient>
          </Pressable>

          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <Pressable onPress={() => router.replace('/(auth)/login')}>
              <Text style={styles.loginLink}>Sign In</Text>
            </Pressable>
          </View>
        </View>
        <View style={{ height: insets.bottom + 32 }} />
      </ScrollView>
    </View>
  );
}

function InputField({ label, value, onChangeText, placeholder, icon, keyboardType, autoCapitalize }: any) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.inputWrapper}>
        <Ionicons name={icon} size={20} color="#9BA3AF" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#9BA3AF"
          keyboardType={keyboardType || 'default'}
          autoCapitalize={autoCapitalize || 'words'}
        />
      </View>
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
  form: { padding: 24 },
  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA',
    padding: 12, borderRadius: 10, marginBottom: 16,
  },
  errorText: { fontFamily: 'Inter_400Regular', fontSize: 14, color: '#EF4444', flex: 1 },
  sectionLabel: { marginBottom: 12, marginTop: 8 },
  sectionLabelText: { fontFamily: 'Inter_700Bold', fontSize: 15, color: '#C62828' },
  rolesRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  roleCard: {
    flex: 1, padding: 14, borderRadius: 14,
    backgroundColor: '#fff', borderWidth: 2, borderColor: '#FFC7C7',
    alignItems: 'center', gap: 6,
  },
  roleCardActive: { backgroundColor: '#C62828', borderColor: '#C62828' },
  roleLabel: { fontFamily: 'Inter_700Bold', fontSize: 13, color: '#C62828' },
  roleLabelActive: { color: '#fff' },
  roleDesc: { fontFamily: 'Inter_400Regular', fontSize: 10, color: '#9BA3AF', textAlign: 'center' },
  roleDescActive: { color: 'rgba(255,255,255,0.8)' },
  inputGroup: { marginBottom: 14 },
  inputLabel: { fontFamily: 'Inter_500Medium', fontSize: 14, color: '#1E1E1E', marginBottom: 8 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#E5E9EE',
    borderRadius: 12, paddingHorizontal: 14, minHeight: 52,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 15, color: '#1E1E1E', paddingVertical: 14 },
  eyeBtn: { padding: 4 },
  bloodGroupGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  bgBtn: {
    width: 68, height: 44, borderRadius: 10,
    backgroundColor: '#fff', borderWidth: 2, borderColor: '#E5E9EE',
    alignItems: 'center', justifyContent: 'center',
  },
  bgBtnActive: { backgroundColor: '#C62828', borderColor: '#C62828' },
  bgBtnText: { fontFamily: 'Inter_700Bold', fontSize: 14, color: '#5A6070' },
  bgBtnTextActive: { color: '#fff' },
  toggleRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#E5E9EE',
    borderRadius: 12, padding: 16, gap: 12, marginBottom: 16,
  },
  toggleLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#1E1E1E' },
  toggleDesc: { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#9BA3AF', marginTop: 2 },
  toggle: {
    width: 48, height: 28, borderRadius: 14,
    backgroundColor: '#E5E9EE', padding: 2,
  },
  toggleActive: { backgroundColor: '#22C55E' },
  toggleKnob: {
    width: 24, height: 24, borderRadius: 12, backgroundColor: '#fff',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2, elevation: 2,
  },
  toggleKnobActive: { transform: [{ translateX: 20 }] },
  registerButton: { marginTop: 16, borderRadius: 14, overflow: 'hidden' },
  registerButtonGrad: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, paddingVertical: 16, minHeight: 54,
  },
  registerButtonText: { fontFamily: 'Inter_700Bold', fontSize: 16, color: '#fff' },
  loginRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20 },
  loginText: { fontFamily: 'Inter_400Regular', fontSize: 14, color: '#5A6070' },
  loginLink: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#C62828' },
});
