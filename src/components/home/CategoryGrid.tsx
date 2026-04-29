import { useNavigate } from 'react-router-dom'
import { TRADE_CATEGORIES } from '../../lib/constants'

export default function CategoryGrid() {
  const navigate = useNavigate()

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
      <h2 className="text-3xl font-black text-marine mb-2">Nos catégories</h2>
      <p className="text-gray-500 mb-10">Trouvez le bon professionnel pour chaque besoin</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {TRADE_CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => navigate(`/artisans?category=${cat.id}`)}
            className="group card p-6 flex flex-col items-center gap-3 text-center hover:border-orange hover:shadow-md transition-all duration-200 cursor-pointer"
          >
            <span className="text-4xl group-hover:scale-110 transition-transform duration-200">
              {cat.icon}
            </span>
            <span className="font-semibold text-marine text-sm group-hover:text-orange transition-colors">
              {cat.name}
            </span>
            <span className="text-xs text-gray-400">
              {cat.trades.length} métiers
            </span>
          </button>
        ))}
      </div>
    </section>
  )
}
