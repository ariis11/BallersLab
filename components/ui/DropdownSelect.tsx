import { Colors } from '@/constants/Colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownSelectProps {
  label: string;
  value: string;
  options: DropdownOption[];
  onValueChange: (value: string) => void;
  required?: boolean;
}

const DropdownSelect: React.FC<DropdownSelectProps> = ({
  label,
  value,
  options,
  onValueChange,
  required = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find(option => option.value === value);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label} {required && '*'}
      </Text>
      <TouchableOpacity
        style={styles.dropdown}
        onPress={() => setIsOpen(!isOpen)}
        activeOpacity={0.8}
      >
        <Text style={styles.dropdownText}>
          {selectedOption?.label || 'Select an option'}
        </Text>
        <MaterialCommunityIcons 
          name={isOpen ? 'chevron-up' : 'chevron-down'} 
          size={20} 
          color={Colors.app.primary} 
        />
      </TouchableOpacity>
      {isOpen && (
        <View style={styles.dropdownList}>
          {options.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={styles.dropdownItem}
              onPress={() => {
                onValueChange(option.value);
                setIsOpen(false);
              }}
            >
              <Text style={styles.dropdownItemText}>{option.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
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
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.app.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.app.border,
    justifyContent: 'space-between',
  },
  dropdownText: {
    color: Colors.app.text,
    fontSize: 16,
    flex: 1,
  },
  dropdownList: {
    backgroundColor: Colors.app.surface,
    borderRadius: 12,
    marginTop: 4,
    borderWidth: 1,
    borderColor: Colors.app.border,
    overflow: 'hidden',
    zIndex: 20,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dropdownItemText: {
    color: Colors.app.text,
    fontSize: 16,
  },
});

export default DropdownSelect; 