import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getRecentlyPlayedGames } from '../../src/playstation/middleware';
import type { RecentGame } from '../../src/playstation/types';
import { platform } from '../../src/playstation/util/platforms';
import { cacheControl } from '../../src/util';

export default async function (_req: VercelRequest, res: VercelResponse) {
  const games = await getRecentlyPlayedGames();

  const filtered: RecentGame[] = games.map((game) => {
    return {
      title: game.name,
      platform: platform(game.platform),
      image: game.image.url,
      lastPlayedAt: game.lastPlayedDateTime,
    };
  });
  return res
    .status(200)
    .setHeader('Cache-Control', cacheControl({ hours: 1 }))
    .send(filtered);
}
