import { VercelRequest, VercelResponse } from '@vercel/node';

import * as github from '../../src/github/middleware';

import { getOrganizations } from './repos';

const USERNAME = process.env.GITHUB_USERNAME;

export default async function (req: VercelRequest, res: VercelResponse) {
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
  let languages: Map<string, number> = new Map();
  for (const repo of repos) {
    const lang = await github.fetch(repo.languages_url);
    const size = Object.keys(lang).reduce((sum, key) => sum + lang[key], 0);
    totalSize += size;
    for (const key in lang) {
      if (languages.has(key)) {
        languages.set(key, languages.get(key)! + lang[key]);
      } else {
        languages.set(key, lang[key]);
      }
    }
  }
  const sorted = new Map([...languages.entries()].sort((a, b) => b[1] - a[1]));

  return res
    .status(200)
    .setHeader(
      'Cache-Control',
      `max-age=0, public, s-maxage=${7 * 24 * 60 * 60}`,
    )
    .send({
      total: totalSize,
      languages: Object.fromEntries(sorted),
    });
}
