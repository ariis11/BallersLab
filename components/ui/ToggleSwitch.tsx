import { Colors } from '@/constants/Colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ToggleSwitchProps {
  label?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  iconOn?: keyof typeof MaterialCommunityIcons.glyphMap;
  iconOff?: keyof typeof MaterialCommunityIcons.glyphMap;
  textOn?: string;
  textOff?: string;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  label,
  value,
  onValueChange,
  iconOn = "eye",
  iconOff = "eye-off",
  textOn = "On",
  textOff = "Off",
}) => {
  return (
    <View style={styles.container}>
      {label && (
        <Text style={styles.label}>{label}</Text>
      )}
      <TouchableOpacity
        style={styles.toggle}
        onPress={() => onValueChange(!value)}
      >
        <MaterialCommunityIcons 
          name={value ? iconOn : iconOff} 
          size={20} 
          color={value ? Colors.app.primary : Colors.app.textSecondary} 
        />
        <Text style={styles.toggleText}>
          {value ? textOn : textOff}
        </Text>
      </TouchableOpacity>
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
  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.app.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  toggleText: {
    color: Colors.app.text,
    fontSize: 14,
    marginLeft: 10,
  },
});

export default ToggleSwitch; 