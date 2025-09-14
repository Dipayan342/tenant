export interface Note {
  id: string
  tenant_id: string
  user_id: string
  title: string
  content: string
  tags: string[]
  is_private: boolean
  created_at: string
  updated_at: string
}

export interface NotesResponse {
  notes: Note[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export async function fetchNotes(params: {
  page?: number
  limit?: number
  search?: string
  tags?: string[]
}): Promise<NotesResponse> {
  const { page = 1, limit = 10, search = "", tags = [] } = params

  const searchParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(search && { search }),
    ...(tags.length > 0 && { tags: tags.join(",") }),
  })

  const response = await fetch(`/api/notes?${searchParams}`)
  if (!response.ok) {
    throw new Error("Failed to fetch notes")
  }

  return response.json()
}

export async function createNote(note: {
  title: string
  content: string
  tags?: string[]
  is_private?: boolean
}): Promise<Note> {
  const response = await fetch("/api/notes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(note),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to create note")
  }

  const data = await response.json()
  return data.note
}

export async function updateNote(
  id: string,
  updates: {
    title?: string
    content?: string
    tags?: string[]
    is_private?: boolean
  },
): Promise<Note> {
  const response = await fetch(`/api/notes/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to update note")
  }

  const data = await response.json()
  return data.note
}

export async function deleteNote(id: string): Promise<void> {
  const response = await fetch(`/api/notes/${id}`, {
    method: "DELETE",
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to delete note")
  }
}

export async function fetchTags(): Promise<string[]> {
  const response = await fetch("/api/notes/tags")
  if (!response.ok) {
    throw new Error("Failed to fetch tags")
  }

  const data = await response.json()
  return data.tags
}

export async function exportNotes(format: "json" | "csv" = "json"): Promise<void> {
  const response = await fetch(`/api/notes/export?format=${format}`)
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to export notes")
  }

  if (format === "csv") {
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "notes.csv"
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  } else {
    const data = await response.json()
    const blob = new Blob([JSON.stringify(data.notes, null, 2)], { type: "application/json" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "notes.json"
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }
}
