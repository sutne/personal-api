import { ProfileFromUserNameResponse } from 'psn-api';
import { TrophySummary } from './types';

const TrophyPoints: Map<string, number> = new Map([
  ['bronze', 15],
  ['silver', 30],
  ['gold', 90],
  ['platinum', 300],
]);

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

export function calculateTrophyPoints(summary: TrophySummary): number {
  let totalPoints = 0;
  Object.entries(summary.earned).forEach((trophy) => {
    const [type, count] = trophy;
    const trophyPoints = TrophyPoints.get(type);
    if (!trophyPoints) throw new Error(`Invalid trophy type: ${type}`);
    totalPoints += count * trophyPoints;
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

export function combineTrophies(
  account1: ProfileFromUserNameResponse,
  account2: ProfileFromUserNameResponse,
): TrophySummary {
  return {
    level: 0,
    earned: {
      bronze:
        account1.profile.trophySummary.earnedTrophies.bronze +
        account2.profile.trophySummary.earnedTrophies.bronze,
      silver:
        account1.profile.trophySummary.earnedTrophies.silver +
        account2.profile.trophySummary.earnedTrophies.silver,
      gold:
        account1.profile.trophySummary.earnedTrophies.gold +
        account2.profile.trophySummary.earnedTrophies.gold,
      platinum:
        account1.profile.trophySummary.earnedTrophies.platinum +
        account2.profile.trophySummary.earnedTrophies.platinum,
    },
  };
}
