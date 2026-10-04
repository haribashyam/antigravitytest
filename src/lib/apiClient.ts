/**
 * FuelWise Authenticated Client API Fetcher
 *
 * Automatically includes session cookies and client Bearer tokens
 * to guarantee seamless authentication across browsers and environments.
 */

export function getAuthHeaders(existingHeaders: HeadersInit = {}): Record<string, string> {
  const headers: Record<string, string> = {};

  if (existingHeaders instanceof Headers) {
    existingHeaders.forEach((val, key) => {
      headers[key] = val;
    });
  } else if (Array.isArray(existingHeaders)) {
    existingHeaders.forEach(([key, val]) => {
      headers[key] = val;
    });
  } else if (typeof existingHeaders === 'object' && existingHeaders !== null) {
    Object.assign(headers, existingHeaders);
  }

  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('fuelwise_token');
    if (token && !headers['Authorization'] && !headers['authorization']) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
}

export async function authFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const headers = getAuthHeaders(init?.headers);
  const mergedInit: RequestInit = {
    ...init,
    credentials: init?.credentials || 'same-origin',
    headers,
  };

  return fetch(input, mergedInit);
}
