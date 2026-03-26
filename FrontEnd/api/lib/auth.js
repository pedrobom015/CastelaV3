// lib/auth.js

export function authenticateRequest(req) {
	const authHeader = req.headers["authorization"];

	if (!authHeader) {
		return { authorized: false, message: "Missing Authorization Header" };
	}

	const token = authHeader.replace("Bearer ", "");

	const SECRET_KEY = process.env.API_SECRET_KEY;

	if (token !== SECRET_KEY) {
		return { authorized: false, message: "Invalid API Token" };
	}

	return { authorized: true };
}
