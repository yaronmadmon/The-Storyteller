import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const protectedPathPrefixes = ["/setup", "/library", "/dashboard", "/writing", "/intro", "/settings", "/book-preview"];

function isProtectedPath(pathname: string): boolean {
  return protectedPathPrefixes.some((prefix) =>
    pathname === prefix || pathname.startsWith(prefix + "/")
  );
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect old /intro/[bookId] to writing (Phase 2)
  const introMatch = request.nextUrl.pathname.match(/^\/intro\/([^/]+)$/);
  if (introMatch) {
    const url = request.nextUrl.clone();
    url.pathname = `/writing/${introMatch[1]}`;
    url.searchParams.set("chapter", "1");
    const redirectRes = NextResponse.redirect(url);
    response.cookies.getAll().forEach((c) => redirectRes.cookies.set(c.name, c.value));
    return redirectRes;
  }

  if (isProtectedPath(request.nextUrl.pathname) && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", request.nextUrl.pathname);
    const redirectRes = NextResponse.redirect(url);
    response.cookies.getAll().forEach((c) => redirectRes.cookies.set(c.name, c.value));
    return redirectRes;
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/auth|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
