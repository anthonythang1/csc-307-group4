// small helper to read a cookie value by name
export function readCookie(name: string): string | null {
  const match = document.cookie.split('; ').find(c => c.startsWith(name + '='));
  if (!match) return null;
  return decodeURIComponent(match.split('=').slice(1).join('='));
}
