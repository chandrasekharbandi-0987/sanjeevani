import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import Colors from '@/constants/colors';

const { width } = Dimensions.get('window');

const STATS = [
  { value: '50,000+', label: 'Donors' },
  { value: '12,000+', label: 'Lives Saved' },
  { value: '800+', label: 'Hospitals' },
  { value: '98%', label: 'Success Rate' },
];

const STEPS = [
  { icon: 'account-plus', title: 'Register', desc: 'Sign up as a donor, recipient, or doctor in minutes.' },
  { icon: 'water', title: 'Request or Donate', desc: 'Post an emergency request or offer to donate blood.' },
  { icon: 'hospital-box', title: 'Connect', desc: 'Get matched with compatible donors near your location.' },
  { icon: 'heart-pulse', title: 'Save Lives', desc: 'Complete the donation and receive medical confirmation.' },
];

const FEATURES = [
  { icon: 'flash', label: 'Emergency Alerts', desc: 'Instant notifications to nearby donors' },
  { icon: 'map-marker', label: 'Smart Matching', desc: 'AI-powered blood group compatibility' },
  { icon: 'shield-check', label: 'Doctor Verified', desc: 'All donations medically approved' },
  { icon: 'chart-line', label: 'Donation Tracking', desc: 'Full history and impact stats' },
  { icon: 'chat', label: 'Live Chat', desc: 'Direct messaging with donors' },
  { icon: 'bell-ring', label: 'Notifications', desc: 'Real-time updates on requests' },
];

const TESTIMONIALS = [
  {
    name: 'Ananya Krishnan',
    role: 'Blood Recipient',
    text: 'Sanjeevani connected me with a B+ donor within 2 hours during my surgery. This platform literally saved my life.',
    bloodGroup: 'B+',
  },
  {
    name: 'Rajiv Menon',
    role: 'Regular Donor',
    text: "I've donated blood 8 times through Sanjeevani. Knowing I've saved lives is the most rewarding feeling.",
    bloodGroup: 'O-',
  },
  {
    name: 'Dr. Sunita Sharma',
    role: 'Cardiologist',
    text: 'The doctor verification system ensures every donation is safe and medically sound. Excellent platform.',
    bloodGroup: 'A+',
  },
];

