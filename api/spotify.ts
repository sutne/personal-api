import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as spotify from '../src/spotify/middleware';
import { SpotifyResponse } from '../src/spotify/types';


export default async function (req: VercelRequest, res: VercelResponse) {
  const [nowPlaying, recentlyPlayed, topArtists, topSongs] = await Promise.all([
    spotify.getNowPlaying(),
    spotify.getRecentlyPlayed(),
    spotify.getTopArtists(),
    spotify.getTopSongs(),
  ]);
  const response: SpotifyResponse = {
    status: {
      error: false,
      errorMessage: '',
    },
    data: {
      nowPlaying: nowPlaying,
      recentlyPlayed: recentlyPlayed,
      topArtists: topArtists,
      topSongs: topSongs,
    }
  }
  res.send(response);
}
