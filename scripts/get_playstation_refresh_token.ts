import { exchangeCodeForAccessToken, exchangeNpssoForCode } from 'psn-api';

// run with:
// npx ts-node scripts/get_playstation_refresh_token.ts

// Follow instruction from psn-api to acquire NPSSO-Session-Token
// https://psn-api.achievements.app/authentication/authenticating-manually
const token = { npsso: '<64-char-token>' };

async function getTokens() {
  const accessCode = await exchangeNpssoForCode(token.npsso);
  console.log({ accessCode });
  const authorization = await exchangeCodeForAccessToken(accessCode);
  console.log({ authorization });
}
getTokens();
