import { getTrophyGroups } from '../../src/playstation/util/api/trophy-list';
import { PlatformInfo, TrophyGroup } from '../../src/playstation/types';
import { earliestDate } from '../../src/util';
import { getTrophyCountProgress } from '../../src/playstation/util/trophy-calculation';

/** returns all trophies (in TrophyGroup[]) for a single game */
export async function getTrophiesForSingleTitle(
  platformInfo: PlatformInfo[],
): Promise<TrophyGroup[]> {
  const groupsPerPlatform = await Promise.all(
    platformInfo
      .sort((a, b) => a.platform.localeCompare(b.platform)) // Highest number first
      .map((game) => getTrophyGroups(game.id, game.platform)),
  );
  let combinedGroups: TrophyGroup[] = groupsPerPlatform[0];
  for (let i = 1; i < groupsPerPlatform.length; i++) {
    combinedGroups = combineGroups(combinedGroups, groupsPerPlatform[i]);
  }
  return combinedGroups;
}

export function combineGroups(
  a: TrophyGroup[],
  b: TrophyGroup[],
): TrophyGroup[] {
  const combined: TrophyGroup[] = JSON.parse(JSON.stringify(a));
  for (const group of b) {
    const existingGroup = combined.find(
      (g) => g.name.trim() === group.name.trim(),
    );
    if (!existingGroup) {
      combined.push(group);
      continue;
    }
    for (const trophy of group.trophies) {
      const existingTrophy = existingGroup.trophies.find(
        (t) => t.title.trim() === trophy.title.trim(),
      );
      if (!existingTrophy) {
        existingGroup.trophies.push(trophy);
        existingGroup.trophyCount[trophy.type]++;
        if (trophy.isEarned) {
          existingGroup.earnedCount[trophy.type]++;
        }
        continue;
      }
      if (!trophy.isEarned) {
        if (!existingTrophy.progress) continue;
        existingTrophy.progress.achieved = Math.max(
          existingTrophy.progress.achieved,
          trophy.progress?.achieved || 0,
        );
        continue;
      }
      if (!existingTrophy.isEarned) {
        existingTrophy.isEarned = true;
        existingTrophy.earnedAt = trophy.earnedAt;
        existingTrophy.progress = trophy.progress;
        existingGroup.earnedCount[trophy.type]++;
        continue;
      } else {
        existingTrophy.earnedAt = earliestDate(
          existingTrophy.earnedAt,
          trophy.earnedAt,
        );
      }
    }
    existingGroup.progress = getTrophyCountProgress(
      existingGroup.earnedCount,
      existingGroup.trophyCount,
    );
  }
  return combined;
}
