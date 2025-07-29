export type SkillLevel = 'ALL_LEVELS' | 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'PROFESSIONAL';
export type AgeGroup = 'U12' | 'U14' | 'U16' | 'U18' | 'OVER_18' | 'ALL_AGES';

export interface TournamentFormData {
  title: string;
  description: string;
  locationName: string;
  latitude?: number;
  longitude?: number;
  maxPlayers: string;
  skillLevel: SkillLevel;
  ageGroup: AgeGroup;
  isPublic: boolean;
  startDateTime: Date | null;
  registrationDeadline: Date | null;
}

export interface CreateTournamentModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (tournamentData: TournamentFormData) => void;
  mode?: 'create' | 'edit';
  initialData?: TournamentFormData;
  tournamentId?: string;
}

export const SKILL_LEVELS = [
  { value: 'ALL_LEVELS', label: 'All Levels' },
  { value: 'BEGINNER', label: 'Beginner' },
  { value: 'INTERMEDIATE', label: 'Intermediate' },
  { value: 'ADVANCED', label: 'Advanced' },
  { value: 'PROFESSIONAL', label: 'Professional' },
] as const;

export const AGE_GROUPS = [
  { value: 'U12', label: 'U12' },
  { value: 'U14', label: 'U14' },
  { value: 'U16', label: 'U16' },
  { value: 'U18', label: 'U18' },
  { value: 'OVER_18', label: '18+' },
  { value: 'ALL_AGES', label: 'All Ages' },
] as const;

export interface FilterState {
  status: string | null;
  skillLevel: string | null;
  ageGroup: string | null;
  startDateFrom: string | null;
  startDateTo: string | null;
  maxPlayersFrom: number | null;
  maxPlayersTo: number | null;
  spotsLeftFrom: number | null;
  spotsLeftTo: number | null;
  registrationDeadlineFrom: string | null;
  registrationDeadlineTo: string | null;
  distance: number | null;
}

// Tournament Card Configuration Types
export interface TextLineConfig {
  key: string;
  style: 'title' | 'subtitle' | 'info';
}

export interface ButtonConfig {
  text: string;
  style: 'primary' | 'secondary' | 'disabled';
  action: string;
}

export interface CardVariantConfig {
  icon: string;
  iconColor: string;
  textLines: TextLineConfig[];
  getButtonConfig: (tournament: any, user: any) => ButtonConfig;
}

export type TournamentCardVariant = 'upcoming' | 'active' | 'finished' | 'created';

// Tournament Data Types
export interface Tournament {
  id: string;
  title: string;
  name?: string; // For backward compatibility
  description?: string;
  startDate: string;
  endDate?: string;
  registrationDeadline: string;
  maxPlayers: number;
  currentPlayers?: number;
  status: 'REGISTRATION_OPEN' | 'IN_PROGRESS' | 'COMPLETED';
  skillLevel?: SkillLevel;
  ageGroup?: AgeGroup;
  location?: string;
  locationName?: string; // For backward compatibility
  latitude?: number;
  longitude?: number;
  participants?: TournamentParticipant[];
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  isPublic?: boolean;
}

export interface TournamentParticipant {
  id: string;
  userId: string;
  tournamentId: string;
  joinedAt: string;
  user?: {
    id: string;
    username: string;
    email: string;
  };
}

// Tournament Card Configuration
export const CARD_VARIANTS: Record<TournamentCardVariant, CardVariantConfig> = {
  upcoming: {
    icon: 'trophy',
    iconColor: '#FFD700',
    textLines: [
      { key: 'title', style: 'title' },
      { key: 'players', style: 'subtitle' },
      { key: 'date', style: 'info' }
    ],
    getButtonConfig: (tournament: any, user: any) => {
      const isParticipant = user && tournament.participants && 
        tournament.participants.some((p: any) => p.userId === user.id);
      const canJoinOrLeave = tournament.status === 'REGISTRATION_OPEN';

      if (!canJoinOrLeave) {
        return {
          text: 'Closed',
          style: 'disabled',
          action: 'disabled'
        };
      }

      return {
        text: isParticipant ? 'Leave' : 'Join',
        style: isParticipant ? 'secondary' : 'primary',
        action: isParticipant ? 'leave' : 'join'
      };
    }
  },
  active: {
    icon: 'trophy',
    iconColor: '#FFD700',
    textLines: [
      { key: 'title', style: 'title' },
      { key: 'round', style: 'subtitle' },
      { key: 'nextMatch', style: 'info' }
    ],
    getButtonConfig: (tournament: any, user: any) => {
      return {
        text: 'Bracket',
        style: 'primary',
        action: 'viewBracket'
      };
    }
  },
  finished: {
    icon: 'trophy',
    iconColor: '#FFD700',
    textLines: [
      { key: 'title', style: 'title' },
      { key: 'position', style: 'subtitle' },
      { key: 'completed', style: 'info' }
    ],
    getButtonConfig: (tournament: any, user: any) => {
      return {
        text: 'Results',
        style: 'primary',
        action: 'viewResults'
      };
    }
  },
  created: {
    icon: 'trophy',
    iconColor: '#FFD700',
    textLines: [
      { key: 'title', style: 'title' },
      { key: 'players', style: 'subtitle' },
      { key: 'date', style: 'info' }
    ],
    getButtonConfig: (tournament: any, user: any) => {
      return {
        text: 'Edit',
        style: 'primary',
        action: 'edit'
      };
    }
  }
}; 