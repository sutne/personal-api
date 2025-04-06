import type { TrophyTitle } from 'psn-api';
import { ACCOUNTS } from '../../config';
import { getGameList } from '../../middleware';
import { getTrophyPoints } from '../trophy-calculation';

const IGNORED_GAMES = [
  'Fortnite', // got a few trophies by "accident" when i didn't realize it was a 1000 hour+ grind, hiddenFlag doesn't seem to work
];

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
  return games.filter((game) => !IGNORED_GAMES.includes(game.trophyTitleName));
}
