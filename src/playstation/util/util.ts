import * as psn from 'psn-api';
import { Trophy } from '../types';

const rarityMap: Record<psn.TrophyRarity, string> = {
  [psn.TrophyRarity.VeryRare]: 'Very Rare',
  [psn.TrophyRarity.UltraRare]: 'Ultra Rare',
  [psn.TrophyRarity.Rare]: 'Rare',
  [psn.TrophyRarity.Common]: 'Common',
};

function mergeTrophyLists(
  gameList: psn.Trophy[],
  earnedList: psn.Trophy[],
): Trophy[] {
  const mergedList: Trophy[] = [];
  for (const gameTrophy of gameList) {
    const earnedTrophy = earnedList.find(
      (earnedTrophy) => earnedTrophy.trophyId === gameTrophy.trophyId,
    );
    const merged = { ...gameTrophy, ...earnedTrophy };
    const trophy: Trophy = convert(merged);
    mergedList.push(trophy);
  }
  return mergedList;
}

const convert = (trophy: psn.Trophy): Trophy => {
  const converted: Trophy = {
    id: trophy.trophyId,
    title: trophy.trophyName,
    description: trophy.trophyDetail,
    isEarned: trophy.earned ?? false,
    earnedAt: trophy.earned ? trophy.earnedDateTime : undefined,
    isHidden: trophy.trophyHidden,
    image: trophy.trophyIconUrl,
    type: trophy.trophyType,
    progress: trophy.trophyProgressTargetValue,
    reward: {
      name: trophy.trophyRewardName,
      image: trophy.trophyRewardImageUrl,
    },
    rarity: {
      name: trophy.trophyRare,
      earned: trophy.trophyEarnedRate,
    },
  };
  return converted;
};
