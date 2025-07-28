import { Colors } from '@/constants/Colors';
import { MEDAL_COLORS } from '@/constants/leaderboard';
import { LeaderboardUser } from '@/types/leaderboard';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface LeaderboardItemProps {
  item: LeaderboardUser;
  isCurrentUser: boolean;
}

export default function LeaderboardItem({ item, isCurrentUser }: LeaderboardItemProps) {
  const isTopThree = item.rank <= 3;

  const getMedalStyle = (rank: number) => {
    switch (rank) {
      case 1: return styles.medal1;
      case 2: return styles.medal2;
      case 3: return styles.medal3;
      default: return {};
    }
  };

  return (
    <View style={[styles.container, isCurrentUser && styles.currentUserItem]}>
      <View style={styles.rankContainer}>
        {isTopThree ? (
          <View style={[styles.medal, getMedalStyle(item.rank)]}>
            <Text style={styles.medalText}>{item.rank}</Text>
          </View>
        ) : (
          <Text style={[styles.rankText, isCurrentUser && styles.currentUserText]}>
            #{item.rank}
          </Text>
        )}
      </View>
      
      <View style={styles.userInfo}>
        <Text style={[styles.name, isCurrentUser && styles.currentUserText]}>
          {item.name} {item.surname}
        </Text>
        <Text style={[styles.stats, isCurrentUser && styles.currentUserText]}>
          {item.tournamentsPlayed} tournaments
        </Text>
      </View>
      
      <View style={styles.pointsContainer}>
        <Text style={[styles.points, isCurrentUser && styles.currentUserText]}>
          {item.points.toLocaleString()}
        </Text>
        <Text style={[styles.pointsLabel, isCurrentUser && styles.currentUserText]}>
          pts
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: Colors.app.surface,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.app.border,
  },
  currentUserItem: {
    backgroundColor: Colors.app.primary + '20',
    borderColor: Colors.app.primary,
  },
  rankContainer: {
    width: 40,
    alignItems: 'center',
  },
  rankText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.app.textSecondary,
  },
  currentUserText: {
    color: Colors.app.primary,
    fontWeight: '600',
  },
  medal: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  medal1: {
    backgroundColor: MEDAL_COLORS[1],
  },
  medal2: {
    backgroundColor: MEDAL_COLORS[2],
  },
  medal3: {
    backgroundColor: MEDAL_COLORS[3],
  },
  medalText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.app.text,
    marginBottom: 2,
  },
  stats: {
    fontSize: 12,
    color: Colors.app.textSecondary,
  },
  pointsContainer: {
    alignItems: 'flex-end',
  },
  points: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.app.text,
  },
  pointsLabel: {
    fontSize: 12,
    color: Colors.app.textSecondary,
    marginTop: 2,
  },
}); 