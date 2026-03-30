import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'data', 'projects')

async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR)
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true })
  }
}

export async function GET() {
  try {
    await ensureDataDir()
    const files = await fs.readdir(DATA_DIR)
    const projects = files.filter(f => f.endsWith('.csv'))
    
    const projectsWithStats = await Promise.all(
      projects.map(async (file) => {
        const filePath = path.join(DATA_DIR, file)
        const stats = await fs.stat(filePath)
        return {
          name: file.replace('.csv', ''),
          fileName: file,
          createdAt: stats.birthtime.toISOString(),
          modifiedAt: stats.mtime.toISOString(),
        }
      })
    )
    
    return NextResponse.json(projectsWithStats)
  } catch (error) {
    console.error('Error reading files:', error)
    return NextResponse.json({ error: 'Failed to read files' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureDataDir()
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }
    
    const buffer = Buffer.from(await file.arrayBuffer())
    const fileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const filePath = path.join(DATA_DIR, fileName)
    
    await fs.writeFile(filePath, buffer)
    
    // Create status file for tracking contact status
    const statusPath = path.join(DATA_DIR, `${fileName.replace('.csv', '')}_status.json`)
    await fs.writeFile(statusPath, JSON.stringify({}))
    
    return NextResponse.json({ success: true, fileName })
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
  }
}
