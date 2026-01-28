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
        
        {/* Patrón decorativo */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
        </div>
        
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
            <Link to="/contact" className="btn bg-white text-primary-500 hover:bg-gray-100 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all">
              Únete Ahora
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/about" className="glass border-2 border-white text-white hover:bg-white/20 px-6 py-3 rounded-lg font-semibold transition-all inline-flex items-center justify-center gap-2">
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
                  className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl p-8 text-center transition-all duration-300 hover:-translate-y-2 border border-gray-100 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-ocean-50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-ocean-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-display font-bold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
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

      <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-ocean-500 rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-display font-bold text-gray-900 mb-6">
                Nuestras Canchas
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Césped profesional y iluminación. Área dedicada para entrenamientos y fitness. Área social. Relájate y conecta con el equipo.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3 p-4 rounded-xl bg-white/50 backdrop-blur-sm border border-white/60 hover:bg-white/80 transition-all">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-ocean-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Cancha Principal</h4>
                    <p className="text-gray-600">Césped profesional y iluminación</p>
                  </div>
                </li>
                <li className="flex items-start gap-3 p-4 rounded-xl bg-white/50 backdrop-blur-sm border border-white/60 hover:bg-white/80 transition-all">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-ocean-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Zona de Entrenamiento</h4>
                    <p className="text-gray-600">Área dedicada para entrenamientos y fitness</p>
                  </div>
                </li>
                <li className="flex items-start gap-3 p-4 rounded-xl bg-white/50 backdrop-blur-sm border border-white/60 hover:bg-white/80 transition-all">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-ocean-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                src="https://www.lapatria.com/sites/default/files/noticia/2023-02/a.aaaaaa.jpg"
                alt="Cancha de vóley playa"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-primary-600 to-ocean-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <div className="glass rounded-3xl p-12 border-2 border-white/30">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
              ¿Listo para Comenzar tu Aventura en el Vóley?
            </h2>
            <p className="text-xl mb-8 text-white/90">
              Únete a cientos de jugadores que han encontrado su pasión en Pelícanos.
            </p>
            <Link to="/contact" className="btn bg-white text-primary-600 hover:bg-gray-100 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all text-lg px-8 py-4">
              Comienza Hoy
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
