import type { VercelRequest, VercelResponse } from '@vercel/node';

import { getRecentlyPlayedGames } from '../../src/playstation/middleware';
import { RecentGame } from '../../src/playstation/types';
import { cacheControl } from '../../src/util';

export default async function (req: VercelRequest, res: VercelResponse) {
  const games = await getRecentlyPlayedGames();

  const filtered: RecentGame[] = games.map((game) => {
    return {
      title: game.name,
      platform: game.platform,
      image: game.image.url,
      lastPlayedAt: game.lastPlayedDateTime,
    };
  });
  return res
    .status(200)
    .setHeader('Cache-Control', cacheControl({ hours: 1 }))
    .send(filtered);
}
