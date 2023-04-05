import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as spotify from '../../src/spotify/middleware';
import { TrackType } from '../../src/spotify/types';
import { formatRequest } from '../../src/util';

const REQUEST_URL = formatRequest("https://api.spotify.com/v1/me/player/recently-played", {
  limit: spotify.CONFIG.LIMIT,
});


export default async function (req: VercelRequest, res: VercelResponse) {
  const response = await spotify.fetchFromApi(REQUEST_URL);
  const songs = response.items?.map((song: any) => filterRecentSong(song.track));
  res.send(songs ?? []);
}

function filterRecentSong(recent_song: any): TrackType | undefined {
  try {
    const filtered: TrackType = {
      title: recent_song.name,
      artists: recent_song.artists.map((artist: any) => artist.name),
      image: recent_song.album.images[0].url,
      isExplicit: recent_song.explicit,
      isLocal: recent_song.is_local,
      href: recent_song.external_urls.spotify,
      sample: recent_song.preview_url,
    };
    // console.log({ recent_song, filtered })
    return filtered;
  } catch (error) {
    console.log(error)
  }
}
