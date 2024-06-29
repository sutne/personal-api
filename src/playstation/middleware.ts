import * as psn from 'psn-api';

const REFRESH_TOKEN = process.env.PLAYSTATION_REFRESH_TOKEN?.trim() ?? '';

async function getAuth(): Promise<any> {
  if (!REFRESH_TOKEN) throw new Error('No refresh token provided.');
  const auth = await psn.exchangeRefreshTokenForAuthTokens(REFRESH_TOKEN);
  return auth;
}

export async function getProfile(
  username: string,
): Promise<psn.ProfileFromUserNameResponse> {
  const result = await psn.getProfileFromUserName(await getAuth(), username);
  return result;
}

export async function getGameList(userId: string): Promise<psn.TrophyTitle[]> {
  const response = await psn.getUserTitles(await getAuth(), userId);
  const filtered = response.trophyTitles.filter(
    (title) => !title.hiddenFlag && title.progress > 0,
  );
  return filtered;
}

export async function getGameTrophies(
  gameId: string,
  platform: string,
): Promise<(psn.TitleThinTrophy & { trophyProgressTargetValue?: string })[]> {
  const response = await psn.getTitleTrophies(await getAuth(), gameId, 'all', {
    npServiceName: getNpServiceName(platform),
  });
  return response.trophies;
}

export async function getEarnedTrophies(
  gameId: string,
  platform: string,
  userId: string,
): Promise<(psn.UserThinTrophy & { progress?: string })[]> {
  const response = await psn.getUserTrophiesEarnedForTitle(
    await getAuth(),
    userId,
    gameId,
    'all',
    {
      npServiceName: getNpServiceName(platform),
    },
  );
  return response.trophies;
}

export async function getTrophyGroupInfo(gameId: string, platform: string) {
  const response = await psn.getTitleTrophyGroups(await getAuth(), gameId, {
    npServiceName: getNpServiceName(platform),
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

type NpServiceName = undefined | 'trophy' | 'trophy2';
function getNpServiceName(platform: string): NpServiceName {
  switch (platform) {
    case 'PS Vita':
      return 'trophy';
    case 'PS3':
      return 'trophy';
    case 'PS4':
      return 'trophy';
    case 'PS5':
      return 'trophy2';
    case 'PS5,PSPC':
      return 'trophy2';
    default:
      console.error("unknown platform: '" + platform + "'");
      return undefined;
  }
}
