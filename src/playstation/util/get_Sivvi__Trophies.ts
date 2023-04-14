import fs from 'fs';

import {
  getAccountId,
  getEarnedTrophies,
  getGameList,
  getGameTrophies,
} from '../middleware';
import { Game } from '../types';
import { writeJSON } from '../../util';

async function main() {
  // 2. Get the user's `accountId` from the username.
  const id = await getAccountId('Sutne_');
  // 3. Get the user's list of titles (games).
  const gameList = await getGameList(id);
  const games: Game[] = [];
  for (const title of gameList) {
    // 4. For each game, get its trophies and the trophies the user has earned.
    const trophies = await getGameTrophies(title);
    const earned = await getEarnedTrophies(title, id);

    // 5. Merge the two trophy lists.
    // const merged = mergeTrophyLists(trophies, earned);
    // // 6. Add all Groups, Trophies and Data for each game
    // games.push({
    //   title: title.trophyTitleName,
    //   platform: title.trophyTitlePlatform,
    //   earnedCounts: title.earnedTrophies,
    //   trophyCount: title.definedTrophies,
    //   trophyGroups: title.trophyGroups,
    //   trophies: merged,
    //   // TODO: add more data
    // });
  }

  // 7. Write to a JSON file.
  writeJSON('Sivvi', games);
}
main();
