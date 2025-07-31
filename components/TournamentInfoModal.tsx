import { Colors } from '@/constants/Colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import {
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AGE_GROUPS } from '../types/tournament';
import { formatTournamentDate } from '../utils/dateUtils';

interface TournamentInfoModalProps {
  visible: boolean;
  tournament: any;
  user: any;
  onClose: () => void;
  onAction: (action: string) => void;
  refreshTournaments?: () => void;
}

const TournamentInfoModal: React.FC<TournamentInfoModalProps> = ({
  visible,
  tournament,
  user,
  onClose,
  onAction,
  refreshTournaments,
}) => {
  const availableSpots = tournament.maxPlayers - tournament.currentPlayers;

  const formatLocation = () => {
    if (tournament.location) {
      return tournament.location;
    }
    if (tournament.longitude && tournament.latitude) {
      return `${tournament.latitude.toFixed(4)}, ${tournament.longitude.toFixed(4)}`;
    }
    return 'Location not specified';
  };

  const formatRegistrationDeadline = () => {
    if (tournament.registrationDeadline) {
      return formatTournamentDate(tournament.registrationDeadline);
    }
    return 'No deadline set';
  };

  const getAgeGroupLabel = (ageGroup: string) => {
    const ageGroupOption = AGE_GROUPS.find(group => group.value === ageGroup);
    return ageGroupOption ? ageGroupOption.label : ageGroup;
  };

  const getStatusColor = () => {
    switch (tournament.status) {
      case 'DRAFT':
        return '#A0A4B8'; // Gray
      case 'PUBLISHED':
        return Colors.app.primary; // Cyan
      case 'REGISTRATION_OPEN':
        return Colors.app.primary; // Cyan
      case 'REGISTRATION_CLOSED':
        return '#FFD700'; // Gold
      case 'IN_PROGRESS':
        return '#00FF88'; // Green
      case 'COMPLETED':
        return '#A0A4B8'; // Gray
      case 'CANCELLED':
        return '#FF6B6B'; // Red
      default:
        return '#A0A4B8'; // Gray
    }
  };

  const getStatusText = () => {
    switch (tournament.status) {
      case 'DRAFT':
        return 'Draft';
      case 'PUBLISHED':
        return 'Published';
      case 'REGISTRATION_OPEN':
        return 'Registration Open';
      case 'REGISTRATION_CLOSED':
        return 'Registration Closed';
      case 'IN_PROGRESS':
        return 'In Progress';
      case 'COMPLETED':
        return 'Completed';
      case 'CANCELLED':
        return 'Canceled';
      default:
        return 'Unknown';
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.overlay} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <TouchableOpacity 
          style={styles.modalContainer} 
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Tournament Details</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialCommunityIcons name="close" size={24} color="#A0A4B8" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Basic Details Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Basic Details</Text>
              
              <View style={styles.infoRow}>
                <Text style={styles.label}>Title:</Text>
                <Text style={styles.value}>{tournament.title}</Text>
              </View>

              {tournament.description && (
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Description:</Text>
                  <Text style={styles.value}>{tournament.description}</Text>
                </View>
              )}

              <View style={styles.infoRow}>
                <Text style={styles.label}>Start Date:</Text>
                <Text style={styles.value}>{formatTournamentDate(tournament.startDate)}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.label}>Registration Deadline:</Text>
                <Text style={styles.value}>{formatRegistrationDeadline()}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.label}>Location Name:</Text>
                <Text style={styles.value}>{tournament.locationName}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.label}>Location:</Text>
                <Text style={styles.value}>{formatLocation()}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.label}>Status:</Text>
                <View style={styles.statusContainer}>
                  <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
                  <Text style={styles.value}>{getStatusText()}</Text>
                </View>
              </View>
            </View>

            {/* Participant Information Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Participant Information</Text>
              
              <View style={styles.infoRow}>
                <Text style={styles.label}>Current Players:</Text>
                <Text style={styles.value}>{tournament.currentPlayers}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.label}>Maximum Players:</Text>
                <Text style={styles.value}>{tournament.maxPlayers}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.label}>Available Spots:</Text>
                <Text style={[styles.value, { color: availableSpots > 0 ? '#00FF88' : '#FF6B6B' }]}>
                  {availableSpots}
                </Text>
              </View>
            </View>

            {/* Tournament Configuration Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tournament Configuration</Text>
              
              {tournament.ageGroup && (
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Age Group:</Text>
                  <Text style={styles.value}>{getAgeGroupLabel(tournament.ageGroup)}</Text>
                </View>
              )}

              <View style={styles.infoRow}>
                <Text style={styles.label}>Tournament Type:</Text>
                <Text style={styles.value}>Single Elimination</Text>
              </View>

              {tournament.code && (
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Tournament Code:</Text>
                  <Text style={styles.value}>{tournament.code}</Text>
                </View>
              )}
            </View>
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#181C2E',
    borderRadius: 20,
    width: Dimensions.get('window').width * 0.9,
    maxHeight: Dimensions.get('window').height * 0.8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#23263A',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: Colors.app.primary,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  label: {
    color: '#A0A4B8',
    fontSize: 14,
    fontWeight: '500',
    width: 120,
    flexShrink: 0,
  },
  value: {
    color: '#fff',
    fontSize: 14,
    flex: 1,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
});

export default TournamentInfoModal; 