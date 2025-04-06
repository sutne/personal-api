import type { TrophyTitle } from 'psn-api';
import type { CompleteTrophy } from './types';
import { getGames } from './util/api/game-list';
import { getTrophyGroups } from './util/api/trophy-list';
import { platform } from './util/platforms';
import {
  compareTrophies,
  compareTrophyDefaultOrder,
  compareTrophyEarnedTime,
  compareTrophyGame,
  compareTrophyGroup,
  compareTrophyProgress,
  compareTrophyRarity,
  compareTrophyType,
} from './util/trophy-sorting';

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
    if (a.isEarned && b.isEarned) return compareEarnedTrophies(a, b);
    if (!a.isEarned && !b.isEarned) return compareUnearnedTrophies(a, b);
    return Number(b.isEarned) - Number(a.isEarned); // earned trophies first
  });
  return allTrophies;
}

function compareEarnedTrophies(a: CompleteTrophy, b: CompleteTrophy) {
  if (!a.earnedAt && !b.earnedAt) {
    // both are missing timestamps, have to assume when they were earned
    return compareTrophies(a, b, [
      { func: compareTrophyGame },
      { func: compareTrophyGroup, reverse: true },
      { func: compareTrophyDefaultOrder, reverse: true },
    ]);
  }
  return compareTrophies(a, b, [
    { func: compareTrophyEarnedTime },
    { func: compareTrophyGame },
    { func: compareTrophyGroup, reverse: true },
    { func: compareTrophyType, reverse: true },
    { func: compareTrophyRarity, reverse: true },
    { func: compareTrophyDefaultOrder, reverse: true },
  ]);
}

function compareUnearnedTrophies(a: CompleteTrophy, b: CompleteTrophy) {
  return compareTrophies(a, b, [
    { func: compareTrophyProgress },
    { func: compareTrophyRarity },
    { func: compareTrophyGame },
    { func: compareTrophyGroup },
    { func: compareTrophyType },
    { func: compareTrophyDefaultOrder },
  ]);
}
