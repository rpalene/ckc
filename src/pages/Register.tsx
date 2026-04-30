import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { COMMUNES, TRADE_CATEGORIES } from '../lib/constants'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Textarea from '../components/ui/Textarea'
import Button from '../components/ui/Button'
import type { UserRole } from '../types'

export default function Register() {
  const [role, setRole]           = useState<UserRole>('client')
  const [step, setStep]           = useState<1 | 2>(1)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const [success, setSuccess]     = useState(false)
  const navigate = useNavigate()

  // Common fields
  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [fullName, setFullName]   = useState('')
  const [phone, setPhone]         = useState('')
  const [commune, setCommune]     = useState('')

  // Artisan fields
  const [bizName, setBizName]     = useState('')
  const [patent, setPatent]       = useState('')
  const [desc, setDesc]           = useState('')
  const [category, setCategory]   = useState('')
  const [trades, setTrades]       = useState<string[]>([])

  const tradesForCat = TRADE_CATEGORIES.find(c => c.id === category)?.trades ?? []

  const toggleTrade = (t: string) =>
    setTrades(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // 1. Créer l'utilisateur dans auth.users
    //    emailRedirectTo : si confirmation email activée, Supabase redirige vers /dashboard
    const { data: authData, error: authErr } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/dashboard` },
    })
    if (authErr || !authData.user) {
      setError(authErr?.message ?? "Erreur lors de l'inscription")
      setLoading(false)
      return
    }

    const uid = authData.user.id

    // 2. Créer le profil via RPC security definer (bypass RLS, pas de session requise)
    const { error: profErr } = await supabase.rpc('create_profile', {
      p_id: uid, p_email: email, p_full_name: fullName,
      p_phone: phone, p_role: role, p_commune: commune,
    })
    if (profErr) { setError(profErr.message); setLoading(false); return }

    // 3. Pour les artisans : créer la fiche via RPC
    if (role === 'artisan') {
      const { error: artErr } = await supabase.rpc('create_artisan_profile', {
        p_profile_id:    uid,
        p_business_name: bizName,
        p_patent_number: patent,
        p_description:   desc,
        p_commune:       commune,
        p_category:      category,
        p_trades:        trades,
      })
      if (artErr) { setError(artErr.message); setLoading(false); return }
    }

    if (authData.session) {
      // Session immédiate (confirmation email désactivée) → dashboard direct
      navigate('/dashboard')
    } else {
      // Confirmation email requise → afficher message, le lien redirigera vers /dashboard
      setSuccess(true)
    }
    setLoading(false)
  }

  const communeOptions = COMMUNES.map(c => ({ value: c, label: c }))
  const categoryOptions = TRADE_CATEGORIES.map(c => ({ value: c.id, label: `${c.icon} ${c.name}` }))

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="bg-orange text-white font-black text-2xl w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4">C</div>
          <h1 className="text-2xl font-black text-marine">Créer un compte</h1>
        </div>

        {/* Succès : confirmation email requise */}
        {success && (
          <div className="text-center py-4 space-y-4">
            <div className="text-6xl">📧</div>
            <h2 className="text-xl font-black text-marine">Vérifiez votre email</h2>
            <p className="text-gray-500 text-sm leading-relaxed">
              Un lien de confirmation a été envoyé à <strong>{email}</strong>.
              Cliquez dessus pour accéder à votre tableau de bord.
            </p>
            <Link to="/login" className="text-orange font-semibold hover:underline text-sm block">
              Déjà confirmé ? Se connecter →
            </Link>
          </div>
        )}

        {/* Step 1: Choose role */}
        {!success && step === 1 && (
          <div className="space-y-4">
            <p className="text-center text-gray-500 text-sm mb-6">Je suis…</p>
            <div className="grid grid-cols-2 gap-4">
              {(['client', 'artisan'] as const).map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`p-6 rounded-2xl border-2 text-center transition-all ${
                    role === r ? 'border-orange bg-orange-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-4xl mb-2">{r === 'client' ? '🏠' : '🔨'}</div>
                  <div className="font-bold text-marine">{r === 'client' ? 'Particulier' : 'Artisan'}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {r === 'client' ? 'Je cherche un pro' : 'Je propose mes services'}
                  </div>
                </button>
              ))}
            </div>
            <Button fullWidth onClick={() => setStep(2)} className="mt-4">
              Continuer →
            </Button>
            <p className="text-center text-gray-500 text-sm">
              Déjà un compte ?{' '}
              <Link to="/login" className="text-orange font-semibold hover:underline">Se connecter</Link>
            </p>
          </div>
        )}

        {/* Step 2: Fill details */}
        {!success && step === 2 && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <button type="button" onClick={() => setStep(1)} className="text-sm text-gray-400 hover:text-marine mb-2">
              ← Retour
            </button>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <Input label="Nom complet" value={fullName} onChange={e => setFullName(e.target.value)} required />
            <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            <Input label="Mot de passe" type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="8 caractères minimum" />
            <Input label="Téléphone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+687 XX XX XX" />
            <Select label="Commune" value={commune} onChange={e => setCommune(e.target.value)} options={communeOptions} placeholder="Sélectionner…" required />

            {role === 'artisan' && (
              <>
                <hr className="my-2" />
                <p className="font-semibold text-marine text-sm">Informations professionnelles</p>
                <Input label="Nom de l'entreprise" value={bizName} onChange={e => setBizName(e.target.value)} required />
                <Input label="Numéro de patente" value={patent} onChange={e => setPatent(e.target.value)} placeholder="Ex: 2024-12345" />
                <Select label="Catégorie principale" value={category} onChange={e => { setCategory(e.target.value); setTrades([]) }} options={categoryOptions} placeholder="Sélectionner…" />
                {category && (
                  <div>
                    <label className="text-sm font-medium text-marine mb-2 block">Métiers exercés</label>
                    <div className="flex flex-wrap gap-2">
                      {tradesForCat.map(t => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => toggleTrade(t)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium border-2 transition-all ${
                            trades.includes(t) ? 'border-orange bg-orange text-white' : 'border-gray-200 text-gray-600 hover:border-orange'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <Textarea label="Description" value={desc} onChange={e => setDesc(e.target.value)} rows={3} placeholder="Présentez vos services, votre expérience…" />
              </>
            )}

            <Button type="submit" loading={loading} fullWidth size="lg" className="mt-2">
              Créer mon compte
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
