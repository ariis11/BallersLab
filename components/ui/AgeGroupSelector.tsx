import { Colors } from '@/constants/Colors';
import { AGE_GROUPS } from '@/constants/leaderboard';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface AgeGroupSelectorProps {
  selectedAgeGroup: string;
  onAgeGroupChange: (ageGroup: string) => void;
}

export default function AgeGroupSelector({ selectedAgeGroup, onAgeGroupChange }: AgeGroupSelectorProps) {
  return (
    <View style={styles.container}>
      {AGE_GROUPS.map((group) => (
        <TouchableOpacity
          key={group.value}
          style={[
            styles.button,
            selectedAgeGroup === group.value && styles.buttonActive,
          ]}
          onPress={() => onAgeGroupChange(group.value)}
        >
          <Text
            style={[
              styles.buttonText,
              selectedAgeGroup === group.value && styles.buttonTextActive,
            ]}
          >
            {group.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    paddingBottom: 20,
    height: 67,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.app.surface,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.app.border,
  },
  buttonActive: {
    backgroundColor: Colors.app.primary,
    borderColor: Colors.app.primary,
  },
  buttonText: {
    color: Colors.app.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  buttonTextActive: {
    color: Colors.app.background,
  },
}); 