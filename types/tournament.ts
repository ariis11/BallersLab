export type SkillLevel = 'ALL_LEVELS' | 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'PROFESSIONAL';

export interface TournamentFormData {
  title: string;
  description: string;
  locationName: string;
  latitude?: number;
  longitude?: number;
  maxPlayers: string;
  skillLevel: SkillLevel;
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