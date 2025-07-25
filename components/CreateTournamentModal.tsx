import CustomDateTimePicker from '@/components/ui/DateTimePicker';
import DropdownSelect from '@/components/ui/DropdownSelect';
import FormInput from '@/components/ui/FormInput';
import ToggleSwitch from '@/components/ui/ToggleSwitch';
import { Colors } from '@/constants/Colors';
import { CreateTournamentModalProps, SKILL_LEVELS, TournamentFormData } from '@/types/tournament';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapPickerModal from './MapPickerModal';

const CreateTournamentModal: React.FC<CreateTournamentModalProps> = ({ 
  visible, 
  onClose, 
  onSubmit 
}) => {
  const [tournamentForm, setTournamentForm] = useState<TournamentFormData>({
    title: '',
    description: '',
    locationName: '',
    latitude: undefined,
    longitude: undefined,
    maxPlayers: '',
    skillLevel: 'ALL_LEVELS',
    isPublic: true,
    startDateTime: new Date(),
    registrationDeadline: new Date(),
  });

  const [showMapPicker, setShowMapPicker] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (isSubmitting) return;

    // Validate required fields
    if (!tournamentForm.title.trim()) {
      Alert.alert('Error', 'Tournament name is required');
      return;
    }

    if (!tournamentForm.locationName.trim()) {
      Alert.alert('Error', 'Location is required');
      return;
    }

    if (!tournamentForm.maxPlayers.trim()) {
      Alert.alert('Error', 'Max players is required');
      return;
    }

    if (!tournamentForm.latitude || !tournamentForm.longitude) {
      Alert.alert('Error', 'Please select a location on the map');
      return;
    }

    setIsSubmitting(true);

    try {
      const authToken = await AsyncStorage.getItem('authToken');
      
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL}/api/tournaments/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          title: tournamentForm.title.trim(),
          description: tournamentForm.description.trim(),
          locationName: tournamentForm.locationName,
          latitude: tournamentForm.latitude,
          longitude: tournamentForm.longitude,
          startDate: tournamentForm.startDateTime.toISOString(),
          skillLevel: tournamentForm.skillLevel,
          maxPlayers: parseInt(tournamentForm.maxPlayers),
          isPublic: tournamentForm.isPublic,
          registrationDeadline: tournamentForm.registrationDeadline.toISOString()
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create tournament');
      }

      const result = await response.json();
      
      Alert.alert(
        'Success', 
        'Tournament created successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              onSubmit(tournamentForm);
              // Reset form
              setTournamentForm({
                title: '',
                description: '',
                locationName: '',
                latitude: undefined,
                longitude: undefined,
                maxPlayers: '',
                skillLevel: 'ALL_LEVELS',
                isPublic: true,
                startDateTime: new Date(),
                registrationDeadline: new Date()
              });
            }
          }
        ]
      );

    } catch (error) {
      console.error('Create tournament error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create tournament';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        {/* Header */}
        <View style={styles.modalHeader}>
          <TouchableOpacity 
            onPress={onClose}
            style={styles.backButton}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Create Tournament</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Form Content */}
        <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
          <FormInput
            label="Tournament Name"
            value={tournamentForm.title}
            onChangeText={(text) => setTournamentForm(prev => ({ ...prev, title: text }))}
            placeholder="Enter tournament name"
            required
          />

          <FormInput
            label="Description"
            value={tournamentForm.description}
            onChangeText={(text) => setTournamentForm(prev => ({ ...prev, description: text }))}
            placeholder="Enter tournament description"
            multiline
            numberOfLines={3}
            style={styles.textArea}
          />

          <View style={styles.formGroup}>
            <Text style={styles.label}>Location *</Text>
            <TouchableOpacity
              style={styles.locationButton}
              onPress={() => setShowMapPicker(true)}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="map-marker" size={20} color="#00E6FF" />
              <Text style={styles.locationButtonText}>
                {tournamentForm.locationName || 'Select location on map'}
              </Text>
              <MaterialCommunityIcons name="chevron-right" size={20} color="#888" />
            </TouchableOpacity>
          </View>

          <FormInput
            label="Max Players"
            value={tournamentForm.maxPlayers}
            onChangeText={(text) => setTournamentForm(prev => ({ ...prev, maxPlayers: text }))}
            placeholder="Enter max players (e.g., 16)"
            keyboardType="numeric"
            required
          />

          <DropdownSelect
            label="Skill Level"
            value={tournamentForm.skillLevel}
            options={SKILL_LEVELS as any}
            onValueChange={(value) => setTournamentForm(prev => ({ ...prev, skillLevel: value as any }))}
          />

          <ToggleSwitch
            label={tournamentForm.isPublic ? 'Public Tournament' : 'Private Tournament'}
            value={tournamentForm.isPublic}
            onValueChange={(value) => setTournamentForm(prev => ({ ...prev, isPublic: value }))}
          />

          <CustomDateTimePicker
            label="Start Date & Time"
            value={tournamentForm.startDateTime}
            onValueChange={(date) => setTournamentForm(prev => ({ ...prev, startDateTime: date }))}
            required
          />

          <CustomDateTimePicker
            label="Registration Deadline"
            value={tournamentForm.registrationDeadline}
            onValueChange={(date) => setTournamentForm(prev => ({ ...prev, registrationDeadline: date }))}
            required
          />
        </ScrollView>

        {/* Footer Buttons */}
        <View style={styles.modalFooter}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onClose}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.createButton, isSubmitting && styles.createButtonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Text style={styles.createButtonText}>
              {isSubmitting ? 'Creating...' : 'Create Tournament'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Map Picker Modal */}
      <MapPickerModal
        visible={showMapPicker}
        onClose={() => setShowMapPicker(false)}
        onLocationSelect={(latitude, longitude) => {
          setTournamentForm(prev => ({
            ...prev,
            latitude,
            longitude,
            locationName: `Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`
          }));
          setShowMapPicker(false);
        }}
        value={tournamentForm.latitude && tournamentForm.longitude ? {
          latitude: tournamentForm.latitude,
          longitude: tournamentForm.longitude
        } : undefined}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.app.background,
    paddingTop: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.app.border,
  },
  backButton: {
    padding: 8,
  },
  modalTitle: {
    color: Colors.app.text,
    fontSize: 20,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 40,
  },
  formContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  textArea: {
    minHeight: 80,
    paddingTop: 14,
    textAlignVertical: 'top',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.app.border,
  },
  cancelButton: {
    backgroundColor: Colors.app.surface,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  cancelButtonText: {
    color: Colors.app.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  createButton: {
    backgroundColor: Colors.app.primary,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  createButtonDisabled: {
    opacity: 0.6,
  },
  createButtonText: {
    color: Colors.app.primaryDark,
    fontSize: 16,
    fontWeight: 'bold',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    color: Colors.app.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.app.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.app.border,
  },
  locationButtonText: {
    flex: 1,
    color: Colors.app.text,
    fontSize: 16,
    marginLeft: 12,
  },
});

export default CreateTournamentModal; 