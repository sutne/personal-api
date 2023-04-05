import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as spotify from '../../src/spotify/middleware';
import { TrackType } from '../../src/spotify/types';
import { formatRequest } from '../../src/util';

const REQUEST_URL = formatRequest("https://api.spotify.com/v1/me/top/tracks", {
  limit: spotify.CONFIG.LIMIT,
  time_range: spotify.CONFIG.TIME_RANGE,
});

export default async function (req: VercelRequest, res: VercelResponse) {
  const response = await spotify.fetchFromApi(REQUEST_URL);
  const songs = response.items?.map((artist: any) => filterTopSong(artist));
  res.send(songs ?? []);
}

function filterTopSong(top_song: any): TrackType | undefined {
  try {
    const filtered: TrackType = {
      title: top_song.name,
      artists: top_song.artists.map((artist: any) => artist.name),
      image: top_song.album.images[0].url,
      isExplicit: top_song.explicit,
      isLocal: top_song.is_local,
      href: top_song.external_urls.spotify,
      sample: top_song.preview_url,
    };
    return filtered;
  } catch (error) {
    console.log(error);
  }
}