import { requireAuth, getUserProfile } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { checkNotesLimit } from "@/lib/subscription"
import { NotesOverview } from "@/components/notes-overview"

export default async function DashboardPage() {
  const user = await requireAuth()
  const profile = await getUserProfile()
  const notesLimit = await checkNotesLimit(user.id)

  const supabase = await createClient()

  // Get recent notes
  const { data: recentNotes } = await supabase
    .from("notes")
    .select("*")
    .eq("tenant_id", profile.tenant_id)
    .order("created_at", { ascending: false })
    .limit(5)

  // Get notes count by user
  const { data: notesStats } = await supabase.from("notes").select("user_id").eq("tenant_id", profile.tenant_id)

  const userNotesCount = notesStats?.filter((note) => note.user_id === user.id).length || 0
  const totalNotesCount = notesStats?.length || 0

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Welcome back, {user.email}</h1>
        <p className="text-muted-foreground">
          {profile.tenant.name} • {profile.role} • {profile.subscription_plan} plan
        </p>
      </div>

      <NotesOverview
        recentNotes={recentNotes || []}
        userNotesCount={userNotesCount}
        totalNotesCount={totalNotesCount}
        notesLimit={notesLimit}
        userRole={profile.role}
      />
    </div>
  )
}
