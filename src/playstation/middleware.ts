import { GET } from "../util";

const PLAYSTATION_COOKIE = process.env.PLAYSTATION_COOKIE;

export async function fetchFromApi(url: string): Promise<any> {
  return await GET(url, {
    headers: {
      "cookie": PLAYSTATION_COOKIE ?? "",
    },
  });
}
