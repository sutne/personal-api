import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as spotify from '../../src/spotify/middleware';
import { NowPlayingType, TrackType } from '../../src/spotify/types';
import { formatRequest } from '../../src/util';

const REQUEST_URL = formatRequest(
  'https://api.spotify.com/v1/me/player/currently-playing',
);

export default async function (req: VercelRequest, res: VercelResponse) {
  const response = await spotify.fetchFromApi(REQUEST_URL);
  const nowPlaying = filterNowPlaying(response);
  res.send(nowPlaying);
}

function filterNowPlaying(now_playing: any): NowPlayingType | undefined {
  if (!now_playing?.is_playing) return;
  const track = filterTrack(now_playing.item);
  if (!track) return;
  try {
    const progress = {
      length: now_playing.item.duration_ms,
      elapsed: now_playing.progress_ms,
      timestamp: now_playing.timestamp,
    };
    return { ...track, ...progress };
  } catch (error) {
    console.log(error);
  }
}

export function filterTrack(track: any): TrackType | undefined {
  try {
    if (track.is_local) return;
    const filtered: TrackType = {
      title: track.name,
      artists: track.artists.map((artist: any) => artist.name),
      image: track.album.images[0].url,
      isExplicit: track.explicit,

      href: track.external_urls.spotify,
      sample: track.preview_url,
    };
    return filtered;
  } catch (error) {
    console.log(error);
  }
}
