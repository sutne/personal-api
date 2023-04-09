import { VercelRequest, VercelResponse } from '@vercel/node';

import * as github from '../../src/github/middleware';
import { RepoType } from '../../src/github/types';

const USERNAME = process.env.GITHUB_USERNAME;

export default async function (req: VercelRequest, res: VercelResponse) {
  let repos = await github.fetch(`/users/${USERNAME}/repos`);
  if (!repos) return res.status(500).send('Failed to load GitHub data');
  repos = await filterRepos(repos);

  const organizations = await getOrganizations();
  if (!organizations) return res.status(500).send('Failed to load GitHub data');

  for (const org of organizations) {
    const orgRepos = await github.fetch(`/orgs/${org}/repos`);
    if (!orgRepos) return res.status(500).send('Failed to load GitHub data');
    const filtered = await filterRepos(orgRepos);
    repos = repos.concat(filtered);
  }

  return res
    .status(200)
    .setHeader('Cache-Control', `max-age=0, public, s-maxage=${24 * 60 * 60}`)
    .send(repos);
}

export async function getOrganizations(): Promise<String[] | undefined> {
  const orgs = await github.fetch(`/users/${USERNAME}/orgs`);
  if (orgs.error) return;
  return orgs.map((org: any) => org.login);
}

export async function filterRepos(repos: any[]): Promise<RepoType[]> {
  const filtered: RepoType[] = [];
  for (const repo of repos) {
    if (repo.name.startsWith('.')) continue;
    filtered.push(await filterRepo(repo));
  }
  return filtered;
}

export async function filterRepo(repo: any): Promise<RepoType> {
  const languages = await github.fetch(repo.languages_url);
  const filtered = {
    name: repo.name,
    description: repo.description,
    href: repo.url,
    isPrivate: repo.private,
    website: repo.website ? repo.website : undefined,
    stars: repo.stargazers_count,
    issues: repo.open_issues,
    forks: repo.forks,
    createdAt: repo.created_at,
    updatedAt: repo.updated_at,
    owner: {
      name: repo.owner.login,
      image: repo.owner.avatar_url,
      href: repo.owner.html_url,
      type: repo.owner.type,
    },
    size: Object.keys(languages).reduce((sum, key) => sum + languages[key], 0),
    languages: {
      ...languages,
    },
  };
  return filtered;
}
