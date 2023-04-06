import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as spotify from '../../src/spotify/middleware';
import { TrackType } from '../../src/spotify/types';
import { formatRequest } from '../../src/util';
import { filterTrack } from './now-playing';

const REQUEST_URL = formatRequest("https://api.spotify.com/v1/me/top/tracks", {
  limit: spotify.CONFIG.LIMIT,
  time_range: spotify.CONFIG.TIME_RANGE,
});

export default async function (req: VercelRequest, res: VercelResponse) {
  const response = await spotify.fetchFromApi(REQUEST_URL);
  const items = response?.items;
  if (!items) return res.send([]);
  let tracks: (TrackType | undefined)[] = items.map((track: any) => filterTrack(track));
  // Remove undefined
  tracks = tracks.filter((track) => track !== undefined);
  return res.send(tracks);
}

