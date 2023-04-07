export type RepoType = {
  name: string;
  description: string;
  href: string;
  stars: number;
  forks: number;
  issues: number;
  isPrivate: boolean;
  createdAt: number;
  updatedAt: number;
  website: string | undefined;
  owner: {
    name: string;
    image: string;
    href: string;
    type: string;
  };
  size: number;
  languages: {
    [key: string]: number;
  };
};
