import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Instagram, Facebook } from 'lucide-react';
import logo from '@/assets/images/Logo.png';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img src={logo} alt="Pelícanos Voley Club" className="h-12 w-auto" />
            </div>
            <p className="text-sm">
              El club de vóley playa líder en Manizales. Entrenamiento, torneos y buena vibra.
            </p>
          </div>

          <div>
            <h3 className="font-display font-bold text-white mb-4">Club</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  Nosotros
                </Link>
              </li>
              <li>
                <Link to="/venues" className="hover:text-white transition-colors">
                  Sedes
                </Link>
              </li>
              <li>
                <Link to="/gallery" className="hover:text-white transition-colors">
                  Galería
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-display font-bold text-white mb-4">Contacto</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                <span>Manizales, Caldas</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <a href="tel:+573001234567" className="hover:text-primary-400">
                  +57 300 123 4567
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <a href="mailto:pelicanosvoleyclub@gmail.com" className="hover:text-primary-400">
                  pelicanosvoleyclub@gmail.com
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-display font-bold text-white mb-4">Síguenos</h3>
            <div className="flex gap-4">
              <a
                href="www.instagram.com/pelicanosvoleyclub/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary-500 transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://web.facebook.com/Pelicanosvoleyclub/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary-500 transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
          <p>© {currentYear} Developed by <a href="https://devsa.tech" target="_blank" rel="noopener noreferrer" className="hover:text-primary-400 transition-colors">Devsa</a>.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
