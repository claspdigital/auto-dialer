'use client'

import { useState, useEffect, useCallback, use } from 'react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { ContactEntry } from '@/components/contact-entry'

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

interface ProjectPageProps {
  params: Promise<{ name: string }>
}

export default function ProjectPage({ params }: ProjectPageProps) {
  const { name } = use(params)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<ContactStatus>('not-contacted')

  const fetchContacts = useCallback(async () => {
    try {
      const res = await fetch(`/api/files/${name}`)
      const data = await res.json()
      setContacts(data)
    } catch (error) {
      console.error('Failed to fetch contacts:', error)
    } finally {
      setLoading(false)
    }
  }, [name])

  useEffect(() => {
    fetchContacts()
  }, [fetchContacts])

  const updateStatus = async (contactId: string, newStatus: ContactStatus) => {
    try {
      await fetch(`/api/files/${name}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contactId, status: newStatus }),
      })

      setContacts(prev =>
        prev.map(c => (c.id === contactId ? { ...c, status: newStatus } : c))
      )
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  const handleCall = (contact: Contact) => {
    // Open phone app with pre-dialed number
    window.location.href = `tel:${contact.phone}`
    // Auto-classify as contacted
    updateStatus(contact.id, 'contacted')
  }

  const filteredContacts = contacts.filter(c => c.status === activeTab)

  const counts = {
    'not-contacted': contacts.filter(c => c.status === 'not-contacted').length,
    'no-response': contacts.filter(c => c.status === 'no-response').length,
    'contacted': contacts.filter(c => c.status === 'contacted').length,
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-6">
        <header className="mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4 -ml-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            {decodeURIComponent(name)}
          </h1>
          <p className="text-sm text-muted-foreground">
            {contacts.length} contacts total
          </p>
        </header>

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as ContactStatus)}
          className="w-full"
        >
          <TabsList className="w-full mb-4">
            <TabsTrigger value="not-contacted" className="flex-1">
              Not Contacted ({counts['not-contacted']})
            </TabsTrigger>
            <TabsTrigger value="no-response" className="flex-1">
              No Response ({counts['no-response']})
            </TabsTrigger>
            <TabsTrigger value="contacted" className="flex-1">
              Contacted ({counts['contacted']})
            </TabsTrigger>
          </TabsList>

          {loading ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              Loading contacts...
            </div>
          ) : (
            <>
              <TabsContent value="not-contacted" className="space-y-2">
                {filteredContacts.length === 0 ? (
                  <p className="py-12 text-center text-sm text-muted-foreground">
                    No contacts in this category
                  </p>
                ) : (
                  filteredContacts.map(contact => (
                    <ContactEntry
                      key={contact.id}
                      contact={contact}
                      onCall={handleCall}
                      onStatusChange={updateStatus}
                    />
                  ))
                )}
              </TabsContent>

              <TabsContent value="no-response" className="space-y-2">
                {filteredContacts.length === 0 ? (
                  <p className="py-12 text-center text-sm text-muted-foreground">
                    No contacts in this category
                  </p>
                ) : (
                  filteredContacts.map(contact => (
                    <ContactEntry
                      key={contact.id}
                      contact={contact}
                      onCall={handleCall}
                      onStatusChange={updateStatus}
                    />
                  ))
                )}
              </TabsContent>

              <TabsContent value="contacted" className="space-y-2">
                {filteredContacts.length === 0 ? (
                  <p className="py-12 text-center text-sm text-muted-foreground">
                    No contacts in this category
                  </p>
                ) : (
                  filteredContacts.map(contact => (
                    <ContactEntry
                      key={contact.id}
                      contact={contact}
                      onCall={handleCall}
                      onStatusChange={updateStatus}
                    />
                  ))
                )}
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </main>
  )
}
