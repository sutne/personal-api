import { Artist, NowPlaying, Song, filterNowPlaying, filterRecentSong, filterTopArtist, filterTopSong } from "./types";

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET
const REFRESH_TOKEN = process.env.SPOTIFY_REFRESH_TOKEN

const LIMIT = 5; // max number of elements to get for each query
const TIME_RANGE = "short_term"; // ≈ last 4 weeks

const SPOTIFY_API = {
  REFRESH_TOKEN: "https://accounts.spotify.com/api/token",
  NOW_PLAYING: "https://api.spotify.com/v1/me/player/currently-playing",
  RECENTLY_PLAYED: `https://api.spotify.com/v1/me/player/recently-played?limit=${LIMIT}`,
  TOP_SONGS: `https://api.spotify.com/v1/me/top/tracks?limit=${LIMIT}&time_range=${TIME_RANGE}`,
  TOP_ARTISTS: `https://api.spotify.com/v1/me/top/artists?limit=${LIMIT}&time_range=${TIME_RANGE}`,
}



export async function getNowPlaying(): Promise<NowPlaying | undefined> {
  const response = await fetchFromApi(SPOTIFY_API.NOW_PLAYING);
  return filterNowPlaying(response);
}

export async function getRecentlyPlayed(): Promise<Song[]> {
  const response = await fetchFromApi(SPOTIFY_API.RECENTLY_PLAYED);
  const songs = response.items?.map((song: any) => filterRecentSong(song.track));
  return songs ?? [];
}

export async function getTopArtists(): Promise<Artist[]> {
  const response = await fetchFromApi(SPOTIFY_API.TOP_ARTISTS);
  const artists = response.items?.map((artist: any) => filterTopArtist(artist));
  return artists ?? [];
}

export async function getTopSongs(): Promise<Song[]> {
  const response = await fetchFromApi(SPOTIFY_API.TOP_SONGS);
  const songs = response.items?.map((album: any) => filterTopSong(album));
  return songs ?? [];
}


async function fetchFromApi(url: string): Promise<any> {
  const response = await fetch(url,
    {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${await getToken()}`
      },
    }).then(res => {
      if (!res.ok) console.error({ url, res });
      return res.json();
    }).catch(error => { console.error(error) });
  return response;
}


async function getToken(): Promise<string> {
  const BASE64 = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')
  const response = await fetch(SPOTIFY_API.REFRESH_TOKEN,
    {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        "Authorization": `Basic ${BASE64}`
      },
      body: [
        `grant_type=refresh_token`,
        `refresh_token=${REFRESH_TOKEN}`
      ].join("&"),
    },
  ).then(res => {
    if (!res.ok) console.error({ res });
    return res.json();
  }).catch(error => { console.error(error) });
  return response.access_token;
}

// const token = await getToken({
//   req,
//   secret: process.env.JWT_SECRET,
//   secureCookie:
//     process.env.NEXTAUTH_URL?.startsWith("https://") ??
//     !!process.env.VERCEL_URL,
// });