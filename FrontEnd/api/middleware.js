// middleware.js
import { NextResponse } from "next/server";

export function middleware(req) {
	const { pathname } = req.nextUrl;

	// Allow these paths to pass
	if (
		pathname.startsWith("/api") ||
		pathname.startsWith("/_next") ||
		pathname.startsWith("/favicon.ico") ||
		pathname.startsWith("/static")
	) {
		return NextResponse.next();
	}

	// Tudo que não for API ou assets, retorna JSON de erro
	return new Response(JSON.stringify({ error: "Route not found" }), {
		status: 404,
		headers: {
			"Content-Type": "application/json",
		},
	});
}

export const config = {
	matcher: ["/((?!_next|api|static|favicon.ico).*)"],
};
