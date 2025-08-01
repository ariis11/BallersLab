import { getApiBaseUrl } from '@/config/constants';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/hooks/useAuth';
import { useTournamentFilters } from '@/hooks/useTournamentFilters';
import { useTournamentSorting } from '@/hooks/useTournamentSorting';
import { Tournament } from '@/types/tournament';
import { convertLocalDateToUTC } from '@/utils/dateUtils';
import { handleTournamentAction } from '@/utils/tournamentActions';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ActiveFiltersRow from '../../../components/ActiveFiltersRow';
import FilterBottomSheet from '../../../components/FilterBottomSheet';
import JoinByCodeModal from '../../../components/JoinByCodeModal';
import SortBottomSheet from '../../../components/SortBottomSheet';
import TournamentCard from '../../../components/TournamentCard';

const TOURNAMENTS_PER_PAGE = 15;

export default function TournamentsScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  
  // Use custom hooks
  const { filters: activeFilters, updateFilter, clearFilters, hasActiveFilters } = useTournamentFilters();
  const { sortState, updateSort, sortTournaments: sortTournamentsList } = useTournamentSorting();
  
  // Modal states
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [pendingFilters, setPendingFilters] = useState(activeFilters);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showSortSheet, setShowSortSheet] = useState(false);
  
  // Convert sortState to SortBottomSheet format
  const currentSort = sortState.field ? {
    label: `${sortState.field} ${sortState.direction === 'asc' ? '↑' : '↓'}`,
    value: sortState.field,
    order: sortState.direction
  } : null;
  
  const handleSortChange = (sort: any) => {
    if (sort) {
      updateSort(sort.value);
    }
  };

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

  const fetchTournaments = async (filters = activeFilters, page = 1, append = false) => {
    if (page === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    
    try {
      const apiBaseUrl = getApiBaseUrl();
      let url = `${apiBaseUrl}/api/tournaments/list?`;
      const params: Record<string, string> = {
        page: String(page),
        limit: String(TOURNAMENTS_PER_PAGE)
      };
      
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
          setLoadingMore(false);
          return;
        }
        params.userLat = String(loc.lat);
        params.userLng = String(loc.lng);
        params.distance = String(filters.distance);
      }
      
      // Add sort parameters
      if (sortState.field) {
        params.sortBy = sortState.field;
        params.sortOrder = sortState.direction;
      }
      
      url += Object.entries(params).map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&');
      const res = await fetch(url);
      const data = await res.json();
      
      const newTournaments = data.tournaments || [];
      const sortedTournaments = sortTournamentsList(newTournaments);
      
      if (append) {
        setTournaments(prev => [...prev, ...sortedTournaments]);
      } else {
        setTournaments(sortedTournaments);
      }
      
      // Update pagination state
      setHasMore(data.pagination && data.pagination.page < data.pagination.pages);
      setCurrentPage(page);
      
    } catch (e) {
      console.error('Error fetching tournaments:', e);
      if (!append) {
        setTournaments([]);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMoreTournaments = () => {
    if (!loadingMore && hasMore) {
      fetchTournaments(activeFilters, currentPage + 1, true);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    setHasMore(true);
    fetchTournaments();
  }, [activeFilters, sortState]);

  // Open filter sheet, copy current filters to pending
  const openFilterSheet = () => {
    setPendingFilters(activeFilters);
    setShowFilterSheet(true);
  };

  // Apply filters from sheet
  const applyFilters = () => {
    // Update filters using the hook's updateFilter method
    Object.entries(pendingFilters).forEach(([key, value]) => {
      updateFilter(key as keyof typeof activeFilters, value);
    });
    setShowFilterSheet(false);
  };

  // Remove a filter from active row
  const removeFilter = (key: keyof typeof activeFilters) => {
    updateFilter(key, null);
  };

  // Add a refreshTournaments function for child components
  const refreshTournaments = () => {
    setCurrentPage(1);
    setHasMore(true);
    fetchTournaments();
  };

  const handleTournamentActionWrapper = async (action: string, tournament: Tournament) => {
    await handleTournamentAction({ action, tournament });
    refreshTournaments();
  };

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.loadingMoreContainer}>
        <ActivityIndicator size="small" color={Colors.app.primary} />
        <Text style={styles.loadingMoreText}>Loading more tournaments...</Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 16 }]}>
      {/* Header */}
      <Text style={styles.heading}>Tournaments</Text>

      {/* Action Buttons Row */}
      <View style={styles.actionButtonsRow}>
        <TouchableOpacity style={styles.filtersButton} onPress={openFilterSheet}>
          <MaterialCommunityIcons name="filter-variant" size={20} color="#fff" />
          <Text style={styles.filtersButtonText}>Filters</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sortButton} onPress={() => setShowSortSheet(true)}>
          <MaterialCommunityIcons name="sort-variant" size={20} color="#fff" />
          <Text style={styles.sortButtonText}>Sort</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.joinCodeButton} onPress={() => setShowJoinModal(true)}>
          <MaterialCommunityIcons name="ticket-confirmation" size={20} color="#fff" />
          <Text style={styles.joinCodeButtonText}>Join by Code</Text>
        </TouchableOpacity>
      </View>

      {/* Active Filters Row */}
      {hasActiveFilters() && (
        <ActiveFiltersRow activeFilters={activeFilters} onRemove={removeFilter} />
      )}

      {/* Tournament List */}
      {loading ? (
        <ActivityIndicator size="large" color={Colors.app.primary} style={{ marginTop: 32 }} />
      ) : (
        <FlatList
          data={tournaments}
          keyExtractor={(item: Tournament) => item.id}
          renderItem={({ item, index }: { item: Tournament, index: number }) => (
            <TournamentCard 
              tournament={item} 
              user={user} 
              variant="upcoming"
              onAction={handleTournamentActionWrapper}
              refreshTournaments={refreshTournaments}
            />
          )}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={() => refreshTournaments()} />
          }
          onEndReached={loadMoreTournaments}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          contentContainerStyle={{ paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={false}
          ListEmptyComponent={<Text style={{ color: '#fff', textAlign: 'center', marginTop: 32 }}>No tournaments found.</Text>}
        />
      )}

      {/* Join by Code Modal */}
      <JoinByCodeModal
        visible={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        onJoinSuccess={() => refreshTournaments()}
      />

      {/* Filter Bottom Sheet */}
      <FilterBottomSheet
        visible={showFilterSheet}
        pendingFilters={pendingFilters}
        setPendingFilters={setPendingFilters}
        onDone={applyFilters}
        onClose={() => setShowFilterSheet(false)}
      />

      {/* Sort Bottom Sheet */}
      <SortBottomSheet
        visible={showSortSheet}
        currentSort={currentSort}
        onSortChange={handleSortChange}
        onClose={() => setShowSortSheet(false)}
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
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  filtersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  filtersButton: {
    flex: 0.8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#181C2E',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  filtersButtonText: {
    color: '#fff',
    marginLeft: 6,
    fontWeight: '600',
    fontSize: 14,
  },
  sortButton: {
    flex: 0.8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#181C2E',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  sortButtonText: {
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
    backgroundColor: Colors.app.primary,
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
    borderColor: Colors.app.primary,
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
    backgroundColor: Colors.app.primary,
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
    backgroundColor: Colors.app.primary,
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
    backgroundColor: Colors.app.primary,
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
    flex: 1.4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#181C2E',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  joinCodeButtonText: {
    color: '#fff',
    marginLeft: 6,
    fontWeight: '600',
    fontSize: 14,
  },
  loadingMoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  loadingMoreText: {
    color: '#A0A4B8',
    marginLeft: 8,
    fontSize: 14,
  },

}); 