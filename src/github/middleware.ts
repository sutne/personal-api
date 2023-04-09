import { GET } from "../util";

const GITHUB_ACCESS_TOKEN = process.env.GITHUB_ACCESS_TOKEN;
const BASE_URL = "https://api.github.com";

export async function fetchFromApi(url: string): Promise<any> {
  if (url.startsWith("/")) url = `${BASE_URL}${url}`;
  return await GET(url, {
    headers: {
      "Authorization": `BEARER ${GITHUB_ACCESS_TOKEN}`,
    },
  });
}
