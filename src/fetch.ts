import { convert } from './util';

type get_args = {
  headers?: any;
};
type post_args = {
  headers?: any;
  body?: any;
};

/**
 * @param url Root URL
 * @param args `{ headers: {} }`
 */
export async function GET(url: string, args: get_args = {}) {
  return await MyFetch(url, {
    method: 'GET',
    headers: { ...args.headers },
  });
}

/**
 * @param url Root URL
 * @param args `{ headers: {}, body: {} }`
 */
export async function POST<T>(url: string, args: post_args = {}): Promise<T> {
  // Convert body to correct format
  const content = convert(args.body, args.headers?.['Content-Type']);

  // Perform post request
  return await MyFetch(url, {
    method: 'POST',
    headers: { ...args.headers },
    body: content,
  });
}

/**
 *
 * Wrapper for `fetch` to make requests to handle errors the same way
 * everywhere.
 *
 */
async function MyFetch<T>(url: string, args: object): Promise<T> {
  let error = {};
  try {
    // Perform fetch request
    const response = await fetch(url, args);
    // Make sure request was successful
    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }
    if (!response.body) return undefined;
    // Make sure response doesn't contain an error
    const data = await response.json();
    if (data.error) {
      error = data;
      throw new Error(data.error_description);
    }
    // Return parsed response
    return data;
  } catch (err) {
    console.error(`Fetch error: ${(err as Error).message}`, {
      url,
      args,
      error,
    });
  }
}
