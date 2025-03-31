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

export type Platform = 'PS1' | 'PS2' | 'PS3' | 'PS4' | 'PS5';
export type RecentGame = {
  title: string;
  image: string;
  platform: Platform;
  lastPlayedAt: string;
};

export type PlatformInfo = {
  id: string;
  platform: Platform;
};
export type TrophyGame = {
  platform: PlatformInfo[];
  title: string;
  image: string;
  trophyCount: TrophyCount;
  earnedCount: TrophyCount;
  progress: number;
  firstTrophyEarnedAt?: string;
  lastTrophyEarnedAt?: string;
};

export type TrophyGroup = {
  id: number;
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
  icon: string;
  type: TrophyType;
  isHidden: boolean;
  rarity: string;
  isEarned: boolean;
  earnedAt?: string;
  progress?: {
    achieved: number;
    target: number;
  };
};

export type CompleteTrophy = Trophy & {
  game: {
    id: string;
    name: string;
    icon: string;
    platform: Platform;
  };
  group: {
    id: number;
    name: string;
    icon: string;
  };
};
