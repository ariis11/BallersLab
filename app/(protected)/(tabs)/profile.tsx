import { useAuth } from '@/hooks/useAuth';
import React from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const AVATAR_PLACEHOLDER = require('@/assets/images/blank-player.jpg');

export default function ProfileScreen() {
  const { user, loading: userLoading, logout } = useAuth();
  const insets = useSafeAreaInsets();

  if (userLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00E6FF" />
      </View>
    );
  }

  const profile = user?.profile || {};
  const fullName = profile.firstName && profile.lastName 
    ? `${profile.firstName} ${profile.lastName}` 
    : user?.email || 'User';

  const getAge = (dateOfBirth: string) => {
    const dob = new Date(dateOfBirth);
    const diff = Date.now() - dob.getTime();
    const age = new Date(diff).getUTCFullYear() - 1970;
    return age;
  };

  const statsData = [
    { label: 'Height:', value: profile.height ? `${profile.height}cm` : '-' },
    { label: 'Weight:', value: profile.weight ? `${profile.weight}kg` : '-' },
    { label: 'Age:', value: profile.dateOfBirth ? `${getAge(profile.dateOfBirth)} years` : '-' },
    { label: 'Country:', value: profile.country || '-' },
    { label: 'City:', value: profile.city || '-' },
    { label: 'Total tournaments played:', value: 0 },
    { label: 'Total points:', value: 0 },
    { label: 'Ranking:', value: 0 },
  ];

  return (
    <ScrollView style={[styles.container, { paddingTop: insets.top }]} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.screenTitle}>Profile</Text>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Image source={AVATAR_PLACEHOLDER} style={styles.avatar} />
        </View>
        <View style={styles.nameContainer}>
          <Text style={styles.name}>{fullName}</Text>
          <Text style={styles.city}>{profile.city || '-'}</Text>
        </View>
      </View>
      <View style={styles.statsBox}>
        {statsData.map((item, idx) => (
          <React.Fragment key={item.label}>
            <StatRow label={item.label} value={item.value} />
            {idx < statsData.length - 1 && <View style={styles.divider} />}
          </React.Fragment>
        ))}
      </View>
      <TouchableOpacity style={styles.logoutButton} onPress={logout} activeOpacity={0.8}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function StatRow({ label, value }: { label: string; value: string | number }) {
  return (
    <View style={styles.statRow}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A1121',
  },
  content: {
    alignItems: 'center',
    padding: 16,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A1121',
  },
  screenTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 22,
    textAlign: 'center',
    marginBottom: 18,
    letterSpacing: 0.5,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    width: '100%',
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#181C2E',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    overflow: 'hidden',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    resizeMode: 'cover',
  },
  nameContainer: {
    backgroundColor: '#181C2E',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: 'center',
    width: '100%',
    marginBottom: 4,
  },
  name: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 2,
  },
  city: {
    color: '#A0A4B8',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 0,
  },
  statsBox: {
    backgroundColor: '#181C2E',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    marginBottom: 24,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  statLabel: {
    color: '#A0A4B8',
    fontSize: 16,
  },
  statValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'normal',
  },
  divider: {
    height: 1,
    backgroundColor: '#23263A',
    marginLeft: 2,
    marginRight: 2,
    opacity: 0.7,
  },
  logoutButton: {
    marginTop: 10,
    backgroundColor: '#00E6FF',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: 'center',
    width: '100%',
  },
  logoutButtonText: {
    color: '#181F2A',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.5,
  },
}); 