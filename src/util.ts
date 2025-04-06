export function formatURL(root: string, args?: object) {
  if (!args) return root;
  const query = Object.entries(args)
    .map(([key, value]) => {
      if (typeof value === 'object') {
        value = encodeURIComponent(JSON.stringify(value));
      }
      return `${key}=${value}`;
    })
    .join('&');
  return `${root}?${query}`;
}

export function B64String(str: string) {
  return Buffer.from(str).toString('base64');
}

export function convert(data: any, contentType?: string) {
  if (!data || !contentType) return data;
  if (typeof data === 'string') return data;
  switch (contentType) {
    case 'application/json':
      return JSON.stringify(data);
    case 'application/x-www-form-urlencoded':
      return Object.entries(data)
        .map(([key, value]) => {
          return `${key}=${value}`;
        })
        .join('&');
    default:
      return data?.toString() ?? '';
  }
}

/**
 * @returns difference in ms between the two dates. Sorting will give latest time first.
 */
export function compareDate(a: string | undefined, b: string | undefined): number {
  const aTime = !a ? 0 : new Date(a).getTime();
  const bTime = !b ? 0 : new Date(b).getTime();
  return bTime - aTime;
}

/**
 * @returns the earliest of the two date strings.
 */
export function earliestDate(
  a: string | undefined,
  b: string | undefined,
): string | undefined {
  const aIsEarliest = 0 < compareDate(a, b);
  return aIsEarliest ? a : b;
}

/**
 * @returns the latest of the two date strings.
 */
export function latestDate(
  a: string | undefined,
  b: string | undefined,
): string | undefined {
  const aIsEarliest = 0 < compareDate(a, b);
  return aIsEarliest ? b : a;
}

type Time = {
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
};
/**
 * @returns Cache-Control header string with the given time in the format:
 * `max-age=0, public, s-maxage=${time}`
 */
export function cacheControl({ days, hours, minutes, seconds }: Time): string {
  const totalSeconds =
    (days ?? 0) * 24 * 60 * 60 +
    (hours ?? 0) * 60 * 60 +
    (minutes ?? 0) * 60 +
    (seconds ?? 0);
  return `max-age=0, public, s-maxage=${totalSeconds}`;
}

export function json(object: any): string {
  return JSON.stringify(object, null, 2);
}
