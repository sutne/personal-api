import fs from 'fs';

export function formatURL(root: string, args?: Object) {
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

export function writeJSON(filename: string, data: any) {
  const path = `${filename}.json`;
  const dataString = JSON.stringify(data, null, 2);
  fs.writeFile(path, dataString, (err: any) => console.error(err));
}

export function earliestDate(a: string | undefined, b: string | undefined) {
  if (!a) return b;
  if (!b) return a;
  const aDate = new Date(a);
  const bDate = new Date(b);
  return aDate < bDate ? a : b;
}
