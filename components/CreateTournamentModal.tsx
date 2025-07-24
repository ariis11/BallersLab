import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import { Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface CreateTournamentModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (tournamentData: any) => void;
}

const CreateTournamentModal: React.FC<CreateTournamentModalProps> = ({ 
  visible, 
  onClose, 
  onSubmit 
}) => {
  type SkillLevel = 'ALL_LEVELS' | 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'PROFESSIONAL';
  const [tournamentForm, setTournamentForm] = useState<{
    title: string;
    description: string;
    locationName: string;
    maxPlayers: string;
    skillLevel: SkillLevel;
    isPublic: boolean;
    startDateTime: Date;
    registrationDeadline: Date;
  }>({
    title: '',
    description: '',
    locationName: '',
    maxPlayers: '',
    skillLevel: 'ALL_LEVELS',
    isPublic: true,
    startDateTime: new Date(),
    registrationDeadline: new Date(),
  });

  // Date picker state
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showDeadlinePicker, setShowDeadlinePicker] = useState(false);

  // Add temp state at the top
  const [tempStartDateTime, setTempStartDateTime] = useState<Date | null>(null);
  const [tempRegistrationDeadline, setTempRegistrationDeadline] = useState<Date | null>(null);

  const showDateTimePicker = (field: 'startDateTime' | 'registrationDeadline') => {
    if (field === 'startDateTime') {
      setTempStartDateTime(tournamentForm.startDateTime);
      setShowStartDatePicker(true);
    } else {
      setTempRegistrationDeadline(tournamentForm.registrationDeadline);
      setShowDeadlinePicker(true);
    }
  };

  const onStartDateChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      setTempStartDateTime(selectedDate);
    }
  };

  const onDeadlineChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      setTempRegistrationDeadline(selectedDate);
    }
  };

  const handleDoneStartDate = () => {
    if (tempStartDateTime) {
      setTournamentForm(prev => ({ ...prev, startDateTime: tempStartDateTime }));
    }
    setShowStartDatePicker(false);
  };

  const handleDoneDeadline = () => {
    if (tempRegistrationDeadline) {
      setTournamentForm(prev => ({ ...prev, registrationDeadline: tempRegistrationDeadline }));
    }
    setShowDeadlinePicker(false);
  };

  const formatDateTime = (date: Date) => {
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const handleSubmit = () => {
    onSubmit(tournamentForm);
    // Reset form
    setTournamentForm({
      title: '',
      description: '',
      locationName: '',
      maxPlayers: '',
      skillLevel: 'ALL_LEVELS',
      isPublic: true,
      startDateTime: new Date(),
      registrationDeadline: new Date()
    });
  };

  // Add at the top
  const [showSkillDropdown, setShowSkillDropdown] = useState(false);
  const skillLevels = [
    { value: 'ALL_LEVELS', label: 'All Levels' },
    { value: 'BEGINNER', label: 'Beginner' },
    { value: 'INTERMEDIATE', label: 'Intermediate' },
    { value: 'ADVANCED', label: 'Advanced' },
    { value: 'PROFESSIONAL', label: 'Professional' },
  ];

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
          <View style={styles.formGroup}>
            <Text style={styles.label}>Tournament Name *</Text>
            <TextInput
              style={styles.input}
              value={tournamentForm.title}
              onChangeText={(text) => setTournamentForm(prev => ({ ...prev, title: text }))}
              placeholder="Enter tournament name"
              placeholderTextColor="#A0A4B8"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={tournamentForm.description}
              onChangeText={(text) => setTournamentForm(prev => ({ ...prev, description: text }))}
              placeholder="Enter tournament description"
              placeholderTextColor="#A0A4B8"
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Location *</Text>
            <TextInput
              style={styles.input}
              value={tournamentForm.locationName}
              onChangeText={(text) => setTournamentForm(prev => ({ ...prev, locationName: text }))}
              placeholder="Enter location name"
              placeholderTextColor="#A0A4B8"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Max Players *</Text>
            <TextInput
              style={styles.input}
              value={tournamentForm.maxPlayers}
              onChangeText={(text) => setTournamentForm(prev => ({ ...prev, maxPlayers: text }))}
              placeholder="Enter max players (e.g., 16)"
              placeholderTextColor="#A0A4B8"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Skill Level</Text>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setShowSkillDropdown((prev) => !prev)}
              activeOpacity={0.8}
            >
              <Text style={styles.dropdownText}>
                {skillLevels.find(l => l.value === tournamentForm.skillLevel)?.label}
              </Text>
              <MaterialCommunityIcons name={showSkillDropdown ? 'chevron-up' : 'chevron-down'} size={20} color="#00E6FF" />
            </TouchableOpacity>
            {showSkillDropdown && (
              <View style={styles.dropdownList}>
                {skillLevels.map((level) => (
                  <TouchableOpacity
                    key={level.value}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setTournamentForm(prev => ({ ...prev, skillLevel: level.value as SkillLevel }));
                      setShowSkillDropdown(false);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>{level.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <View style={styles.formGroup}>
            <TouchableOpacity
              style={styles.publicToggle}
              onPress={() => setTournamentForm(prev => ({ ...prev, isPublic: !prev.isPublic }))}
            >
              <MaterialCommunityIcons 
                name={tournamentForm.isPublic ? "eye" : "eye-off"} 
                size={20} 
                color={tournamentForm.isPublic ? "#00E6FF" : "#A0A4B8"} 
              />
              <Text style={styles.publicToggleText}>
                {tournamentForm.isPublic ? 'Public Tournament' : 'Private Tournament'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Start Date & Time *</Text>
            <TouchableOpacity
              style={styles.dateTimePicker}
              onPress={() => showDateTimePicker('startDateTime')}
            >
              <Text style={styles.dateTimeText}>
                {formatDateTime(tournamentForm.startDateTime)}
              </Text>
              <MaterialCommunityIcons name="calendar-clock" size={20} color="#00E6FF" />
            </TouchableOpacity>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Registration Deadline *</Text>
            <TouchableOpacity
              style={styles.dateTimePicker}
              onPress={() => showDateTimePicker('registrationDeadline')}
            >
              <Text style={styles.dateTimeText}>
                {formatDateTime(tournamentForm.registrationDeadline)}
              </Text>
              <MaterialCommunityIcons name="calendar-clock" size={20} color="#00E6FF" />
            </TouchableOpacity>
          </View>
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
            style={styles.createButton}
            onPress={handleSubmit}
          >
            <Text style={styles.createButtonText}>Create Tournament</Text>
          </TouchableOpacity>
        </View>

        {/* Date/Time Pickers - Centered modal style */}
        {showStartDatePicker && (
          <View style={styles.centeredPickerWrapper}>
            <View style={styles.centeredPickerContainer}>
              <View style={styles.pickerHeader}>
                <Text style={styles.pickerTitle}>Select Date & Time</Text>
                <View style={{ flex: 1 }} />
                <TouchableOpacity onPress={handleDoneStartDate}>
                  <Text style={styles.pickerDoneText}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={tempStartDateTime || tournamentForm.startDateTime}
                mode="datetime"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onStartDateChange}
                style={styles.picker}
              />
            </View>
          </View>
        )}
        {showDeadlinePicker && (
          <View style={styles.centeredPickerWrapper}>
            <View style={styles.centeredPickerContainer}>
              <View style={styles.pickerHeader}>
                <Text style={styles.pickerTitle}>Select Date & Time</Text>
                <View style={{ flex: 1 }} />
                <TouchableOpacity onPress={handleDoneDeadline}>
                  <Text style={styles.pickerDoneText}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={tempRegistrationDeadline || tournamentForm.registrationDeadline}
                mode="datetime"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onDeadlineChange}
                style={styles.picker}
              />
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#0A1121',
    paddingTop: 40, // Adjust for header height
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#181F33',
  },
  backButton: {
    padding: 8,
  },
  modalTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 40, // Placeholder for the "Create" button
  },
  formContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20, // Add some padding at the bottom for footer
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    color: '#A0A4B8',
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#181F33',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#2A3047',
  },
  textArea: {
    minHeight: 80,
    paddingTop: 14,
    textAlignVertical: 'top',
  },
  skillLevelContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  skillLevelButton: {
    backgroundColor: '#181F33',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginHorizontal: 5,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: '#2A3047',
  },
  skillLevelButtonActive: {
    backgroundColor: '#00E6FF',
    borderColor: '#00E6FF',
  },
  skillLevelText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  skillLevelTextActive: {
    color: '#101426',
  },
  publicToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#181F33',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 10,
  },
  publicToggleText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 10,
  },
  dateTimePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#181F33',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginTop: 8,
  },
  dateTimeText: {
    color: '#fff',
    fontSize: 16,
    flex: 1,
    marginRight: 10,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#181F33',
  },
  cancelButton: {
    backgroundColor: '#181F33',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  cancelButtonText: {
    color: '#00E6FF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  createButton: {
    backgroundColor: '#00E6FF',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  createButtonText: {
    color: '#101426',
    fontSize: 16,
    fontWeight: 'bold',
  },
  pickerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)', // Semi-transparent overlay
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerContainer: {
    backgroundColor: '#0A1121',
    borderTopWidth: 1,
    borderTopColor: '#181F33',
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  pickerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  pickerDoneText: {
    color: '#00E6FF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  centeredPickerWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 17, 33, 0.7)', // dim the background
    zIndex: 10,
  },
  centeredPickerContainer: {
    backgroundColor: '#181F33',
    borderRadius: 20,
    padding: 20,
    minWidth: 300,
    width: '80%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  picker: {
    width: '100%',
    minWidth: 250,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#181F33',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#2A3047',
    marginTop: 8,
    justifyContent: 'space-between',
  },
  dropdownText: {
    color: '#fff',
    fontSize: 16,
    flex: 1,
  },
  dropdownList: {
    backgroundColor: '#181F33',
    borderRadius: 12,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#2A3047',
    overflow: 'hidden',
    zIndex: 20,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dropdownItemText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default CreateTournamentModal; 