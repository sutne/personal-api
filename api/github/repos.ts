import { VercelRequest, VercelResponse } from '@vercel/node';
import * as github from '../../src/github/middleware';
import { RepoType } from '../../src/github/types';

const USERNAME = process.env.GITHUB_USERNAME;

export default async function (req: VercelRequest, res: VercelResponse) {
  const personalRepos = await getPersonalRepos();
  if (!personalRepos) return res.status(500).send('Failed to load GitHub data');

  const organizations = await getOrganizations();
  if (!organizations) return res.status(500).send('Failed to load GitHub data');

  const orgRepos: RepoType[] = [];
  for (const org of organizations) {
    const repos = await getOrganizationRepos(org);
    if (!repos) return res.status(500).send('Failed to load GitHub data');
    orgRepos.push(...repos);
  }

  return res.status(200).send(personalRepos.concat(orgRepos));
}

async function getPersonalRepos(): Promise<RepoType[] | undefined | any> {
  const repos = await github.fetchFromApi(`/users/${USERNAME}/repos`);
  if (repos.error) return repos.error;

  const filtered: RepoType[] = [];
  repos.forEach(async (repo: any) => {
    filtered.push(await filterRepo(repo));
  });
  return filtered;
}

async function getOrganizations(): Promise<string[] | undefined> {
  const orgs = await github.fetchFromApi(`/users/${USERNAME}/orgs`);
  if (orgs.error) return;
  return orgs.map((org: any) => org.login);
}

async function getOrganizationRepos(
  org: string,
): Promise<RepoType[] | undefined> {
  const repos = await github.fetchFromApi(`/orgs/${org}/repos`);
  if (repos.error) return;

  const filtered: RepoType[] = [];
  repos.forEach(async (repo: any) => {
    filtered.push(await filterRepo(repo));
  });
  return filtered;
}

async function filterRepo(repo: any): Promise<RepoType> {
  console.log(`Filtering '${repo.name}': ${repo.languages_url}`);
  const languages = await github.fetchFromApi(repo.languages_url);
  return {
    name: repo.name,
    description: repo.description,
    href: repo.rul,
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
}
