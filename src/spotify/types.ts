export type SpotifyResponse = {
  status: ApiStatus,
  data: {
    nowPlaying: NowPlaying | undefined,
    recentlyPlayed: Song[],
    topArtists: Artist[],
    topSongs: Song[],
  }
}

export type Song = {
  title: string,
  artists: string[],
  art: string,
  isExplicit: boolean,
  isLocal: boolean,
  href: string,
  sample: string,
}

export type NowPlaying = Song & {
  isPlaying: boolean,
  length: number,
  progress: number,
}

export type Artist = {
  name: string,
  genres: string[],
  image: string,
  href: string,
}

export type ApiStatus = {
  error: boolean,
  errorMessage: string,
}





export function filterNowPlaying(now_playing: any): NowPlaying | undefined {
  if (now_playing.is_playing === false) return;
  try {
    const filtered: NowPlaying = {
      isPlaying: true,
      title: now_playing.item.name,
      artists: now_playing.item.artists.map((artist: any) => artist.name),
      art: now_playing.item.album.images[0].url,
      length: now_playing.item.duration_ms,
      progress: now_playing.progress_ms,
      isExplicit: now_playing.item.explicit,
      isLocal: now_playing.item.is_local,
      href: now_playing.item.external_urls.spotify,
      sample: now_playing.item.preview_url,
    }
    // console.log({ now_playing, filtered })
    return filtered;
  } catch (error) {
    console.log(error);
  }

}

export function filterRecentSong(recent_song: any): Song | undefined {
  try {
    const filtered: Song = {
      title: recent_song.name,
      artists: recent_song.artists.map((artist: any) => artist.name),
      art: recent_song.album.images[0].url,
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

export function filterTopSong(top_song: any): Song | undefined {
  try {
    const filtered: Song = {
      title: top_song.name,
      artists: top_song.artists.map((artist: any) => artist.name),
      art: top_song.album.images[0].url,
      isExplicit: top_song.explicit,
      isLocal: top_song.is_local,
      href: top_song.external_urls.spotify,
      sample: top_song.preview_url,
    };
    // console.log({ top_song, filtered })
    return filtered;
  } catch (error) {
    console.log(error);
  }
}

export function filterTopArtist(artist: any): Artist | undefined {
  try {
    const filtered: Artist = {
      name: artist.name,
      genres: artist.genres,
      image: artist.images[0].url,
      href: artist.external_urls.spotify,
    };
    // console.log({ artist, filtered })
    return filtered;
  } catch (error) {
    console.log(error);
  }
}