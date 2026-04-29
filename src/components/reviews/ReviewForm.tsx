import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import StarRating from '../ui/StarRating'
import Textarea from '../ui/Textarea'
import Button from '../ui/Button'

interface Props {
  artisanId: string
  clientId: string
  onSuccess: () => void
}

export default function ReviewForm({ artisanId, clientId, onSuccess }: Props) {
  const [rating, setRating]   = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0) { setError('Veuillez choisir une note'); return }
    setLoading(true)
    setError('')
    const { error: err } = await supabase.from('reviews').upsert({
      client_id: clientId, artisan_id: artisanId, rating, comment,
    })
    if (err) { setError(err.message); setLoading(false); return }
    setLoading(false)
    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-4">
      <h3 className="font-bold text-marine">Laisser un avis</h3>

      <div>
        <label className="text-sm font-medium text-marine mb-2 block">Votre note</label>
        <StarRating value={rating} onChange={setRating} size="lg" />
      </div>

      <Textarea
        label="Commentaire (optionnel)"
        value={comment}
        onChange={e => setComment(e.target.value)}
        rows={3}
        placeholder="Décrivez votre expérience…"
      />

      {error && <p className="text-sm text-red-500">{error}</p>}

      <Button type="submit" loading={loading} fullWidth>
        Publier l'avis
      </Button>
    </form>
  )
}
