import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-marine text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-orange text-white font-black text-xl w-9 h-9 rounded-lg flex items-center justify-center">C</div>
              <span className="font-black text-xl tracking-tight">CKC</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              La plateforme qui connecte particuliers et artisans patentés en Nouvelle-Calédonie.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-gray-300">Navigation</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/artisans" className="hover:text-orange transition-colors">Trouver un artisan</Link></li>
              <li><Link to="/register" className="hover:text-orange transition-colors">Devenir artisan</Link></li>
              <li><Link to="/login" className="hover:text-orange transition-colors">Se connecter</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-gray-300">Contact</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>📍 Nouméa, Nouvelle-Calédonie</li>
              <li>📧 contact@ckc.nc</li>
              <li>📞 +687 00 00 00</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-marine-700 mt-10 pt-6 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} CKC — Tous droits réservés
        </div>
      </div>
    </footer>
  )
}
