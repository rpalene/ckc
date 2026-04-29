export type UserRole = 'client' | 'artisan'

export interface Profile {
  id: string
  email: string
  full_name: string
  phone?: string
  role: UserRole
  avatar_url?: string
  commune?: string
  created_at: string
}

export interface Artisan {
  id: string
  profile_id: string
  business_name: string
  patent_number?: string
  description?: string
  commune: string
  trades: string[]
  category?: string
  rating: number
  reviews_count: number
  available: boolean
  verified: boolean
  profile?: Profile
  created_at: string
}

export interface Conversation {
  id: string
  client_id: string
  artisan_id: string
  client?: Profile
  artisan?: Artisan & { profile?: Profile }
  created_at: string
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  read: boolean
  created_at: string
  sender?: Profile
}

export interface Review {
  id: string
  client_id: string
  artisan_id: string
  rating: number
  comment?: string
  created_at: string
  client?: Profile
}
