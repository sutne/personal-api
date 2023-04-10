import type { VercelRequest, VercelResponse } from '@vercel/node';

import { RecentlyPlayedGame, getRecentlyPlayedGames } from 'psn-api';

import { getAuth } from '../../src/playstation/middleware';
import { GameType } from '../../src/playstation/types';

export default async function (req: VercelRequest, res: VercelResponse) {
  const auth = await getAuth();
  const response = await getRecentlyPlayedGames(auth, {
    limit: 12,
    categories: ['ps4_game', 'ps5_native_game'],
  });

  const games = response.data.gameLibraryTitlesRetrieve.games;
  console.log({ games });
  const filtered = games.map((game) => filteredGame(game));

  return res
    .status(200)
    .setHeader('Cache-Control', `max-age=0, public, s-maxage=${3 * 60 * 60}`)
    .send(filtered);
}

function filteredGame(game: RecentlyPlayedGame): GameType {
  return {
    title: game.name,
    image: game.image.url,
    platform: game.platform,
    lastPlayedAt: game.lastPlayedDateTime,
  };
}
