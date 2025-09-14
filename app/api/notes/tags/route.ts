import { createClient } from "@/lib/supabase/server"
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

    // Get user's tenant
    const { data: profile } = await supabase.from("profiles").select("tenant_id").eq("id", user.id).single()

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    // Get all unique tags from notes in the tenant
    const { data: notes, error } = await supabase
      .from("notes")
      .select("tags")
      .eq("tenant_id", profile.tenant_id)
      .not("tags", "is", null)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Flatten and deduplicate tags
    const allTags = notes.flatMap((note) => note.tags || [])
    const uniqueTags = [...new Set(allTags)].sort()

    return NextResponse.json({ tags: uniqueTags })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
