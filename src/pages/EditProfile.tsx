import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { COMMUNES, TRADE_CATEGORIES } from '../lib/constants'
import type { Artisan } from '../types'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Textarea from '../components/ui/Textarea'
import Button from '../components/ui/Button'
import Spinner from '../components/ui/Spinner'

export default function EditProfile() {
  const { profile, refreshProfile } = useAuth()
  const navigate  = useNavigate()
  const [artisan, setArtisan] = useState<Artisan | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [success, setSuccess] = useState(false)

  // Profile fields
  const [fullName, setFullName] = useState('')
  const [phone, setPhone]       = useState('')
  const [commune, setCommune]   = useState('')

  // Artisan fields
  const [bizName, setBizName] = useState('')
  const [patent, setPatent]   = useState('')
  const [desc, setDesc]       = useState('')
  const [trades, setTrades]   = useState<string[]>([])
  const [category, setCategory] = useState('')

  useEffect(() => {
    if (!profile) return
    setFullName(profile.full_name)
    setPhone(profile.phone ?? '')
    setCommune(profile.commune ?? '')

    if (profile.role === 'artisan') {
      supabase.from('artisans').select('*').eq('profile_id', profile.id).single().then(({ data }) => {
        if (data) {
          const a = data as Artisan
          setArtisan(a)
          setBizName(a.business_name)
          setPatent(a.patent_number ?? '')
          setDesc(a.description ?? '')
          setTrades(a.trades ?? [])
          setCategory(a.category ?? '')
        }
        setLoading(false)
      })
    } else {
      setLoading(false)
    }
  }, [profile])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return
    setSaving(true)

    await supabase.from('profiles').update({ full_name: fullName, phone, commune }).eq('id', profile.id)

    if (profile.role === 'artisan' && artisan) {
      await supabase.from('artisans').update({
        business_name: bizName, patent_number: patent, description: desc, trades, category, commune,
      }).eq('id', artisan.id)
    }

    await refreshProfile()
    setSaving(false)
    setSuccess(true)
    setTimeout(() => navigate('/dashboard'), 1500)
  }

  const toggleTrade = (t: string) =>
    setTrades(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])

  const tradesForCat = TRADE_CATEGORIES.find(c => c.id === category)?.trades ?? []
  const communeOptions = COMMUNES.map(c => ({ value: c, label: c }))
  const categoryOptions = TRADE_CATEGORIES.map(c => ({ value: c.id, label: `${c.icon} ${c.name}` }))

  if (!profile) return null
  if (loading) return <div className="flex justify-center py-24"><Spinner size="lg" /></div>

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-2xl font-black text-marine mb-8">Modifier mon profil</h1>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-6 text-sm">
          ✓ Profil mis à jour avec succès !
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-5">
        <div className="card p-6 space-y-4">
          <h2 className="font-bold text-marine">Informations personnelles</h2>
          <Input label="Nom complet" value={fullName} onChange={e => setFullName(e.target.value)} required />
          <Input label="Téléphone" value={phone} onChange={e => setPhone(e.target.value)} type="tel" />
          <Select label="Commune" value={commune} onChange={e => setCommune(e.target.value)} options={communeOptions} placeholder="Sélectionner…" />
        </div>

        {profile.role === 'artisan' && artisan && (
          <div className="card p-6 space-y-4">
            <h2 className="font-bold text-marine">Informations professionnelles</h2>
            <Input label="Nom de l'entreprise" value={bizName} onChange={e => setBizName(e.target.value)} required />
            <Input label="Numéro de patente" value={patent} onChange={e => setPatent(e.target.value)} />
            <Select label="Catégorie principale" value={category} onChange={e => { setCategory(e.target.value); setTrades([]) }} options={categoryOptions} placeholder="Sélectionner…" />
            {category && (
              <div>
                <label className="text-sm font-medium text-marine mb-2 block">Métiers exercés</label>
                <div className="flex flex-wrap gap-2">
                  {tradesForCat.map(t => (
                    <button key={t} type="button" onClick={() => toggleTrade(t)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium border-2 transition-all ${
                        trades.includes(t) ? 'border-orange bg-orange text-white' : 'border-gray-200 text-gray-600 hover:border-orange'
                      }`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <Textarea label="Description" value={desc} onChange={e => setDesc(e.target.value)} rows={4} placeholder="Présentez vos services, votre expérience…" />
          </div>
        )}

        <Button type="submit" loading={saving} fullWidth size="lg">
          Enregistrer les modifications
        </Button>
      </form>
    </div>
  )
}
