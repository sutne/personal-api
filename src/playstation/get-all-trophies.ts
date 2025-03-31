import type { TrophyTitle } from 'psn-api';
import { compareDate } from '../util';
import type { CompleteTrophy } from './types';
import { getGames } from './util/api/game-list';
import { getTrophyGroups } from './util/api/trophy-list';
import { platform } from './util/platforms';

/** returns all trophies across all games as CompleteTrophy[], wether they are earned or not */
export async function getAllTrophies(): Promise<CompleteTrophy[]> {
  const trophyTitles: TrophyTitle[] = await getGames();
  const allGameTrophies: CompleteTrophy[][] = await Promise.all(
    trophyTitles.map(async (trophyTitle) => {
      const groups = await getTrophyGroups(
        trophyTitle.npCommunicationId,
        platform(trophyTitle.trophyTitlePlatform),
      );
      const trophies: CompleteTrophy[] = groups.reduce(
        (trophies, group) =>
          trophies.concat(
            group.trophies.map((trophy) => {
              const complete: CompleteTrophy = {
                ...trophy,
                group: {
                  id: group.id,
                  name: group.name,
                  icon: group.icon,
                },
                game: {
                  id: trophyTitle.npCommunicationId,
                  name: trophyTitle.trophyTitleName,
                  icon: trophyTitle.trophyTitleIconUrl,
                  platform: platform(trophyTitle.trophyTitlePlatform),
                },
              };
              return complete;
            }),
          ),
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
