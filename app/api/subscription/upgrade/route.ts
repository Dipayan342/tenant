import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { plan } = await request.json()

    if (!["free", "pro", "enterprise"].includes(plan)) {
      return NextResponse.json({ error: "Invalid subscription plan" }, { status: 400 })
    }

    // In a real app, you would integrate with a payment processor here
    // For this demo, we'll just update the subscription plan directly

    const { data, error } = await supabase
      .from("profiles")
      .update({
        subscription_plan: plan,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ profile: data })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
