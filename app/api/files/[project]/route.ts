import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { parse } from 'csv-parse/sync'

const DATA_DIR = path.join(process.cwd(), 'data', 'projects')

export type ContactStatus = 'not-contacted' | 'no-response' | 'contacted'

export interface Contact {
  id: string
  name: string
  type: string
  phone: string
  website: string
  address: string
  city: string
  county: string
  state_code: string
  postal_code: string
  domain: string
  company_facebook: string
  company_instagram: string
  email: string
  contact_phones: string
  reviews: string
  reviews_link: string
  rating: string
  location_link: string
  status: ContactStatus
}

async function getStatusPath(project: string) {
  return path.join(DATA_DIR, `${project}_status.json`)
}

async function getStatus(project: string): Promise<Record<string, ContactStatus>> {
  try {
    const statusPath = await getStatusPath(project)
    const data = await fs.readFile(statusPath, 'utf-8')
    return JSON.parse(data)
  } catch {
    return {}
  }
}

async function saveStatus(project: string, status: Record<string, ContactStatus>) {
  const statusPath = await getStatusPath(project)
  await fs.writeFile(statusPath, JSON.stringify(status, null, 2))
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ project: string }> }
) {
  try {
    const { project } = await params
    const filePath = path.join(DATA_DIR, `${project}.csv`)
    
    const fileContent = await fs.readFile(filePath, 'utf-8')
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
    })
    
    const status = await getStatus(project)
    
    const contacts: Contact[] = records.map((record: Record<string, string>, index: number) => ({
      id: `${index}-${record.phone || record.name}`,
      name: record.name || '',
      type: record.type || '',
      phone: record.phone || '',
      website: record.website || '',
      address: record.address || '',
      city: record.city || '',
      county: record.county || '',
      state_code: record.state_code || '',
      postal_code: record.postal_code || '',
      domain: record.domain || '',
      company_facebook: record.company_facebook || '',
      company_instagram: record.company_instagram || '',
      email: record.email || '',
      contact_phones: record.contact_phones || '',
      reviews: record.reviews || '',
      reviews_link: record.reviews_link || '',
      rating: record.rating || '',
      location_link: record.location_link || '',
      status: status[`${index}-${record.phone || record.name}`] || 'not-contacted',
    }))
    
    return NextResponse.json(contacts)
  } catch (error) {
    console.error('Error reading project:', error)
    return NextResponse.json({ error: 'Failed to read project' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ project: string }> }
) {
  try {
    const { project } = await params
    const { contactId, status: newStatus } = await request.json()
    
    const currentStatus = await getStatus(project)
    currentStatus[contactId] = newStatus
    await saveStatus(project, currentStatus)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating status:', error)
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ project: string }> }
) {
  try {
    const { project } = await params
    const filePath = path.join(DATA_DIR, `${project}.csv`)
    const statusPath = path.join(DATA_DIR, `${project}_status.json`)
    
    await fs.unlink(filePath)
    try {
      await fs.unlink(statusPath)
    } catch {
      // Status file might not exist
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting project:', error)
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 })
  }
}
