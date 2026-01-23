import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Users, Trophy, Heart, ArrowRight } from 'lucide-react';
import banner from '@/assets/images/Banner.jpeg';

function HomePage() {
  const features = [
    {
      icon: Users,
      title: 'Comunidad',
      description: 'Únete a una familia de amantes del vóley.',
    },
    {
      icon: Heart,
      title: 'Salud',
      description: 'Mantente en forma mientras te diviertes bajo el sol.',
    },
    {
      icon: Trophy,
      title: 'Competencia',
      description: 'Torneos para todos los niveles y edades.',
    },
  ];

  return (
    <div>
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-ocean-500 to-primary-500"></div>
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url(${banner})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        ></div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center text-white">
          <motion.h1
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-display font-bold mb-6"
          >
            Vive el Mejor Vóley Playa en Manizales
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl mb-8 text-white/90"
          >
            Entrena, compite y conéctate con la comunidad de vóley playa más vibrante de Colombia.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/contact" className="btn bg-white text-primary-500 hover:bg-gray-100">
              Únete Ahora
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/about" className="btn border-2 border-white text-white hover:bg-white/10">
              Conoce Más Sobre Nosotros
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-bold text-gray-900 mb-4">
              ¿Por Qué Elegir Pelícanos?
            </h2>
            <p className="text-xl text-gray-600">
              Más que un club, somos un estilo de vida.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="card text-center hover:shadow-xl transition-shadow"
                >
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-primary-500" />
                  </div>
                  <h3 className="text-2xl font-display font-bold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>

          <div className="text-center mt-12">
            <Link to="/contact" className="btn btn-primary btn-lg">
              Únete Ahora <ArrowRight className="ml-2" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-display font-bold text-gray-900 mb-6">
                Nuestras Canchas
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Césped profesional y iluminación. Área dedicada para entrenamientos y fitness. Área social. Relájate y conecta con el equipo.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Cancha Principal</h4>
                    <p className="text-gray-600">Césped profesional y iluminación</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Zona de Entrenamiento</h4>
                    <p className="text-gray-600">Área dedicada para entrenamientos y fitness</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Área Social</h4>
                    <p className="text-gray-600">Relájate y conecta con el equipo</p>
                  </div>
                </li>
              </ul>
              <Link to="/venues" className="btn btn-outline">
                Ver Todas las Canchas
              </Link>
            </div>
            <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800"
                alt="Cancha de vóley playa"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-primary-500 to-ocean-500 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-display font-bold mb-6">
            ¿Listo para Comenzar tu Aventura en el Vóley?
          </h2>
          <p className="text-xl mb-8">
            Únete a cientos de jugadores que han encontrado su pasión en Pelícanos.
          </p>
          <Link to="/contact" className="btn bg-white text-primary-500 hover:bg-gray-100 btn-lg">
            Comienza Hoy
          </Link>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
