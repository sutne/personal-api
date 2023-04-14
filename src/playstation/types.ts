export type Profile = {
  onlineId: string;
  accountId: string;
  avatar: string;
  trophySummary: TrophySummary;
};

export type TrophySummary = {
  level: number;
  earned: TrophyCount;
};

export type TrophyType = 'bronze' | 'silver' | 'gold' | 'platinum';
export type TrophyCount = {
  bronze: number;
  silver: number;
  gold: number;
  platinum: number;
};

export type Game = RecentGame & {
  trophyCount: TrophyCount;
  earnedCount: TrophyCount;
  trophyGroups: TrophyGroup[];
};

export type TrophyGroup = {
  id: string;
  name: string;
  image: string;
  trophyCount: TrophyCount;
  earnedCount: TrophyCount;
  trophies: Trophy[];
};

export type Trophy = {
  id: string;
  title: string;
  description: string;
  isEarned: boolean;
  isHidden: boolean;
  image: string;
  earnedAt: string;
  type: TrophyType;
  /** % of players who have earned this trophy */
  rarity: string;
  progress: number;
};

export type RecentGame = {
  id: string;
  title: string;
  image: string;
  platform: string;
  lastPlayedAt: string;
};
