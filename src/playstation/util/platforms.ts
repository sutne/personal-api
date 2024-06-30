import { Platform } from '../types';

export function platform(trophyTitlePlatform: string): Platform {
  switch (trophyTitlePlatform) {
    case 'PS2':
      return 'PS2';
    case 'PS3':
      return 'PS3';
    case 'PS4':
      return 'PS4';
    case 'PS5':
    case 'PS5,PSPC':
      return 'PS5';
  }
  throw new Error('Unknown platform: ' + trophyTitlePlatform);
}

type NpServiceName = undefined | 'trophy' | 'trophy2';
export function getNpServiceName(platform: Platform): NpServiceName {
  switch (platform) {
    case 'PS3':
      return 'trophy';
    case 'PS4':
      return 'trophy';
    case 'PS5':
      return 'trophy2';
    default:
      return undefined;
  }
}
