import type { VercelRequest, VercelResponse } from '@vercel/node';

import * as spotify from '../../src/spotify/middleware';
import { TrackType } from '../../src/spotify/types';
import { formatURL } from '../../src/util';

import { filterTrack } from './now-playing';

const REQUEST_URL = formatURL('https://api.spotify.com/v1/me/top/tracks', {
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
  let tracks: (TrackType | undefined)[] = items.map((track: any) =>
    filterTrack(track),
  );
  tracks = tracks.filter((track) => track !== undefined);
  return res
    .status(200)
    .setHeader('Cache-Control', `max-age=0, public, s-maxage=${24 * 60 * 60}`)
    .send(tracks);
}
