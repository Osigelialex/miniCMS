import { createServerClient, parseCookieHeader, serializeCookieHeader } from '@supabase/ssr'

export const getServerClient = (request: Request) => {
  const headers = new Headers();
  const supabase = createServerClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        const cookies = parseCookieHeader(request.headers.get('Cookie') ?? '');
        return cookies
          .filter((cookie): cookie is { name: string; value: string } => cookie.value !== undefined)
          .map((cookie) => ({
            name: cookie.name,
            value: cookie.value,
          }));
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          headers.append('Set-Cookie', serializeCookieHeader(name, value, {
            ...options,
            maxAge: 60 * 60 * 24 * 30,
            sameSite: 'lax',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production'
          }))
        )
      },
    },
  })

  return { supabase, headers };
}
