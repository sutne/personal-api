import * as psn from 'psn-api';

const REFRESH_TOKEN = process.env.PLAYSTATION_REFRESH_TOKEN;

async function getAuth(): Promise<any> {
  if (!REFRESH_TOKEN) throw new Error('No refresh token provided.');
  const auth = await psn.exchangeRefreshTokenForAuthTokens(REFRESH_TOKEN);
  return auth;
}

export async function getProfile(username: string) {
  const result = await psn.getProfileFromUserName(await getAuth(), username);
  return result;
}

export async function getGameList(userId: string) {
  const response = await psn.getUserTitles(await getAuth(), userId);
  return response.trophyTitles;
}

export async function getGameTrophies(gameId: string, platform: string) {
  const npServiceName = platform === 'PS5' ? undefined : 'trophy';
  const response = await psn.getTitleTrophies(await getAuth(), gameId, 'all', {
    npServiceName: npServiceName,
  });
  return response.trophies;
}

export async function getEarnedTrophies(
  gameId: string,
  platform: string,
  userId: string,
) {
  const npServiceName = platform === 'PS5' ? undefined : 'trophy';
  const response = await psn.getUserTrophiesEarnedForTitle(
    await getAuth(),
    userId,
    gameId,
    'all',
    {
      npServiceName: npServiceName,
    },
  );
  return response.trophies;
}

export async function getTrophyGroupInfo(gameId: string, platform: string) {
  const npServiceName = platform === 'PS5' ? undefined : 'trophy';
  const response = await psn.getTitleTrophyGroups(await getAuth(), gameId, {
    npServiceName: npServiceName,
  });
  return response.trophyGroups;
}

export async function getRecentlyPlayedGames() {
  const response = await psn.getRecentlyPlayedGames(await getAuth(), {
    limit: 12,
    categories: ['ps4_game', 'ps5_native_game'],
  });
  return response.data.gameLibraryTitlesRetrieve.games;
}
