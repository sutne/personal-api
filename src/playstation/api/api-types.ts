export type apiEarnedTrophy = {
  trophyId: number;
  trophyHidden: boolean;
  earned: boolean;
  trophyType: string;
  trophyRare: 0 | 1 | 2 | 3;
  trophyEarnedRate: string;
};

export type apiEarnedList = {
  hasTrophyGroups: boolean;
  trophySetVersion: string;
  lastUpdatedDateTime: string;
  trophies: apiEarnedTrophy[];
  rarestTrophies: apiEarnedTrophy[];
  totalItemCount: number;
};

export type apiGameTrophy = {
  trophyId: number;
  trophyHidden: boolean;
  trophyType: string;
  trophyName: string;
  trophyDetail: string;
  trophyIconUrl: string;
  trophyGroupId: string;
};

export type apiGameList = {
  trophySetVersion: string;
  hasTrophyGroups: boolean;
  trophies: apiGameTrophy[];
  totalItemCount: number;
};
