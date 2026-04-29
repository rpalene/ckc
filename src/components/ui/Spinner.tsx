interface Props {
  size?: 'sm' | 'md' | 'lg'
  color?: 'orange' | 'white' | 'marine'
}

const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' }
const colors = {
  orange: 'border-orange border-t-transparent',
  white:  'border-white border-t-transparent',
  marine: 'border-marine border-t-transparent',
}

export default function Spinner({ size = 'md', color = 'orange' }: Props) {
  return (
    <div className={`${sizes[size]} border-2 ${colors[color]} rounded-full animate-spin`} />
  )
}
