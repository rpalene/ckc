import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Artisan, Review } from '../types'
import { useAuth } from '../context/AuthContext'
import Avatar from '../components/ui/Avatar'
import Badge from '../components/ui/Badge'
import StarRating from '../components/ui/StarRating'
import ReviewCard from '../components/reviews/ReviewCard'
import ReviewForm from '../components/reviews/ReviewForm'
import Button from '../components/ui/Button'
import Spinner from '../components/ui/Spinner'
import { formatDate } from '../lib/utils'

export default function ArtisanProfile() {
  const { id }  = useParams<{ id: string }>()
  const { user, profile } = useAuth()
  const navigate = useNavigate()

  const [artisan, setArtisan]   = useState<Artisan | null>(null)
  const [reviews, setReviews]   = useState<Review[]>([])
  const [loading, setLoading]   = useState(true)
  const [contacting, setContacting] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [alreadyReviewed, setAlreadyReviewed] = useState(false)

  const fetchData = async () => {
    const [{ data: a }, { data: r }] = await Promise.all([
      supabase.from('artisans').select('*, profile:profiles(*)').eq('id', id!).single(),
      supabase.from('reviews').select('*, client:profiles(*)').eq('artisan_id', id!).order('created_at', { ascending: false }),
    ])
    setArtisan(a as Artisan)
    setReviews((r as Review[]) ?? [])
    if (profile) {
      setAlreadyReviewed(!!(r as Review[])?.find(rv => rv.client_id === profile.id))
    }
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [id, profile])

  const handleContact = async () => {
    if (!user || !profile) { navigate('/login'); return }
    setContacting(true)
    // Get or create conversation
    const { data: existing } = await supabase
      .from('conversations')
      .select('id')
      .eq('client_id', profile.id)
      .eq('artisan_id', id!)
      .single()

    if (existing) {
      navigate('/messages', { state: { conversationId: existing.id } })
    } else {
      const { data: newConv } = await supabase
        .from('conversations')
        .insert({ client_id: profile.id, artisan_id: id! })
        .select('id')
        .single()
      navigate('/messages', { state: { conversationId: newConv?.id } })
    }
    setContacting(false)
  }

  if (loading) return (
    <div className="flex justify-center py-24"><Spinner size="lg" /></div>
  )
  if (!artisan) return (
    <div className="text-center py-24 text-gray-500">Artisan introuvable.</div>
  )

  const name = artisan.profile?.full_name || artisan.business_name
  const isOwner = profile?.id === artisan.profile_id
  const canReview = user && profile?.role === 'client' && !isOwner && !alreadyReviewed

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      {/* Profile header */}
      <div className="card p-8 mb-6">
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          <Avatar src={artisan.profile?.avatar_url} name={name} size="xl" />
          <div className="flex-1">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h1 className="text-2xl font-black text-marine">{name}</h1>
                  {artisan.verified && <Badge variant="marine">✓ Patenté</Badge>}
                  <Badge variant={artisan.available ? 'green' : 'red'}>
                    {artisan.available ? '● Disponible' : '● Indisponible'}
                  </Badge>
                </div>
                <p className="text-gray-500 font-medium">{artisan.business_name}</p>
                <p className="text-sm text-gray-400 mt-1">📍 {artisan.commune}</p>
                {artisan.patent_number && (
                  <p className="text-xs text-gray-400 mt-0.5">Patente : {artisan.patent_number}</p>
                )}
              </div>

              <div className="text-right">
                <div className="flex items-center gap-2 justify-end mb-1">
                  <StarRating value={artisan.rating} size="md" />
                  <span className="font-bold text-marine">{artisan.rating?.toFixed(1)}</span>
                </div>
                <p className="text-sm text-gray-400">{artisan.reviews_count} avis</p>
              </div>
            </div>

            {/* Trades */}
            {artisan.trades.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {artisan.trades.map(t => <Badge key={t} variant="orange">{t}</Badge>)}
              </div>
            )}

            {/* CTA */}
            {!isOwner && (
              <div className="mt-6 flex gap-3 flex-wrap">
                <Button onClick={handleContact} loading={contacting}>
                  💬 Contacter
                </Button>
                {isOwner && (
                  <Button variant="outline" onClick={() => navigate('/profile/edit')}>
                    Modifier le profil
                  </Button>
                )}
              </div>
            )}
            {isOwner && (
              <Button variant="outline" className="mt-6" onClick={() => navigate('/profile/edit')}>
                ✏️ Modifier mon profil
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      {artisan.description && (
        <div className="card p-6 mb-6">
          <h2 className="font-bold text-marine mb-3">À propos</h2>
          <p className="text-gray-600 leading-relaxed">{artisan.description}</p>
        </div>
      )}

      {/* Reviews */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-marine text-xl">Avis ({artisan.reviews_count})</h2>
          {canReview && (
            <Button variant="outline" size="sm" onClick={() => setShowReviewForm(v => !v)}>
              {showReviewForm ? 'Annuler' : '+ Laisser un avis'}
            </Button>
          )}
        </div>

        {showReviewForm && profile && (
          <div className="mb-4">
            <ReviewForm
              artisanId={artisan.id}
              clientId={profile.id}
              onSuccess={() => { setShowReviewForm(false); fetchData() }}
            />
          </div>
        )}

        {reviews.length === 0 ? (
          <div className="card p-8 text-center text-gray-400">
            <div className="text-4xl mb-2">⭐</div>
            <p>Aucun avis pour l'instant.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map(r => <ReviewCard key={r.id} review={r} />)}
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400 text-center">
        Membre depuis {formatDate(artisan.created_at)}
      </p>
    </div>
  )
}
