export interface LeaderboardUser {
  rank: number;
  userId: string;
  name: string;
  surname: string;
  points: number;
  tournamentsPlayed: number;
  avatar?: string;
}

export interface LeaderboardResponse {
  users: LeaderboardUser[];
  userRank: number | null;
  totalUsers: number;
  pagination: {
    page: number;
    size: number;
    totalPages: number;
    hasMore: boolean;
  };
} 