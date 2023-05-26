import {
  getEarnedTrophies,
  getGameTrophies,
  getTrophyGroupInfo,
} from '../../middleware';
import { UserThinTrophy } from 'psn-api';
import { Trophy, TrophyGroup } from '../../types';
import assert from 'assert';
import { earliestDate } from '../../../util';
import { getTrophyPoints } from '../trophy-calculation';
import { ACCOUNTS } from '../../config';

export async function getTrophyGroups(id: string, platform: string) {
  const trophiesInfo = await getGameTrophies(id, platform);
  const groupInfo = await getTrophyGroupInfo(id, platform);

  const groups: TrophyGroup[] = [];
  for (const group of groupInfo) {
    // Initialize Group
    groups.push({
      name: group.trophyGroupName,
      icon: group.trophyGroupIconUrl,
      trophyCount: group.definedTrophies,
      earnedCount: {
        bronze: 0,
        silver: 0,
        gold: 0,
        platinum: 0,
      },
      progress: 0,
      trophies: [],
    });
  }

  const accountResults = await Promise.all(
    ACCOUNTS.map((accountId) =>
      getEarnedTrophies(id, platform, accountId).catch(() => []),
    ),
  );
  const accountTrophies: UserThinTrophy[][] = accountResults.filter(
    (list) => list.length > 0,
  );

  for (let i = 0; i < trophiesInfo.length; i++) {
    const t = trophiesInfo[i];
    const groupIndex = getGroupIndex(t.trophyGroupId);

    const trophy: Trophy = {
      id: t.trophyId,
      title: t.trophyName ?? '',
      description: t.trophyDetail ?? '',
      icon: t.trophyIconUrl ?? '',
      type: t.trophyType,
      isHidden: t.trophyHidden,
      rarity: undefined,
      isEarned: false,
      earnedAt: undefined,
      progress: undefined,
    };

    // Update earned info for trophy
    for (const earned of accountTrophies) {
      const e = earned[i];
      assert(e.trophyId === t.trophyId, 'Trophy ID mismatch');
      trophy.rarity = e.trophyEarnedRate;

      if (!e.earned) continue;
      trophy.isEarned = true;
      trophy.earnedAt = earliestDate(trophy.earnedAt, e.earnedDateTime);
    }

    if (trophy.isEarned) groups[groupIndex].earnedCount[trophy.type] += 1;
    // Add trophy and its info to list
    groups[groupIndex].trophies.push(trophy);
  }

  // Update progress and trophies for group
  for (const g of groups) {
    const totalPoints = getTrophyPoints(g.trophyCount);
    const earnedPoints = getTrophyPoints(g.earnedCount);
    g.progress = Math.ceil((100 * earnedPoints) / totalPoints);
  }

  return groups;
}

function getGroupIndex(groupId: string | undefined) {
  if (!groupId || groupId == 'default') return 0;
  return parseInt(groupId); // Group ids: "001", "002", ...
}
