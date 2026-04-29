import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import type { Artisan, Conversation } from '../types'
import Avatar from '../components/ui/Avatar'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Spinner from '../components/ui/Spinner'

export default function Dashboard() {
  const { profile } = useAuth()
  const navigate  = useNavigate()
  const [artisan, setArtisan]         = useState<Artisan | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading]         = useState(true)

  useEffect(() => {
    if (!profile) return
    const load = async () => {
      const convQuery = profile.role === 'artisan'
        ? supabase.from('conversations').select('*, client:profiles!conversations_client_id_fkey(*), artisan:artisans(*, profile:profiles(*))').order('created_at', { ascending: false })
        : supabase.from('conversations').select('*, client:profiles!conversations_client_id_fkey(*), artisan:artisans(*, profile:profiles(*))').eq('client_id', profile.id).order('created_at', { ascending: false })

      const [artRes, convRes] = await Promise.all([
        profile.role === 'artisan'
          ? supabase.from('artisans').select('*').eq('profile_id', profile.id).single()
          : Promise.resolve({ data: null }),
        convQuery,
      ])

      if (artRes.data) {
        const art = artRes.data as Artisan
        setArtisan(art)
        // Re-fetch conv filtered by artisan_id
        const { data: ac } = await supabase
          .from('conversations')
          .select('*, client:profiles!conversations_client_id_fkey(*), artisan:artisans(*, profile:profiles(*))')
          .eq('artisan_id', art.id)
          .order('created_at', { ascending: false })
        setConversations((ac as Conversation[]) ?? [])
      } else {
        setConversations((convRes.data as Conversation[]) ?? [])
      }
      setLoading(false)
    }
    load()
  }, [profile])

  const toggleAvailability = async () => {
    if (!artisan) return
    await supabase.from('artisans').update({ available: !artisan.available }).eq('id', artisan.id)
    setArtisan(prev => prev ? { ...prev, available: !prev.available } : prev)
  }

  if (!profile) return null
  if (loading) return <div className="flex justify-center py-24"><Spinner size="lg" /></div>

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      {/* Welcome header */}
      <div className="card p-6 mb-8 flex items-center gap-5">
        <Avatar src={profile.avatar_url} name={profile.full_name || profile.email} size="xl" />
        <div className="flex-1">
          <h1 className="text-2xl font-black text-marine">
            Bonjour, {profile.full_name?.split(' ')[0] || 'vous'} 👋
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {profile.role === 'artisan' ? 'Espace artisan' : 'Espace client'} · {profile.commune}
          </p>
          {profile.role === 'artisan' && artisan && (
            <div className="flex items-center gap-3 mt-3">
              <Badge variant={artisan.available ? 'green' : 'red'}>
                {artisan.available ? '● Disponible' : '● Indisponible'}
              </Badge>
              <button
                onClick={toggleAvailability}
                className="text-xs text-orange font-semibold hover:underline"
              >
                Changer
              </button>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate('/profile/edit')}>
            ✏️ Mon profil
          </Button>
          {profile.role === 'artisan' && artisan && (
            <Link to={`/artisans/${artisan.id}`}>
              <Button variant="ghost" size="sm" className="w-full">👁 Voir ma fiche</Button>
            </Link>
          )}
        </div>
      </div>

      {/* Stats row (artisan only) */}
      {profile.role === 'artisan' && artisan && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Note', value: artisan.rating?.toFixed(1) || '—', sub: `${artisan.reviews_count} avis` },
            { label: 'Conversations', value: conversations.length, sub: 'au total' },
            { label: 'Statut', value: artisan.verified ? '✓ Patenté' : '⏳ En attente', sub: 'vérification' },
          ].map(s => (
            <div key={s.label} className="card p-5 text-center">
              <div className="text-2xl font-black text-orange">{s.value}</div>
              <div className="text-xs text-gray-400 mt-1">{s.label}</div>
              <div className="text-xs text-gray-300">{s.sub}</div>
            </div>
          ))}
        </div>
      )}

      {/* Conversations preview */}
      <div className="card overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-marine">Derniers messages</h2>
          <Link to="/messages" className="text-sm text-orange font-semibold hover:underline">Voir tout →</Link>
        </div>
        {conversations.length === 0 ? (
          <div className="p-10 text-center text-gray-400">
            <div className="text-4xl mb-3">💬</div>
            <p>Aucune conversation pour l'instant.</p>
            {profile.role === 'client' && (
              <Link to="/artisans" className="text-orange font-semibold mt-2 block hover:underline">
                Trouver un artisan →
              </Link>
            )}
          </div>
        ) : (
          <div>
            {conversations.slice(0, 5).map(conv => {
              const other = profile.role === 'client'
                ? conv.artisan?.profile
                : conv.client
              const name = other?.full_name || '—'
              return (
                <Link
                  key={conv.id}
                  to="/messages"
                  state={{ conversationId: conv.id }}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-cream transition-colors border-b border-gray-50 last:border-0"
                >
                  <Avatar src={other?.avatar_url} name={name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-marine text-sm truncate">{name}</p>
                    {profile.role === 'client' && (
                      <p className="text-xs text-gray-400 truncate">{conv.artisan?.business_name}</p>
                    )}
                  </div>
                  <span className="text-xs text-gray-300">→</span>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
