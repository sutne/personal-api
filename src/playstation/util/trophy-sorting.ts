import { compareDate } from '../../util';
import type { CompleteTrophy, Trophy } from '../types';

/** Sorts by game title in alphabetical order  */
export function compareTrophyGame(a: CompleteTrophy, b: CompleteTrophy): number {
  return a.game.name.localeCompare(b.game.name);
}

/** Sorts by group id in ascending order, id=0 first etc. */
export function compareTrophyGroup(a: CompleteTrophy, b: CompleteTrophy): number {
  return a.group.id - b.group.id;
}

/** Sorts by the game-defined order, id=1 first etc. */
export function compareTrophyDefaultOrder(a: Trophy, b: Trophy): number {
  return a.id - b.id;
}

/** Sorts so most common trophy, highest earned percentage, is first */
export function compareTrophyRarity(a: Trophy, b: Trophy): number {
  const rarityDiff = Number(b.rarity) - Number(a.rarity);
  if (Math.abs(rarityDiff) < 0.099) return 0;
  return rarityDiff;
}

/** Compare based on earned time, most recent first */
export function compareTrophyEarnedTime(a: Trophy, b: Trophy): number {
  const timeDiff = compareDate(a.earnedAt, b.earnedAt);
  if (Math.abs(timeDiff) < 1000 * 30) return 0; // ignore less than 30s difference
  return timeDiff;
}

/** Sorts common grade first: bronze - ... - (hidden, only for unearned) - platinum -  */
export function compareTrophyType(a: Trophy, b: Trophy): number {
  const typeValues = {
    bronze: 1,
    silver: 2,
    gold: 3,
    hidden: 4,
    platinum: 5,
  };
  const typeA = a.isHidden && !a.isEarned ? 'hidden' : a.type;
  const typeB = b.isHidden && !b.isEarned ? 'hidden' : b.type;
  return typeValues[typeA] - typeValues[typeB];
}

/** Sorts trophies based on their progress percentage, lowest first */
export function compareTrophyProgress(a: Trophy, b: Trophy): number {
  const aProgress = (a.progress?.achieved || 0) / (a.progress?.target || 1);
  const bProgress = (b.progress?.achieved || 0) / (b.progress?.target || 1);
  const progressDiff = aProgress - bProgress;
  if (Math.abs(progressDiff) < 0.001) return 0;
  return progressDiff;
}

type TrophyComparator = { func: (a: Trophy, b: Trophy) => number; reverse?: boolean };
/** sort trophies based on custom set of comparators performed in order. */
export function compareTrophies(
  a: Trophy,
  b: Trophy,
  comparators: TrophyComparator[],
): number {
  for (const { func, reverse } of comparators) {
    const diff = func(a, b);
    if (diff !== 0) return (reverse ? -1 : 1) * diff;
  }
  return 0;
}
