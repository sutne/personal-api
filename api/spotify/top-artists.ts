import type { VercelRequest, VercelResponse } from '@vercel/node';

import * as spotify from '../../src/spotify/middleware';
import { ArtistType } from '../../src/spotify/types';
import { cacheControl, formatURL } from '../../src/util';

const REQUEST_URL = formatURL('https://api.spotify.com/v1/me/top/artists', {
  limit: spotify.CONFIG.LIMIT,
  time_range: spotify.CONFIG.TIME_RANGE,
});

export default async function (req: VercelRequest, res: VercelResponse) {
  const response = await spotify.fetch(REQUEST_URL);
  const items = response?.items;
  if (!items) {
    console.error({ response });
    return res.status(404).send([]);
  }
  let artists: (ArtistType | undefined)[] = items.map((artist: any) =>
    filterArtist(artist),
  );
  artists = artists.filter((artist) => artist !== undefined);
  return res
    .status(200)
    .setHeader('Cache-Control', cacheControl({ days: 1 }))
    .send(artists);
}

function filterArtist(artist: any): ArtistType | undefined {
  const filtered: ArtistType = {
    name: artist.name,
    genres: artist.genres,
    image: artist.images[0].url,
    href: artist.external_urls.spotify,
  };
  return filtered;
}
