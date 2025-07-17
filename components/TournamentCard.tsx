import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { formatTournamentDate } from '../utils/dateUtils';

interface TournamentCardProps {
  item: any;
  index: number;
  user: any;
  refreshTournaments: () => void;
}

const TournamentCard: React.FC<TournamentCardProps> = ({ item, index, user, refreshTournaments }) => {
  const [loading, setLoading] = useState(false);
  // Determine if the user is a participant
  const isParticipant = user && item.participants && item.participants.some((p: any) => p.userId === user.id);
  const canJoinOrLeave = item.status === 'REGISTRATION_OPEN';

  const handleJoinLeave = async () => {
    if (!user) return;
    setLoading(true);
    try {
              const endpoint = isParticipant
          ? `${process.env.EXPO_PUBLIC_API_BASE_URL}/api/tournaments/leave/${item.id}`
          : `${process.env.EXPO_PUBLIC_API_BASE_URL}/api/tournaments/join/${item.id}`;
      const token = await (await import('@react-native-async-storage/async-storage')).default.getItem('authToken');
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      await refreshTournaments();
    } catch (e) {}
    setLoading(false);
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardLeft}>
        <View style={styles.iconCircle}>
          <MaterialCommunityIcons name="basketball" size={32} color="#00E6FF" />
        </View>
        <View>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.players}>{item.currentPlayers}/{item.maxPlayers} Players</Text>
          <Text style={styles.date}>{formatTournamentDate(item.startDate)}</Text>
          <Text style={styles.date}>{formatTournamentDate(item.registrationDeadline)}</Text>
        </View>
      </View>
      {canJoinOrLeave ? (
        <TouchableOpacity
          style={isParticipant ? styles.unjoinButton : styles.joinButton}
          activeOpacity={0.8}
          onPress={handleJoinLeave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={isParticipant ? '#101426' : '#181C2E'} />
          ) : (
            <Text style={isParticipant ? styles.unjoinButtonText : styles.joinButtonText}>
              {isParticipant ? 'Leave' : 'Join'}
            </Text>
          )}
        </TouchableOpacity>
      ) : (
        <View style={[styles.closedButton, { opacity: 0.7 }]}> 
          <Text style={styles.closedButtonText}>Registration Closed</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#181C2E',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#101426',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    borderWidth: 2,
    borderColor: '#00E6FF',
  },
  title: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  players: {
    color: '#A0A4B8',
    fontSize: 14,
    marginBottom: 2,
  },
  date: {
    color: '#00E6FF',
    fontSize: 12,
    fontWeight: '500',
  },
  joinButton: {
    backgroundColor: '#00E6FF',
    borderRadius: 16,
    paddingHorizontal: 22,
    paddingVertical: 8,
  },
  joinButtonText: {
    color: '#101426',
    fontWeight: 'bold',
    fontSize: 15,
  },
  unjoinButton: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 22,
    paddingVertical: 8,
  },
  unjoinButtonText: {
    color: '#101426',
    fontWeight: 'bold',
    fontSize: 15,
  },
  closedButton: {
    backgroundColor: '#23263A',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closedButtonText: {
    color: '#A0A4B8',
    fontWeight: 'bold',
    fontSize: 15,
  },
});

export default TournamentCard; 