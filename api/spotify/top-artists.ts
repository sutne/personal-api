import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as spotify from '../../src/spotify/middleware';
import { Artist } from '../../src/spotify/types';
import { formatRequest } from '../../src/util';

const REQUEST_URL = formatRequest("https://api.spotify.com/v1/me/top/artists", {
  limit: spotify.CONFIG.LIMIT,
  time_range: spotify.CONFIG.TIME_RANGE,
});

export default async function (req: VercelRequest, res: VercelResponse) {
  const response = await spotify.fetchFromApi(REQUEST_URL);
  const artists = response.items?.map((artist: any) => filterTopArtist(artist));
  res.send(artists ?? []);
}

function filterTopArtist(artist: any): Artist | undefined {
  try {
    const filtered: Artist = {
      name: artist.name,
      genres: artist.genres,
      image: artist.images[2].url,
      href: artist.external_urls.spotify,
    };
    // console.log({ artist, filtered })
    return filtered;
  } catch (error) {
    console.log(error);
  }
}