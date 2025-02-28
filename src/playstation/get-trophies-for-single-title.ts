import type { PlatformInfo, Trophy, TrophyGroup } from '../../src/playstation/types';
import { getTrophyGroups } from '../../src/playstation/util/api/trophy-list';
import { getTrophyCountProgress } from '../../src/playstation/util/trophy-calculation';
import { compareDate, latestDate } from '../../src/util';

/** returns all trophies (in TrophyGroup[]) for a single game */
export async function getTrophiesForSingleTitle(
  platformInfo: PlatformInfo[],
): Promise<TrophyGroup[]> {
  const groupsPerPlatform = await Promise.all(
    platformInfo
      .sort((a, b) => b.platform.localeCompare(a.platform)) // Highest number first
      .map((game) => getTrophyGroups(game.id, game.platform)),
  );
  let combinedGroups: TrophyGroup[] = groupsPerPlatform[0];
  for (let i = 1; i < groupsPerPlatform.length; i++) {
    combinedGroups = combineGroups(combinedGroups, groupsPerPlatform[i]);
  }
  return combinedGroups;
}

export function combineGroups(a: TrophyGroup[], b: TrophyGroup[]): TrophyGroup[] {
  const combined: TrophyGroup[] = JSON.parse(JSON.stringify(a));
  for (const group of b) {
    const existingGroup = combined.find((g) => g.name.trim() === group.name.trim());
    if (!existingGroup) {
      combined.push(group);
    } else {
      const mergedGroup = mergeGroups(existingGroup, group);
      const index = combined.indexOf(existingGroup);
      combined[index] = mergedGroup;
    }
  }
  return combined;
}

function mergeGroups(a: TrophyGroup, b: TrophyGroup): TrophyGroup {
  if (a.name.trim() !== b.name.trim())
    throw new Error(
      `Groups must have the same name to be merged, was: '${a.name}' and '${b.name}'`,
    );

  const merged: TrophyGroup = JSON.parse(JSON.stringify(a));
  for (const trophy of b.trophies) {
    const existingTrophy = merged.trophies.find(
      (t) => t.title.trim() === trophy.title.trim(),
    );
    if (!existingTrophy) {
      merged.trophies.push(trophy);
      merged.trophyCount[trophy.type]++;
      if (trophy.isEarned) {
        merged.earnedCount[trophy.type]++;
      }
    } else {
      const mergedTrophy = mergeTrophies(existingTrophy, trophy);
      const index = merged.trophies.indexOf(existingTrophy);
      merged.trophies[index] = mergedTrophy;
      if (!existingTrophy.isEarned && mergedTrophy.isEarned) {
        merged.earnedCount[mergedTrophy.type]++;
      }
    }
  }

  // if all other trophies are earned, mark platinum as earned
  if (merged.trophyCount.platinum && !merged.earnedCount.platinum) {
    const hasAllBronze = merged.earnedCount.bronze === merged.trophyCount.bronze;
    const hasAllSilver = merged.earnedCount.silver === merged.trophyCount.silver;
    const hasAllGold = merged.earnedCount.gold === merged.trophyCount.gold;
    if (hasAllBronze && hasAllSilver && hasAllGold) {
      merged.earnedCount.platinum = 1;
      const platinum = merged.trophies.find((t) => t.type === 'platinum');
      platinum.isEarned = true;
      platinum.earnedAt = merged.trophies.map((t) => t.earnedAt).reduce(latestDate);
    }
  }
  merged.progress = getTrophyCountProgress(merged.earnedCount, merged.trophyCount);
  return merged;
}

function mergeTrophies(a: Trophy, b: Trophy): Trophy {
  if (a.title.trim() !== b.title.trim())
    throw new Error(
      `Trophies must have the same title to be merged, was: '${a.title}' and '${b.title}'`,
    );

  if (a.isEarned && !b.isEarned) return a;
  if (!a.isEarned && b.isEarned) return b;
  if (a.isEarned && b.isEarned) {
    const aEarnedFirst = compareDate(a.earnedAt, b.earnedAt) > 0;
    return aEarnedFirst ? a : b;
  }
  // none earned
  if (!(a.progress || b.progress)) return a;
  return {
    ...a,
    progress: {
      target: a.progress?.target ?? b.progress?.target ?? 0,
      achieved: Math.max(a.progress?.achieved ?? 0, b.progress?.achieved ?? 0),
    },
  };
}
