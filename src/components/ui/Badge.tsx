import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  variant?: 'green' | 'red' | 'orange' | 'gray' | 'marine'
}

const variants = {
  green:  'bg-green-100 text-green-700',
  red:    'bg-red-100 text-red-700',
  orange: 'bg-orange-50 text-orange',
  gray:   'bg-gray-100 text-gray-600',
  marine: 'bg-marine text-white',
}

export default function Badge({ children, variant = 'gray' }: Props) {
  return (
    <span className={`${variants[variant]} text-xs font-semibold px-2.5 py-1 rounded-full`}>
      {children}
    </span>
  )
}
