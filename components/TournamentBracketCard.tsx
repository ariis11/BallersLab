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
  const [errorMessage, setErrorMessage] = useState<string | string[] | null>(null);

  const isPlayer1 = user && match.player1?.id === user.id;
  const isPlayer2 = user && match.player2?.id === user.id;
  const isParticipant = isPlayer1 || isPlayer2;

  const isPlayer1Winner = match.winnerId === match.player1?.id;
  const isPlayer2Winner = match.winnerId === match.player2?.id;

  // Determine if match is running (both players assigned, not finished, not disputed)
  const isRunning = match.player1 && match.player2 && !match.winnerId && match.status !== 'DISPUTED';
  // Determine if match is disputed
  const isDisputed = match.status === 'DISPUTED';
  // Determine if match is finished
  const isFinished = !!match.winnerId && match.status === 'CONFIRMED';

  // Submission status for each player
  const player1HasSubmitted = !!match.player1Submission;
  const player2HasSubmitted = !!match.player2Submission;

  // For running matches: show submit button only for participant who hasn't submitted
  const canSubmitScore = isRunning && (
    (isPlayer1 && !player1HasSubmitted) || (isPlayer2 && !player2HasSubmitted)
  );

  // For disputed matches: both participants can resubmit
  const canResubmit = isDisputed && isParticipant;

  const handleSubmitScore = async () => {
    setErrorMessage(null);
    if (!score1 || !score2) {
      setErrorMessage('Please enter both scores');
      return;
    }
    const score1Num = parseInt(score1);
    const score2Num = parseInt(score2);
    if (isNaN(score1Num) || isNaN(score2Num)) {
      setErrorMessage('Please enter valid numbers');
      return;
    }
    if (score1Num < 0 || score2Num < 0) {
      setErrorMessage('Scores cannot be negative');
      return;
    }
    if (score1Num === score2Num) {
      setErrorMessage('Scores cannot be equal');
      return;
    }
    setSubmitting(true);
    try {
      await onScoreSubmit(match.id, score1Num, score2Num);
      setShowScoreModal(false);
      setScore1('');
      setScore2('');
      setErrorMessage(null);
      Alert.alert('Success', 'Score submitted successfully!');
    } catch (error) {
      setErrorMessage('Failed to submit score');
    } finally {
      setSubmitting(false);
    }
  };

  // Card border color for disputed
  const cardBorderColor = isDisputed ? '#FF6B6B' : 'transparent';
  const cardBackgroundColor = isDisputed ? '#2A0A0A' : '#181C2E';

  return (
    <View style={styles.container}>
      <Text style={styles.matchLabel}>Match {match.matchNumber}</Text>
      <View style={[styles.card, { borderColor: cardBorderColor, backgroundColor: cardBackgroundColor }]}> 
        {/* Player 1 Row */}
        <View style={[
          styles.playerRow,
          isPlayer1Winner && styles.winnerRow
        ]}>
          <View style={styles.playerInfoRow}>
            <Text style={[styles.playerName, isPlayer1Winner && styles.winnerText]}>
              {match.player1?.name || 'TBD'}
            </Text>
            {/* Submission icon for running matches */}
            {isRunning && match.player1 && (
              player1HasSubmitted ? (
                <MaterialCommunityIcons name="check-circle" size={16} color="#00E6FF" style={styles.icon} />
              ) : (
                <MaterialCommunityIcons name="clock-outline" size={16} color="#A0A4B8" style={styles.icon} />
              )
            )}
          </View>
          <Text style={[styles.score, isPlayer1Winner && styles.winnerText]}>
            {isFinished ? (match.confirmedScore1 ?? 0) : ''}
          </Text>
        </View>
        {/* Player 2 Row */}
        <View style={[
          styles.playerRow,
          isPlayer2Winner && styles.winnerRow
        ]}>
          <View style={styles.playerInfoRow}>
            <Text style={[styles.playerName, isPlayer2Winner && styles.winnerText]}>
              {match.player2?.name || 'TBD'}
            </Text>
            {isRunning && match.player2 && (
              player2HasSubmitted ? (
                <MaterialCommunityIcons name="check-circle" size={16} color="#00E6FF" style={styles.icon} />
              ) : (
                <MaterialCommunityIcons name="clock-outline" size={16} color="#A0A4B8" style={styles.icon} />
              )
            )}
          </View>
          <Text style={[styles.score, isPlayer2Winner && styles.winnerText]}>
            {isFinished ? (match.confirmedScore2 ?? 0) : ''}
          </Text>
        </View>
        {/* Dispute message */}
        {isDisputed && (
          <View style={styles.disputeRow}>
            <MaterialCommunityIcons name="alert-circle" size={18} color="#FF6B6B" style={{ marginRight: 6 }} />
            <Text style={styles.disputeText}>Score dispute! Please resubmit.</Text>
          </View>
        )}
      </View>
      {/* Submit/Resubmit Button */}
      {(canSubmitScore || canResubmit) && (
        <TouchableOpacity
          style={isDisputed ? styles.resubmitButton : styles.submitScoreButton}
          onPress={() => setShowScoreModal(true)}
        >
          <MaterialCommunityIcons name={isDisputed ? 'refresh' : 'pencil'} size={16} color="#101426" />
          <Text style={isDisputed ? styles.resubmitButtonText : styles.submitScoreText}>
            {isDisputed ? 'Resubmit your score' : 'Submit Score'}
          </Text>
        </TouchableOpacity>
      )}
      {/* Score Submission Modal */}
      <Modal
        visible={showScoreModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowScoreModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{isDisputed ? 'Resubmit Score' : 'Submit Match Score'}</Text>
            {/* Error message display */}
            {errorMessage && (
              <View style={styles.errorBox}>
                {Array.isArray(errorMessage) ? (
                  errorMessage.map((msg, idx) => (
                    <Text key={idx} style={styles.errorText}>⚠️ {msg}</Text>
                  ))
                ) : (
                  <Text style={styles.errorText}>⚠️ {errorMessage}</Text>
                )}
              </View>
            )}
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
                  {submitting ? 'Submitting...' : (isDisputed ? 'Resubmit' : 'Submit')}
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
    borderWidth: 2,
  },
  playerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  playerInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
    minWidth: 24,
    textAlign: 'center',
  },
  winnerText: {
    color: '#00E6FF',
  },
  icon: {
    marginLeft: 6,
  },
  disputeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 2,
  },
  disputeText: {
    color: '#FF6B6B',
    fontWeight: 'bold',
    fontSize: 13,
  },
  submitScoreButton: {
    backgroundColor: '#00E6FF',
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  submitScoreText: {
    color: '#101426',
    fontWeight: 'bold',
    fontSize: 12,
    marginLeft: 4,
  },
  resubmitButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  resubmitButtonText: {
    color: '#fff',
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
  errorBox: {
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
    padding: 8,
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  errorText: {
    color: '#D32F2F',
    fontWeight: 'bold',
    fontSize: 13,
    marginBottom: 2,
  },
});

export default TournamentBracketCard; 