import { exchangeRefreshTokenForAuthTokens } from 'psn-api';

const REFRESH_TOKEN = process.env.PLAYSTATION_REFRESH_TOKEN;

export async function getAuth(): Promise<any> {
  if (!REFRESH_TOKEN) throw new Error('No refresh token provided.');
  const auth = await exchangeRefreshTokenForAuthTokens(REFRESH_TOKEN);
  return auth;
}
