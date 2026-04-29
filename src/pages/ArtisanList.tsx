import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Artisan } from '../types'
import { TRADE_CATEGORIES } from '../lib/constants'
import ArtisanCard from '../components/artisan/ArtisanCard'
import SearchFilters from '../components/artisan/SearchFilters'
import Spinner from '../components/ui/Spinner'

const DEFAULT_FILTERS = { q: '', commune: '', category: '', available: false }

export default function ArtisanList() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [artisans, setArtisans] = useState<Artisan[]>([])
  const [loading, setLoading]   = useState(true)
  const [filters, setFilters]   = useState({
    q:         searchParams.get('q')        ?? '',
    commune:   searchParams.get('commune')  ?? '',
    category:  searchParams.get('category') ?? '',
    available: false,
  })

  const updateFilters = (patch: Partial<typeof filters>) =>
    setFilters(prev => ({ ...prev, ...patch }))

  const fetchArtisans = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from('artisans')
      .select('*, profile:profiles(*)')
      .order('rating', { ascending: false })

    if (filters.commune)  query = query.eq('commune', filters.commune)
    if (filters.category) query = query.eq('category', filters.category)
    if (filters.available) query = query.eq('available', true)
    if (filters.q) {
      // Search in business_name or trades using ilike
      query = query.or(`business_name.ilike.%${filters.q}%,trades.cs.{${filters.q}}`)
    }

    const { data } = await query
    setArtisans((data as Artisan[]) ?? [])
    setLoading(false)
  }, [filters])

  useEffect(() => { fetchArtisans() }, [fetchArtisans])

  const categoryLabel = filters.category
    ? TRADE_CATEGORIES.find(c => c.id === filters.category)?.name
    : null

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-marine mb-1">
          {categoryLabel ?? 'Tous les artisans'}
        </h1>
        <p className="text-gray-500">
          {loading ? '…' : `${artisans.length} artisan${artisans.length > 1 ? 's' : ''} trouvé${artisans.length > 1 ? 's' : ''}`}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filters sidebar */}
        <div className="lg:w-64 flex-shrink-0">
          <SearchFilters
            filters={filters}
            onChange={updateFilters}
            onReset={() => { setFilters(DEFAULT_FILTERS); setSearchParams({}) }}
          />
        </div>

        {/* Results */}
        <div className="flex-1">
          {loading ? (
            <div className="flex justify-center py-20">
              <Spinner size="lg" />
            </div>
          ) : artisans.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-marine mb-2">Aucun résultat</h3>
              <p className="text-gray-500">Modifiez vos filtres pour trouver un artisan.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {artisans.map(a => <ArtisanCard key={a.id} artisan={a} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
