import { ProfileFromUserNameResponse } from 'psn-api';
import { TrophyCount, TrophySummary } from '../types';
import * as psn from 'psn-api';

export const rarityMap: Record<psn.TrophyRarity, string> = {
  [psn.TrophyRarity.VeryRare]: 'Very Rare',
  [psn.TrophyRarity.UltraRare]: 'Ultra Rare',
  [psn.TrophyRarity.Rare]: 'Rare',
  [psn.TrophyRarity.Common]: 'Common',
};

const TrophyPoints: Record<string, number> = {
  ['bronze']: 15,
  ['silver']: 30,
  ['gold']: 90,
  ['platinum']: 300,
};

function pointsToNextLevel(level: number): number {
  if (level < 100) return 60;
  if (level < 200) return 90;
  if (level < 300) return 450;
  if (level < 400) return 900;
  if (level < 500) return 1350;
  if (level < 600) return 1800;
  if (level < 700) return 2250;
  if (level < 800) return 2700;
  if (level < 900) return 3150;
  return 3600;
}

export function getTrophyPoints(counts: TrophyCount): number {
  let totalPoints = 0;
  Object.entries(counts).forEach((trophy) => {
    const [type, count] = trophy;
    totalPoints += count * TrophyPoints[type];
  });
  return totalPoints;
}

export function getTrophyLevel(trophyPoints: number): number {
  let level = 0;
  let remainingPoints = trophyPoints;
  while (remainingPoints > 0 || level === 999) {
    const required = pointsToNextLevel(level);
    if (required > remainingPoints) break;
    remainingPoints -= required;
    level += 1;
  }
  return level;
}
