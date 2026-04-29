import { TextareaHTMLAttributes } from 'react'

interface Props extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export default function Textarea({ label, error, className = '', ...props }: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-marine">{label}</label>}
      <textarea
        {...props}
        className={`input-field resize-none ${error ? 'border-red-400' : ''} ${className}`}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}
