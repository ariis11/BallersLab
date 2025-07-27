import { useState } from 'react';
import { FilterState } from '../types/tournament';

export const useTournamentFilters = () => {
  const [filters, setFilters] = useState<FilterState>({
    status: null,
    skillLevel: null,
    ageGroup: null,
    startDateFrom: null,
    startDateTo: null,
    maxPlayersFrom: null,
    maxPlayersTo: null,
    spotsLeftFrom: null,
    spotsLeftTo: null,
    registrationDeadlineFrom: null,
    registrationDeadlineTo: null,
    distance: null,
  });

  const updateFilter = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      status: null,
      skillLevel: null,
      ageGroup: null,
      startDateFrom: null,
      startDateTo: null,
      maxPlayersFrom: null,
      maxPlayersTo: null,
      spotsLeftFrom: null,
      spotsLeftTo: null,
      registrationDeadlineFrom: null,
      registrationDeadlineTo: null,
      distance: null,
    });
  };

  const hasActiveFilters = () => {
    return Object.values(filters).some(value => value !== null);
  };

  return {
    filters,
    updateFilter,
    clearFilters,
    hasActiveFilters
  };
}; 