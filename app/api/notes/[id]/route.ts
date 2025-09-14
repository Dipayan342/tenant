import { createClient } from "@/lib/supabase/server"
import { checkFeatureAccess } from "@/lib/subscription"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: note, error } = await supabase.from("notes").select("*").eq("id", id).single()

    if (error) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 })
    }

    return NextResponse.json({ note })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { title, content, tags, is_private } = await request.json()

    // Check if user can use private notes
    if (is_private !== undefined) {
      const canUsePrivateNotes = await checkFeatureAccess(user.id, "privateNotes")
      if (is_private && !canUsePrivateNotes) {
        return NextResponse.json({ error: "Private notes require a Pro or Enterprise subscription" }, { status: 403 })
      }
    }

    // Check if user can use tags
    if (tags && tags.length > 0) {
      const canUseTags = await checkFeatureAccess(user.id, "tags")
      if (!canUseTags) {
        return NextResponse.json({ error: "Tags require a Pro or Enterprise subscription" }, { status: 403 })
      }
    }

    const updates: any = { updated_at: new Date().toISOString() }
    if (title !== undefined) updates.title = title
    if (content !== undefined) updates.content = content
    if (tags !== undefined) updates.tags = tags
    if (is_private !== undefined) updates.is_private = is_private

    const { data: note, error } = await supabase.from("notes").update(updates).eq("id", id).select().single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ note })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { error } = await supabase.from("notes").delete().eq("id", id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
