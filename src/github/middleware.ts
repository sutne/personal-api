const GITHUB_ACCESS_TOKEN = process.env.GITHUB_ACCESS_TOKEN;
const BASE_URL = 'https://api.github.com';

export async function fetchFromApi(url: string): Promise<any> {
  if (url.startsWith('/')) url = `${BASE_URL}${url}`;
  return await fetch(url, {
    method: 'GET',
    headers: {
      // 'Cache-Control': 'max-age=86400, public', // responses are cached every day
      Authorization: `BEARER ${GITHUB_ACCESS_TOKEN}`,
    },
  })
    .then((res) => {
      if (res.ok) return res.json();
      console.error({ res });
      return { error: res };
    })
    .catch((error) => {
      console.error({ error });
      return { error: error };
    });
}
