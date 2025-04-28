import type { TrophyTitle } from 'psn-api';
import type { CompleteTrophy, Platform } from './types';
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

type IgnoreRule = {
  name: string;
  platforms: Platform[];
};
/**
 * manual list of games where all my remaining trophies are
 * unobtainable (servers are no longer online, game is no longer playable),
 * or if i for other reasons am never going to be getting those trophies.
 */
const IGNORED_UNEARNED_IN_GAMES: IgnoreRule[] = [
  { name: 'Burnout™ Paradise', platforms: ['PS3'] }, // online servers shut down, not getting remaining single player ones
  { name: 'Battlefield: Bad Company™ 2', platforms: ['PS3'] }, // online servers shut down, DLC no longer purchasable
  { name: 'Need for Speed™ Most Wanted', platforms: ['PS3'] }, // online servers shut down
  { name: 'Grand Theft Auto V', platforms: ['PS3'] }, // online servers shut down
  { name: 'Fall Guys', platforms: ['PS4'] }, // game is no longer playable (replaced when bought by Epic)
];

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
  const allTrophies = allGameTrophies
    .flat()
    .filter((trophy) => {
      if (!trophy.isEarned) {
        for (const rule of IGNORED_UNEARNED_IN_GAMES) {
          if (trophy.game.name === rule.name) {
            return !rule.platforms.includes(trophy.game.platform);
          }
        }
      }
      return true;
    })
    .sort((a, b) => {
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
    { func: compareTrophyProgress, reverse: true },
    { func: compareTrophyRarity },
    { func: compareTrophyGame },
    { func: compareTrophyGroup },
    { func: compareTrophyType },
    { func: compareTrophyDefaultOrder },
  ]);
}
