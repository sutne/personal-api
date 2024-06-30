import { TrophyTitle } from 'psn-api';

import { getGameList } from '../../middleware';
import { ACCOUNTS } from '../../config';
import { getTrophyPoints } from '../trophy-calculation';
import { Platform } from '../../types';

export async function getGames() {
  const games: TrophyTitle[] = [];

  const id = (g: TrophyTitle) => g.npCommunicationId;

  const gamesForAccounts: TrophyTitle[][] = await Promise.all(
    ACCOUNTS.map(async (account) => getGameList(account)),
  );
  for (const accountGames of gamesForAccounts) {
    for (const newTitle of accountGames) {
      // check if title exists in games already
      const oldTitle = games.find((g) => id(g) === id(newTitle));
      if (!oldTitle) {
        games.push(newTitle);
      } else {
        // Only keep the title with the highest points
        const newPoints = getTrophyPoints(newTitle.earnedTrophies);
        const oldPoints = getTrophyPoints(oldTitle.earnedTrophies);
        if (newPoints > oldPoints) {
          oldTitle.earnedTrophies = newTitle.earnedTrophies;
          oldTitle.progress = newTitle.progress;
        }
      }
    }
  }
  return games;
}
