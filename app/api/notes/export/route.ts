import { createClient } from "@/lib/supabase/server"
import { checkFeatureAccess } from "@/lib/subscription"
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

    // Check if user can export
    const canExport = await checkFeatureAccess(user.id, "export")
    if (!canExport) {
      return NextResponse.json({ error: "Export requires a Pro or Enterprise subscription" }, { status: 403 })
    }

    // Get user's tenant
    const { data: profile } = await supabase.from("profiles").select("tenant_id").eq("id", user.id).single()

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    const url = new URL(request.url)
    const format = url.searchParams.get("format") || "json"

    const { data: notes, error } = await supabase
      .from("notes")
      .select("*")
      .eq("tenant_id", profile.tenant_id)
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (format === "csv") {
      const csvHeader = "ID,Title,Content,Tags,Private,Created At,Updated At\n"
      const csvRows = notes
        .map((note) =>
          [
            note.id,
            `"${note.title.replace(/"/g, '""')}"`,
            `"${note.content.replace(/"/g, '""')}"`,
            `"${note.tags.join(", ")}"`,
            note.is_private,
            note.created_at,
            note.updated_at,
          ].join(","),
        )
        .join("\n")

      const csv = csvHeader + csvRows

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": "attachment; filename=notes.csv",
        },
      })
    }

    // Default to JSON
    return NextResponse.json({ notes })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
