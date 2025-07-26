import { Colors } from '@/constants/Colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface CustomDateTimePickerProps {
  label: string;
  value: Date;
  onValueChange: (date: Date) => void;
  required?: boolean;
  error?: string;
}

const CustomDateTimePicker: React.FC<CustomDateTimePickerProps> = ({
  label,
  value,
  onValueChange,
  required = false,
  error,
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [tempDate, setTempDate] = useState<Date | null>(null);

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

  const handleShowPicker = () => {
    setTempDate(value);
    setShowPicker(true);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      setTempDate(selectedDate);
    }
  };

  const handleDone = () => {
    if (tempDate) {
      onValueChange(tempDate);
    }
    setShowPicker(false);
  };

  return (
    <>
      <View style={styles.container}>
        <Text style={styles.label}>
          {label} {required && '*'}
        </Text>
        <TouchableOpacity
          style={[styles.dateTimePicker, error && styles.inputError]}
          onPress={handleShowPicker}
        >
          <Text style={styles.dateTimeText}>
            {formatDateTime(value)}
          </Text>
          <MaterialCommunityIcons name="calendar-clock" size={20} color={Colors.app.primary} />
        </TouchableOpacity>
        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>

      {showPicker && (
        <View style={styles.centeredPickerWrapper}>
          <View style={styles.centeredPickerContainer}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Select Date & Time</Text>
              <View style={{ flex: 1 }} />
              <TouchableOpacity onPress={handleDone}>
                <Text style={styles.pickerDoneText}>Done</Text>
              </TouchableOpacity>
            </View>
            <DateTimePicker
              value={tempDate || value}
              mode="datetime"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
              style={styles.picker}
            />
          </View>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
  label: {
    color: Colors.app.textSecondary,
    fontSize: 14,
    marginBottom: 8,
  },
  dateTimePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.app.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.app.border,
  },
  inputError: {
    borderColor: Colors.app.error,
  },
  dateTimeText: {
    color: Colors.app.text,
    fontSize: 16,
    flex: 1,
    marginRight: 10,
  },
  centeredPickerWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 17, 33, 0.7)',
    zIndex: 10,
  },
  centeredPickerContainer: {
    backgroundColor: Colors.app.surface,
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
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  pickerTitle: {
    color: Colors.app.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  pickerDoneText: {
    color: Colors.app.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  picker: {
    width: '100%',
    minWidth: 250,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 12,
    marginTop: 4,
    marginBottom: 8,
  },
});

export default CustomDateTimePicker; 