import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { TournamentBracketProps } from '../types/bracket';
import TournamentBracketCard from './TournamentBracketCard';

const TournamentBracket: React.FC<TournamentBracketProps> = ({ bracketData, onScoreSubmit, selectedRound, onRoundChange }) => {
  // Validate selected round when bracket data changes
  React.useEffect(() => {
    if (bracketData && bracketData.rounds.length > 0) {
      // Check if current selected round exists in the new data
      const roundExists = bracketData.rounds.some(round => round.roundNumber === selectedRound);
      if (!roundExists) {
        onRoundChange(1);
      }
    }
  }, [bracketData, selectedRound, onRoundChange]);

  if (!bracketData) {
    return (
      <View style={styles.container}>
        <Text style={styles.noDataText}>No bracket data available</Text>
      </View>
    );
  }

  const { rounds } = bracketData;

  const renderRoundContent = () => {
    const currentRound = rounds.find(round => round.roundNumber === selectedRound);
    if (!currentRound) return null;

    return currentRound.matches.map((match) => (
      <TournamentBracketCard
        key={match.id}
        match={match}
        onScoreSubmit={onScoreSubmit}
        tournamentStatus={bracketData.tournamentStatus}
      />
    ));
  };

  return (
    <View style={styles.container}>
      {/* Round Navigation Tabs */}
      <View style={styles.roundTabsContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.roundTabsContent}
        >
          {rounds.map((round) => (
            <TouchableOpacity
              key={round.roundNumber}
              style={[
                styles.roundTab,
                selectedRound === round.roundNumber && styles.roundTabActive
              ]}
              onPress={() => onRoundChange(round.roundNumber)}
            >
              <Text style={[
                styles.roundTabText,
                selectedRound === round.roundNumber && styles.roundTabTextActive
              ]}>
                {round.roundName}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Bracket Content */}
      <View style={styles.bracketContent}>
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.bracketContentContainer}
        >
          {renderRoundContent()}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  noDataText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 32,
  },
  roundTabsContainer: {
    backgroundColor: '#181C2E',
    borderBottomWidth: 1,
    borderBottomColor: '#2A3441',
  },
  roundTabsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  roundTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 16,
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
  roundTabActive: {
    backgroundColor: '#00E6FF',
  },
  roundTabText: {
    color: '#A0A4B8',
    fontSize: 13,
    fontWeight: '500',
  },
  roundTabTextActive: {
    color: '#101426',
    fontWeight: 'bold',
  },
  bracketContent: {
    flex: 1,
  },
  bracketContentContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 32,
  },
});

export default TournamentBracket; 