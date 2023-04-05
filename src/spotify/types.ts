export type TrackType = {
  title: string,
  artists: string[],
  image: string,
  sample: string,
  href: string,
  isExplicit: boolean,
  isLocal: boolean,
}

export type NowPlayingType = TrackType & {
  length: number,
  startedAt: number,
}

export type ArtistType = {
  name: string,
  genres: string[],
  image: string,
  href: string,
}