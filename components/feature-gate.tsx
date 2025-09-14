"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Lock } from "lucide-react"
import Link from "next/link"

interface FeatureGateProps {
  feature: string
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function FeatureGate({ feature, children, fallback }: FeatureGateProps) {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const response = await fetch("/api/subscription/limits")
        if (response.ok) {
          const data = await response.json()
          setHasAccess(data.limits.features[feature] || false)
        } else {
          setHasAccess(false)
        }
      } catch (error) {
        setHasAccess(false)
      }
    }

    checkAccess()
  }, [feature])

  if (hasAccess === null) {
    return <div>Loading...</div>
  }

  if (!hasAccess) {
    return (
      fallback || (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Premium Feature
            </CardTitle>
            <CardDescription>This feature requires a Pro or Enterprise subscription.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/dashboard/subscription">Upgrade Now</Link>
            </Button>
          </CardContent>
        </Card>
      )
    )
  }

  return <>{children}</>
}
