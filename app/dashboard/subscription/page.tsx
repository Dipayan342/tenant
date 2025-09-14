import { requireAuth, getUserProfile } from "@/lib/auth"
import { getUserSubscriptionLimits, checkNotesLimit } from "@/lib/subscription"
import { SubscriptionManager } from "@/components/subscription-manager"

export default async function SubscriptionPage() {
  const user = await requireAuth()
  const profile = await getUserProfile()
  const limits = await getUserSubscriptionLimits(user.id)
  const notesStatus = await checkNotesLimit(user.id)

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Subscription</h1>
        <p className="text-muted-foreground">Manage your subscription plan and usage</p>
      </div>
      <SubscriptionManager
        currentPlan={profile.subscription_plan}
        limits={limits}
        usage={{
          notes: notesStatus,
        }}
      />
    </div>
  )
}
