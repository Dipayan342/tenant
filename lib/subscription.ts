import { createClient } from "@/lib/supabase/server"

export interface SubscriptionLimits {
  maxNotes: number
  maxUsers: number
  features: {
    privateNotes: boolean
    tags: boolean
    export: boolean
    api: boolean
  }
}

export const SUBSCRIPTION_PLANS: Record<string, SubscriptionLimits> = {
  free: {
    maxNotes: 5,
    maxUsers: 1,
    features: {
      privateNotes: false,
      tags: false,
      export: false,
      api: false,
    },
  },
  pro: {
    maxNotes: 100,
    maxUsers: 5,
    features: {
      privateNotes: true,
      tags: true,
      export: true,
      api: false,
    },
  },
  enterprise: {
    maxNotes: Number.POSITIVE_INFINITY,
    maxUsers: Number.POSITIVE_INFINITY,
    features: {
      privateNotes: true,
      tags: true,
      export: true,
      api: true,
    },
  },
}

export async function getUserSubscriptionLimits(userId: string): Promise<SubscriptionLimits> {
  const supabase = await createClient()

  const { data: profile } = await supabase.from("profiles").select("subscription_plan").eq("id", userId).single()

  const plan = profile?.subscription_plan || "free"
  return SUBSCRIPTION_PLANS[plan] || SUBSCRIPTION_PLANS.free
}

export async function checkFeatureAccess(
  userId: string,
  feature: keyof SubscriptionLimits["features"],
): Promise<boolean> {
  const limits = await getUserSubscriptionLimits(userId)
  return limits.features[feature]
}

export async function checkNotesLimit(userId: string): Promise<{ canCreate: boolean; current: number; limit: number }> {
  const supabase = await createClient()
  const limits = await getUserSubscriptionLimits(userId)

  const { count } = await supabase.from("notes").select("*", { count: "exact", head: true }).eq("user_id", userId)

  return {
    canCreate: (count || 0) < limits.maxNotes,
    current: count || 0,
    limit: limits.maxNotes,
  }
}

export async function checkUsersLimit(tenantId: string): Promise<{ canAdd: boolean; current: number; limit: number }> {
  const supabase = await createClient()

  // Get the tenant owner's subscription plan
  const { data: owner } = await supabase
    .from("profiles")
    .select("subscription_plan")
    .eq("tenant_id", tenantId)
    .eq("role", "owner")
    .single()

  const limits = SUBSCRIPTION_PLANS[owner?.subscription_plan || "free"]

  const { count } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("tenant_id", tenantId)

  return {
    canAdd: (count || 0) < limits.maxUsers,
    current: count || 0,
    limit: limits.maxUsers,
  }
}
