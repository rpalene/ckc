import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { COMMUNES, TRADE_CATEGORIES } from '../../lib/constants'
import Button from '../ui/Button'

export default function HeroSection() {
  const [keyword, setKeyword]   = useState('')
  const [commune, setCommune]   = useState('')
  const [category, setCategory] = useState('')
  const [locating, setLocating] = useState(false)
  const navigate = useNavigate()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (keyword)  params.set('q', keyword)
    if (commune)  params.set('commune', commune)
    if (category) params.set('category', category)
    navigate(`/artisans?${params.toString()}`)
  }

  const geolocate = () => {
    if (!navigator.geolocation) return
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      () => {
        setCommune('Nouméa')
        setLocating(false)
      },
      () => setLocating(false),
      { timeout: 8000 }
    )
  }

  return (
    <section className="bg-marine relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-orange opacity-10 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange opacity-5 rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20 relative z-10 text-center">
        <span className="inline-block bg-orange/20 text-orange text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
          🇳🇨 Nouvelle-Calédonie
        </span>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-tight mb-6">
          Trouvez l'artisan<br />
          <span className="text-orange">qu'il vous faut</span>
        </h1>
        <p className="text-gray-300 text-lg mb-10 max-w-2xl mx-auto">
          Mis en relation avec des artisans patentés et vérifiés près de chez vous, partout en Nouvelle-Calédonie.
        </p>

        {/* Search form */}
        <form onSubmit={handleSearch} className="bg-white rounded-2xl p-4 shadow-2xl flex flex-col md:flex-row gap-3">
          <input
            type="text"
            placeholder="Maçon, électricien, plombier…"
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange text-marine placeholder-gray-400"
          />
          <select
            value={commune}
            onChange={e => setCommune(e.target.value)}
            className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange text-marine min-w-[160px] appearance-none bg-white"
          >
            <option value="">Toutes les communes</option>
            {COMMUNES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange text-marine min-w-[160px] appearance-none bg-white"
          >
            <option value="">Tous les métiers</option>
            {TRADE_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <Button type="submit" size="md" className="px-6 whitespace-nowrap">
            🔍 Rechercher
          </Button>
        </form>

        {/* Geolocation */}
        <button
          type="button"
          onClick={geolocate}
          disabled={locating}
          className="mt-4 text-gray-400 hover:text-orange text-sm transition-colors flex items-center gap-1.5 mx-auto"
        >
          {locating ? '📍 Localisation…' : '📍 Utiliser ma position'}
        </button>

        {/* Stats */}
        <div className="flex justify-center gap-12 mt-12">
          {[['500+', 'Artisans'], ['30', 'Communes'], ['4,8★', 'Note moyenne']].map(([n, l]) => (
            <div key={l} className="text-center">
              <div className="text-2xl font-black text-orange">{n}</div>
              <div className="text-gray-400 text-sm">{l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
