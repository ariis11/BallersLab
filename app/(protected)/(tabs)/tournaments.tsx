import { useAuth } from '@/hooks/useAuth';
import { FilterState } from '@/types/tournament';
import { convertLocalDateToUTC } from '@/utils/dateUtils';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, RefreshControl, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ActiveFiltersRow from '../../../components/ActiveFiltersRow';
import FilterBottomSheet from '../../../components/FilterBottomSheet';
import TournamentCard from '../../../components/TournamentCard';

// Extended filter state
const initialFilters: FilterState = {
  status: null,
  skillLevel: null,
  ageGroup: null,
  startDateFrom: null,
  startDateTo: null,
  maxPlayersFrom: null,
  maxPlayersTo: null,
  spotsLeftFrom: null,
  spotsLeftTo: null,
  registrationDeadlineFrom: null,
  registrationDeadlineTo: null,
  distance: null,
};

export default function TournamentsScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeFilters, setActiveFilters] = useState(initialFilters);
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [pendingFilters, setPendingFilters] = useState(initialFilters);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  
  // Join by code modal state
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joiningTournament, setJoiningTournament] = useState(false);

  // Helper to get user location if distance filter is set
  const ensureUserLocation = async () => {
    if (!userLocation) {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Location permission is required to filter by distance.');
        return null;
      }
      const loc = await Location.getCurrentPositionAsync({});
      setUserLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });
      return { lat: loc.coords.latitude, lng: loc.coords.longitude };
    }
    return userLocation;
  };

  const fetchTournaments = async (filters = activeFilters) => {
    setLoading(true);
    try {
      let url = `${process.env.EXPO_PUBLIC_API_BASE_URL}/api/tournaments/list?`;
      const params: Record<string, string> = {};
      if (filters.status) params.status = filters.status;
      if (filters.skillLevel) params.skillLevel = filters.skillLevel;
      if (filters.ageGroup) params.ageGroup = filters.ageGroup;
      if (filters.startDateFrom) params.startDateFrom = convertLocalDateToUTC(filters.startDateFrom);
      if (filters.startDateTo) params.startDateTo = convertLocalDateToUTC(filters.startDateTo, true); // End of day
      if (filters.maxPlayersFrom !== null) params.maxPlayersFrom = String(filters.maxPlayersFrom);
      if (filters.maxPlayersTo !== null) params.maxPlayersTo = String(filters.maxPlayersTo);
      if (filters.spotsLeftFrom !== null) params.spotsLeftFrom = String(filters.spotsLeftFrom);
      if (filters.spotsLeftTo !== null) params.spotsLeftTo = String(filters.spotsLeftTo);
      if (filters.registrationDeadlineFrom) params.registrationDeadlineFrom = convertLocalDateToUTC(filters.registrationDeadlineFrom);
      if (filters.registrationDeadlineTo) params.registrationDeadlineTo = convertLocalDateToUTC(filters.registrationDeadlineTo, true); // End of day
      if (filters.distance !== null) {
        const loc = await ensureUserLocation();
        if (!loc) {
          setLoading(false);
          return;
        }
        params.userLat = String(loc.lat);
        params.userLng = String(loc.lng);
        params.distance = String(filters.distance);
      }
      url += Object.entries(params).map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&');
      const res = await fetch(url);
      const data = await res.json();
      setTournaments(data.tournaments || []);
    } catch (e) {
      setTournaments([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTournaments();
  }, [activeFilters]);

  // Open filter sheet, copy current filters to pending
  const openFilterSheet = () => {
    setPendingFilters(activeFilters);
    setShowFilterSheet(true);
  };

  // Apply filters from sheet
  const applyFilters = () => {
    setActiveFilters(pendingFilters);
    setShowFilterSheet(false);
  };

  // Remove a filter from active row
  const removeFilter = (key: keyof typeof initialFilters) => {
    setActiveFilters(filters => ({ ...filters, [key]: null }));
  };

  // Add a refreshTournaments function for child components
  const refreshTournaments = () => fetchTournaments();

  const handleJoinByCode = async () => {
    if (!joinCode.trim()) {
      Alert.alert('Error', 'Please enter a tournament code');
      return;
    }

    setJoiningTournament(true);
    try {
      const token = await (await import('@react-native-async-storage/async-storage')).default.getItem('authToken');
      
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL}/api/tournaments/join-by-code`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: joinCode.trim().toUpperCase() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to join tournament');
      }

      Alert.alert('Success', 'Successfully joined tournament!');
      setShowJoinModal(false);
      setJoinCode('');
      
      // Refresh tournaments list
      fetchTournaments();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to join tournament');
    } finally {
      setJoiningTournament(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 16 }]}>
      {/* Header */}
      <Text style={styles.heading}>Tournaments</Text>

      {/* Filters Row */}
      <View style={styles.filtersRow}>
        <TouchableOpacity style={styles.filtersButton} onPress={openFilterSheet}>
          <MaterialCommunityIcons name="filter-variant" size={20} color="#fff" />
          <Text style={styles.filtersButtonText}>Filters</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.joinCodeButton} onPress={() => setShowJoinModal(true)}>
          <MaterialCommunityIcons name="ticket-confirmation" size={20} color="#fff" />
          <Text style={styles.joinCodeButtonText}>Join Code</Text>
        </TouchableOpacity>
        <ActiveFiltersRow activeFilters={activeFilters} onRemove={removeFilter} />
      </View>

      {/* Tournament List */}
      {loading ? (
        <ActivityIndicator size="large" color="#00E6FF" style={{ marginTop: 32 }} />
      ) : (
        <FlatList
          data={tournaments}
          keyExtractor={(item: any) => item.id}
          renderItem={({ item, index }: { item: any, index: number }) => (
            <TournamentCard item={item} index={index} user={user} refreshTournaments={refreshTournaments} />
          )}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={() => fetchTournaments()} />
          }
          contentContainerStyle={{ paddingBottom: 24 }}
          ListEmptyComponent={<Text style={{ color: '#fff', textAlign: 'center', marginTop: 32 }}>No tournaments found.</Text>}
        />
      )}

      {/* Join by Code Modal */}
      <Modal
        visible={showJoinModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowJoinModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Join Tournament</Text>
            <View style={styles.codeInputContainer}>
              <Text style={styles.codeLabel}>Tournament Code</Text>
              <TextInput
                style={styles.codeInput}
                value={joinCode}
                onChangeText={(text) => setJoinCode(text.toUpperCase())}
                placeholder="Enter code (e.g., ABC123)"
                placeholderTextColor="#A0A4B8"
                autoCapitalize="characters"
                editable={!joiningTournament}
                textAlign="center"
              />
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowJoinModal(false)}
                disabled={joiningTournament}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.submitButton, joiningTournament && styles.submitButtonDisabled]}
                onPress={handleJoinByCode}
                disabled={joiningTournament}
              >
                <Text style={styles.submitButtonText}>
                  {joiningTournament ? 'Joining...' : 'Join Tournament'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Filter Bottom Sheet */}
      <FilterBottomSheet
        visible={showFilterSheet}
        pendingFilters={pendingFilters}
        setPendingFilters={setPendingFilters}
        onDone={applyFilters}
        onClose={() => setShowFilterSheet(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#101426',
    paddingHorizontal: 12,
  },
  heading: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 12,
  },
  filtersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  filtersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#181C2E',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginRight: 8,
  },
  filtersButtonText: {
    color: '#fff',
    marginLeft: 6,
    fontWeight: '600',
    fontSize: 14,
  },
  filtersChipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterChipActive: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00E6FF',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginRight: 8,
  },
  filterChipText: {
    fontWeight: '600',
    marginRight: 4,
    fontSize: 13,
  },
  filterChipTextActive: {
    color: '#101426',
  },
  card: {
    backgroundColor: '#181C2E',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#101426',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    borderWidth: 2,
    borderColor: '#00E6FF',
  },
  title: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  players: {
    color: '#A0A4B8',
    fontSize: 14,
  },
  joinButton: {
    backgroundColor: '#00E6FF',
    borderRadius: 16,
    paddingHorizontal: 22,
    paddingVertical: 8,
  },
  joinButtonText: {
    color: '#101426',
    fontWeight: 'bold',
    fontSize: 15,
  },
  unjoinButton: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 22,
    paddingVertical: 8,
  },
  unjoinButtonText: {
    color: '#101426',
    fontWeight: 'bold',
    fontSize: 15,
  },
  // Bottom sheet styles
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
  },
  sheetTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 18,
    textAlign: 'center',
  },
  sheetGroupTitle: {
    color: '#A0A4B8',
    fontWeight: '600',
    fontSize: 14,
    marginBottom: 8,
    marginTop: 12,
  },
  sheetChipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
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
  // Join by code button styles
  joinCodeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#181C2E',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginLeft: 8,
  },
  joinCodeButtonText: {
    color: '#fff',
    marginLeft: 6,
    fontWeight: '600',
    fontSize: 14,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#181C2E',
    borderRadius: 16,
    padding: 24,
    width: '80%',
    maxWidth: 300,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  codeInputContainer: {
    marginBottom: 16,
  },
  codeLabel: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 8,
  },
  codeInput: {
    backgroundColor: '#101426',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#2A3441',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#00E6FF',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginLeft: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#101426',
    fontWeight: 'bold',
  },
}); 