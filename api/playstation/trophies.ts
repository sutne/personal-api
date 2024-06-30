import type { VercelRequest, VercelResponse } from '@vercel/node';

import { Platform, PlatformInfo } from '../../src/playstation/types';
import { cacheControl } from '../../src/util';
import { getTrophiesForSingleTitle } from '../../src/playstation/get-trophies-for-single-title';
import { getOverviewForAllGames } from '../../src/playstation/get-overview-for-all-games';

/**
 * @returns either trophy overview for a game, or all trophies associated with
 * a game in their respective groups (Base Game + DLC)
 */
export default async function (req: VercelRequest, res: VercelResponse) {
  const ids = (
    typeof req.query.id === 'string' ? [req.query.id] : req.query.id
  ) as string[];
  const platforms = (
    typeof req.query.platform === 'string'
      ? [req.query.platform]
      : req.query.platform
  ) as Platform[];

  if (!ids && !platforms) {
    return res
      .status(200)
      .setHeader('Cache-Control', cacheControl({ hours: 12 }))
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
      .send(await getTrophiesForSingleTitle(platformInfoArr));
  }
}
