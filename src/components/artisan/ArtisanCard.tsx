import { Link } from 'react-router-dom'
import type { Artisan } from '../../types'
import Avatar from '../ui/Avatar'
import Badge from '../ui/Badge'
import StarRating from '../ui/StarRating'

interface Props { artisan: Artisan }

export default function ArtisanCard({ artisan }: Props) {
  const name = artisan.profile?.full_name || artisan.business_name

  return (
    <div className="card hover:shadow-md transition-all duration-200 flex flex-col">
      <div className="p-5 flex-1">
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          <Avatar src={artisan.profile?.avatar_url} name={name} size="lg" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-marine truncate">{name}</h3>
              {artisan.verified && (
                <span className="text-xs text-blue-500 font-semibold">✓ Patenté</span>
              )}
            </div>
            <p className="text-sm text-gray-500 truncate">{artisan.business_name}</p>
            <div className="flex items-center gap-1 mt-1">
              <StarRating value={artisan.rating} size="sm" />
              <span className="text-xs text-gray-400">({artisan.reviews_count})</span>
            </div>
          </div>
        </div>

        {/* Trades */}
        {artisan.trades.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {artisan.trades.slice(0, 3).map(t => (
              <Badge key={t} variant="orange">{t}</Badge>
            ))}
            {artisan.trades.length > 3 && (
              <Badge variant="gray">+{artisan.trades.length - 3}</Badge>
            )}
          </div>
        )}

        {/* Location */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500 flex items-center gap-1">
            📍 {artisan.commune}
          </span>
          <Badge variant={artisan.available ? 'green' : 'red'}>
            {artisan.available ? '● Disponible' : '● Indisponible'}
          </Badge>
        </div>
      </div>

      <div className="px-5 pb-5">
        <Link
          to={`/artisans/${artisan.id}`}
          className="block w-full text-center bg-marine text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-marine-700 transition-colors"
        >
          Voir le profil
        </Link>
      </div>
    </div>
  )
}
