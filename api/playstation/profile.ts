import type { VercelRequest, VercelResponse } from '@vercel/node';

import { getProfile } from '../../src/playstation/middleware';
import {
  calculateTrophyPoints,
  combineTrophies,
  getTrophyLevel,
} from '../../src/playstation/trophy-calculation';

export default async function (req: VercelRequest, res: VercelResponse) {
  // I Have 2 accounts so merge the trophy stats for both
  // will filter later so there are no overlapping trophies for games (theres only like 2)
  const response1 = await getProfile('Sutne_');
  const response2 = await getProfile('Sivvi__');

  const combined = combineTrophies(response1, response2);
  const trophyPoints = calculateTrophyPoints(combined);
  const fixedTrophyLevel = getTrophyLevel(trophyPoints);

  const profile = {
    onlineId: response1.profile.onlineId,
    accountId: response1.profile.accountId,
    avatar: response1.profile.avatarUrls[0].avatarUrl,
    trophySummary: {
      level: fixedTrophyLevel,
      earned: combined.earned,
    },
  };

  return res
    .status(200)
    .setHeader('Cache-Control', `max-age=0, public, s-maxage=${3 * 60 * 60}`)
    .send(profile);
}
