import { earliestDate, json } from '../../../util';
import { ACCOUNTS } from '../../config';
import {
  getEarnedTrophies,
  getGameTrophies,
  getTrophyGroupInfo,
} from '../../middleware';
import type { Platform, Trophy, TrophyGroup } from '../../types';
import { getTrophyCountProgress } from '../trophy-calculation';

export async function getTrophyGroups(id: string, platform: Platform) {
  const [trophiesInfo, groupInfo] = await Promise.all([
    getGameTrophies(id, platform),
    getTrophyGroupInfo(id, platform),
  ]);

  const groups: TrophyGroup[] = [];
  for (const group of groupInfo) {
    // Initialize Group
    groups.push({
      id: getGroupIndex(group.trophyGroupId),
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
  const accountTrophies = accountResults.filter((list) => list.length > 0);

  for (let i = 0; i < trophiesInfo.length; i++) {
    const trophyInfo = trophiesInfo[i];
    const groupIndex = getGroupIndex(trophyInfo.trophyGroupId);

    const trophy: Partial<Trophy> = {
      id: trophyInfo.trophyId,
      title: trophyInfo.trophyName ?? '',
      description: trophyInfo.trophyDetail ?? '',
      icon: trophyInfo.trophyIconUrl ?? '',
      type: trophyInfo.trophyType,
      isHidden: trophyInfo.trophyHidden,
      isEarned: false,
    };

    // Update earned info for trophy
    for (const earnedTophies of accountTrophies) {
      const earnedTrophy = earnedTophies[i];
      if (earnedTrophy.trophyId !== trophyInfo.trophyId) {
        throw new Error(
          `Trophy id mismatch: "${json(earnedTrophy)}" vs "${json(trophyInfo)}"`,
        );
      }
      trophy.rarity = earnedTrophy.trophyEarnedRate;

      if (earnedTrophy.earned) {
        trophy.isEarned = true;
        if (trophy.earnedAt) {
          trophy.earnedAt = earliestDate(trophy.earnedAt, earnedTrophy.earnedDateTime);
        } else {
          trophy.earnedAt = earnedTrophy.earnedDateTime;
        }
      } else {
        const progressTarget = Number(trophyInfo.trophyProgressTargetValue ?? 0);
        if (progressTarget > 1) {
          trophy.progress = {
            achieved: Number(earnedTrophy.progress ?? 0),
            target: progressTarget,
          };
        }
      }
    }

    if (trophy.isEarned) groups[groupIndex].earnedCount[trophy.type] += 1;
    // Add trophy and its info to list
    groups[groupIndex].trophies.push(trophy as Trophy);
  }

  // Update progress and trophies for group
  for (const group of groups) {
    group.progress = getTrophyCountProgress(group.earnedCount, group.trophyCount);
  }

  return groups;
}

function getGroupIndex(groupId: string | undefined) {
  if (!groupId || groupId === 'default') return 0;
  return Number.parseInt(groupId); // Group ids: "001", "002", ...
}
