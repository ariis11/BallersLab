import { AGE_GROUPS, FilterState, SKILL_LEVELS } from '@/types/tournament';
import React from 'react';
import { Dimensions, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const STATUS_FILTERS = [
  { label: 'Open', value: 'REGISTRATION_OPEN' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Completed', value: 'COMPLETED' },
];

interface FilterBottomSheetProps {
  visible: boolean;
  pendingFilters: FilterState;
  setPendingFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  onDone: () => void;
  onClose: () => void;
}

const FilterBottomSheet: React.FC<FilterBottomSheetProps> = ({ visible, pendingFilters, setPendingFilters, onDone, onClose }) => {
  const SCREEN_HEIGHT = Dimensions.get('window').height;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <Pressable style={styles.sheetOverlay} onPress={onClose} />
      <View style={[styles.sheetContainer, { maxHeight: SCREEN_HEIGHT * 0.8 }]}>
        <ScrollView contentContainerStyle={{ paddingBottom: 24, paddingLeft: 5, paddingRight: 5 }} showsVerticalScrollIndicator={false}>
          <Text style={styles.sheetTitle}>Filters</Text>
          <Text style={styles.sheetGroupTitle}>Status</Text>
          <View style={styles.sheetChipsRow}>
            {STATUS_FILTERS.map(filter => (
              <TouchableOpacity
                key={filter.value}
                style={[styles.sheetChip, pendingFilters.status === filter.value ? styles.sheetChipActive : styles.sheetChipInactive]}
                onPress={() => setPendingFilters(f => ({ ...f, status: f.status === filter.value ? null : filter.value }))}
              >
                <Text style={[styles.sheetChipText, pendingFilters.status === filter.value ? styles.sheetChipTextActive : styles.sheetChipTextInactive]}>{filter.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.sheetGroupTitle}>Skill Level</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScrollView}>
            <View style={styles.sheetChipsRow}>
              {SKILL_LEVELS.map(filter => (
                <TouchableOpacity
                  key={filter.value}
                  style={[styles.sheetChip, pendingFilters.skillLevel === filter.value ? styles.sheetChipActive : styles.sheetChipInactive]}
                  onPress={() => setPendingFilters(f => ({ ...f, skillLevel: f.skillLevel === filter.value ? null : filter.value }))}
                >
                  <Text style={[styles.sheetChipText, pendingFilters.skillLevel === filter.value ? styles.sheetChipTextActive : styles.sheetChipTextInactive]}>{filter.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
          <Text style={styles.sheetGroupTitle}>Age Group</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScrollView}>
            <View style={styles.sheetChipsRow}>
              {AGE_GROUPS.map(filter => (
                <TouchableOpacity
                  key={filter.value}
                  style={[styles.sheetChip, pendingFilters.ageGroup === filter.value ? styles.sheetChipActive : styles.sheetChipInactive]}
                  onPress={() => setPendingFilters(f => ({ ...f, ageGroup: f.ageGroup === filter.value ? null : filter.value }))}
                >
                  <Text style={[styles.sheetChipText, pendingFilters.ageGroup === filter.value ? styles.sheetChipTextActive : styles.sheetChipTextInactive]}>{filter.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
          {/* Start Date */}
          <Text style={styles.sheetGroupTitle}>Start Date (YYYY-MM-DD)</Text>
          <View style={styles.sheetInputsRow}>
            <TextInput
              style={styles.sheetInput}
              placeholder="From"
              placeholderTextColor="#A0A4B8"
              value={pendingFilters.startDateFrom || ''}
              onChangeText={v => setPendingFilters(f => ({ ...f, startDateFrom: v || null }))}
            />
            <TextInput
              style={styles.sheetInput}
              placeholder="To"
              placeholderTextColor="#A0A4B8"
              value={pendingFilters.startDateTo || ''}
              onChangeText={v => setPendingFilters(f => ({ ...f, startDateTo: v || null }))}
            />
          </View>
          {/* Max Players */}
          <Text style={styles.sheetGroupTitle}>Max Players</Text>
          <View style={styles.sheetInputsRow}>
            <TextInput
              style={styles.sheetInput}
              placeholder="From"
              placeholderTextColor="#A0A4B8"
              keyboardType="numeric"
              value={pendingFilters.maxPlayersFrom !== null ? String(pendingFilters.maxPlayersFrom) : ''}
              onChangeText={v => setPendingFilters(f => ({ ...f, maxPlayersFrom: v ? Number(v) : null }))}
            />
            <TextInput
              style={styles.sheetInput}
              placeholder="To"
              placeholderTextColor="#A0A4B8"
              keyboardType="numeric"
              value={pendingFilters.maxPlayersTo !== null ? String(pendingFilters.maxPlayersTo) : ''}
              onChangeText={v => setPendingFilters(f => ({ ...f, maxPlayersTo: v ? Number(v) : null }))}
            />
          </View>
          {/* Spots Left */}
          <Text style={styles.sheetGroupTitle}>Spots Left</Text>
          <View style={styles.sheetInputsRow}>
            <TextInput
              style={styles.sheetInput}
              placeholder="From"
              placeholderTextColor="#A0A4B8"
              keyboardType="numeric"
              value={pendingFilters.spotsLeftFrom !== null ? String(pendingFilters.spotsLeftFrom) : ''}
              onChangeText={v => setPendingFilters(f => ({ ...f, spotsLeftFrom: v ? Number(v) : null }))}
            />
            <TextInput
              style={styles.sheetInput}
              placeholder="To"
              placeholderTextColor="#A0A4B8"
              keyboardType="numeric"
              value={pendingFilters.spotsLeftTo !== null ? String(pendingFilters.spotsLeftTo) : ''}
              onChangeText={v => setPendingFilters(f => ({ ...f, spotsLeftTo: v ? Number(v) : null }))}
            />
          </View>
          {/* Registration Deadline */}
          <Text style={styles.sheetGroupTitle}>Registration Deadline (YYYY-MM-DD)</Text>
          <View style={styles.sheetInputsRow}>
            <TextInput
              style={styles.sheetInput}
              placeholder="From"
              placeholderTextColor="#A0A4B8"
              value={pendingFilters.registrationDeadlineFrom || ''}
              onChangeText={v => setPendingFilters(f => ({ ...f, registrationDeadlineFrom: v || null }))}
            />
            <TextInput
              style={styles.sheetInput}
              placeholder="To"
              placeholderTextColor="#A0A4B8"
              value={pendingFilters.registrationDeadlineTo || ''}
              onChangeText={v => setPendingFilters(f => ({ ...f, registrationDeadlineTo: v || null }))}
            />
          </View>
          {/* Distance */}
          <Text style={styles.sheetGroupTitle}>Distance (km)</Text>
          <View style={styles.sheetInputsRow}>
            <TextInput
              style={styles.sheetInput}
              placeholder="e.g. 10"
              placeholderTextColor="#A0A4B8"
              keyboardType="numeric"
              value={pendingFilters.distance !== null ? String(pendingFilters.distance) : ''}
              onChangeText={v => setPendingFilters(f => ({ ...f, distance: v ? Number(v) : null }))}
            />
          </View>
          <TouchableOpacity style={styles.sheetDoneButton} onPress={onDone}>
            <Text style={styles.sheetDoneButtonText}>Done</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  sheetContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#181C2E',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 32,
    paddingHorizontal: 16, // Add horizontal padding
  },
  sheetTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 18,
    textAlign: 'center',
  },
  sheetGroupTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  chipsScrollView: {
    marginBottom: 8,
  },
  sheetChipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sheetInputsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    width: '100%',
  },
  sheetInput: {
    flex: 1,
    minWidth: 0,
    backgroundColor: '#23263A',
    color: '#fff',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 7,
    fontSize: 14,
    marginHorizontal: 4,
  },
  sheetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginRight: 8,
    marginBottom: 4,
  },
  sheetChipActive: {
    backgroundColor: '#00E6FF',
  },
  sheetChipInactive: {
    backgroundColor: '#23263A',
    borderWidth: 1,
    borderColor: '#2A2E44',
  },
  sheetChipText: {
    fontWeight: '600',
    fontSize: 14,
  },
  sheetChipTextActive: {
    color: '#101426',
  },
  sheetChipTextInactive: {
    color: '#A0A4B8',
  },
  sheetDoneButton: {
    backgroundColor: '#00E6FF',
    borderRadius: 16,
    paddingVertical: 12,
    marginTop: 18,
  },
  sheetDoneButtonText: {
    color: '#101426',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default FilterBottomSheet; 