export default function LandingScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const scrollRef = useRef<ScrollView>(null);

  function handleGetStarted() {
    if (user) {
      routeToRole();
    } else {
      router.push('/(auth)/register');
    }
  }

  function handleLogin() {
    if (user) {
      routeToRole();
    } else {
      router.push('/(auth)/login');
    }
  }

  function routeToRole() {
    if (!user) return;
    switch (user.role) {
      case 'donor': router.replace('/(donor)'); break;
      case 'recipient': router.replace('/(recipient)'); break;
      case 'doctor': router.replace('/(doctor)'); break;
      case 'admin': router.replace('/(admin)'); break;
    }
  }

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
      >
        {/* HERO */}
        <LinearGradient
          colors={['#6A0000', '#C62828', '#E53935']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.hero, { paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 0) + 20 }]}
        >
          <View style={styles.logoRow}>
            <View style={styles.logoCircle}>
              <MaterialCommunityIcons name="water" size={28} color="#fff" />
            </View>
            <Text style={styles.logoText}>Sanjeevani</Text>
            <Pressable style={styles.loginBtn} onPress={handleLogin}>
              <Text style={styles.loginBtnText}>{user ? 'Dashboard' : 'Login'}</Text>
            </Pressable>
          </View>

          <View style={styles.heroContent}>
            <View style={styles.heroBadge}>
              <View style={styles.heroBadgeDot} />
              <Text style={styles.heroBadgeText}>Emergency Support 24/7</Text>
            </View>

            <Text style={styles.heroTitle}>
              Donate Blood.{'\n'}Save Lives.
            </Text>
            <Text style={styles.heroSubtitle}>
              Connect with donors, hospitals and doctors in real-time. Every drop counts — be someone's reason to live.
            </Text>

            <View style={styles.heroCTA}>
              <Pressable style={styles.primaryCTA} onPress={handleGetStarted}>
                <MaterialCommunityIcons name="account-plus" size={20} color="#fff" />
                <Text style={styles.primaryCTAText}>{user ? 'Go to Dashboard' : 'Register as Donor'}</Text>
              </Pressable>
              <Pressable style={styles.secondaryCTA} onPress={() => router.push('/(auth)/login')}>
                <Ionicons name="search" size={20} color="#C62828" />
                <Text style={styles.secondaryCTAText}>Find Blood</Text>
              </Pressable>
            </View>

            <View style={styles.emergencyBadge}>
              <MaterialCommunityIcons name="alarm-light" size={16} color="#FF6B6B" />
              <Text style={styles.emergencyText}>Emergency? Request blood instantly</Text>
              <Ionicons name="arrow-forward" size={16} color="#FF6B6B" />
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            {STATS.map((stat, i) => (
              <View key={i} style={styles.statItem}>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        {/* ABOUT */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionAccent} />
            <Text style={styles.sectionTitle}>About Sanjeevani</Text>
          </View>
          <Text style={styles.aboutText}>
            Sanjeevani is a modern healthcare platform that bridges the gap between blood donors and those in need. Named after the mythical life-restoring herb, our platform leverages technology to reduce emergency response times and save precious lives.
          </Text>
          <View style={styles.aboutCards}>
            <View style={[styles.aboutCard, { backgroundColor: '#FFF0F0' }]}>
              <MaterialCommunityIcons name="water" size={32} color="#C62828" />
              <Text style={styles.aboutCardTitle}>Blood Donation</Text>
              <Text style={styles.aboutCardText}>Connect donors with recipients in real-time emergencies</Text>
            </View>
            <View style={[styles.aboutCard, { backgroundColor: '#F0FFF4' }]}>
              <MaterialCommunityIcons name="stethoscope" size={32} color="#22C55E" />
              <Text style={styles.aboutCardTitle}>Medical Oversight</Text>
              <Text style={styles.aboutCardText}>Every donation verified by licensed medical professionals</Text>
            </View>
          </View>
        </View>

        {/* HOW IT WORKS */}
        <LinearGradient colors={['#F7F9FB', '#FFF0F0']} style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionAccent} />
            <Text style={styles.sectionTitle}>How It Works</Text>
          </View>
          {STEPS.map((step, i) => (
            <View key={i} style={styles.stepRow}>
              <View style={styles.stepLeft}>
                <View style={styles.stepCircle}>
                  <Text style={styles.stepNumber}>{i + 1}</Text>
                </View>
                {i < STEPS.length - 1 && <View style={styles.stepLine} />}
              </View>
              <View style={styles.stepContent}>
                <View style={styles.stepIconBox}>
                  <MaterialCommunityIcons name={step.icon as any} size={22} color="#C62828" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  <Text style={styles.stepDesc}>{step.desc}</Text>
                </View>
              </View>
            </View>
          ))}
        </LinearGradient>

        {/* WHY DONATE */}
        <View style={[styles.section, { backgroundColor: '#C62828' }]}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionAccent, { backgroundColor: '#fff' }]} />
            <Text style={[styles.sectionTitle, { color: '#fff' }]}>Why Donate Blood?</Text>
          </View>
          <View style={styles.whyGrid}>
            {[
              { icon: 'heart-pulse', text: 'One donation saves up to 3 lives' },
              { icon: 'reload', text: 'Blood replenishes in 56 days' },
              { icon: 'hospital', text: 'Critical for surgeries & accidents' },
              { icon: 'emoticon-happy', text: 'Improves donor heart health' },
            ].map((item, i) => (
              <View key={i} style={styles.whyCard}>
                <MaterialCommunityIcons name={item.icon as any} size={28} color="#FF6B6B" />
                <Text style={styles.whyText}>{item.text}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* FEATURES */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionAccent} />
            <Text style={styles.sectionTitle}>Platform Features</Text>
          </View>
          <View style={styles.featuresGrid}>
            {FEATURES.map((f, i) => (
              <View key={i} style={styles.featureCard}>
                <View style={styles.featureIconBox}>
                  <MaterialCommunityIcons name={f.icon as any} size={24} color="#C62828" />
                </View>
                <Text style={styles.featureLabel}>{f.label}</Text>
                <Text style={styles.featureDesc}>{f.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* TESTIMONIALS */}
        <LinearGradient colors={['#F7F9FB', '#FFF0F0']} style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionAccent} />
            <Text style={styles.sectionTitle}>Stories That Inspire</Text>
          </View>
          {TESTIMONIALS.map((t, i) => (
            <View key={i} style={styles.testimonialCard}>
              <View style={styles.testimonialTop}>
                <View style={styles.testimonialAvatar}>
                  <Text style={styles.testimonialInitial}>{t.name[0]}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.testimonialName}>{t.name}</Text>
                  <Text style={styles.testimonialRole}>{t.role}</Text>
                </View>
                <View style={styles.bloodBadge}>
                  <Text style={styles.bloodBadgeText}>{t.bloodGroup}</Text>
                </View>
              </View>
              <Text style={styles.testimonialText}>"{t.text}"</Text>
            </View>
          ))}
        </LinearGradient>

        {/* CTA */}
        <LinearGradient
          colors={['#6A0000', '#C62828']}
          style={styles.ctaSection}
        >
          <MaterialCommunityIcons name="water" size={48} color="rgba(255,255,255,0.3)" />
          <Text style={styles.ctaTitle}>Be Someone's Hero Today</Text>
          <Text style={styles.ctaSubtitle}>Join 50,000+ donors who have saved lives. Your blood, their future.</Text>
          <Pressable style={styles.ctaButton} onPress={handleGetStarted}>
            <Text style={styles.ctaButtonText}>{user ? 'Go to Dashboard' : 'Start Donating'}</Text>
            <Ionicons name="arrow-forward" size={20} color="#C62828" />
          </Pressable>
        </LinearGradient>

        {/* FOOTER */}
        <View style={styles.footer}>
          <View style={styles.footerLogo}>
            <MaterialCommunityIcons name="water" size={20} color="#C62828" />
            <Text style={styles.footerLogoText}>Sanjeevani</Text>
          </View>
          <Text style={styles.footerTagline}>Donate Blood. Save Lives.</Text>
          <Text style={styles.footerCopy}>© 2025 Sanjeevani Healthcare Platform</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F9FB' },
  hero: { paddingBottom: 0 },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  logoCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  logoText: {
    color: '#fff',
    fontSize: 22,
    fontFamily: 'Inter_700Bold',
    flex: 1,
  },
  loginBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  loginBtnText: { color: '#fff', fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  heroContent: { paddingHorizontal: 20, paddingBottom: 24 },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 20,
  },
  heroBadgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22C55E',
  },
  heroBadgeText: { color: '#fff', fontFamily: 'Inter_500Medium', fontSize: 12 },
  heroTitle: {
    fontSize: 42,
    fontFamily: 'Inter_700Bold',
    color: '#fff',
    lineHeight: 50,
    marginBottom: 16,
  },
  heroSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 24,
    marginBottom: 28,
  },
  heroCTA: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  primaryCTA: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    paddingVertical: 14,
    borderRadius: 12,
  },
  primaryCTAText: { color: '#fff', fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  secondaryCTA: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fff',
    paddingVertical: 14,
    borderRadius: 12,
  },
  secondaryCTAText: { color: '#C62828', fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  emergencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  emergencyText: { color: '#FF6B6B', fontFamily: 'Inter_500Medium', fontSize: 13, flex: 1 },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.25)',
    marginTop: 24,
  },
  statItem: {
    flex: 1,
    paddingVertical: 20,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.15)',
  },
  statValue: { fontSize: 22, fontFamily: 'Inter_700Bold', color: '#fff' },
  statLabel: { fontSize: 11, fontFamily: 'Inter_400Regular', color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  section: { padding: 24 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  sectionAccent: { width: 4, height: 24, backgroundColor: '#C62828', borderRadius: 2 },
  sectionTitle: { fontSize: 22, fontFamily: 'Inter_700Bold', color: '#1E1E1E' },
  aboutText: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: '#5A6070',
    lineHeight: 24,
    marginBottom: 20,
  },
  aboutCards: { flexDirection: 'row', gap: 12 },
  aboutCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    gap: 10,
  },
  aboutCardTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#1E1E1E', textAlign: 'center' },
  aboutCardText: { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#5A6070', textAlign: 'center', lineHeight: 18 },
  stepRow: { flexDirection: 'row', marginBottom: 0, minHeight: 72 },
  stepLeft: { alignItems: 'center', width: 44 },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#C62828',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  stepNumber: { color: '#fff', fontFamily: 'Inter_700Bold', fontSize: 14 },
  stepLine: { width: 2, flex: 1, backgroundColor: '#FFC7C7', marginTop: 4, marginBottom: 4, minHeight: 24 },
  stepContent: { flex: 1, flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingBottom: 24 },
  stepIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFF0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 15, color: '#1E1E1E', marginBottom: 4 },
  stepDesc: { fontFamily: 'Inter_400Regular', fontSize: 13, color: '#5A6070', lineHeight: 18 },
  whyGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  whyCard: {
    width: (width - 60) / 2,
    backgroundColor: 'rgba(255,255,255,0.12)',
    padding: 16,
    borderRadius: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  whyText: { fontFamily: 'Inter_500Medium', fontSize: 13, color: '#fff', lineHeight: 18 },
  featuresGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  featureCard: {
    width: (width - 60) / 2,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  featureIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFF0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#1E1E1E' },
  featureDesc: { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#5A6070', lineHeight: 17 },
  testimonialCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  testimonialTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 10 },
  testimonialAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#C62828',
    alignItems: 'center',
    justifyContent: 'center',
  },
  testimonialInitial: { color: '#fff', fontFamily: 'Inter_700Bold', fontSize: 18 },
  testimonialName: { fontFamily: 'Inter_600SemiBold', fontSize: 15, color: '#1E1E1E' },
  testimonialRole: { fontFamily: 'Inter_400Regular', fontSize: 13, color: '#5A6070' },
  bloodBadge: {
    backgroundColor: '#FFF0F0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFC7C7',
  },
  bloodBadgeText: { fontFamily: 'Inter_700Bold', fontSize: 13, color: '#C62828' },
  testimonialText: { fontFamily: 'Inter_400Regular', fontSize: 14, color: '#5A6070', lineHeight: 21, fontStyle: 'italic' },
  ctaSection: { padding: 32, alignItems: 'center', gap: 16 },
  ctaTitle: { fontFamily: 'Inter_700Bold', fontSize: 26, color: '#fff', textAlign: 'center' },
  ctaSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 15, color: 'rgba(255,255,255,0.85)', textAlign: 'center', lineHeight: 22 },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 50,
    marginTop: 8,
  },
  ctaButtonText: { fontFamily: 'Inter_700Bold', fontSize: 16, color: '#C62828' },
  footer: {
    backgroundColor: '#1E1E1E',
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  footerLogo: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  footerLogoText: { fontFamily: 'Inter_700Bold', fontSize: 18, color: '#fff' },
  footerTagline: { fontFamily: 'Inter_400Regular', fontSize: 14, color: '#9BA3AF', fontStyle: 'italic' },
  footerCopy: { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#5A6070' },
});
