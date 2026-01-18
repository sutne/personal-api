<div align="center">

# Personal Api

[![on push main][on-push-main-action-badge]][on-push-main-action]

</div>

Some basic endpoints hosted at [vercel][api] that I use for my personal projects.

## Development

### Configuration

To setup the dev environment, perform the following:

1. Install [mise][mise], make sure to also:
    - add auto-activation for your shell
    - add autocompletion (if it wasn't done automatically)
2. `mise install`
3. `mise run env-download`
    1. When prompted, sign in link this repo to the `personal-api` vercel project.
    2. rename the created: `.vercel/.env.production.local` to `.env`
    3. (optional) remove all variables that don't start with:
        - `SPOTIFY_`
        - `GITHUB_`
        - `PLAYSTATION_`

### Running

Once the dev environment is configured, launch the api with:

```sh
mise serve
```

> To show all available commands write `mise run` and hit **tab**.



[on-push-main-action]: https://github.com/sutne/personal-api/actions/workflows/on-push-main.yaml
[on-push-main-action-badge]: https://github.com/sutne/personal-api/actions/workflows/on-push-main.yaml/badge.svg
[api]: https://personal-sutne.vercel.app
[mise]: https://mise.jdx.dev/getting-started.html
