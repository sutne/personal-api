import type { VercelRequest, VercelResponse } from '@vercel/node';

import { getGames } from '../../src/playstation/util/api/game-list';
import { getTrophyGroups } from '../../src/playstation/util/api/trophy-list';
import {
  Platform,
  PlatformInfo,
  Trophy,
  TrophyGame,
  TrophyGroup,
} from '../../src/playstation/types';
import {
  cacheControl,
  compareDate,
  earliestDate,
  latestDate,
} from '../../src/util';
import { TrophyTitle } from 'psn-api';
import { platform } from '../../src/playstation/util/platforms';
import { assert } from 'console';
import { getTrophyCountProgress } from '../../src/playstation/util/trophy-calculation';

/**
 * @returns either trophy overview for a game, or all trophies associated with
 * a game in their respective groups (Base Game + DLC)
 */
export default async function (req: VercelRequest, res: VercelResponse) {
  const ids = (
    typeof req.query.ids === 'string' ? [req.query.ids] : req.query.ids
  ) as string[];
  const platforms = (
    typeof req.query.platforms === 'string'
      ? [req.query.platforms]
      : req.query.platforms
  ) as Platform[];

  if (!ids && !platforms) {
    return res
      .status(200)
      .setHeader('Cache-Control', cacheControl({ minutes: 12 }))
      .send(await getOverviewForAllGames());
  } else {
    if (ids.length !== platforms.length)
      throw new Error('ids: ' + ids + ' must match platforms: ' + platforms);
    const platformInfoArr: PlatformInfo[] = ids.map((id, i) => ({
      id,
      platform: platforms[i],
    }));
    return res
      .status(200)
      .setHeader('Cache-Control', cacheControl({ minutes: 5 }))
      .send(await getTrophiesForGame(platformInfoArr));
  }
}

/** returns all games with their trophy overview as TrophyGame[] */
async function getOverviewForAllGames(): Promise<TrophyGame[]> {
  const games = (await getGames()) as (TrophyTitle & {
    firstUpdatedDateTime?: string;
  })[];

  // Find earliest trophy earned for each game
  await Promise.all(
    games.map(async (game) => {
      const groups = await getTrophyGroups(
        game.npCommunicationId,
        platform(game.trophyTitlePlatform),
      );
      // gather all group trophies to single list
      const trophies = groups.reduce(
        (trophies, group) => trophies.concat(group.trophies),
        [] as Trophy[],
      );

      const earliestTrophy = trophies.reduce((earliest, trophy) => {
        if (!trophy.isEarned) return earliest;
        if (!earliest) return trophy;
        const newIsEarlier =
          compareDate(earliest.earnedAt, trophy.earnedAt) < 0;
        return newIsEarlier ? trophy : earliest;
      }, null as Trophy | null);

      if (earliestTrophy !== null) {
        game.firstUpdatedDateTime = earliestTrophy.earnedAt ?? '';
      }
    }),
  );
  const sorted = games.sort((a, b) => {
    return compareDate(a.lastUpdatedDateTime, b.lastUpdatedDateTime);
  });
  return sorted.map((game) => {
    const platformInfo: PlatformInfo = {
      id: game.npCommunicationId,
      platform: platform(game.trophyTitlePlatform),
    };
    const trophyGame: TrophyGame = {
      platform: [platformInfo],
      title: game.trophyTitleName,
      image: game.trophyTitleIconUrl,
      trophyCount: game.definedTrophies,
      earnedCount: game.earnedTrophies,
      progress: game.progress,
      firstTrophyEarnedAt: game.firstUpdatedDateTime,
      lastTrophyEarnedAt: game.lastUpdatedDateTime,
    };
    return trophyGame;
  });
}

/** returns all trophies (in TrophyGroup[]) for a single game */
async function getTrophiesForGame(
  platformInfo: PlatformInfo[],
): Promise<TrophyGroup[]> {
  const groupsPerPlatform = await Promise.all(
    platformInfo
      .sort((a, b) => b.platform.localeCompare(a.platform)) // Highest number first
      .map((game) => getTrophyGroups(game.id, game.platform)),
  );
  const combinedGroups: TrophyGroup[] = groupsPerPlatform[0];
  for (let i = 1; i < groupsPerPlatform.length; i++) {
    const groups = groupsPerPlatform[i];
    for (const group of groups) {
      const existingGroup = combinedGroups.find((g) => g.id === group.id);
      if (!existingGroup) {
        combinedGroups.push(group);
        continue;
      }
      assert(
        existingGroup.name.trim() === group.name.trim(),
        `Group name mismatch: "${existingGroup.name}" vs "${group.name}"`,
      );
      for (const trophy of group.trophies) {
        const existingTrophy = existingGroup.trophies.find(
          (t) => t.id === trophy.id,
        );
        if (!existingTrophy) {
          existingGroup.trophies.push(trophy);
          existingGroup.trophyCount[trophy.type]++;
          if (trophy.isEarned) {
            existingGroup.earnedCount[trophy.type]++;
          }
          continue;
        }
        if (!trophy.isEarned) continue;
        assert(
          existingTrophy.type === trophy.type,
          `Trophy type mismatch: "${existingTrophy.type}" vs "${trophy.type}"`,
        );
        assert(
          existingTrophy.title.trim() === trophy.title.trim(),
          `Trophy title mismatch: "${existingTrophy.title}" vs "${trophy.title}"`,
        );
        if (!existingTrophy.isEarned) {
          existingTrophy.isEarned = true;
          existingTrophy.earnedAt = trophy.earnedAt;
          existingTrophy.progress = trophy.progress;
          existingGroup.earnedCount[trophy.type]++;
          continue;
        } else {
          if (compareDate(existingTrophy.earnedAt, trophy.earnedAt) < 0) {
            existingTrophy.earnedAt = trophy.earnedAt;
          }
        }
      }
      existingGroup.progress = getTrophyCountProgress(
        existingGroup.earnedCount,
        existingGroup.trophyCount,
      );
    }
  }
  return combinedGroups;
}
