import { createClient } from "@/lib/supabase/server"
import { getUserSubscriptionLimits, checkNotesLimit } from "@/lib/subscription"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const limits = await getUserSubscriptionLimits(user.id)
    const notesStatus = await checkNotesLimit(user.id)

    return NextResponse.json({
      limits,
      usage: {
        notes: notesStatus,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
