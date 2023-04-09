export type TrackType = {
  title: string;
  artists: string[];
  image: string;
  sample: string;
  href: string;
  isExplicit: boolean;
};

export type NowPlayingType = TrackType & {
  length: number;
  elapsed: number;
  timestamp: number;
};

export type ArtistType = {
  name: string;
  genres: string[];
  image: string;
  href: string;
};
