import type { VercelRequest, VercelResponse } from '@vercel/node';

import * as spotify from '../../src/spotify/middleware';
import { TrackType } from '../../src/spotify/types';
import { cacheControl, formatURL } from '../../src/util';

import { filterTrack } from './now-playing';

const REQUEST_URL = formatURL(
  'https://api.spotify.com/v1/me/player/recently-played',
  {
    limit: spotify.CONFIG.LIMIT,
  },
);

export default async function (req: VercelRequest, res: VercelResponse) {
  const response = await spotify.fetch(REQUEST_URL);
  const items = response?.items;
  if (!items) {
    console.error({ response });
    return res.status(404).send([]);
  }
  let tracks: (TrackType | undefined)[] = items.map((track: any) =>
    filterTrack(track.track),
  );
  tracks = tracks.filter((track) => track !== undefined);
  tracks = tracks.filter((track, i) => tracks.indexOf(track) === i);
  return res
    .status(200)
    .setHeader('Cache-Control', cacheControl({ seconds: 1 }))
    .send(tracks);
}
