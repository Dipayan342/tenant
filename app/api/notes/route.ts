import { createClient } from "@/lib/supabase/server"
import { checkNotesLimit, checkFeatureAccess } from "@/lib/subscription"
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

    const url = new URL(request.url)
    const page = Number.parseInt(url.searchParams.get("page") || "1")
    const limit = Number.parseInt(url.searchParams.get("limit") || "10")
    const search = url.searchParams.get("search") || ""
    const tags = url.searchParams.get("tags")?.split(",").filter(Boolean) || []

    const offset = (page - 1) * limit

    let query = supabase
      .from("notes")
      .select("*", { count: "exact" })
      .eq("tenant_id", profile.tenant_id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    // Search functionality
    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`)
    }

    // Tag filtering
    if (tags.length > 0) {
      query = query.overlaps("tags", tags)
    }

    const { data: notes, error, count } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      notes,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check notes limit
    const notesLimit = await checkNotesLimit(user.id)
    if (!notesLimit.canCreate) {
      return NextResponse.json(
        {
          error: "Notes limit reached",
          details: `You have reached your limit of ${notesLimit.limit} notes. Please upgrade your subscription.`,
        },
        { status: 403 },
      )
    }

    // Get user's tenant
    const { data: profile } = await supabase.from("profiles").select("tenant_id").eq("id", user.id).single()

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    const { title, content, tags = [], is_private = false } = await request.json()

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 })
    }

    // Check if user can create private notes
    if (is_private) {
      const canUsePrivateNotes = await checkFeatureAccess(user.id, "privateNotes")
      if (!canUsePrivateNotes) {
        return NextResponse.json({ error: "Private notes require a Pro or Enterprise subscription" }, { status: 403 })
      }
    }

    // Check if user can use tags
    if (tags.length > 0) {
      const canUseTags = await checkFeatureAccess(user.id, "tags")
      if (!canUseTags) {
        return NextResponse.json({ error: "Tags require a Pro or Enterprise subscription" }, { status: 403 })
      }
    }

    const { data: note, error } = await supabase
      .from("notes")
      .insert({
        tenant_id: profile.tenant_id,
        user_id: user.id,
        title,
        content,
        tags,
        is_private,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ note }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
