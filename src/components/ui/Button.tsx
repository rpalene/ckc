import { ButtonHTMLAttributes } from 'react'
import type { ReactNode } from 'react'
import Spinner from './Spinner'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  fullWidth?: boolean
  children: ReactNode
}

const variants = {
  primary:   'bg-orange text-white hover:bg-orange-600 shadow-sm',
  secondary: 'bg-marine text-white hover:bg-marine-700 shadow-sm',
  outline:   'border-2 border-orange text-orange hover:bg-orange-50',
  ghost:     'text-marine hover:bg-gray-100',
}

const sizes = {
  sm: 'px-4 py-2 text-sm rounded-lg',
  md: 'px-6 py-3 rounded-xl',
  lg: 'px-8 py-4 text-lg rounded-xl',
}

export default function Button({
  variant = 'primary', size = 'md', loading, fullWidth, children, className = '', disabled, ...props
}: Props) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`
        ${variants[variant]} ${sizes[size]}
        font-semibold transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        flex items-center justify-center gap-2
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
    >
      {loading && <Spinner size="sm" color="white" />}
      {children}
    </button>
  )
}
