
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET
const REFRESH_TOKEN = process.env.SPOTIFY_REFRESH_TOKEN

const SPOTIFY_API = {
  REFRESH_TOKEN: "https://accounts.spotify.com/api/token",
  NOW_PLAYING: "https://api.spotify.com/v1/me/player/currently-playing",
  RECENTLY_PLAYED: "https://api.spotify.com/v1/me/player/recently-played?limit=5",
  TOP_SONGS: "https://api.spotify.com/v1/me/top/tracks?limit=5&time_range=short_term&offset=0",
  TOP_ARTISTS: "https://api.spotify.com/v1/me/top/artists?limit=5&time_range=short_term&offset=0",
}

async function _getToken(): Promise<string> {
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
  ).then(res => res.json()).catch(err => console.log(err));
  return response.access_token;
}


export async function getNowPlaying(): Promise<JSON> {
  const response = await fetch(SPOTIFY_API.NOW_PLAYING,
    {
      method: "GET",
      headers: { "Authorization": `Bearer ${await _getToken()}` },
    },
  ).then(res => res.json()).catch(err => console.log(err));
  return response;
}

export async function getRecentlyPlayed(): Promise<JSON> {
  const response = await fetch(SPOTIFY_API.RECENTLY_PLAYED,
    {
      method: "GET",
      headers: { "Authorization": `Bearer ${await _getToken()}` },
    },
  ).then(res => res.json()).catch(err => console.log(err));
  return response;
}

export async function getTopSongs(): Promise<JSON> {
  const response = await fetch(SPOTIFY_API.TOP_SONGS,
    {
      method: "GET",
      headers: { "Authorization": `Bearer ${await _getToken()}` },
    },
  ).then(res => res.json()).catch(err => console.log(err));
  return response;
}

export async function getTopArtists(): Promise<JSON> {
  const response = await fetch(SPOTIFY_API.TOP_ARTISTS,
    {
      method: "GET",
      headers: { "Authorization": `Bearer ${await _getToken()}` },
    },
  ).then(res => res.json()).catch(err => console.log(err));
  return response;
}