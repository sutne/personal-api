import type { VercelRequest, VercelResponse } from '@vercel/node';

import { getGames } from '../../src/playstation/util/api/game-list';
import { getTrophyGroups } from '../../src/playstation/util/api/trophy-list';
import { TrophyGame } from '../../src/playstation/types';

export default async function (req: VercelRequest, res: VercelResponse) {
  let response: any = undefined;

  if (req.query.game && req.query.platform) {
    const id = req.query.game as string;
    const platform = req.query.platform as string;
    const groups = await getTrophyGroups(id, platform);
    // TrophyGroup[]
    response = groups;
  } else {
    const games = await getGames();
    // TrophyGame[]
    response = games.map((game) => {
      const filtered: TrophyGame = {
        id: game.npCommunicationId,
        title: game.trophyTitleName,
        image: game.trophyTitleIconUrl,
        platform: game.trophyTitlePlatform,
        trophyCount: game.definedTrophies,
        earnedCount: game.earnedTrophies,
        progress: game.progress,
      };
      return filtered;
    });
  }

  return res
    .status(200)
    .setHeader('Cache-Control', `max-age=0, public, s-maxage=${3 * 60 * 60}`)
    .send(response);
}
