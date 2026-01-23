import { motion } from 'framer-motion';
import { Target, Eye, Heart } from 'lucide-react';

function AboutPage() {
  return (
    <div>
      <section className="py-20 bg-gradient-to-br from-ocean-500 to-primary-500 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-display font-bold mb-6"
          >
            Acerca de Pelícanos Vóley Club
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-white/90"
          >
            Construyendo comunidad a través del vóley playa en el corazón de Manizales
          </motion.p>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-display font-bold text-gray-900 mb-6">Nuestra Historia</h2>
          <div className="prose prose-lg max-w-none text-gray-600">
            <p>
              Pelícanos Vóley Club fue fundado con una visión simple: traer la alegría y 
              emoción del vóley playa a Manizales, Caldas. Lo que comenzó como un pequeño 
              grupo de jugadores apasionados ha crecido hasta convertirse en una próspera comunidad de atletas, 
              amigos y entusiastas del voleibol.
            </p>
            <p>
              Bajo el liderazgo de nuestro fundador y entrenador principal Daniel Castaño, hemos 
              creado un espacio donde jugadores de todos los niveles pueden desarrollar sus habilidades, competir 
              en torneos y construir amistades duraderas. Nuestro club es más que solo un 
              lugar para jugar voleibol – es una familia.
            </p>
            <p>
              Hoy, estamos orgullosos de ser el destino premier de vóley playa en Manizales, 
              ofreciendo entrenamiento profesional, instalaciones de primera calidad y una 
              comunidad acogedora que celebra tanto la competencia como la camaradería.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="card text-center"
            >
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-primary-500" />
              </div>
              <h3 className="text-2xl font-display font-bold text-gray-900 mb-4">Misión</h3>
              <p className="text-gray-600">
                Promover el vóley playa como deporte y estilo de vida, proporcionando un espacio 
                donde los atletas puedan crecer, competir y conectar con una comunidad apasionada.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="card text-center"
            >
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Eye className="w-8 h-8 text-primary-500" />
              </div>
              <h3 className="text-2xl font-display font-bold text-gray-900 mb-4">Visión</h3>
              <p className="text-gray-600">
                Ser reconocidos como el club de vóley playa líder en Colombia, 
                desarrollando atletas de clase mundial mientras fomentamos una cultura de excelencia 
                y deportividad.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="card text-center"
            >
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-primary-500" />
              </div>
              <h3 className="text-2xl font-display font-bold text-gray-900 mb-4">Valores</h3>
              <ul className="text-gray-600 text-left space-y-2">
                <li>• Trabajo en equipo y colaboración</li>
                <li>• Respeto y deportividad</li>
                <li>• Mejora continua</li>
                <li>• Comunidad e inclusión</li>
                <li>• Pasión por el deporte</li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-display font-bold text-gray-900 mb-6">
            Conoce a Nuestro Entrenador
          </h2>
          <div className="card max-w-2xl mx-auto">
            <div className="flex flex-col md:flex-row gap-6 items-center text-left">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary-400 to-ocean-500 flex items-center justify-center flex-shrink-0">
                <span className="text-4xl font-bold text-white">DC</span>
              </div>
              <div>
                <h3 className="text-2xl font-display font-bold text-gray-900 mb-2">
                  Daniel Castaño
                </h3>
                <p className="text-primary-500 font-semibold mb-4">
                  Fundador y Entrenador Principal
                </p>
                <p className="text-gray-600">
                  Con más de 10 años de experiencia en vóley playa, Daniel fundó 
                  Pelícanos Vóley Club para compartir su pasión por el deporte. Su filosofía de entrenamiento 
                  se enfoca en la excelencia técnica, la fortaleza mental y 
                  construir un ambiente de equipo solidario.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default AboutPage;
