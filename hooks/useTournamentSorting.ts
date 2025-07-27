import { useState } from 'react';

export type SortOption = 'title' | 'startDate' | 'maxPlayers' | 'spotsLeft' | 'registrationDeadline';
export type SortDirection = 'asc' | 'desc';

export interface SortState {
  field: SortOption;
  direction: SortDirection;
}

export const useTournamentSorting = () => {
  const [sortState, setSortState] = useState<SortState>({
    field: 'startDate',
    direction: 'asc'
  });

  const updateSort = (field: SortOption) => {
    setSortState(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const sortTournaments = (tournaments: any[]) => {
    return [...tournaments].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortState.field) {
        case 'title':
          aValue = a.title?.toLowerCase() || '';
          bValue = b.title?.toLowerCase() || '';
          break;
        case 'startDate':
          aValue = new Date(a.startDate || 0);
          bValue = new Date(b.startDate || 0);
          break;
        case 'maxPlayers':
          aValue = a.maxPlayers || 0;
          bValue = b.maxPlayers || 0;
          break;
        case 'spotsLeft':
          aValue = (a.maxPlayers || 0) - (a.participants?.length || 0);
          bValue = (b.maxPlayers || 0) - (b.participants?.length || 0);
          break;
        case 'registrationDeadline':
          aValue = new Date(a.registrationDeadline || 0);
          bValue = new Date(b.registrationDeadline || 0);
          break;
        default:
          return 0;
      }

      if (aValue < bValue) {
        return sortState.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortState.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  return {
    sortState,
    updateSort,
    sortTournaments
  };
}; 