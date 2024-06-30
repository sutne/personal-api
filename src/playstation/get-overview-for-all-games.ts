import { getGames } from '../../src/playstation/util/api/game-list';
import { getTrophyGroups } from '../../src/playstation/util/api/trophy-list';
import { Trophy, TrophyGame } from '../../src/playstation/types';
import { compareDate, earliestDate, latestDate } from '../../src/util';
import { TrophyTitle } from 'psn-api';
import { platform } from '../../src/playstation/util/platforms';
import { maxCounts } from '../../src/playstation/util/util';

/** returns all games with their trophy overview as TrophyGame[] */
export async function getOverviewForAllGames(): Promise<TrophyGame[]> {
  const games = (await getGames()) as (TrophyTitle & {
    firstUpdatedDateTime?: string;
  })[];

  // Find earliest trophy earned for each game
  await Promise.all(
    games.map(async (game) => {
      const groups = await getTrophyGroups(
        game.npCommunicationId,
        platform(game.trophyTitlePlatform),
      );
      // gather all group trophies to single list
      const trophies = groups.reduce(
        (trophies, group) => trophies.concat(group.trophies),
        [] as Trophy[],
      );

      const earliestTrophy = trophies.reduce((earliest, trophy) => {
        if (!trophy.isEarned) return earliest;
        if (!earliest) return trophy;
        const newIsEarlier =
          compareDate(earliest.earnedAt, trophy.earnedAt) < 0;
        return newIsEarlier ? trophy : earliest;
      }, null as Trophy | null);

      if (earliestTrophy !== null) {
        game.firstUpdatedDateTime = earliestTrophy.earnedAt ?? '';
      }
    }),
  );
  const sorted = games.sort((a, b) => {
    return compareDate(a.lastUpdatedDateTime, b.lastUpdatedDateTime);
  });
  return sorted.map((game) => {
    const trophyGame: TrophyGame = {
      platform: [
        {
          id: game.npCommunicationId,
          platform: platform(game.trophyTitlePlatform),
        },
      ],
      title: game.trophyTitleName,
      image: game.trophyTitleIconUrl,
      trophyCount: game.definedTrophies,
      earnedCount: game.earnedTrophies,
      progress: game.progress,
      firstTrophyEarnedAt: game.firstUpdatedDateTime,
      lastTrophyEarnedAt: game.lastUpdatedDateTime,
    };
    const gameWithSameTitle = sorted.filter(
      (g) =>
        g.trophyTitleName === game.trophyTitleName &&
        g.npCommunicationId !== game.npCommunicationId,
    );
    for (const otherGame of gameWithSameTitle) {
      trophyGame.platform.push({
        id: otherGame.npCommunicationId,
        platform: platform(otherGame.trophyTitlePlatform),
      });
      sorted.splice(sorted.indexOf(otherGame), 1);
      trophyGame.firstTrophyEarnedAt = earliestDate(
        trophyGame.firstTrophyEarnedAt,
        otherGame.firstUpdatedDateTime,
      );
      trophyGame.lastTrophyEarnedAt = latestDate(
        trophyGame.lastTrophyEarnedAt,
        otherGame.lastUpdatedDateTime,
      );
      trophyGame.progress = Math.max(trophyGame.progress, otherGame.progress);
      trophyGame.trophyCount = maxCounts(
        trophyGame.trophyCount,
        otherGame.definedTrophies,
      );
      trophyGame.earnedCount = maxCounts(
        trophyGame.earnedCount,
        otherGame.earnedTrophies,
      );
    }
    return trophyGame;
  });
}
