export const SUTNE_ID = process.env.PLAYSTATION_USER_ID_SUTNE ?? '';
export const SIVVI_ID = process.env.PLAYSTATION_USER_ID_SIVVI ?? '';

if (!SUTNE_ID || !SIVVI_ID) throw new Error('User IDs not provided.');
export const ACCOUNTS = [SUTNE_ID, SIVVI_ID];
