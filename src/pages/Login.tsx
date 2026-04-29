import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'

export default function Login() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) { setError(err.message); setLoading(false); return }
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-orange text-white font-black text-2xl w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4">C</div>
          <h1 className="text-2xl font-black text-marine">Connexion</h1>
          <p className="text-gray-500 text-sm mt-1">Accédez à votre espace CKC</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required icon="✉" />
          <Input label="Mot de passe" type="password" value={password} onChange={e => setPassword(e.target.value)} required icon="🔒" />
          <Button type="submit" loading={loading} fullWidth size="lg">Se connecter</Button>
        </form>

        <p className="text-center text-gray-500 mt-6 text-sm">
          Pas encore de compte ?{' '}
          <Link to="/register" className="text-orange font-semibold hover:underline">S'inscrire</Link>
        </p>
      </div>
    </div>
  )
}
