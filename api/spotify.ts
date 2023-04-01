import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as spotify from '../src/spotify';


export default async function (req: VercelRequest, res: VercelResponse) {
  const nowPlaying = await spotify.getNowPlaying();
  const recentlyPlayed = await spotify.getRecentlyPlayed();
  const topSongs = await spotify.getTopSongs();
  const topArtists = await spotify.getTopArtists();
  res.send({
    nowPlaying: nowPlaying,
    recentlyPlayed: recentlyPlayed,
    topSongs: topSongs,
    topArtists: topArtists,
  });
}

