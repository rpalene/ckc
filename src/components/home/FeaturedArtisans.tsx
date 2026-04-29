import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import type { Artisan } from '../../types'
import ArtisanCard from '../artisan/ArtisanCard'
import Button from '../ui/Button'
import Spinner from '../ui/Spinner'

export default function FeaturedArtisans() {
  const [artisans, setArtisans] = useState<Artisan[]>([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    supabase
      .from('artisans')
      .select('*, profile:profiles(*)')
      .eq('available', true)
      .order('rating', { ascending: false })
      .limit(6)
      .then(({ data }) => {
        setArtisans((data as Artisan[]) ?? [])
        setLoading(false)
      })
  }, [])

  if (loading) return (
    <div className="flex justify-center py-16">
      <Spinner size="lg" />
    </div>
  )

  if (artisans.length === 0) return null

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-black text-marine mb-1">Artisans disponibles</h2>
          <p className="text-gray-500">Les mieux notés du moment</p>
        </div>
        <Link to="/artisans">
          <Button variant="outline" size="sm">Voir tous →</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {artisans.map(a => <ArtisanCard key={a.id} artisan={a} />)}
      </div>
    </section>
  )
}
