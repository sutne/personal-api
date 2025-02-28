import type { VercelRequest, VercelResponse } from '@vercel/node';
import { CONFIG } from '../../src/spotify/config';
import * as spotify from '../../src/spotify/middleware';
import type { TrackType } from '../../src/spotify/types';
import { cacheControl, formatURL } from '../../src/util';
import { filterTrack } from './now-playing';

const REQUEST_URL = formatURL('https://api.spotify.com/v1/me/player/recently-played', {
  limit: CONFIG.LIMIT,
});

export default async function (req: VercelRequest, res: VercelResponse) {
  const response = await spotify.fetch(REQUEST_URL);
  const items = response?.items;
  if (!items) {
    console.error({ response });
    return res.status(404).send([]);
  }
  const tracks: TrackType[] = items
    .map((track: any) => filterTrack(track.track))
    .filter((t: TrackType | undefined) => t !== undefined);
  const unique = tracks.filter(
    (track, i) => i === tracks.findIndex((t) => t.href === track.href),
  );
  return res
    .status(200)
    .setHeader('Cache-Control', cacheControl({ seconds: 1 }))
    .send(unique);
}
