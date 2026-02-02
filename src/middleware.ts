import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            req.cookies.set(name, value),
          );
          res = NextResponse.next({
            request: {
              headers: req.headers,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const pathname = req.nextUrl.pathname;
  const isLoginPage = pathname === "/login";

  // Pages autorisées pour les utilisateurs connectés
  const allowedPaths = ["/dashboard", "/note/new"];
  const isDynamicNotePath = pathname.match(/^\/note\/[^/]+$/);

  const isAllowedPath =
    allowedPaths.includes(pathname) || isDynamicNotePath !== null;

  // Rediriger vers /login si non connecté et pas sur la page de login
  if (!session && !isLoginPage) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  // Si connecté et sur la page de login, rediriger vers /dashboard
  if (session && isLoginPage) {
    const dashboardUrl = new URL("/dashboard", req.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // Si connecté mais sur une page non autorisée, rediriger vers /dashboard
  if (session && !isLoginPage && !isAllowedPath) {
    const dashboardUrl = new URL("/dashboard", req.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};
