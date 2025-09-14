"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { FileText, Plus, Users, TrendingUp } from "lucide-react"
import Link from "next/link"
import type { Note } from "@/lib/notes"

interface NotesOverviewProps {
  recentNotes: Note[]
  userNotesCount: number
  totalNotesCount: number
  notesLimit: { current: number; limit: number; canCreate: boolean }
  userRole: string
}

export function NotesOverview({
  recentNotes,
  userNotesCount,
  totalNotesCount,
  notesLimit,
  userRole,
}: NotesOverviewProps) {
  const usagePercentage =
    notesLimit.limit === Number.POSITIVE_INFINITY ? 0 : (notesLimit.current / notesLimit.limit) * 100

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Notes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userNotesCount}</div>
            <p className="text-xs text-muted-foreground">
              {notesLimit.limit === Number.POSITIVE_INFINITY
                ? "Unlimited"
                : `${notesLimit.current} / ${notesLimit.limit}`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Notes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalNotesCount}</div>
            <p className="text-xs text-muted-foreground">Across your organization</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usage</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(usagePercentage)}%</div>
            <Progress value={usagePercentage} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Get started with your notes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button asChild disabled={!notesLimit.canCreate}>
              <Link href="/dashboard/notes?action=create">
                <Plus className="h-4 w-4 mr-2" />
                Create Note
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard/notes">
                <FileText className="h-4 w-4 mr-2" />
                View All Notes
              </Link>
            </Button>
            {["owner", "admin"].includes(userRole) && (
              <Button variant="outline" asChild>
                <Link href="/dashboard/users">
                  <Users className="h-4 w-4 mr-2" />
                  Manage Users
                </Link>
              </Button>
            )}
          </div>
          {!notesLimit.canCreate && (
            <p className="text-sm text-muted-foreground mt-4">
              You&apos;ve reached your notes limit.{" "}
              <Link href="/dashboard/subscription" className="underline">
                Upgrade your subscription
              </Link>{" "}
              to create more notes.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Recent Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Notes</CardTitle>
          <CardDescription>Your latest notes</CardDescription>
        </CardHeader>
        <CardContent>
          {recentNotes.length > 0 ? (
            <div className="space-y-4">
              {recentNotes.map((note) => (
                <div key={note.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium">{note.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{note.content}</p>
                    <div className="flex items-center gap-2 mt-2">
                      {note.is_private && <Badge variant="secondary">Private</Badge>}
                      {note.tags.map((tag) => (
                        <Badge key={tag} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">{new Date(note.created_at).toLocaleDateString()}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No notes yet</h3>
              <p className="text-muted-foreground mb-4">Create your first note to get started</p>
              <Button asChild disabled={!notesLimit.canCreate}>
                <Link href="/dashboard/notes?action=create">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Note
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
