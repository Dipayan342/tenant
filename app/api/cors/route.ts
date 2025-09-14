import { type NextRequest, NextResponse } from "next/server"

// Handle preflight OPTIONS requests for CORS
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get("origin")

  // Define allowed origins based on environment
  const allowedOrigins =
    process.env.NODE_ENV === "production"
      ? process.env.ALLOWED_ORIGINS?.split(",") || ["https://yourdomain.com"]
      : ["http://localhost:3000", "http://127.0.0.1:3000"]

  const isAllowedOrigin = !origin || allowedOrigins.includes(origin) || process.env.NODE_ENV === "development"

  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": isAllowedOrigin ? origin || "*" : "null",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Max-Age": "86400", // 24 hours
    },
  })
}
