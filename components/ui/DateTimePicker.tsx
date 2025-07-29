import { Colors } from '@/constants/Colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface CustomDateTimePickerProps {
  label?: string;
  value: Date | null;
  onValueChange: (date: Date | null) => void;
  required?: boolean;
  error?: string;
  mode?: 'date' | 'datetime';
  placeholder?: string;
  compact?: boolean;
}

const CustomDateTimePicker: React.FC<CustomDateTimePickerProps> = ({
  label,
  value,
  onValueChange,
  required = false,
  error,
  mode = 'datetime',
  placeholder = 'Select date',
  compact = false
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [tempDate, setTempDate] = useState<Date | null>(value);

  const formatDateTime = (date: Date) => {
    if (mode === 'date') {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    }
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
    setTempDate(value || new Date());
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

  const handleClear = () => {
    onValueChange(null);
    setShowPicker(false);
  };

  const getIconName = () => {
    return mode === 'date' ? 'calendar' : 'calendar-clock';
  };

  return (
    <>
      <View style={compact ? styles.containerCompact : styles.container}>
        {label && (
          <Text style={styles.label}>
            {label} {required && '*'}
          </Text>
        )}
        <TouchableOpacity
          style={[
            compact ? styles.dateTimePickerCompact : styles.dateTimePicker, 
            error && styles.inputError
          ]}
          onPress={handleShowPicker}
        >
          <Text style={[compact ? styles.dateTimeTextCompact : styles.dateTimeText, !value && styles.placeholderText]}>
            {value ? formatDateTime(value) : placeholder}
          </Text>
          <MaterialCommunityIcons name={getIconName()} size={20} color={Colors.app.primary} />
        </TouchableOpacity>
        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>

      {showPicker && (
        <View style={styles.centeredPickerWrapper}>
          <View style={styles.centeredPickerContainer}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Select Date</Text>
              <View style={{ flex: 1 }} />
              <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
                <Text style={styles.clearButtonText}>Clear</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDone} style={styles.doneButton}>
                <Text style={styles.pickerDoneText}>Done</Text>
              </TouchableOpacity>
            </View>
            <DateTimePicker
              value={tempDate || new Date()}
              mode={mode}
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
  containerCompact: {
    marginBottom: 0,
    minWidth: '50%'
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
  dateTimePickerCompact: {
    flex: 1,
    minWidth: 0,
    backgroundColor: '#23263A',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: '#2A2E44',
    marginHorizontal: 4,
    flexDirection: 'row',
    alignItems: 'center',
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
  dateTimeTextCompact: {
    color: '#fff',
    fontSize: 14,
    flex: 1,
    marginRight: 10,
  },
  placeholderText: {
    color: Colors.app.textSecondary,
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
    width: '100%',
  },
  pickerTitle: {
    color: Colors.app.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  clearButton: {
    marginRight: 10,
  },
  clearButtonText: {
    color: Colors.app.error,
    fontSize: 16,
    fontWeight: 'bold',
  },
  doneButton: {
    marginLeft: 10,
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