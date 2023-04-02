import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as spotify from '../src/spotify';


export default async function (req: VercelRequest, res: VercelResponse) {
  const nowPlaying = await spotify.getNowPlaying().catch(() => { });
  const recentlyPlayed = await spotify.getRecentlyPlayed().catch(() => { });
  const topSongs = await spotify.getTopSongs().catch(() => { });
  const topArtists = await spotify.getTopArtists().catch(() => { });
  res.send({
    nowPlaying: nowPlaying,
    recentlyPlayed: recentlyPlayed,
    topSongs: topSongs,
    topArtists: topArtists,
  });
}

