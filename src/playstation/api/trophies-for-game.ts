// import fs from 'fs';

// import {
//   getAccountId,
//   getEarnedTrophies,
//   getGameList,
//   getGameTrophies,
// } from '../middleware';
// import { Game } from '../types';
// import { writeJSON } from '../../util';
// import * as psn from 'psn-api';

// async function getGame(title: psn.TrophyTitle): Game {
//   const trophies = await getGameTrophies(title);

//   const earnedSutne = await getEarnedTrophies(title, 'me');
//   const earnedSivvi = await getEarnedTrophies(title, 'Sivvi__');

//   // 5. Merge the two trophy lists.
//   // const merged = mergeTrophyLists(trophies, earned);
//   // // 6. Add all Groups, Trophies and Data for each game
//   // games.push({
//   //   title: title.trophyTitleName,
//   //   platform: title.trophyTitlePlatform,
//   //   earnedCounts: title.earnedTrophies,
//   //   trophyCount: title.definedTrophies,
//   //   trophyGroups: title.trophyGroups,
//   //   trophies: merged,
//   //   // TODO: add more data
//   // });

//   return {} as Game;
// }
