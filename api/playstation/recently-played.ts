import type { VercelRequest, VercelResponse } from "@vercel/node";

import * as playstation from "../../src/playstation/middleware";
import { formatURL } from "../../src/util";
import { GameType } from "../../src/playstation/types";
import { GameResponseType } from "../../src/playstation/api-types";

const REQUEST_URL = formatURL(
  "https://web.np.playstation.com/api/graphql/v1/op",
  {
    operationName: "getUserGameList",
    variables: {
      limit: 50,
      categories: "ps4_game,ps5_native_game",
    },
    extensions: {
      persistedQuery: {
        version: 1,
        sha256Hash: process.env.PLAYSTATION_HASH,
      },
    },
  },
);

export default async function (req: VercelRequest, res: VercelResponse) {
  const response = await playstation.fetchFromApi(REQUEST_URL);
  if (!response?.data?.gameLibraryTitlesRetrieve?.games) {
    return res.status(500).send(response);
  }
  const games = response.data.gameLibraryTitlesRetrieve.games.map(
    (game: GameResponseType) =>
      ({
        platform: game.platform,
        title: game.name,
        image: game.image.url,
        lastPlayedAt: game.lastPlayedDateTime,
      } as GameType),
  );
  return res
    .status(200)
    .setHeader("Cache-Control", "max-age=0, public, s-maxage=18000")
    .send(games);
}
