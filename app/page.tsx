'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { Phone, Upload, Folder, Trash2, Calendar } from 'lucide-react'

interface Project {
  name: string
  fileName: string
  createdAt: string
  modifiedAt: string
}

export default function HomePage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchProjects = useCallback(async () => {
    try {
      const res = await fetch('/api/files')
      const data = await res.json()
      setProjects(data)
    } catch (error) {
      console.error('Failed to fetch projects:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/files', {
        method: 'POST',
        body: formData,
      })

      if (res.ok) {
        await fetchProjects()
      }
    } catch (error) {
      console.error('Failed to upload file:', error)
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleDelete = async (name: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!confirm(`Delete "${name}"?`)) return

    try {
      await fetch(`/api/files/${name}`, { method: 'DELETE' })
      await fetchProjects()
    } catch (error) {
      console.error('Failed to delete project:', error)
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-12">
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-foreground">
              <Phone className="h-5 w-5 text-background" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Auto Dialer
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Manage your call lists and track outreach progress
          </p>
        </header>

        <div className="mb-8">
          <label htmlFor="csv-upload">
            <div className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/30 px-6 py-8 transition-colors hover:border-muted-foreground/50 hover:bg-muted/50">
              <Upload className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">
                {uploading ? 'Uploading...' : 'Upload CSV file'}
              </span>
            </div>
          </label>
          <input
            id="csv-upload"
            type="file"
            accept=".csv"
            onChange={handleUpload}
            disabled={uploading}
            className="sr-only"
          />
        </div>

        <div className="space-y-2">
          {loading ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              Loading projects...
            </div>
          ) : projects.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No projects yet. Upload a CSV file to get started.
            </div>
          ) : (
            projects.map((project) => (
              <Link key={project.name} href={`/project/${project.name}`}>
                <Card className="group flex items-center justify-between p-4 transition-colors hover:bg-muted/50">
                  <div className="flex items-center gap-3">
                    <Folder className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-foreground">{project.name}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {new Date(project.modifiedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={(e) => handleDelete(project.name, e)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </Card>
              </Link>
            ))
          )}
        </div>
      </div>
    </main>
  )
}
