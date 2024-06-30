import { TrophyCount } from '../types';

export function maxCounts(a: TrophyCount, b: TrophyCount): TrophyCount {
  return {
    bronze: Math.max(a.bronze, b.bronze),
    silver: Math.max(a.silver, b.silver),
    gold: Math.max(a.gold, b.gold),
    platinum: Math.max(a.platinum, b.platinum),
  };
}
