import CustomDateTimePicker from '@/components/ui/DateTimePicker';
import DropdownSelect from '@/components/ui/DropdownSelect';
import FormInput from '@/components/ui/FormInput';
import ToggleSwitch from '@/components/ui/ToggleSwitch';
import { Colors } from '@/constants/Colors';
import { AGE_GROUPS, CreateTournamentModalProps, TournamentFormData } from '@/types/tournament';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapPickerModal from './MapPickerModal';

const CreateTournamentModal: React.FC<CreateTournamentModalProps> = ({ 
  visible, 
  onClose, 
  onSubmit,
  mode = 'create',
  initialData,
  tournamentId
}) => {
  const [tournamentForm, setTournamentForm] = useState<TournamentFormData>({
    title: '',
    description: '',
    locationName: '',
    latitude: undefined,
    longitude: undefined,
    maxPlayers: '',
    skillLevel: 'ALL_LEVELS',
    ageGroup: 'ALL_AGES',
    isPublic: true,
    startDateTime: new Date(),
    registrationDeadline: new Date(),
  });

  const [showMapPicker, setShowMapPicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    if (visible && mode === 'edit' && initialData) {
      setTournamentForm(initialData);
    }
  }, [visible, mode, initialData]);

  const resetForm = () => {
    setTournamentForm({
      title: '',
      description: '',
      locationName: '',
      latitude: undefined,
      longitude: undefined,
      maxPlayers: '',
      skillLevel: 'ALL_LEVELS',
      ageGroup: 'ALL_AGES',
      isPublic: true,
      startDateTime: new Date(),
      registrationDeadline: new Date(),
    });
    setErrors({});
  };

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  const handleBack = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    setErrors({});

    const newErrors: {[key: string]: string} = {};

    if (!tournamentForm.title.trim()) {
      newErrors.title = 'Tournament name is required';
    }

    if (!tournamentForm.locationName.trim()) {
      newErrors.locationName = 'Location name is required';
    }

    if (!tournamentForm.latitude || !tournamentForm.longitude) {
      newErrors.mapLocation = 'Please select a location on the map';
    }

    if (!tournamentForm.maxPlayers.trim()) {
      newErrors.maxPlayers = 'Max players is required';
    } else {
      const maxPlayersNum = parseInt(tournamentForm.maxPlayers, 10);
      if (isNaN(maxPlayersNum)) {
        newErrors.maxPlayers = 'Max players must be a number';
      } else if (maxPlayersNum < 4) {
        newErrors.maxPlayers = 'Max players must be at least 4';
      }
    }

    const now = new Date();
    if (tournamentForm.startDateTime <= now) {
      newErrors.startDateTime = 'Start date & time must be in the future';
    }
    if (tournamentForm.registrationDeadline <= now) {
      newErrors.registrationDeadline = 'Registration deadline must be in the future';
    }
    if (tournamentForm.startDateTime <= tournamentForm.registrationDeadline) {
      newErrors.startDateTime = 'Start date & time must be after registration deadline';
    }

    // If there are errors, display them and return
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const authToken = await AsyncStorage.getItem('authToken');
      
      const endpoint = mode === 'edit' 
        ? `${process.env.EXPO_PUBLIC_API_BASE_URL}/api/tournaments/update/${tournamentId}`
        : `${process.env.EXPO_PUBLIC_API_BASE_URL}/api/tournaments/create`;
      
      const method = mode === 'edit' ? 'PUT' : 'POST';
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          title: tournamentForm.title.trim(),
          description: tournamentForm.description.trim(),
          locationName: tournamentForm.locationName.trim(),
          latitude: tournamentForm.latitude,
          longitude: tournamentForm.longitude,
          startDate: tournamentForm.startDateTime.toISOString(),
          ageGroup: tournamentForm.ageGroup,
          maxPlayers: parseInt(tournamentForm.maxPlayers),
          isPublic: tournamentForm.isPublic,
          registrationDeadline: tournamentForm.registrationDeadline.toISOString()
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${mode} tournament`);
      }

      onSubmit(tournamentForm);
      resetForm();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Failed to ${mode} tournament`;
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
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={Colors.app.text} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>{mode === 'edit' ? 'Edit Tournament' : 'Create Tournament'}</Text>
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
            error={errors.title}
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

          <FormInput
            label="Location Name *"
            value={tournamentForm.locationName}
            onChangeText={(text) => setTournamentForm(prev => ({ ...prev, locationName: text }))}
            placeholder="Enter location name"
            error={errors.locationName}
          />

          <View style={styles.formGroup}>
            <Text style={styles.label}>Location *</Text>
              <TouchableOpacity
                style={[styles.locationButton, errors.mapLocation && styles.inputError]}
                onPress={() => setShowMapPicker(true)}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons name="map-marker" size={20} color="#00E6FF" />
                <Text style={styles.locationButtonText}>
                  {tournamentForm.latitude && tournamentForm.longitude
                    ? `Location (${tournamentForm.latitude.toFixed(4)}, ${tournamentForm.longitude.toFixed(4)})`
                    : 'Select location on map'}
                </Text>
                <MaterialCommunityIcons name="chevron-right" size={20} color="#888" />
              </TouchableOpacity>
              {errors.mapLocation && <Text style={styles.errorText}>{errors.mapLocation}</Text>}
            </View>

          <FormInput
            label="Max Players"
            value={tournamentForm.maxPlayers}
            onChangeText={(text) => setTournamentForm(prev => ({ ...prev, maxPlayers: text }))}
            placeholder="Enter max players (e.g., 16)"
            keyboardType="numeric"
            required
            error={errors.maxPlayers}
          />

          <DropdownSelect
            label="Age Group"
            value={tournamentForm.ageGroup}
            options={AGE_GROUPS as any}
            onValueChange={(value) => setTournamentForm(prev => ({ ...prev, ageGroup: value as any }))}
          />

          <ToggleSwitch
            label="Tournament Privacy"
            value={tournamentForm.isPublic}
            onValueChange={(value) => setTournamentForm(prev => ({ ...prev, isPublic: value }))}
            textOn="Public"
            textOff="Private"
          />

          <CustomDateTimePicker
            label="Start Date & Time"
            value={tournamentForm.startDateTime}
            onValueChange={(date) => setTournamentForm(prev => ({ ...prev, startDateTime: date }))}
            required
            error={errors.startDateTime}
          />

          <CustomDateTimePicker
            label="Registration Deadline"
            value={tournamentForm.registrationDeadline}
            onValueChange={(date) => setTournamentForm(prev => ({ ...prev, registrationDeadline: date }))}
            required
            error={errors.registrationDeadline}
          />
        </ScrollView>

        {/* Footer Buttons */}
        <View style={styles.modalFooter}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancel}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.createButton, isSubmitting && styles.createButtonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Text style={styles.createButtonText}>
              {isSubmitting ? (mode === 'edit' ? 'Updating...' : 'Creating...') : (mode === 'edit' ? 'Update Tournament' : 'Create Tournament')}
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
            longitude
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
    paddingTop: 60,
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
    paddingTop: 15,
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
    paddingBottom: 30,
    paddingTop: 15,
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
    color: Colors.app.textSecondary,
    fontSize: 14,
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
  inputError: {
    borderColor: Colors.app.error,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 12,
    marginTop: 4,
    marginBottom: 8,
  },
});

export default CreateTournamentModal; 