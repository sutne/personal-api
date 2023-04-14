import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAccountId, getGameList } from '../../src/playstation/middleware';
import { Game } from '../../src/playstation/types';
import * as psn from 'psn-api';

export default async function (req: VercelRequest, res: VercelResponse) {
  let response: any = null;

  if (req.query.game) {
    response = {
      error: 'Extracting single game trophy info not supported yet',
    };
  } else {
    const sutne = await getGameList();
    const sivvi = await getGameList('Sivvi__');
    response = mergeGameLists(sutne, sivvi);
  }

  return res
    .status(200)
    .setHeader('Cache-Control', `max-age=0, public, s-maxage=${3 * 60 * 60}`)
    .send(response);
}

function mergeGameLists(sutne: psn.TrophyTitle[], sivvi: psn.TrophyTitle[]) {
  const games = [...sutne];

  for (const game of sivvi) {
    const duplicate = sutne.find(
      (g) => g.npCommunicationId === game.npCommunicationId,
    );
    if (duplicate) {
      duplicate.earnedTrophies = game.earnedTrophies;
      duplicate.progress = game.progress;
    } else {
      games.push(game);
    }
  }

  return games;
}
