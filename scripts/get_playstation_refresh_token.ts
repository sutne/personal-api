// run with:
// npx ts-node scripts/get_playstation_refresh_token.ts

import { exchangeCodeForAccessToken, exchangeNpssoForCode } from 'psn-api';

// Follow instruction from psn-api to acquire NPSSO-Session-Token
// https://psn-api.achievements.app/authentication/authenticating-manually
const NPSSO = '<64-char-token>';

async function getTokens() {
  const accessCode = await exchangeNpssoForCode(NPSSO);
  console.log({ accessCode });
  const authorization = await exchangeCodeForAccessToken(accessCode);
  console.log({ authorization });
}
getTokens();
