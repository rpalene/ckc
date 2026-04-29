import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Avatar from '../ui/Avatar'

export default function Navbar() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropOpen, setDropOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
    setDropOpen(false)
  }

  const navLink = (to: string, label: string) => (
    <Link
      to={to}
      onClick={() => setMenuOpen(false)}
      className={`font-medium transition-colors ${pathname === to ? 'text-orange' : 'text-marine hover:text-orange'}`}
    >
      {label}
    </Link>
  )

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="bg-orange text-white font-black text-xl w-9 h-9 rounded-lg flex items-center justify-center">
            C
          </div>
          <span className="font-black text-xl text-marine tracking-tight">CKC</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLink('/artisans', 'Trouver un artisan')}
          {user && navLink('/messages', 'Messages')}
          {user && navLink('/dashboard', 'Tableau de bord')}
        </div>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-3">
          {user && profile ? (
            <div className="relative">
              <button
                onClick={() => setDropOpen(v => !v)}
                className="flex items-center gap-2 p-1 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <Avatar src={profile.avatar_url} name={profile.full_name || profile.email} size="sm" />
                <span className="font-medium text-marine text-sm">{profile.full_name?.split(' ')[0]}</span>
                <span className="text-gray-400 text-xs">▾</span>
              </button>
              {dropOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                  <Link to="/dashboard" onClick={() => setDropOpen(false)} className="block px-4 py-2.5 text-sm text-marine hover:bg-cream">Tableau de bord</Link>
                  <Link to="/profile/edit" onClick={() => setDropOpen(false)} className="block px-4 py-2.5 text-sm text-marine hover:bg-cream">Mon profil</Link>
                  <hr className="my-1 border-gray-100" />
                  <button onClick={handleSignOut} className="block w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50">
                    Déconnexion
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="font-semibold text-marine hover:text-orange transition-colors text-sm">
                Connexion
              </Link>
              <Link to="/register" className="bg-orange text-white px-4 py-2 rounded-xl font-semibold text-sm hover:bg-orange-600 transition-colors">
                S'inscrire
              </Link>
            </>
          )}
        </div>

        {/* Mobile burger */}
        <button onClick={() => setMenuOpen(v => !v)} className="md:hidden p-2 text-marine">
          <div className={`w-5 h-0.5 bg-marine mb-1 transition-all ${menuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
          <div className={`w-5 h-0.5 bg-marine mb-1 transition-all ${menuOpen ? 'opacity-0' : ''}`} />
          <div className={`w-5 h-0.5 bg-marine transition-all ${menuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 flex flex-col gap-4">
          {navLink('/artisans', 'Trouver un artisan')}
          {user && navLink('/messages', 'Messages')}
          {user && navLink('/dashboard', 'Tableau de bord')}
          {user ? (
            <>
              {navLink('/profile/edit', 'Mon profil')}
              <button onClick={handleSignOut} className="text-left text-red-500 font-medium">Déconnexion</button>
            </>
          ) : (
            <div className="flex gap-3">
              <Link to="/login" onClick={() => setMenuOpen(false)} className="flex-1 text-center border-2 border-marine text-marine py-2 rounded-xl font-semibold text-sm">Connexion</Link>
              <Link to="/register" onClick={() => setMenuOpen(false)} className="flex-1 text-center bg-orange text-white py-2 rounded-xl font-semibold text-sm">S'inscrire</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}
