import { supabase } from './supabaseClient';

export async function apiFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const headers = new Headers(init.headers);

  if (supabase) {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  return fetch(input, {
    ...init,
    headers,
  });
}
