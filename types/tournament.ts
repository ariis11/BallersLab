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
  startDateTime: Date;
  registrationDeadline: Date;
}

export interface CreateTournamentModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (tournamentData: TournamentFormData) => void;
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