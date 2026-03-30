'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Phone,
  ChevronDown,
  ChevronUp,
  Globe,
  Mail,
  MapPin,
  Star,
  Facebook,
  Instagram,
  ExternalLink,
  MoreVertical,
  PhoneOff,
  PhoneCall,
  UserX,
} from 'lucide-react'
import type { Contact, ContactStatus } from '@/app/project/[name]/page'

interface ContactEntryProps {
  contact: Contact
  onCall: (contact: Contact) => void
  onStatusChange: (contactId: string, status: ContactStatus) => void
}

export function ContactEntry({ contact, onCall, onStatusChange }: ContactEntryProps) {
  const [isOpen, setIsOpen] = useState(false)

  const statusOptions: { value: ContactStatus; label: string; icon: React.ReactNode }[] = [
    { value: 'not-contacted', label: 'Not Contacted', icon: <PhoneOff className="h-4 w-4" /> },
    { value: 'no-response', label: 'No Response', icon: <UserX className="h-4 w-4" /> },
    { value: 'contacted', label: 'Contacted', icon: <PhoneCall className="h-4 w-4" /> },
  ]

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="icon-sm" className="shrink-0">
                {isOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            
            <div className="min-w-0 flex-1">
              <p className="font-medium text-foreground truncate">
                {contact.phone}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {contact.name} · {contact.county}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {statusOptions
                  .filter(opt => opt.value !== contact.status)
                  .map(opt => (
                    <DropdownMenuItem
                      key={opt.value}
                      onClick={() => onStatusChange(contact.id, opt.value)}
                    >
                      {opt.icon}
                      <span className="ml-2">{opt.label}</span>
                    </DropdownMenuItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              size="sm"
              onClick={() => onCall(contact)}
              className="shrink-0"
            >
              <Phone className="h-4 w-4" />
              Call
            </Button>
          </div>
        </div>

        <CollapsibleContent>
          <div className="border-t px-4 py-3 space-y-3 bg-muted/30">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground text-xs mb-1">Type</p>
                <p className="text-foreground">{contact.type || '-'}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs mb-1">Rating</p>
                <div className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                  <span className="text-foreground">{contact.rating || '-'}</span>
                  {contact.reviews && (
                    <span className="text-muted-foreground">
                      ({contact.reviews} reviews)
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div>
              <p className="text-muted-foreground text-xs mb-1">Address</p>
              <p className="text-foreground text-sm">
                {contact.address || `${contact.city}, ${contact.state_code} ${contact.postal_code}`}
              </p>
            </div>

            {contact.email && (
              <div>
                <p className="text-muted-foreground text-xs mb-1">Email</p>
                <a
                  href={`mailto:${contact.email}`}
                  className="text-sm text-foreground flex items-center gap-1.5 hover:underline"
                >
                  <Mail className="h-3.5 w-3.5" />
                  {contact.email}
                </a>
              </div>
            )}

            <div className="flex flex-wrap gap-2 pt-1">
              {contact.website && (
                <a
                  href={contact.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md bg-background border hover:bg-muted transition-colors"
                >
                  <Globe className="h-3.5 w-3.5" />
                  Website
                </a>
              )}
              {contact.company_facebook && (
                <a
                  href={contact.company_facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md bg-background border hover:bg-muted transition-colors"
                >
                  <Facebook className="h-3.5 w-3.5" />
                  Facebook
                </a>
              )}
              {contact.company_instagram && (
                <a
                  href={contact.company_instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md bg-background border hover:bg-muted transition-colors"
                >
                  <Instagram className="h-3.5 w-3.5" />
                  Instagram
                </a>
              )}
              {contact.location_link && (
                <a
                  href={contact.location_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md bg-background border hover:bg-muted transition-colors"
                >
                  <MapPin className="h-3.5 w-3.5" />
                  Map
                </a>
              )}
              {contact.reviews_link && (
                <a
                  href={contact.reviews_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md bg-background border hover:bg-muted transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Reviews
                </a>
              )}
            </div>
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}
