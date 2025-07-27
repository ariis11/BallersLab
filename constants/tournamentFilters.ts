export const FILTER_OPTIONS = {
  status: [
    { label: 'All', value: null },
    { label: 'Registration Open', value: 'REGISTRATION_OPEN' },
    { label: 'In Progress', value: 'IN_PROGRESS' },
    { label: 'Completed', value: 'COMPLETED' }
  ],
  skillLevel: [
    { label: 'All', value: null },
    { label: 'All Levels', value: 'ALL_LEVELS' },
    { label: 'Beginner', value: 'BEGINNER' },
    { label: 'Intermediate', value: 'INTERMEDIATE' },
    { label: 'Advanced', value: 'ADVANCED' },
    { label: 'Professional', value: 'PROFESSIONAL' }
  ],
  ageGroup: [
    { label: 'All', value: null },
    { label: 'U12', value: 'U12' },
    { label: 'U14', value: 'U14' },
    { label: 'U16', value: 'U16' },
    { label: 'U18', value: 'U18' },
    { label: '18+', value: 'OVER_18' },
    { label: 'All Ages', value: 'ALL_AGES' }
  ]
};

export const SORT_OPTIONS = [
  { label: 'Name', value: 'title' },
  { label: 'Start Date', value: 'startDate' },
  { label: 'Max Players', value: 'maxPlayers' },
  { label: 'Spots Left', value: 'spotsLeft' },
  { label: 'Registration Deadline', value: 'registrationDeadline' }
];

export const DISTANCE_OPTIONS = [
  { label: 'Any Distance', value: null },
  { label: 'Within 5km', value: 5 },
  { label: 'Within 10km', value: 10 },
  { label: 'Within 25km', value: 25 },
  { label: 'Within 50km', value: 50 }
]; 