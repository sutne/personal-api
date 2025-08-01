import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as github from '../../src/github/middleware';
import { cacheControl } from '../../src/util';
import { getOrganizations } from './repos';

const USERNAME = process.env.GITHUB_USERNAME?.trim() ?? '';

export default async function (_req: VercelRequest, res: VercelResponse) {
  let totalSize = 0;
  let repos: any[] = [];

  // Get all personal repos
  const personal = await github.fetch(`/users/${USERNAME}/repos`);
  if (!repos) return res.status(500).send('Failed to load GitHub data');
  repos = repos.concat(personal);

  // Get repos from all organizations
  const organizations = await getOrganizations();
  if (!organizations) return res.status(500).send('Failed to load GitHub data');
  for (const org of organizations) {
    const orgrepos = await github.fetch(`/orgs/${org}/repos`);
    if (!orgrepos) return res.status(500).send('Failed to load GitHub data');
    repos = repos.concat(orgrepos);
  }

  // get language stats for each repo
  const languages: Map<string, number> = new Map();
  const langs = await Promise.all(
    repos.map((repo) => github.fetch(repo.languages_url)),
  );
  for (const lang of langs) {
    const size = Object.keys(lang).reduce((sum, key) => sum + lang[key], 0);
    totalSize += size;
    for (const key in lang) {
      languages.set(key, (languages.get(key) ?? 0) + lang[key]);
    }
  }

  const sortedList = Array.from(languages.entries()).sort((a, b) => b[1] - a[1]);
  const sorted = new Map(sortedList);

  return res
    .status(200)
    .setHeader('Cache-Control', cacheControl({ days: 7 }))
    .send({
      total: totalSize,
      languages: Object.fromEntries(sorted),
    });
}
