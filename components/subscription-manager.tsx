"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Check, X } from "lucide-react"
import { useRouter } from "next/navigation"
import type { SubscriptionLimits } from "@/lib/subscription"

interface SubscriptionManagerProps {
  currentPlan: string
  limits: SubscriptionLimits
  usage: {
    notes: { current: number; limit: number; canCreate: boolean }
  }
}

const PLAN_DETAILS = {
  free: {
    name: "Free",
    price: "$0",
    description: "Perfect for getting started",
  },
  pro: {
    name: "Pro",
    price: "$9/month",
    description: "For growing teams",
  },
  enterprise: {
    name: "Enterprise",
    price: "$29/month",
    description: "For large organizations",
  },
}

export function SubscriptionManager({ currentPlan, limits, usage }: SubscriptionManagerProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleUpgrade = async (plan: string) => {
    setIsLoading(true)

    try {
      const response = await fetch("/api/subscription/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      })

      if (response.ok) {
        router.refresh()
      } else {
        const error = await response.json()
        alert(error.error || "Failed to upgrade subscription")
      }
    } catch (error) {
      alert("Failed to upgrade subscription")
    } finally {
      setIsLoading(false)
    }
  }

  const getUsagePercentage = (current: number, limit: number) => {
    if (limit === Number.POSITIVE_INFINITY) return 0
    return Math.min((current / limit) * 100, 100)
  }

  const getUsageColor = (current: number, limit: number) => {
    const percentage = getUsagePercentage(current, limit)
    if (percentage >= 90) return "bg-red-500"
    if (percentage >= 70) return "bg-yellow-500"
    return "bg-green-500"
  }

  return (
    <div className="space-y-8">
      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Current Plan
            <Badge variant="default">{PLAN_DETAILS[currentPlan as keyof typeof PLAN_DETAILS]?.name || "Unknown"}</Badge>
          </CardTitle>
          <CardDescription>{PLAN_DETAILS[currentPlan as keyof typeof PLAN_DETAILS]?.description || ""}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Notes Usage</span>
                <span className="text-sm text-muted-foreground">
                  {usage.notes.current} / {limits.maxNotes === Number.POSITIVE_INFINITY ? "∞" : limits.maxNotes}
                </span>
              </div>
              <Progress
                value={getUsagePercentage(usage.notes.current, limits.maxNotes)}
                className="h-2"
                // @ts-ignore
                indicatorClassName={getUsageColor(usage.notes.current, limits.maxNotes)}
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {limits.maxUsers === Number.POSITIVE_INFINITY ? "∞" : limits.maxUsers}
                </div>
                <div className="text-sm text-muted-foreground">Max Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {limits.maxNotes === Number.POSITIVE_INFINITY ? "∞" : limits.maxNotes}
                </div>
                <div className="text-sm text-muted-foreground">Max Notes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl">
                  {limits.features.privateNotes ? (
                    <Check className="h-6 w-6 text-green-500 mx-auto" />
                  ) : (
                    <X className="h-6 w-6 text-red-500 mx-auto" />
                  )}
                </div>
                <div className="text-sm text-muted-foreground">Private Notes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl">
                  {limits.features.api ? (
                    <Check className="h-6 w-6 text-green-500 mx-auto" />
                  ) : (
                    <X className="h-6 w-6 text-red-500 mx-auto" />
                  )}
                </div>
                <div className="text-sm text-muted-foreground">API Access</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Plans */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Available Plans</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {Object.entries(PLAN_DETAILS).map(([planKey, plan]) => (
            <Card key={planKey} className={planKey === currentPlan ? "border-primary" : ""}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {plan.name}
                  {planKey === currentPlan && <Badge variant="default">Current</Badge>}
                </CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="text-3xl font-bold">{plan.price}</div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">
                      {planKey === "free" ? "5 notes" : planKey === "pro" ? "100 notes" : "Unlimited notes"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">
                      {planKey === "free" ? "1 user" : planKey === "pro" ? "5 users" : "Unlimited users"}
                    </span>
                  </div>
                  {planKey !== "free" && (
                    <>
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Private notes</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Tags & export</span>
                      </div>
                    </>
                  )}
                  {planKey === "enterprise" && (
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-sm">API access</span>
                    </div>
                  )}
                </div>
                {planKey !== currentPlan && (
                  <Button
                    className="w-full"
                    onClick={() => handleUpgrade(planKey)}
                    disabled={isLoading}
                    variant={planKey === "free" ? "outline" : "default"}
                  >
                    {planKey === "free" ? "Downgrade" : "Upgrade"}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
