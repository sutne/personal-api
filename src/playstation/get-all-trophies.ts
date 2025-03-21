import type { TrophyTitle } from 'psn-api';
import { compareDate } from '../util';
import type { Trophy } from './types';
import { getGames } from './util/api/game-list';
import { getTrophyGroups } from './util/api/trophy-list';
import { platform } from './util/platforms';

/** returns all trophies across all games as Trophy[], wether they are earned or not */
export async function getAllTrophies(): Promise<Trophy[]> {
  const trophyTitles: TrophyTitle[] = await getGames();
  const allGameTrophies: Trophy[][] = await Promise.all(
    trophyTitles.map(async (trophyTitle) => {
      const groups = await getTrophyGroups(
        trophyTitle.npCommunicationId,
        platform(trophyTitle.trophyTitlePlatform),
      );
      const trophies: Trophy[] = groups.reduce(
        (trophies, group) => trophies.concat(group.trophies),
        [],
      );
      return trophies;
    }),
  );
  const allTrophies = allGameTrophies.flat().sort((a, b) => {
    const earnedDiff = compareDate(a.earnedAt, b.earnedAt);
    if (earnedDiff !== 0) return earnedDiff;
    return Number(b.rarity) - Number(a.rarity);
  });
  return allTrophies;
}
