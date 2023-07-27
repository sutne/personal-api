import type { VercelRequest, VercelResponse } from '@vercel/node';

import { getProfile } from '../../src/playstation/middleware';
import {
  getTrophyPoints,
  getTrophyLevel,
} from '../../src/playstation/util/trophy-calculation';
import { TrophyCount } from '../../src/playstation/types';
import { cacheControl } from '../../src/util';

export default async function (req: VercelRequest, res: VercelResponse) {
  const primary = await getProfile('Sutne_');
  const secondary = await getProfile('Sivvi__');

  const combined = combineCounts(
    primary.profile.trophySummary.earnedTrophies,
    secondary.profile.trophySummary.earnedTrophies,
  );

  const profile = {
    onlineId: primary.profile.onlineId,
    avatar: primary.profile.avatarUrls[0].avatarUrl,
    trophySummary: {
      level: getTrophyLevel(getTrophyPoints(combined)),
      earned: combined,
    },
  };

  return res
    .status(200)
    .setHeader('Cache-Control', cacheControl({ hours: 3 }))
    .send(profile);
}

function combineCounts(a: TrophyCount, b: TrophyCount): TrophyCount {
  return {
    bronze: a.bronze + b.bronze,
    silver: a.silver + b.silver,
    gold: a.gold + b.gold,
    platinum: a.platinum + b.platinum,
  };
}
