import { GET } from '../fetch';

const GITHUB_ACCESS_TOKEN = process.env.GITHUB_ACCESS_TOKEN?.trim() ?? '';
const BASE_URL = 'https://api.github.com';

export async function fetch(url: string): Promise<any> {
  const URL = url.startsWith('/') ? `${BASE_URL}${url}` : url;
  const response = await GET(URL, {
    headers: {
      Authorization: `BEARER ${GITHUB_ACCESS_TOKEN}`,
    },
  });
  return response;
}
