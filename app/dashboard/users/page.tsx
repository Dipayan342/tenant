import { requireAuth, getUserProfile } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { UserManagement } from "@/components/user-management"

export default async function UsersPage() {
  const user = await requireAuth()
  const profile = await getUserProfile()

  // Only admins and owners can access user management
  if (!["owner", "admin"].includes(profile.role)) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground">You don&apos;t have permission to access user management.</p>
        </div>
      </div>
    )
  }

  const supabase = await createClient()

  // Get all users in the tenant
  const { data: users } = await supabase
    .from("profiles")
    .select(`
      id,
      email,
      role,
      subscription_plan,
      created_at,
      updated_at
    `)
    .eq("tenant_id", profile.tenant_id)
    .order("created_at", { ascending: false })

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground">Manage users in your organization</p>
      </div>
      <UserManagement users={users || []} currentUserRole={profile.role} />
    </div>
  )
}
