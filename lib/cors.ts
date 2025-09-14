import { type NextRequest, NextResponse } from "next/server"

export function corsHeaders(origin?: string | null) {
  const allowedOrigins =
    process.env.NODE_ENV === "production"
      ? process.env.ALLOWED_ORIGINS?.split(",") || ["https://yourdomain.com"]
      : ["http://localhost:3000", "http://127.0.0.1:3000", "*"]

  const isAllowedOrigin = !origin || allowedOrigins.includes(origin) || allowedOrigins.includes("*")

  return {
    "Access-Control-Allow-Origin": isAllowedOrigin ? origin || "*" : "null",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
    "Access-Control-Allow-Credentials": "true",
  }
}

export function withCors(handler: (request: NextRequest) => Promise<NextResponse>) {
  return async (request: NextRequest) => {
    // Handle preflight requests
    if (request.method === "OPTIONS") {
      return new NextResponse(null, {
        status: 200,
        headers: corsHeaders(request.headers.get("origin")),
      })
    }

    // Handle actual request
    const response = await handler(request)

    // Add CORS headers to response
    const corsHeadersObj = corsHeaders(request.headers.get("origin"))
    Object.entries(corsHeadersObj).forEach(([key, value]) => {
      response.headers.set(key, value)
    })

    return response
  }
}
