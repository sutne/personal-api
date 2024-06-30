import { getTrophyGroups } from '../../src/playstation/util/api/trophy-list';
import { PlatformInfo, TrophyGroup } from '../../src/playstation/types';
import { compareDate } from '../../src/util';
import { assert } from 'console';
import { getTrophyCountProgress } from '../../src/playstation/util/trophy-calculation';

/** returns all trophies (in TrophyGroup[]) for a single game */
export async function getTrophiesForSingleTitle(
  platformInfo: PlatformInfo[],
): Promise<TrophyGroup[]> {
  const groupsPerPlatform = await Promise.all(
    platformInfo
      .sort((a, b) => b.platform.localeCompare(a.platform)) // Highest number first
      .map((game) => getTrophyGroups(game.id, game.platform)),
  );
  const combinedGroups: TrophyGroup[] = groupsPerPlatform[0];
  for (let i = 1; i < groupsPerPlatform.length; i++) {
    const groups = groupsPerPlatform[i];
    for (const group of groups) {
      const existingGroup = combinedGroups.find((g) => g.id === group.id);
      if (!existingGroup) {
        combinedGroups.push(group);
        continue;
      }
      assert(
        existingGroup.name.trim() === group.name.trim(),
        `Group name mismatch: "${existingGroup.name}" vs "${group.name}"`,
      );
      for (const trophy of group.trophies) {
        const existingTrophy = existingGroup.trophies.find(
          (t) => t.id === trophy.id,
        );
        if (!existingTrophy) {
          existingGroup.trophies.push(trophy);
          existingGroup.trophyCount[trophy.type]++;
          if (trophy.isEarned) {
            existingGroup.earnedCount[trophy.type]++;
          }
          continue;
        }
        if (!trophy.isEarned) continue;
        assert(
          existingTrophy.type === trophy.type,
          `Trophy type mismatch: "${existingTrophy.type}" vs "${trophy.type}"`,
        );
        assert(
          existingTrophy.title.trim() === trophy.title.trim(),
          `Trophy title mismatch: "${existingTrophy.title}" vs "${trophy.title}"`,
        );
        if (!existingTrophy.isEarned) {
          existingTrophy.isEarned = true;
          existingTrophy.earnedAt = trophy.earnedAt;
          existingTrophy.progress = trophy.progress;
          existingGroup.earnedCount[trophy.type]++;
          continue;
        } else {
          if (compareDate(existingTrophy.earnedAt, trophy.earnedAt) < 0) {
            existingTrophy.earnedAt = trophy.earnedAt;
          }
        }
      }
      existingGroup.progress = getTrophyCountProgress(
        existingGroup.earnedCount,
        existingGroup.trophyCount,
      );
    }
  }
  return combinedGroups;
}
