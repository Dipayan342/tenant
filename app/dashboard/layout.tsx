import type React from "react"
import { requireAuth, getUserProfile } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { LogOut, Settings, Users, FileText, CreditCard } from "lucide-react"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAuth()
  const profile = await getUserProfile()

  const handleSignOut = async () => {
    "use server"
    const supabase = await createClient()
    await supabase.auth.signOut()
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-xl font-bold">
                NotesApp
              </Link>
              <span className="text-sm text-muted-foreground">
                {profile.tenant.name} • {profile.subscription_plan}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">{user.email}</span>
              <form action={handleSignOut}>
                <Button variant="outline" size="sm" type="submit">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="w-64 border-r min-h-[calc(100vh-73px)]">
          <nav className="p-4 space-y-2">
            <Link
              href="/dashboard"
              className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-accent transition-colors"
            >
              <Settings className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>
            <Link
              href="/dashboard/notes"
              className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-accent transition-colors"
            >
              <FileText className="h-4 w-4" />
              <span>Notes</span>
            </Link>
            {["owner", "admin"].includes(profile.role) && (
              <Link
                href="/dashboard/users"
                className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-accent transition-colors"
              >
                <Users className="h-4 w-4" />
                <span>Users</span>
              </Link>
            )}
            <Link
              href="/dashboard/subscription"
              className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-accent transition-colors"
            >
              <CreditCard className="h-4 w-4" />
              <span>Subscription</span>
            </Link>
          </nav>
        </aside>

        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  )
}
