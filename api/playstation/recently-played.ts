import type { VercelRequest, VercelResponse } from '@vercel/node';

import * as psn from 'psn-api';

import { getRecentlyPlayedGames } from '../../src/playstation/middleware';
import { RecentGame } from '../../src/playstation/types';

export default async function (req: VercelRequest, res: VercelResponse) {
  const games = await getRecentlyPlayedGames();

  const filtered: RecentGame[] = games.map((game) => {
    return {
      id: game.titleId,
      title: game.name,
      platform: game.platform,
      image: game.image.url,
      lastPlayedAt: game.lastPlayedDateTime,
    };
  });
  return res
    .status(200)
    .setHeader('Cache-Control', `max-age=0, public, s-maxage=${3 * 60 * 60}`)
    .send(filtered);
}
