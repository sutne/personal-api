import * as psn from 'psn-api';
import {
  calculateTrophyPoints,
  combineTrophies,
  getTrophyLevel,
} from './trophy-calculation';

const REFRESH_TOKEN = process.env.PLAYSTATION_REFRESH_TOKEN;

async function getAuth(): Promise<any> {
  if (!REFRESH_TOKEN) throw new Error('No refresh token provided.');
  const auth = await psn.exchangeRefreshTokenForAuthTokens(REFRESH_TOKEN);
  return auth;
}

export async function getProfile(username: string) {
  const auth = await getAuth();
  return await psn.getProfileFromUserName(auth, username);
}

export async function getAccountId(onlineId: string) {
  const result = await psn.makeUniversalSearch(
    await getAuth(),
    onlineId,
    'SocialAllAccounts',
  );
  return result.domainResponses[0].results[0].socialMetadata.accountId;
}

export async function getGameList(user: string = 'me') {
  const userId = user == 'me' ? 'me' : await getAccountId(user);
  const response = await psn.getUserTitles(await getAuth(), userId);
  return response.trophyTitles;
}

export async function getGameTrophies(title: psn.TrophyTitle) {
  const response = await psn.getTitleTrophies(
    await getAuth(),
    title.npCommunicationId,
    'all',
    {
      npServiceName: title.trophyTitlePlatform !== 'PS5' ? 'trophy' : undefined,
    },
  );
  return response.trophies;
}

export async function getEarnedTrophies(
  title: psn.TrophyTitle,
  user: string = 'me',
) {
  const userId = user == 'me' ? 'me' : await getAccountId(user);
  const response = await psn.getUserTrophiesEarnedForTitle(
    await getAuth(),
    userId,
    title.npCommunicationId,
    'all',
    {
      npServiceName: title.trophyTitlePlatform !== 'PS5' ? 'trophy' : undefined,
    },
  );
  return response.trophies;
}

export async function getRecentlyPlayedGames() {
  const response = await psn.getRecentlyPlayedGames(await getAuth(), {
    limit: 12,
    categories: ['ps4_game', 'ps5_native_game'],
  });
  return response.data.gameLibraryTitlesRetrieve.games;
}
