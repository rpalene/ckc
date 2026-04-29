import { COMMUNES, TRADE_CATEGORIES } from '../../lib/constants'
import Select from '../ui/Select'

interface Filters {
  q: string
  commune: string
  category: string
  available: boolean
}

interface Props {
  filters: Filters
  onChange: (f: Partial<Filters>) => void
  onReset: () => void
}

export default function SearchFilters({ filters, onChange, onReset }: Props) {
  return (
    <aside className="card p-5 h-fit sticky top-24">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-bold text-marine">Filtres</h3>
        <button onClick={onReset} className="text-xs text-orange hover:underline">Réinitialiser</button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-marine mb-1.5 block">Mot-clé</label>
          <input
            type="text"
            placeholder="Maçon, électricien…"
            value={filters.q}
            onChange={e => onChange({ q: e.target.value })}
            className="input-field"
          />
        </div>

        <Select
          label="Commune"
          value={filters.commune}
          onChange={e => onChange({ commune: e.target.value })}
          options={COMMUNES.map(c => ({ value: c, label: c }))}
          placeholder="Toutes"
        />

        <Select
          label="Catégorie"
          value={filters.category}
          onChange={e => onChange({ category: e.target.value })}
          options={TRADE_CATEGORIES.map(c => ({ value: c.id, label: `${c.icon} ${c.name}` }))}
          placeholder="Toutes"
        />

        <label className="flex items-center gap-3 cursor-pointer">
          <div
            onClick={() => onChange({ available: !filters.available })}
            className={`w-11 h-6 rounded-full transition-colors relative ${filters.available ? 'bg-orange' : 'bg-gray-200'}`}
          >
            <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${filters.available ? 'left-5' : 'left-0.5'}`} />
          </div>
          <span className="text-sm font-medium text-marine">Disponible seulement</span>
        </label>
      </div>
    </aside>
  )
}
