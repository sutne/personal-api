import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as spotify from '../src/spotify';


export default async function (req: VercelRequest, res: VercelResponse) {
  const [nowPlaying, recentlyPlayed, topArtists, topSongs] = await Promise.all([
    spotify.getNowPlaying().catch((err) => { console.log(err) }),
    spotify.getRecentlyPlayed().catch((err) => { console.log(err) }),
    spotify.getTopArtists().catch((err) => { console.log(err) }),
    spotify.getTopSongs().catch((err) => { console.log(err) }),
  ]);
  res.send({
    nowPlaying: nowPlaying,
    recentlyPlayed: recentlyPlayed,
    topArtists: topArtists,
    topSongs: topSongs,
  });
}

