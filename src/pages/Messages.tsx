import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Conversation } from '../types'
import { useAuth } from '../context/AuthContext'
import ConversationList from '../components/messaging/ConversationList'
import MessageThread from '../components/messaging/MessageThread'
import Spinner from '../components/ui/Spinner'

export default function Messages() {
  const { profile } = useAuth()
  const location    = useLocation()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [active, setActive]   = useState<Conversation | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile) return
    const filter = profile.role === 'client'
      ? `client_id=eq.${profile.id}`
      : `artisan_id=in.(${profile.id})` // we'll refine after fetch

    const fetchConversations = async () => {
      let query = supabase
        .from('conversations')
        .select('*, client:profiles!conversations_client_id_fkey(*), artisan:artisans(*, profile:profiles(*))')
        .order('created_at', { ascending: false })

      if (profile.role === 'client') {
        query = query.eq('client_id', profile.id)
      } else {
        // Find artisan id for this profile
        const { data: art } = await supabase.from('artisans').select('id').eq('profile_id', profile.id).single()
        if (art) query = query.eq('artisan_id', art.id)
      }

      const { data } = await query
      const convs = (data as Conversation[]) ?? []
      setConversations(convs)

      // Auto-select from navigation state
      const stateId = location.state?.conversationId
      if (stateId) {
        const target = convs.find(c => c.id === stateId)
        if (target) setActive(target)
      } else if (convs.length > 0) {
        setActive(convs[0])
      }
      setLoading(false)
    }

    fetchConversations()
  }, [profile, location.state])

  if (!profile) return null
  if (loading) return <div className="flex justify-center py-24"><Spinner size="lg" /></div>

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="card overflow-hidden" style={{ height: 'calc(100vh - 180px)' }}>
        <div className="flex h-full">
          {/* Left: conversation list */}
          <div className={`${active ? 'hidden sm:block' : 'block'} sm:w-72 border-r border-gray-100 overflow-y-auto flex-shrink-0`}>
            <ConversationList
              conversations={conversations}
              activeId={active?.id}
              currentProfile={profile}
              onSelect={c => setActive(c)}
            />
          </div>

          {/* Right: message thread */}
          <div className="flex-1 overflow-hidden">
            {active ? (
              <MessageThread conversation={active} currentProfile={profile} />
            ) : (
              <div className="h-full flex items-center justify-center text-center p-8">
                <div>
                  <div className="text-5xl mb-4">💬</div>
                  <h3 className="font-bold text-marine mb-2">Vos messages</h3>
                  <p className="text-gray-400 text-sm">Sélectionnez une conversation ou contactez un artisan</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
