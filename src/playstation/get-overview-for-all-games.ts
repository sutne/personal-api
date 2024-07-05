import { getGames } from '../../src/playstation/util/api/game-list';
import { getTrophyGroups } from '../../src/playstation/util/api/trophy-list';
import { Trophy, TrophyGame, TrophyGroup } from '../../src/playstation/types';
import { compareDate, earliestDate, latestDate } from '../../src/util';
import { TrophyTitle } from 'psn-api';
import { platform } from '../../src/playstation/util/platforms';
import { combineGroups } from './get-trophies-for-single-title';
import { getTrophyCountProgress } from './util/trophy-calculation';

type TrophyGameTitle = {
  game: TrophyGame;
  groups: TrophyGroup[];
};

/** returns all games with their trophy overview as TrophyGame[] */
export async function getOverviewForAllGames(): Promise<TrophyGame[]> {
  const trophyTitles: TrophyTitle[] = await getGames();
  const trophyGameTitles: TrophyGameTitle[] = await Promise.all(
    trophyTitles.map(async (trophyTitle) => {
      const groups = await getTrophyGroups(
        trophyTitle.npCommunicationId,
        platform(trophyTitle.trophyTitlePlatform),
      );
      const game: TrophyGame = {
        platform: [
          {
            id: trophyTitle.npCommunicationId,
            platform: platform(trophyTitle.trophyTitlePlatform),
          },
        ],
        title: trophyTitle.trophyTitleName,
        image: trophyTitle.trophyTitleIconUrl,
        trophyCount: trophyTitle.definedTrophies,
        earnedCount: trophyTitle.earnedTrophies,
        progress: trophyTitle.progress,
        firstTrophyEarnedAt: getEarliestTrophyEarnedDate(groups),
        lastTrophyEarnedAt: trophyTitle.lastUpdatedDateTime,
      };
      return { game, groups };
    }),
  );

  const uniqueGames: TrophyGame[] = [];
  trophyGameTitles.forEach((gameTitle) => {
    const existingGame = uniqueGames.find(
      (g) => g.title.trim() === gameTitle.game.title.trim(),
    );
    const game = gameTitle.game;
    if (!existingGame) {
      uniqueGames.push(game);
      return;
    }

    const gamesWithSameTitle = trophyGameTitles.filter(
      (t) =>
        t.game.title === existingGame.title &&
        t.game.platform[0].id !== existingGame.platform[0].id,
    );
    for (const otherGameTitle of gamesWithSameTitle) {
      const otherGame = otherGameTitle.game;
      existingGame.platform.push({ ...otherGame.platform[0] });
      existingGame.firstTrophyEarnedAt = earliestDate(
        existingGame.firstTrophyEarnedAt,
        otherGame.firstTrophyEarnedAt,
      );
      existingGame.lastTrophyEarnedAt = latestDate(
        existingGame.lastTrophyEarnedAt,
        otherGame.lastTrophyEarnedAt,
      );
      const combinedGroups = combineGroups(
        gameTitle.groups,
        otherGameTitle.groups,
      );
      existingGame.trophyCount = combinedGroups.reduce(
        (count, group) => {
          return {
            bronze: count.bronze + group.trophyCount.bronze,
            silver: count.silver + group.trophyCount.silver,
            gold: count.gold + group.trophyCount.gold,
            platinum: count.platinum + group.trophyCount.platinum,
          };
        },
        { bronze: 0, silver: 0, gold: 0, platinum: 0 },
      );
      existingGame.earnedCount = combinedGroups.reduce(
        (earned, group) => {
          return {
            bronze: earned.bronze + group.earnedCount.bronze,
            silver: earned.silver + group.earnedCount.silver,
            gold: earned.gold + group.earnedCount.gold,
            platinum: earned.platinum + group.earnedCount.platinum,
          };
        },
        { bronze: 0, silver: 0, gold: 0, platinum: 0 },
      );
      existingGame.progress = getTrophyCountProgress(
        existingGame.earnedCount,
        existingGame.trophyCount,
      );
    }
    if (existingGame.title === 'Fall Guys') {
      console.log(existingGame);
    }
  });

  uniqueGames.sort((a, b) => {
    return compareDate(a.lastTrophyEarnedAt, b.lastTrophyEarnedAt);
  });
  return uniqueGames;
}

function getEarliestTrophyEarnedDate(
  groups: TrophyGroup[],
): string | undefined {
  const trophies = groups.reduce(
    (trophies, group) => trophies.concat(group.trophies),
    [] as Trophy[],
  );
  return trophies.reduce((firstDate, trophy) => {
    if (!trophy.isEarned) return firstDate;
    if (!firstDate) return trophy.earnedAt;
    return earliestDate(firstDate, trophy.earnedAt);
  }, undefined as string | undefined);
}
