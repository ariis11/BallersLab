import React, { useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface JoinByCodeModalProps {
  visible: boolean;
  onClose: () => void;
  onJoinSuccess: () => void;
}

const JoinByCodeModal: React.FC<JoinByCodeModalProps> = ({ visible, onClose, onJoinSuccess }) => {
  const [joinCode, setJoinCode] = useState('');
  const [joiningTournament, setJoiningTournament] = useState(false);

  const handleJoinByCode = async () => {
    if (!joinCode.trim()) {
      Alert.alert('Error', 'Please enter a tournament code');
      return;
    }

    setJoiningTournament(true);
    try {
      const token = await (await import('@react-native-async-storage/async-storage')).default.getItem('authToken');
      
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL}/api/tournaments/join-by-code`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: joinCode.trim().toUpperCase() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to join tournament');
      }

      Alert.alert('Success', 'Successfully joined tournament!');
      handleClose();
      onJoinSuccess();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to join tournament');
    } finally {
      setJoiningTournament(false);
    }
  };

  const handleClose = () => {
    setJoinCode('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <Pressable style={styles.modalOverlay} onPress={handleClose}>
        <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.modalTitle}>Join Tournament</Text>
          <View style={styles.codeInputContainer}>
            <TextInput
              style={styles.codeInput}
              value={joinCode}
              onChangeText={(text) => setJoinCode(text.toUpperCase())}
              placeholder="Enter tournament code"
              placeholderTextColor="#A0A4B8"
              autoCapitalize="characters"
              editable={!joiningTournament}
              textAlign="center"
            />
          </View>
          <View style={styles.modalButtons}>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={handleClose}
              disabled={joiningTournament}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.submitButton, joiningTournament && styles.submitButtonDisabled]}
              onPress={handleJoinByCode}
              disabled={joiningTournament}
            >
              <Text style={styles.submitButtonText}>
                {joiningTournament ? 'Joining...' : 'Join'}
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
  codeInputContainer: {
    marginBottom: 16,
    marginTop: 16,
  },
  codeLabel: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 8,
  },
  codeInput: {
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

export default JoinByCodeModal; 