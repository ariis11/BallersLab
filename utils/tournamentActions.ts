import { getApiBaseUrl } from '@/config/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface TournamentActionParams {
  action: string;
  tournament: any;
  router?: any;
  onEdit?: (tournament: any) => void;
}

export const handleTournamentAction = async ({
  action,
  tournament,
  router,
  onEdit
}: TournamentActionParams): Promise<void> => {
  const token = await AsyncStorage.getItem('authToken');
  const baseUrl = getApiBaseUrl();

  switch (action) {
    case 'join':
      await fetch(`${baseUrl}/api/tournaments/join/${tournament.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      break;

    case 'leave':
      await fetch(`${baseUrl}/api/tournaments/leave/${tournament.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      break;

    case 'viewResults':
    case 'viewBracket':
      if (router) {
        router.push({
          pathname: '/bracket',
          params: {
            tournamentId: tournament.id
          }
        });
      }
      break;

    case 'edit':
      if (onEdit) {
        onEdit(tournament);
      }
      break;

    case 'disabled':
      // No action needed for disabled state
      break;

    default:
      console.warn(`Unknown tournament action: ${action}`);
  }
}; 