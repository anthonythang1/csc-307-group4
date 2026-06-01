import { supabase } from './supabaseClient';

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined)
  ?.replace(/\/+$/, '');

function withApiBaseUrl(input: RequestInfo | URL) {
  if (!apiBaseUrl) {
    return input;
  }

  if (typeof input === 'string' && input.startsWith('/api')) {
    return `${apiBaseUrl}${input}`;
  }

  if (
    input instanceof URL &&
    input.origin === window.location.origin &&
    input.pathname.startsWith('/api')
  ) {
    return new URL(`${apiBaseUrl}${input.pathname}${input.search}${input.hash}`);
  }

  return input;
}

export async function apiFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const headers = new Headers(init.headers);

  if (supabase) {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  return fetch(withApiBaseUrl(input), {
    ...init,
    headers,
  });
}
