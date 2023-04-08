export function formatURL(root: string, args?: Object) {
  console.log({ root });
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
