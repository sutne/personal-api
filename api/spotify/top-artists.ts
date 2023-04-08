import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as spotify from '../../src/spotify/middleware';
import { ArtistType } from '../../src/spotify/types';
import { formatURL } from '../../src/util';

const REQUEST_URL = formatURL('https://api.spotify.com/v1/me/top/artists', {
  limit: spotify.CONFIG.LIMIT,
  time_range: spotify.CONFIG.TIME_RANGE,
});

export default async function (req: VercelRequest, res: VercelResponse) {
  const response = await spotify.fetchFromApi(REQUEST_URL);
  const items = response?.items;
  if (!items) {
    console.error({ response });
    return res.status(404).send([]);
  }
  let artists: (ArtistType | undefined)[] = items.map((artist: any) =>
    filterArtist(artist),
  );
  // Remove undefined
  artists = artists.filter((artist) => artist !== undefined);
  return res.send(artists);
}

function filterArtist(artist: any): ArtistType | undefined {
  try {
    const filtered: ArtistType = {
      name: artist.name,
      genres: artist.genres,
      image: artist.images[0].url,
      href: artist.external_urls.spotify,
    };
    // console.log({ artist, filtered })
    return filtered;
  } catch (error) {
    console.log(error);
  }
}
