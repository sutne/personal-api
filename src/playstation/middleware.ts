import { exchangeRefreshTokenForAuthTokens } from 'psn-api';
import { GET, POST } from '../fetch';

// const AUTH_BASE_URL = 'https://ca.account.sony.com/api/authz/v3/oauth';
const REFRESH_TOKEN = process.env.PLAYSTATION_REFRESH_TOKEN;

// export async function fetch(url: string): Promise<any> {
//   return await GET(url, {
//     headers: {
//       Authorization: `Bearer ${await getToken()}`,
//     },
//   });
// }

export async function getAuth(): Promise<any> {
  // const response = await POST(`${AUTH_BASE_URL}/token`, {
  //   headers: {
  //     'Content-Type': 'application/x-www-form-urlencoded',
  //     Authorization: `Bearer MDk1MTUxNTktNzIzNy00MzcwLTliNDAtMzgwNmU2N2MwODkxOnVjUGprYTV0bnRCMktxc1A=`,
  //   },
  //   body: {
  //     refresh_token: REFRESH_TOKEN,
  //     grant_type: 'refresh_token',
  //     token_format: 'jwt',
  //     scope: 'psn:mobile.v2.core psn:clientapp',
  //   },
  // });
  if (!REFRESH_TOKEN) throw new Error('No refresh token provided.');
  const auth = await exchangeRefreshTokenForAuthTokens(REFRESH_TOKEN);
  return auth;
}
