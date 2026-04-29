interface Props {
  value: number
  max?: number
  onChange?: (v: number) => void
  size?: 'sm' | 'md' | 'lg'
}

const sizes = { sm: 'text-base', md: 'text-xl', lg: 'text-3xl' }

export default function StarRating({ value, max = 5, onChange, size = 'md' }: Props) {
  return (
    <div className={`flex gap-0.5 ${sizes[size]}`}>
      {Array.from({ length: max }, (_, i) => {
        const filled = i < Math.round(value)
        return (
          <button
            key={i}
            type="button"
            onClick={() => onChange?.(i + 1)}
            className={`${filled ? 'text-orange' : 'text-gray-300'} ${onChange ? 'cursor-pointer hover:text-orange transition-colors' : 'cursor-default'}`}
          >
            ★
          </button>
        )
      })}
    </div>
  )
}
