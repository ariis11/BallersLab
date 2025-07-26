import React, { useEffect, useState } from 'react';
import { Dimensions, Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const SORT_OPTIONS: SortOption[] = [
  { label: 'Date ↑', value: 'startDate', order: 'asc' },
  { label: 'Date ↓', value: 'startDate', order: 'desc' },
  { label: 'Name ↑', value: 'title', order: 'asc' },
  { label: 'Name ↓', value: 'title', order: 'desc' },
  { label: 'Players ↑', value: 'currentPlayers', order: 'asc' },
  { label: 'Players ↓', value: 'currentPlayers', order: 'desc' },
  { label: 'Max Players ↑', value: 'maxPlayers', order: 'asc' },
  { label: 'Max Players ↓', value: 'maxPlayers', order: 'desc' },
];

interface SortOption {
  label: string;
  value: string;
  order: 'asc' | 'desc';
}

interface SortBottomSheetProps {
  visible: boolean;
  currentSort: SortOption | null;
  onSortChange: (sort: SortOption | null) => void;
  onClose: () => void;
}

const SortBottomSheet: React.FC<SortBottomSheetProps> = ({ visible, currentSort, onSortChange, onClose }) => {
  const SCREEN_HEIGHT = Dimensions.get('window').height;
  const [pendingSort, setPendingSort] = useState<SortOption | null>(currentSort);

  // Update pending sort when currentSort changes
  useEffect(() => {
    setPendingSort(currentSort);
  }, [currentSort]);

  const handleSortSelect = (sort: SortOption) => {
    // If the same sort is selected, deselect it
    if (pendingSort && pendingSort.value === sort.value && pendingSort.order === sort.order) {
      setPendingSort(null);
    } else {
      setPendingSort(sort);
    }
  };

  const handleDone = () => {
    onSortChange(pendingSort);
    onClose();
  };

  const isSortActive = (sort: SortOption) => {
    return pendingSort && pendingSort.value === sort.value && pendingSort.order === sort.order;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <Pressable style={styles.sheetOverlay} onPress={onClose} />
      <View style={[styles.sheetContainer, { maxHeight: SCREEN_HEIGHT * 0.6 }]}>
        <ScrollView contentContainerStyle={{ paddingLeft: 5, paddingRight: 5 }} showsVerticalScrollIndicator={false}>
          <Text style={styles.sheetTitle}>Sort By</Text>
          
          <View style={styles.sheetChipsRow}>
            {SORT_OPTIONS.map((sort, index) => (
              <TouchableOpacity
                key={`${sort.value}-${sort.order}-${index}`}
                style={[styles.sheetChip, isSortActive(sort) ? styles.sheetChipActive : styles.sheetChipInactive]}
                onPress={() => handleSortSelect(sort)}
              >
                <Text style={[styles.sheetChipText, isSortActive(sort) ? styles.sheetChipTextActive : styles.sheetChipTextInactive]}>
                  {sort.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
        
        <View style={styles.sheetFooter}>
          <TouchableOpacity style={styles.sheetDoneButton} onPress={handleDone}>
            <Text style={styles.sheetDoneButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sheetContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#181C2E',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingHorizontal: 16,
  },
  sheetTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  sheetChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  sheetChip: {
    width: '48%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetChipActive: {
    backgroundColor: '#00E6FF',
    borderColor: '#00E6FF',
  },
  sheetChipInactive: {
    backgroundColor: 'transparent',
    borderColor: '#2A3441',
  },
  sheetChipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  sheetChipTextActive: {
    color: '#101426',
  },
  sheetChipTextInactive: {
    color: '#fff',
  },
  sheetFooter: {
    paddingBottom: 25,
  },
  sheetDoneButton: {
    backgroundColor: '#00E6FF',
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  sheetDoneButtonText: {
    color: '#101426',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default SortBottomSheet; 