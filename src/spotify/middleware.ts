import { GET, POST } from '../fetch';

const REFRESH_TOKEN = process.env.SPOTIFY_REFRESH_TOKEN?.trim();
const BASE64 = process.env.SPOTIFY_BASE64?.trim();

const REFRESH_TOKEN_URL = 'https://accounts.spotify.com/api/token';

export const CONFIG = {
  LIMIT: 15, // max number of elements to get for each query
  TIME_RANGE: 'short_term', // ≈ last 4 weeks
};

export async function fetch(url: string): Promise<any> {
  return await GET(url, {
    headers: {
      Authorization: `Bearer ${await getToken()}`,
    },
  });
}

export async function getToken(): Promise<string> {
  const response = await POST(REFRESH_TOKEN_URL, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${BASE64}`,
    },
    body: {
      grant_type: 'refresh_token',
      refresh_token: REFRESH_TOKEN,
    },
  });
  return response?.access_token;
}
