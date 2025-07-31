import { Colors } from '@/constants/Colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CARD_VARIANTS, TournamentCardVariant } from '../types/tournament';
import { formatTournamentDate } from '../utils/dateUtils';
import TournamentInfoModal from './TournamentInfoModal';

interface TournamentCardProps {
  tournament: any;
  user: any;
  variant: TournamentCardVariant;
  onAction: (action: string, tournament: any) => void;
  refreshTournaments?: () => void;
}

const TournamentCard: React.FC<TournamentCardProps> = ({ 
  tournament, 
  user, 
  variant, 
  onAction,
  refreshTournaments 
}) => {
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const variantConfig = CARD_VARIANTS[variant];

  const handleAction = async (action: string) => {
    if (action === 'disabled') return;
    
    setLoading(true);
    try {
      await onAction(action, tournament);
      if (refreshTournaments) {
        await refreshTournaments();
      }
    } catch (error) {
      console.error('Action failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCardPress = () => {
    setModalVisible(true);
  };

  const handleModalClose = () => {
    setModalVisible(false);
  };

  const handleButtonPress = (action: string) => {
    // Prevent card press when button is pressed
    handleAction(action);
  };

  const getTextContent = (key: string) => {
    switch (key) {
      case 'title':
        return tournament.title;
      case 'players':
        return `${tournament.currentPlayers}/${tournament.maxPlayers} Players`;
      case 'date':
        return formatTournamentDate(tournament.startDate);
      case 'round':
        return `Current Round: ${tournament.currentRound || '1'}`;
      case 'nextMatch':
        return `Next Match: ${tournament.nextMatch || 'TBD'}`;
      case 'startDate':
        return `Start Date: ${new Date(tournament.startDate).toLocaleDateString()}`;
      case 'position':
        return 'Final Position: 1st Place'; // This will be dynamic when we implement final positions
      case 'completed':
        return formatTournamentDate(tournament.startDate);
      default:
        return '';
    }
  };

  const getTextStyle = (styleKey: string) => {
    switch (styleKey) {
      case 'title':
        return styles.title;
      case 'subtitle':
        return styles.subtitle;
      case 'info':
        return styles.info;
      default:
        return styles.title;
    }
  };

  const getButtonStyle = (styleKey: string) => {
    switch (styleKey) {
      case 'primary':
        return styles.primaryButton;
      case 'secondary':
        return styles.secondaryButton;
      case 'disabled':
        return styles.disabledButton;
      default:
        return styles.primaryButton;
    }
  };

  const getButtonTextStyle = (styleKey: string) => {
    switch (styleKey) {
      case 'primary':
        return styles.primaryButtonText;
      case 'secondary':
        return styles.secondaryButtonText;
      case 'disabled':
        return styles.disabledButtonText;
      default:
        return styles.primaryButtonText;
    }
  };

  const buttonConfig = variantConfig.getButtonConfig(tournament, user);

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={handleCardPress}
      activeOpacity={0.9}
    >
      <View style={[styles.iconCircle, { borderColor: variantConfig.iconColor }]}>
        <MaterialCommunityIcons 
          name={variantConfig.icon as any} 
          size={32} 
          color={variantConfig.iconColor} 
        />
      </View>
      <View style={styles.infoBlock}>
        <Text style={getTextStyle('title')} numberOfLines={1} ellipsizeMode="tail">
          {getTextContent('title')}
        </Text>
        <View style={styles.rowBetween}>
          <Text style={getTextStyle('subtitle')} numberOfLines={1} ellipsizeMode="tail">
            {getTextContent(variantConfig.textLines[1].key)}
          </Text>
          <TouchableOpacity
            style={[getButtonStyle(buttonConfig.style), loading && styles.buttonLoading]}
            activeOpacity={0.8}
            onPress={() => handleButtonPress(buttonConfig.action)}
            disabled={loading || buttonConfig.action === 'disabled'}
          >
            {loading ? (
              <ActivityIndicator 
                size="small" 
                color={buttonConfig.style === 'secondary' ? '#101426' : '#181C2E'} 
              />
            ) : (
              <Text style={getButtonTextStyle(buttonConfig.style)}>
                {buttonConfig.text}
              </Text>
            )}
          </TouchableOpacity>
        </View>
        <Text style={getTextStyle('info')} numberOfLines={2} ellipsizeMode="tail">
          {getTextContent(variantConfig.textLines[2].key)}
        </Text>
      </View>
      <TournamentInfoModal 
        visible={modalVisible}
        tournament={tournament} 
        user={user} 
        onClose={handleModalClose} 
        onAction={handleButtonPress} 
        refreshTournaments={refreshTournaments} 
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#181C2E',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
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
    borderColor: Colors.app.primary,
  },
  infoBlock: {
    flex: 1,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  subtitle: {
    color: '#A0A4B8',
    fontSize: 14,
    marginBottom: 2,
    flex: 1,
    marginRight: 8,
  },
  info: {
    color: Colors.app.primary,
    fontSize: 12,
    fontWeight: '500',
  },
  primaryButton: {
    backgroundColor: Colors.app.primary,
    borderRadius: 16,
    paddingHorizontal: 22,
    paddingVertical: 8,
    flexShrink: 0,
  },
  primaryButtonText: {
    color: '#101426',
    fontWeight: 'bold',
    fontSize: 15,
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 22,
    paddingVertical: 8,
    flexShrink: 0,
  },
  secondaryButtonText: {
    color: '#101426',
    fontWeight: 'bold',
    fontSize: 15,
  },
  disabledButton: {
    backgroundColor: '#23263A',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 8,
    opacity: 0.7,
    flexShrink: 0,
  },
  disabledButtonText: {
    color: '#A0A4B8',
    fontWeight: 'bold',
    fontSize: 15,
  },
  buttonLoading: {
    opacity: 0.7,
  },
});

export default TournamentCard; 