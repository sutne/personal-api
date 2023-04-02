import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as spotify from '../src/spotify';


export default async function (req: VercelRequest, res: VercelResponse) {
  const [nowPlaying, recentlyPlayed, topArtists] = await Promise.all([
    spotify.getNowPlaying().catch(() => { }),
    spotify.getRecentlyPlayed().catch(() => { }),
    spotify.getTopArtists().catch(() => { }),
    // spotify.getTopAlbums().catch(() => { }),
  ]);
  res.send({
    nowPlaying: nowPlaying,
    recentlyPlayed: recentlyPlayed,
    topArtists: topArtists,
    // topAlbums: topAlbums,
  });
}

