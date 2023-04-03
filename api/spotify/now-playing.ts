import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as spotify from '../../src/spotify/middleware';
import { NowPlaying } from '../../src/spotify/types';
import { formatRequest } from '../../src/util';

const REQUEST_URL = formatRequest("https://api.spotify.com/v1/me/player/currently-playing");




export default async function (req: VercelRequest, res: VercelResponse) {
  const response = await spotify.fetchFromApi(REQUEST_URL);
  const nowPlaying = filterNowPlaying(response);
  res.send(nowPlaying);
}

function filterNowPlaying(now_playing: any): NowPlaying | undefined {
  if (!now_playing?.is_playing) return;
  try {
    const filtered: NowPlaying = {
      title: now_playing.item.name,
      artists: now_playing.item.artists.map((artist: any) => artist.name),
      art: now_playing.item.album.images[1].url,
      length: now_playing.item.duration_ms,
      progress: now_playing.progress_ms,
      isExplicit: now_playing.item.explicit,
      isLocal: now_playing.item.is_local,
      href: now_playing.item.external_urls.spotify,
      sample: now_playing.item.preview_url,
    }
    return filtered;
  } catch (error) {
    console.log(error);
  }
}