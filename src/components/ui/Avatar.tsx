import { getInitials } from '../../lib/utils'

interface Props {
  src?: string | null
  name: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const sizes = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-lg',
  xl: 'w-24 h-24 text-2xl',
}

export default function Avatar({ src, name, size = 'md' }: Props) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${sizes[size]} rounded-full object-cover flex-shrink-0`}
      />
    )
  }
  return (
    <div className={`${sizes[size]} rounded-full bg-orange text-white font-bold flex items-center justify-center flex-shrink-0`}>
      {getInitials(name)}
    </div>
  )
}
