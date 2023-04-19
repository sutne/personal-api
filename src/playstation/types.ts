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

export type RecentGame = {
  title: string;
  image: string;
  platform: string;
  lastPlayedAt: string;
};

export type TrophyGame = {
  id: string;
  title: string;
  image: string;
  platform: string;
  trophyCount: TrophyCount;
  earnedCount: TrophyCount;
  progress: number;
};

export type TrophyGroup = {
  name: string;
  icon: string;
  trophyCount: TrophyCount;
  earnedCount: TrophyCount;
  progress: number;
  trophies: Trophy[];
};

export type Trophy = {
  id: number;
  title: string;
  description: string;
  isEarned: boolean;
  isHidden: boolean;
  icon: string;
  earnedAt: string | undefined;
  type: TrophyType;
  /** % of players who have earned this trophy */
  rarity: string | undefined;
  progress: string | undefined;
};
