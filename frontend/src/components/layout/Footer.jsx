import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Instagram, Facebook } from 'lucide-react';
import logo from '@/assets/images/Logo.png';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-12">

          {/* Brand */}
          <div className="md:col-span-4">
            <img src={logo} alt="Pelícanos Voley Club" className="h-12 w-auto mb-4" />
            <p className="text-sm leading-relaxed max-w-xs">
              El club de vóley playa líder en Manizales. Entrenamiento profesional, torneos y una comunidad increíble.
            </p>
            <div className="flex gap-3 mt-6">
              <a
                href="https://www.instagram.com/pelicanosvoleyclub"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram de Pelícanos"
                className="w-10 h-10 bg-slate-800 flex items-center justify-center hover:bg-primary-500 hover:text-white transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://web.facebook.com/Pelicanosvoleyclub/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook de Pelícanos"
                className="w-10 h-10 bg-slate-800 flex items-center justify-center hover:bg-primary-500 hover:text-white transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div className="md:col-span-3">
            <h3 className="font-display font-bold text-white uppercase tracking-widest text-xs mb-5">Club</h3>
            <ul className="space-y-3 text-sm">
              {[
                { to: '/about', label: 'Nosotros' },
                { to: '/venues', label: 'Sedes' },
                { to: '/gallery', label: 'Galería' },
                { to: '/contact', label: 'Contacto' },
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="hover:text-primary-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="md:col-span-5">
            <h3 className="font-display font-bold text-white uppercase tracking-widest text-xs mb-5">Contacto</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-primary-400 mt-0.5 flex-shrink-0" />
                <span>Manizales, Caldas, Colombia</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-primary-400 flex-shrink-0" />
                <a href="tel:+573113057249" className="hover:text-primary-400 transition-colors">
                  +57 311 305 7249
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-primary-400 flex-shrink-0" />
                <a href="mailto:pelicanosvoleyclub@gmail.com" className="hover:text-primary-400 transition-colors break-all">
                  pelicanosvoleyclub@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-600">
          <p>© {currentYear} Pelícanos Vóley Club. Todos los derechos reservados.</p>
          <p>
            Developed by{' '}
            <a
              href="https://santiagomartinez.dev/es"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary-400 transition-colors"
            >
              Santiago Martínez
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
