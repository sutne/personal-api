import { B64String } from '../util';

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.SPOTIFY_REFRESH_TOKEN;

const REFRESH_TOKEN_URL = 'https://accounts.spotify.com/api/token';

export const CONFIG = {
  LIMIT: 15, // max number of elements to get for each query
  TIME_RANGE: 'short_term', // ≈ last 4 weeks
};

export async function fetchFromApi(url: string): Promise<any> {
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${await getToken()}`,
    },
  })
    .then((res) => {
      if (res.ok) return res.json();
      return { error: res };
    })
    .catch((error) => {
      return { error: error };
    });
  return response;
}

export async function getToken(): Promise<string> {
  const response = await fetch(REFRESH_TOKEN_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${B64String(`${CLIENT_ID}:${CLIENT_SECRET}`)}`,
    },
    body: [`grant_type=refresh_token`, `refresh_token=${REFRESH_TOKEN}`].join(
      '&',
    ),
  })
    .then((res) => {
      if (res.ok) return res.json();
      console.error({ res });
      return { access_token: '' };
    })
    .catch((error) => {
      console.error({ error });
      return { access_token: '' };
    });
  return response.access_token;
}
