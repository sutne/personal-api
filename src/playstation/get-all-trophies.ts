import type { TrophyTitle } from 'psn-api';
import { compareDate } from '../util';
import type { CompleteTrophy, Trophy } from './types';
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
    if (a.isEarned && b.isEarned) return compareEarnedTrophy(a, b);
    if (!a.isEarned && !b.isEarned) return compareUnearnedTrophy(a, b);
    return Number(b.isEarned) - Number(a.isEarned);
  });
  return allTrophies;
}

function compareEarnedTrophy(a: CompleteTrophy, b: CompleteTrophy) {
  if (!a.earnedAt && !b.earnedAt) {
    // both trophies are missing timestamps, so no way to compare them that way
    const gameDiff = a.game.name.localeCompare(b.game.name);
    if (gameDiff) return gameDiff;
    return a.id - b.id; // id in reverse order (first id comes last, assumed to have been achieved first)
  }
  const earnedDiff = compareDate(a.earnedAt, b.earnedAt);
  if (earnedDiff !== 0) return earnedDiff;
  const rarityDiff = Number(a.rarity) - Number(b.rarity);
  if (Math.abs(rarityDiff) > 0.09) return rarityDiff;
  return compareTrophyType(a, b);
}

function compareUnearnedTrophy(a: CompleteTrophy, b: CompleteTrophy) {
  const progressDiff =
    (a.progress?.achieved ?? 0 / a.progress?.target ?? 1) -
    (b.progress?.achieved ?? 0 / b.progress?.target ?? 1);
  if (Math.abs(progressDiff) > 0.0001) return progressDiff;
  const rarityDiff = Number(b.rarity) - Number(a.rarity);
  if (Math.abs(rarityDiff) > 0.09) return rarityDiff;
  return compareTrophyType(b, a);
}

function compareTrophyType(a: Trophy, b: Trophy) {
  const typeValues = {
    platinum: 0,
    gold: 1,
    silver: 2,
    bronze: 3,
  };
  const hideA = a.isHidden && !a.isEarned;
  const hideB = b.isHidden && !b.isEarned;
  if (hideA && hideB) return 0;
  if (hideA) return 1;
  if (hideB) return -1;
  return typeValues[a.type] - typeValues[b.type];
}
