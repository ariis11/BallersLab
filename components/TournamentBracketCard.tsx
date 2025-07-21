import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { TournamentBracketCardProps } from '../types/bracket';

const TournamentBracketCard: React.FC<TournamentBracketCardProps> = ({ match, onScoreSubmit }) => {
  const { user } = useAuth();
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [score1, setScore1] = useState('');
  const [score2, setScore2] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isPlayer1Winner = match.winnerId === match.player1?.id;
  const isPlayer2Winner = match.winnerId === match.player2?.id;
  
  // Check if current user is a participant in this match
  const isCurrentUserMatch = user && (
    match.player1?.id === user.id || 
    match.player2?.id === user.id
  );

  // Check if user can submit score (match is pending or submitted, and user is participant)
  const canSubmitScore = isCurrentUserMatch && (
    match.status === 'PENDING' || 
    match.status === 'SUBMITTED'
  );

  const handleSubmitScore = async () => {
    if (!score1 || !score2) {
      Alert.alert('Error', 'Please enter both scores');
      return;
    }

    const score1Num = parseInt(score1);
    const score2Num = parseInt(score2);

    if (isNaN(score1Num) || isNaN(score2Num)) {
      Alert.alert('Error', 'Please enter valid numbers');
      return;
    }

    if (score1Num < 0 || score2Num < 0) {
      Alert.alert('Error', 'Scores cannot be negative');
      return;
    }

    if (score1Num === score2Num) {
      Alert.alert('Error', 'Scores cannot be equal in basketball');
      return;
    }

    setSubmitting(true);
    try {
      await onScoreSubmit(match.id, score1Num, score2Num);
      setShowScoreModal(false);
      setScore1('');
      setScore2('');
      Alert.alert('Success', 'Score submitted successfully!');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to submit score');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.matchLabel}>Match {match.matchNumber}</Text>
      <View style={styles.card}>
        <View style={[
          styles.playerRow,
          isPlayer1Winner && styles.winnerRow
        ]}>
          <Text style={[
            styles.playerName,
            isPlayer1Winner && styles.winnerText
          ]}>
            {match.player1?.name || 'TBD'}
          </Text>
          <Text style={[
            styles.score,
            isPlayer1Winner && styles.winnerText
          ]}>
            {match.confirmedScore1 || 0}
          </Text>
        </View>
        <View style={[
          styles.playerRow,
          isPlayer2Winner && styles.winnerRow
        ]}>
          <Text style={[
            styles.playerName,
            isPlayer2Winner && styles.winnerText
          ]}>
            {match.player2?.name || 'TBD'}
          </Text>
          <Text style={[
            styles.score,
            isPlayer2Winner && styles.winnerText
          ]}>
            {match.confirmedScore2 || 0}
          </Text>
        </View>
      </View>
      
      {/* Status and Action Section */}
      <View style={styles.statusContainer}>
        
        {/* Submit Score Button - only show if user can submit */}
        {canSubmitScore && (
          <TouchableOpacity 
            style={styles.submitScoreButton} 
            onPress={() => setShowScoreModal(true)}
          >
            <MaterialCommunityIcons name="pencil" size={16} color="#101426" />
            <Text style={styles.submitScoreText}>Submit Score</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Score Submission Modal */}
      <Modal
        visible={showScoreModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowScoreModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Submit Match Score</Text>
            
            <View style={styles.scoreInputContainer}>
              <Text style={styles.playerLabel}>{match.player1?.name}</Text>
              <TextInput
                style={styles.scoreInput}
                value={score1}
                onChangeText={setScore1}
                placeholder="Score"
                keyboardType="numeric"
                placeholderTextColor="#A0A4B8"
                editable={!submitting}
              />
            </View>

            <View style={styles.scoreInputContainer}>
              <Text style={styles.playerLabel}>{match.player2?.name}</Text>
              <TextInput
                style={styles.scoreInput}
                value={score2}
                onChangeText={setScore2}
                placeholder="Score"
                keyboardType="numeric"
                placeholderTextColor="#A0A4B8"
                editable={!submitting}
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowScoreModal(false)}
                disabled={submitting}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                onPress={handleSubmitScore}
                disabled={submitting}
              >
                <Text style={styles.submitButtonText}>
                  {submitting ? 'Submitting...' : 'Submit'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  matchLabel: {
    color: '#A0A4B8',
    fontSize: 12,
    marginBottom: 8,
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#181C2E',
    borderRadius: 12,
    padding: 12,
  },
  playerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  winnerRow: {
    backgroundColor: '#1A2332',
  },
  playerName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  score: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  winnerText: {
    color: '#00E6FF',
  },
  statusContainer: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  submitScoreButton: {
    backgroundColor: '#00E6FF',
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  submitScoreText: {
    color: '#101426',
    fontWeight: 'bold',
    fontSize: 12,
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#181C2E',
    borderRadius: 16,
    padding: 24,
    width: '80%',
    maxWidth: 300,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  scoreInputContainer: {
    marginBottom: 16,
  },
  playerLabel: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 8,
  },
  scoreInput: {
    backgroundColor: '#101426',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#2A3441',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#00E6FF',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginLeft: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#101426',
    fontWeight: 'bold',
  },
});

export default TournamentBracketCard; 