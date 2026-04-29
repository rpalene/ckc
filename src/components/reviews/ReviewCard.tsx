import type { Review } from '../../types'
import Avatar from '../ui/Avatar'
import StarRating from '../ui/StarRating'
import { formatDate } from '../../lib/utils'

interface Props { review: Review }

export default function ReviewCard({ review }: Props) {
  const name = review.client?.full_name || 'Anonyme'
  return (
    <div className="card p-5">
      <div className="flex items-start gap-3 mb-3">
        <Avatar src={review.client?.avatar_url} name={name} size="sm" />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-marine text-sm">{name}</span>
            <span className="text-xs text-gray-400">{formatDate(review.created_at)}</span>
          </div>
          <StarRating value={review.rating} size="sm" />
        </div>
      </div>
      {review.comment && (
        <p className="text-gray-600 text-sm leading-relaxed">{review.comment}</p>
      )}
    </div>
  )
}
