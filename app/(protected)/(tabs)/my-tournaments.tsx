import { useAuth } from '@/hooks/useAuth';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CreateTournamentModal from '../../../components/CreateTournamentModal';
import TournamentCard from '../../../components/TournamentCard';

// Active Tournament Card Component
const ActiveTournamentCard = ({ tournament }: any) => {
  const router = useRouter();

  const handleViewBracket = () => {
    router.push({
      pathname: '/bracket',
      params: { 
        tournamentId: tournament.id
      }
    });
  };

  return (
    <View style={styles.card}>
      <View style={styles.iconCircle}>
        <MaterialCommunityIcons name="basketball" size={32} color="#00E6FF" />
      </View>
      <View style={styles.infoBlockV2}>
        <Text style={styles.title}>{tournament.title}</Text>
        <View style={styles.rowBetween}>
          <Text style={styles.round}>{`Current Round: ${tournament.currentRound}`}</Text>
          <TouchableOpacity 
            style={styles.viewBracketButtonV2} 
            activeOpacity={0.8}
            onPress={handleViewBracket}
          >
            <Text style={styles.viewBracketButtonTextV2}>View Bracket</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.nextMatchV2}>{`Next Match: ${tournament.nextMatch}`}</Text>
      </View>
    </View>
  );
};

// Placeholder TournamentCard for other categories - replace with your actual component or import
const TournamentCardLegacy = ({ tournament, category }: any) => (
  <View style={styles.card}>
    <Text style={styles.cardTitle}>{tournament.name}</Text>
    <View style={styles.cardAction}>
      {category === 'finished' && <Text style={styles.actionBtn}>Results</Text>}
      {category === 'created' && <Text style={styles.actionBtn}>Edit</Text>}
    </View>
  </View>
);

const CATEGORIES = [
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'active', label: 'Active' },
  { key: 'finished', label: 'Finished' },
  { key: 'created', label: 'Created' },
];

type CategoryKey = 'upcoming' | 'active' | 'finished' | 'created';

const API_URL = `${process.env.EXPO_PUBLIC_API_BASE_URL}/api/tournaments/my-tournaments`;

const MyTournamentsScreen = () => {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>('upcoming');
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Create tournament modal state
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Dummy refresh function (replace with real refetch if needed)
  const refreshTournaments = () => fetchTournaments(selectedCategory);

  useEffect(() => {
    fetchTournaments(selectedCategory);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory]);

  async function fetchTournaments(category: CategoryKey) {
    if (category !== 'upcoming' && category !== 'active') return;
    setLoading(true);
    try {
      const token = await (await import('@react-native-async-storage/async-storage')).default.getItem('authToken');
      const res = await fetch(`${API_URL}?type=${category}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      setTournaments(data.tournaments || []);
    } catch (e) {
      setTournaments([]);
    }
    setLoading(false);
  }

  // Dummy data for finished/created for now
  const DUMMY_TOURNAMENTS: Record<CategoryKey, { id: string; name: string }[]> = {
    upcoming: [],
    active: [],
    finished: [
      { id: '5', name: 'Finished Tournament 1' },
    ],
    created: [
      { id: '6', name: 'Created Tournament 1' },
    ],
  };

  const displayTournaments =
    selectedCategory === 'upcoming' || selectedCategory === 'active'
      ? tournaments
      : DUMMY_TOURNAMENTS[selectedCategory] || [];

  const handleCreateTournament = (tournamentData: any) => {
    // TODO: Implement API call
    console.log('Creating tournament:', tournamentData);
    setShowCreateModal(false);
    // Refresh tournaments list
    fetchTournaments(selectedCategory);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 16 }]}>
      {/* Header with Create Button */}
      <View style={styles.headerContainer}>
        <Text style={styles.header}>My Tournaments</Text>
        <TouchableOpacity 
          style={styles.createButton}
          onPress={() => setShowCreateModal(true)}
        >
          <MaterialCommunityIcons name="plus" size={20} color="#00E6FF" />
          <Text style={styles.createButtonText}>Create</Text>
        </TouchableOpacity>
      </View>

      {/* Category Selector */}
      <View style={styles.categoryRow}>
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat.key}
            style={[
              styles.categoryButton,
              selectedCategory === cat.key && styles.categoryButtonActive,
            ]}
            onPress={() => setSelectedCategory(cat.key as CategoryKey)}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === cat.key && styles.categoryTextActive,
              ]}
            >
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tournament List */}
      {loading ? (
        <ActivityIndicator size="large" color="#00E6FF" style={{ marginTop: 32 }} />
      ) : (
        <FlatList
          data={displayTournaments}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            selectedCategory === 'active' ? (
              <ActiveTournamentCard tournament={item} />
            ) : selectedCategory === 'upcoming' ? (
              <TournamentCard item={item} index={0} user={user} refreshTournaments={refreshTournaments} />
            ) : (
              <TournamentCardLegacy tournament={item} category={selectedCategory} />
            )
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No tournaments in this category.</Text>
          }
          contentContainerStyle={{ flexGrow: 1 }}
        />
      )}

      {/* Create Tournament Modal */}
      <CreateTournamentModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateTournament}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A1121', paddingHorizontal: 16 },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  header: { 
    color: 'white', 
    fontSize: 20, 
    fontWeight: 'bold', 
    textAlign: 'center',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#181F33',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  createButtonText: {
    color: '#00E6FF',
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 8,
  },
  categoryRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 16 },
  categoryButton: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#181F33',
    marginHorizontal: 4,
  },
  categoryButtonActive: {
    backgroundColor: '#00E6FB',
  },
  categoryText: { color: 'white', fontWeight: '500' },
  categoryTextActive: { color: '#181F33' },
  emptyText: { color: '#888', textAlign: 'center', marginTop: 32 },
  // Active Tournament Card styles (matching discovery card style)
  card: {
    backgroundColor: '#181C2E',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#101426',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    borderWidth: 2,
    borderColor: '#00E6FF',
    marginTop: 2,
  },
  infoBlockV2: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 6,
    lineHeight: 22,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center', // ensure vertical centering
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  round: {
    color: '#A0A4B8',
    fontSize: 14,
    flex: 1,
    marginRight: 8,
    lineHeight: 20,
  },
  viewBracketButtonV2: {
    backgroundColor: '#00E6FF',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 6,
    // alignSelf removed for vertical centering
    flexShrink: 0,
    minWidth: 0,
  },
  viewBracketButtonTextV2: {
    color: '#101426',
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 0.2,
  },
  nextMatchV2: {
    color: '#00E6FF',
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
    lineHeight: 20,
  },
  // Legacy card styles for other categories
  cardTitle: { color: 'white', fontSize: 16, fontWeight: '600' },
  cardAction: {},
  actionBtn: {
    backgroundColor: '#00E6FB',
    color: '#181F33',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontWeight: 'bold',
    overflow: 'hidden',
  },
});

export default MyTournamentsScreen; 