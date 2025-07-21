export interface PlayerData {
  id: string;
  name: string;
  avatar?: string;
}

export interface ScoreSubmission {
  score1: number;
  score2: number;
  submittedAt: string;
}

export interface MatchData {
  id: string;
  roundNumber: number;
  matchNumber: number;
  player1: PlayerData | null;
  player2: PlayerData | null;
  status: string;
  winnerId: string | null;
  confirmedScore1?: number;
  confirmedScore2?: number;
  player1Submission?: ScoreSubmission;
  player2Submission?: ScoreSubmission;
}

export interface RoundData {
  roundNumber: number;
  roundName: string;
  matches: MatchData[];
}

export interface BracketData {
  id: string;
  tournamentId: string;
  totalRounds: number;
  totalPlayers: number;
  rounds: RoundData[];
}

export interface TournamentBracketProps {
  bracketData: BracketData | null;
  onScoreSubmit: (matchId: string, score1: number, score2: number) => Promise<void>;
}

export interface TournamentBracketCardProps {
  match: MatchData;
  onScoreSubmit: (matchId: string, score1: number, score2: number) => Promise<void>;
} 