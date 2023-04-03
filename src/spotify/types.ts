export type Track = {
  title: string,
  artists: string[],
  art: string,
  isExplicit: boolean,
  isLocal: boolean,
  href: string,
  sample: string,
}

export type NowPlaying = Track & {
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