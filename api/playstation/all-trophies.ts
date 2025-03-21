import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAllTrophies } from '../../src/playstation/get-all-trophies';
import { cacheControl } from '../../src/util';

/**
 * @returns all trophies as a Trophy[] across all games, earned or not.
 */
export default async function (req: VercelRequest, res: VercelResponse) {
  const allTrophies = await getAllTrophies();
  return res
    .status(200)
    .setHeader('Cache-Control', cacheControl({ minutes: 30 }))
    .send(allTrophies);
}
