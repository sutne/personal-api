// import * as psn from 'psn-api';
// import { getEarnedTrophies, getGameList, getGameTrophies } from '../middleware';
// import { Game } from '../types';

// async function getUsersGameList(): Promise<Game[]> {
//   const response = await getGameList('me');

//   const games: Game[] = [];
//   for (const title of response) {
//     const info = await getGameTrophies(title);
//     const earned = await getEarnedTrophies(title, 'me');

//     const trophies = combineTrophies(info, earned);
//   }

//   return games;
// }

// function combineTrophies(
//   info: psn.TitleThinTrophy[],
//   earned: psn.UserThinTrophy[],
// ): Trophy[] {}
