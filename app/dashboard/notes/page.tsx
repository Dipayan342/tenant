import { requireAuth, getUserProfile } from "@/lib/auth"
import { NotesManager } from "@/components/notes-manager"

export default async function NotesPage() {
  const user = await requireAuth()
  const profile = await getUserProfile()

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Notes</h1>
        <p className="text-muted-foreground">Manage your organization&apos;s notes</p>
      </div>
      <NotesManager />
    </div>
  )
}
