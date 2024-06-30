import type { VercelRequest, VercelResponse } from '@vercel/node';

import { getGames } from '../../src/playstation/util/api/game-list';
import { getTrophyGroups } from '../../src/playstation/util/api/trophy-list';
import { Platform, Trophy, TrophyGame } from '../../src/playstation/types';
import { cacheControl, compareDate } from '../../src/util';
import { TrophyTitle } from 'psn-api';
import { platform } from '../../src/playstation/util/platforms';

/**
 * @returns either trophy overview for a game, or all trophies associated with
 * a game in their respective groups (Base Game + DLC)
 */
export default async function (req: VercelRequest, res: VercelResponse) {
  let response: any = undefined;

  const reqSingleGame = req.query.game && req.query.platform;
  if (reqSingleGame) {
    // TrophyGroup[]
    // returns all trophies (TrophyGroups) for a single game
    const id = req.query.game as string;
    const platform = req.query.platform as Platform;
    const groups = await getTrophyGroups(id, platform);
    response = groups;
  } else {
    // TrophyGame[]
    // returns all games with their trophy overview
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
    response = sorted.map((game) => {
      const trophyGame: TrophyGame = {
        id: game.npCommunicationId,
        title: game.trophyTitleName,
        image: game.trophyTitleIconUrl,
        platforms: [platform(game.trophyTitlePlatform)],
        trophyCount: game.definedTrophies,
        earnedCount: game.earnedTrophies,
        progress: game.progress,
        firstTrophyEarnedAt: game.firstUpdatedDateTime,
        lastTrophyEarnedAt: game.lastUpdatedDateTime,
      };
      return trophyGame;
    });
  }

  return res
    .status(200)
    .setHeader('Cache-Control', cacheControl({ hours: 1 }))
    .send(response);
}
