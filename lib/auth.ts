import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function getCurrentUser() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  return user
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/auth/login")
  }
  return user
}

export async function getUserProfile() {
  const supabase = await createClient()
  const user = await requireAuth()

  console.log("[v0] Getting profile for user:", user.id)

  if (!user || !user.id) {
    console.log("[v0] No authenticated user found")
    throw new Error("User not authenticated")
  }

  try {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select(`
        *,
        tenant:tenants(*)
      `)
      .eq("id", user.id)
      .single()

    console.log("[v0] Profile query result:", { profile, error })

    if (error) {
      console.log("[v0] Profile error details:", error)

      if (error.code === "PGRST116") {
        console.log("[v0] No profile found, creating tenant and profile")

        // Create tenant first
        const { data: tenant, error: tenantError } = await supabase
          .from("tenants")
          .insert({
            name: `${user.email?.split("@")[0] || "User"}'s Organization`,
            slug: `${user.email?.split("@")[0] || "user"}-${Date.now()}`,
          })
          .select()
          .single()

        if (tenantError) {
          console.log("[v0] Error creating tenant:", tenantError)
          throw new Error(`Failed to create organization: ${tenantError.message}`)
        }

        console.log("[v0] Created tenant:", tenant)

        // Create profile
        const { data: newProfile, error: profileError } = await supabase
          .from("profiles")
          .insert({
            id: user.id,
            email: user.email,
            tenant_id: tenant.id,
            role: "owner",
            subscription_plan: "free",
          })
          .select(`
            *,
            tenant:tenants(*)
          `)
          .single()

        if (profileError) {
          console.log("[v0] Error creating profile:", profileError)
          throw new Error(`Failed to create user profile: ${profileError.message}`)
        }

        console.log("[v0] Created new profile:", newProfile)
        return newProfile
      }

      throw new Error(`Database error: ${error.message} (Code: ${error.code})`)
    }

    if (!profile) {
      console.log("[v0] Profile query returned null")
      throw new Error("Profile not found")
    }

    console.log("[v0] Successfully retrieved profile:", profile)
    return profile
  } catch (err) {
    console.log("[v0] Unexpected error in getUserProfile:", err)
    if (err instanceof Error) {
      throw new Error(`Failed to fetch user profile: ${err.message}`)
    }
    throw new Error("Failed to fetch user profile: Unknown error")
  }
}

export async function checkSubscriptionLimit(userId: string, subscriptionPlan: string) {
  const supabase = await createClient()

  const { count } = await supabase.from("notes").select("*", { count: "exact", head: true }).eq("user_id", userId)

  const limits = {
    free: 5,
    pro: 100,
    enterprise: Number.POSITIVE_INFINITY,
  }

  const limit = limits[subscriptionPlan as keyof typeof limits] || 5
  return { count: count || 0, limit, canCreate: (count || 0) < limit }
}
