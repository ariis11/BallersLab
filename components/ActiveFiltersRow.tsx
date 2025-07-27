import { AGE_GROUPS, FilterState } from '@/types/tournament';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const STATUS_FILTERS = [
  { label: 'Open', value: 'REGISTRATION_OPEN' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Completed', value: 'COMPLETED' },
];

function formatRange(from: any, to: any, label: string) {
  if (from && to && from === to) return `${label}: ${from}`;
  if (from && to) return `${label}: ${from} - ${to}`;
  if (from) return `${label}: > ${from}`;
  if (to) return `${label}: < ${to}`;
  return null;
}

interface ActiveFiltersRowProps {
  activeFilters: FilterState;
  onRemove: (key: keyof FilterState) => void;
}

const ActiveFiltersRow: React.FC<ActiveFiltersRowProps> = ({ activeFilters, onRemove }) => {
  const chips = [];
  if (activeFilters.status) {
    const f = STATUS_FILTERS.find(f => f.value === activeFilters.status);
    if (f) chips.push(
      <View key="status" style={styles.filterChipActive}>
        <Text style={[styles.filterChipText, styles.filterChipTextActive]}>Status: {f.label}</Text>
        <TouchableOpacity onPress={() => onRemove('status')}>
          <MaterialCommunityIcons name="close" size={16} color="#101426" />
        </TouchableOpacity>
      </View>
    );
  }
  if (activeFilters.ageGroup) {
    const f = AGE_GROUPS.find(f => f.value === activeFilters.ageGroup);
    if (f) chips.push(
      <View key="ageGroup" style={styles.filterChipActive}>
        <Text style={[styles.filterChipText, styles.filterChipTextActive]}>Age: {f.label}</Text>
        <TouchableOpacity onPress={() => onRemove('ageGroup')}>
          <MaterialCommunityIcons name="close" size={16} color="#101426" />
        </TouchableOpacity>
      </View>
    );
  }
  // Start Date
  const startDateLabel = formatRange(activeFilters.startDateFrom, activeFilters.startDateTo, 'Start');
  if (startDateLabel) chips.push(
    <View key="startDate" style={styles.filterChipActive}>
      <Text style={[styles.filterChipText, styles.filterChipTextActive]}>{startDateLabel}</Text>
      <TouchableOpacity onPress={() => { onRemove('startDateFrom'); onRemove('startDateTo'); }}>
        <MaterialCommunityIcons name="close" size={16} color="#101426" />
      </TouchableOpacity>
    </View>
  );
  // Max Players
  const maxPlayersLabel = formatRange(activeFilters.maxPlayersFrom, activeFilters.maxPlayersTo, 'Max Players');
  if (maxPlayersLabel) chips.push(
    <View key="maxPlayers" style={styles.filterChipActive}>
      <Text style={[styles.filterChipText, styles.filterChipTextActive]}>{maxPlayersLabel}</Text>
      <TouchableOpacity onPress={() => { onRemove('maxPlayersFrom'); onRemove('maxPlayersTo'); }}>
        <MaterialCommunityIcons name="close" size={16} color="#101426" />
      </TouchableOpacity>
    </View>
  );
  // Spots Left
  const spotsLeftLabel = formatRange(activeFilters.spotsLeftFrom, activeFilters.spotsLeftTo, 'Spots Left');
  if (spotsLeftLabel) chips.push(
    <View key="spotsLeft" style={styles.filterChipActive}>
      <Text style={[styles.filterChipText, styles.filterChipTextActive]}>{spotsLeftLabel}</Text>
      <TouchableOpacity onPress={() => { onRemove('spotsLeftFrom'); onRemove('spotsLeftTo'); }}>
        <MaterialCommunityIcons name="close" size={16} color="#101426" />
      </TouchableOpacity>
    </View>
  );
  // Registration Deadline
  const regDeadlineLabel = formatRange(activeFilters.registrationDeadlineFrom, activeFilters.registrationDeadlineTo, 'Reg. Deadline');
  if (regDeadlineLabel) chips.push(
    <View key="regDeadline" style={styles.filterChipActive}>
      <Text style={[styles.filterChipText, styles.filterChipTextActive]}>{regDeadlineLabel}</Text>
      <TouchableOpacity onPress={() => { onRemove('registrationDeadlineFrom'); onRemove('registrationDeadlineTo'); }}>
        <MaterialCommunityIcons name="close" size={16} color="#101426" />
      </TouchableOpacity>
    </View>
  );
  // Distance
  if (activeFilters.distance !== null && activeFilters.distance !== undefined) {
    chips.push(
      <View key="distance" style={styles.filterChipActive}>
        <Text style={[styles.filterChipText, styles.filterChipTextActive]}>Distance: {activeFilters.distance} km</Text>
        <TouchableOpacity onPress={() => onRemove('distance')}>
          <MaterialCommunityIcons name="close" size={16} color="#101426" />
        </TouchableOpacity>
      </View>
    );
  }
  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false} 
      contentContainerStyle={styles.filtersChipsRow}
      style={styles.filtersScrollView}
    >
      {chips}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  filtersScrollView: {
    paddingHorizontal: 0,
    minHeight: 32,
    marginBottom: 16,
    maxHeight: 32,
  },
  filtersChipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 0,
  },
  filterChipActive: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00E6FF',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    minHeight: 24,
  },
  filterChipText: {
    fontWeight: '600',
    marginRight: 4,
    fontSize: 13,
    flexShrink: 1,
  },
  filterChipTextActive: {
    color: '#101426',
  },
});

export default ActiveFiltersRow; 