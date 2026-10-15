export function sanitizeRedirect(input: string | null): string {
  if (!input) return '/';
  if (!input.startsWith('/') || input.startsWith('//') || input.includes('\\') || input.includes('http:') || input.includes('https:')) {
    return '/';
  }
  return input;
}
