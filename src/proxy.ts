import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Изменено название функции с middleware на proxy
export async function proxy(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request: { headers: request.headers },
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return request.cookies.getAll(); },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
                    supabaseResponse = NextResponse.next({ request });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // Проверяем сессию пользователя
    const { data: { user } } = await supabase.auth.getUser();

    // Логика редиректов (защита роутов)
    const isDashboard = request.nextUrl.pathname.startsWith('/projects') || request.nextUrl.pathname.startsWith('/profile');
    const isAuthPage = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/register');

    if (isDashboard && !user) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    if (isAuthPage && user) {
        return NextResponse.redirect(new URL('/projects', request.url));
    }

    return supabaseResponse;
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};