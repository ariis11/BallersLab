import { useAuth } from '@/hooks/useAuth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const AVATAR_PLACEHOLDER = require('@/assets/images/blank-player.jpg');

interface UserPointsData {
  totalTournamentsPlayed: number;
  totalPoints: number;
  ranking: number;
  ageGroup: string | null;
}

export default function ProfileScreen() {
  const { user, loading: userLoading, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const [userPointsData, setUserPointsData] = useState<UserPointsData>({
    totalTournamentsPlayed: 0,
    totalPoints: 0,
    ranking: 0,
    ageGroup: null
  });
  const [loadingPoints, setLoadingPoints] = useState(false);

  const fetchUserPoints = async () => {
    try {
      setLoadingPoints(true);
      const token = await AsyncStorage.getItem('authToken');
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_BASE_URL}/api/leaderboard/user-points`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch user points');
      }

      const data: UserPointsData = await response.json();
      setUserPointsData(data);
    } catch (error) {
      console.error('Error fetching user points:', error);
      // Keep default values (0) on error
    } finally {
      setLoadingPoints(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserPoints();
    }
  }, [user]);

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

  const formatDateOfBirth = (dateOfBirth: string) => {
    const dob = new Date(dateOfBirth);
    const year = dob.getFullYear();
    const month = String(dob.getMonth() + 1).padStart(2, '0');
    const day = String(dob.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatAgeGroup = (ageGroup: string | null) => {
    if (!ageGroup) return '-';
    switch (ageGroup) {
      case 'ALL_AGES': return 'All Ages';
      case 'U18': return 'Under 18';
      case 'U25': return '18-25';
      case 'U35': return '26-35';
      case 'U45': return '36-45';
      case 'U55': return '46-55';
      case 'OVER_55': return 'Over 55';
      default: return ageGroup;
    }
  };

  const statsData = [
    { label: 'Height:', value: profile.height ? `${profile.height}cm` : '-' },
    { label: 'Weight:', value: profile.weight ? `${profile.weight}kg` : '-' },
    { label: 'Birth Date:', value: profile.dateOfBirth ? formatDateOfBirth(profile.dateOfBirth) : '-' },
    { label: 'Age Group:', value: loadingPoints ? '...' : formatAgeGroup(userPointsData.ageGroup) },
    { label: 'Total tournaments played:', value: loadingPoints ? '...' : userPointsData.totalTournamentsPlayed },
    { label: 'Total points:', value: loadingPoints ? '...' : userPointsData.totalPoints },
    { label: 'Ranking:', value: loadingPoints ? '...' : userPointsData.ranking },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Fixed Header */}
      <View style={styles.header}>
        <Text style={styles.screenTitle}>Profile</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.headerProfile}>
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
      </View>
    </View>
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
  header: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 16,
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
  headerProfile: {
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
    marginTop: 5,
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