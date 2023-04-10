export type GameType = {
  platform: string;
  title: string;
  image: string;
  lastPlayedAt: string;
};

export type ProfileType = {
  onlineId: string;
  accountId: string;
  avatar: string;
  trophySummary: TrophySummary;
};

export type TrophySummary = {
  level: number;
  earned: {
    bronze: number;
    silver: number;
    gold: number;
    platinum: number;
  };
};
