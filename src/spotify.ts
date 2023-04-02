
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET
const REFRESH_TOKEN = process.env.SPOTIFY_REFRESH_TOKEN

const SPOTIFY_API = {
  REFRESH_TOKEN: "https://accounts.spotify.com/api/token",
  NOW_PLAYING: "https://api.spotify.com/v1/me/player/currently-playing",
  RECENTLY_PLAYED: "https://api.spotify.com/v1/me/player/recently-played?limit=3",
  // TOP_SONGS: "https://api.spotify.com/v1/me/top/tracks?limit=5&time_range=short_term",
  TOP_ARTISTS: "https://api.spotify.com/v1/me/top/artists?limit=5&time_range=short_term",
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

export async function getNowPlaying(): Promise<any> {
  const response = await fetch(SPOTIFY_API.NOW_PLAYING,
    {
      method: "GET",
      headers: { "Authorization": `Bearer ${await _getToken()}` },
    },
  ).then(res => res.json()).catch(err => console.log(err));
  return _filterNowPlaying(response);
}

export async function getRecentlyPlayed(): Promise<JSON> {
  const response = await fetch(SPOTIFY_API.RECENTLY_PLAYED,
    {
      method: "GET",
      headers: { "Authorization": `Bearer ${await _getToken()}` },
    },
  ).then(res => res.json()).catch(err => console.log(err));
  const songs = response.items.map((song: any) => _filterRecentSong(song.track));
  return songs;
}

export async function getTopArtists(): Promise<JSON> {
  const response = await fetch(SPOTIFY_API.TOP_ARTISTS,
    {
      method: "GET",
      headers: { "Authorization": `Bearer ${await _getToken()}` },
    },
  ).then(res => res.json()).catch(err => console.log(err));
  const artists = response.items.map((artist: any) => _filterTopArtist(artist));
  return artists;
}

// export async function getTopAlbums(): Promise<JSON> {
//   const response = await fetch(SPOTIFY_API.TOP_SONGS,
//     {
//       method: "GET",
//       headers: { "Authorization": `Bearer ${await _getToken()}` },
//     },
//   ).then(res => res.json()).catch(err => console.log(err));
//   const songs = response.items.map((album: any) => _filterTopAlbums(album));
//   return songs;
// }



function _filterNowPlaying(song: any): any {
  return {
    title: song.item.name,
    artists: song.item.artists.map((artist: any) => artist.name),
    art: song.item.album.images[0].url,
    startedAt: song.timestamp,
    progress: song.progress_ms,
    explicit: song.explicit,
    is_local: song.is_local,
    href: song.item.external_urls.spotify,
    sample: song.item.preview_url,
  }
}

function _filterRecentSong(song: any): any {
  return {
    name: song.name,
    artists: song.artists.map((artist: any) => artist.name),
    art: song.album.images[0].url,
    explicit: song.explicit,
    is_local: song.is_local,
    sample: song.preview_url,
    href: song.external_urls.spotify,
  };
}



function _filterTopArtist(artist: any): any {
  return {
    name: artist.name,
    genres: artist.genres,
    image: artist.images[0].url,
    href: artist.external_urls.spotify,
  };
}