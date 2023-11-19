import type { VercelRequest, VercelResponse } from '@vercel/node';

import { getProfile } from '../../src/playstation/middleware';
import {
  getTrophyPoints,
  getTrophyLevel,
} from '../../src/playstation/util/trophy-calculation';
import { TrophyCount } from '../../src/playstation/types';
import { cacheControl } from '../../src/util';

export default async function (req: VercelRequest, res: VercelResponse) {
  const [primary, secondary] = await Promise.all([
    getProfile('Sutne_'),
    getProfile('Sivvi__'),
  ]);
  const combinedTrophyCount = combineCounts(
    primary.profile.trophySummary.earnedTrophies,
    secondary.profile.trophySummary.earnedTrophies,
  );
  const accountLevel = getTrophyLevel(getTrophyPoints(combinedTrophyCount));

  const profile = {
    onlineId: primary.profile.onlineId,
    avatar: primary.profile.avatarUrls[0].avatarUrl,
    trophySummary: {
      level: accountLevel,
      earned: combinedTrophyCount,
    },
  };

  return res
    .status(200)
    .setHeader('Cache-Control', cacheControl({ hours: 1 }))
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
