import type { TrophyCount } from '../types';

const TrophyPoints = {
  bronze: 15,
  silver: 30,
  gold: 90,
  platinum: 300,
} as const;

function pointsToNextLevel(currentLevel: number): number {
  if (currentLevel < 100) return 60;
  if (currentLevel < 200) return 90;
  if (currentLevel < 300) return 450;
  if (currentLevel < 400) return 900;
  if (currentLevel < 500) return 1350;
  if (currentLevel < 600) return 1800;
  if (currentLevel < 700) return 2250;
  if (currentLevel < 800) return 2700;
  if (currentLevel < 900) return 3150;
  return 3600;
}

export function getTrophyPoints(counts: TrophyCount): number {
  return Object.entries(counts).reduce((sum, trophy) => {
    const [type, count] = trophy;
    return sum + TrophyPoints[type] * count;
  }, 0);
}

export function getTrophyLevel(trophyPoints: number): number {
  let level = 0;
  let remainingPoints = trophyPoints;
  while (remainingPoints > 0 && level < 999) {
    const requiredPoints = pointsToNextLevel(level);
    if (remainingPoints < requiredPoints) break;
    remainingPoints -= requiredPoints;
    level += 1;
  }
  return level;
}

/**
 * Find percentage of earned trophies, weighted by their type and
 * ignoring Platinums
 */
export function getTrophyCountProgress(
  earned: TrophyCount,
  defined: TrophyCount,
): number {
  const earnedPoints = getTrophyPoints({ ...earned, platinum: 0 });
  const availablePoints = getTrophyPoints({ ...defined, platinum: 0 });
  const percentage = (100 * earnedPoints) / availablePoints;
  return Math.round(percentage);
}
