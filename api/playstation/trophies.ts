import type { VercelRequest, VercelResponse } from '@vercel/node';

import { getGames } from '../../src/playstation/util/api/game-list';
import { getTrophyGroups } from '../../src/playstation/util/api/trophy-list';
import { TrophyGame } from '../../src/playstation/types';
import { cacheControl, compareDate } from '../../src/util';

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
    const platform = req.query.platform as string;
    const groups = await getTrophyGroups(id, platform);
    response = groups;
  } else {
    // TrophyGame[]
    // returns all games with their trophy overview
    const games = await getGames();
    const sorted = games.sort((a, b) =>
      compareDate(a.lastUpdatedDateTime, b.lastUpdatedDateTime),
    );
    response = sorted.map((game) => {
      const trophyGame: TrophyGame = {
        id: game.npCommunicationId,
        title: game.trophyTitleName,
        image: game.trophyTitleIconUrl,
        platform: game.trophyTitlePlatform,
        trophyCount: game.definedTrophies,
        earnedCount: game.earnedTrophies,
        progress: game.progress,
      };
      return trophyGame;
    });
  }

  return res
    .status(200)
    .setHeader('Cache-Control', cacheControl({ hours: 1 }))
    .send(response);
}
