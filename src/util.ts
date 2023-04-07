export function formatRequest(root: string, args?: Object) {
  let url = root;
  if (args) {
    const formattedArgs: String[] = [];
    for (const key in args) {
      const value = args[key];
      formattedArgs.push(`${key}=${value}`);
    }
    url = `${url}?${formattedArgs.join('&')}`;
  }
  return url;
}
