// import type { VercelRequest, VercelResponse } from '@vercel/node';
// import * as psn from 'psn-api';

// import fs from 'fs';

// import { getAuth } from '../middleware';

// export default async function (req: VercelRequest, res: VercelResponse) {
//   req.url;
//   const auth = await getAuth();

//   // const targetAccountId = 'Sivvi__';

//   // 2. Get the user's `accountId` from the username.
//   const allAccountsSearchResults = await psn.makeUniversalSearch(
//     auth,
//     'Sivvi__',
//     'SocialAllAccounts',
//   );

//   const targetAccountId =
//     allAccountsSearchResults.domainResponses[0].results[0].socialMetadata
//       .accountId;

//   // 3. Get the user's list of titles (games).
//   const { trophyTitles } = await psn.getUserTitles(auth, targetAccountId);

//   const games: any[] = [];
//   for (const title of trophyTitles) {
//     // 4. Get the list of trophies for each of the user's titles.
//     const { trophies: titleTrophies } = await psn.getTitleTrophies(
//       auth,
//       title.npCommunicationId,
//       'all',
//       {
//         npServiceName:
//           title.trophyTitlePlatform !== 'PS5' ? 'trophy' : undefined,
//       },
//     );

//     // 5. Get the list of _earned_ trophies for each of the user's titles.
//     const { trophies: earnedTrophies } =
//       await psn.getUserTrophiesEarnedForTitle(
//         auth,
//         targetAccountId,
//         title.npCommunicationId,
//         'all',
//         {
//           npServiceName:
//             title.trophyTitlePlatform !== 'PS5' ? 'trophy' : undefined,
//         },
//       );

//     // 6. Merge the two trophy lists.
//     const mergedTrophies = mergeTrophyLists(titleTrophies, earnedTrophies);

//     games.push({
//       gameName: title.trophyTitleName,
//       platform: title.trophyTitlePlatform,
//       trophyTypeCounts: title.definedTrophies,
//       earnedCounts: title.earnedTrophies,
//       trophyList: mergedTrophies,
//     });
//   }

//   return res
//     .status(200)
//     .setHeader('Cache-Control', `max-age=0, public, s-maxage=${3 * 60 * 60}`)
//     .send(games);
// }

// const mergeTrophyLists = (
//   titleTrophies: psn.Trophy[],
//   earnedTrophies: psn.Trophy[],
// ) => {
//   const mergedTrophies: any[] = [];

//   for (const earnedTrophy of earnedTrophies) {
//     const foundTitleTrophy = titleTrophies.find(
//       (t) => t.trophyId === earnedTrophy.trophyId,
//     );

//     mergedTrophies.push(
//       normalizeTrophy({ ...earnedTrophy, ...foundTitleTrophy }),
//     );
//   }

//   return mergedTrophies;
// };

// const normalizeTrophy = (trophy: psn.Trophy) => {
//   return {
//     trophyName: trophy.trophyName,
//     descriotion: trophy.trophyDetail,
//     image: trophy.trophyIconUrl,
//     type: trophy.trophyType,
//     isEarned: trophy.earned ?? false,
//     earnedOn: trophy.earned ? trophy.earnedDateTime : 'unearned',
//     rarity: rarityMap[trophy.trophyRare ?? 0],
//     earnedRate: Number(trophy.trophyEarnedRate),
//     groupId: trophy.trophyGroupId,
//   };
// };

// const rarityMap: Record<psn.TrophyRarity, string> = {
//   [psn.TrophyRarity.VeryRare]: 'Very Rare',
//   [psn.TrophyRarity.UltraRare]: 'Ultra Rare',
//   [psn.TrophyRarity.Rare]: 'Rare',
//   [psn.TrophyRarity.Common]: 'Common',
// };
