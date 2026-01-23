import { MapPin, Clock, Phone } from 'lucide-react';
import { motion } from 'framer-motion';

function VenuesPage() {
  const venues = [
    {
      name: 'Bosque Popular El Prado',
      address: 'Avenida Alberto Mendoza - Parque bicentenario bosque popular el prado',
      description: 'Canchas publicas de voley playa en el bosque popular el prado frente a las canchas de tenis',
      hours: 'Lun-Dom: 6:00 AM - 07:30 PM',
      phone: '+57 311 305 7249',
      image: 'https://www.lapatria.com/sites/default/files/noticia/2023-02/a.aaaaaa.jpg',
    },
    {
      name: 'Unidad Deportiva Palogrande',
      address: 'Unidad Deportiva Palogrande',
      description: 'Canchas de voley playa en la unidad deportiva palogrande',
      hours: 'Lun-Vie: 5:00 AM - 10:00 PM',
      phone: '+57 311 305 7249',
      image: 'https://centrodeinformacion.manizales.gov.co/wp-content/uploads/2024/12/WhatsApp-Image-2024-12-24-at-11.52.05-AM-2048x1366.jpeg',
    }
  ];

  return (
    <div>
      <section className="py-20 bg-gradient-to-br from-ocean-500 to-primary-500 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-display font-bold mb-6"
          >
            Nuestras Sedes
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-white/90"
          >
            Instalaciones profesionales en Manizales para entrenamiento, competencia y diversión
          </motion.p>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="space-y-12">
            {venues.map((venue, index) => (
              <motion.div
                key={venue.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="card"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="relative h-64 lg:h-full rounded-lg overflow-hidden">
                    <img
                      src={venue.image}
                      alt={venue.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col justify-center">
                    <h2 className="text-3xl font-display font-bold text-gray-900 mb-4">
                      {venue.name}
                    </h2>
                    <p className="text-gray-600 mb-6">{venue.description}</p>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-primary-500 flex-shrink-0 mt-1" />
                        <div>
                          <p className="font-semibold text-gray-900">Ubicación</p>
                          <p className="text-gray-600">{venue.address}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Clock className="w-5 h-5 text-primary-500 flex-shrink-0 mt-1" />
                        <div>
                          <p className="font-semibold text-gray-900">Horario</p>
                          <p className="text-gray-600">{venue.hours}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Phone className="w-5 h-5 text-primary-500 flex-shrink-0 mt-1" />
                        <div>
                          <p className="font-semibold text-gray-900">Contacto</p>
                          <a href={`tel:${venue.phone}`} className="text-primary-500 hover:underline">
                            {venue.phone}
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-display font-bold text-gray-900 mb-6">
            Visítanos
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Ven a conocer nuestras instalaciones y al equipo. Las visitas sin cita son bienvenidas, 
            o agenda un tour para conocer más sobre nuestros programas.
          </p>
          <a href="tel:+573001234567" className="btn btn-primary">
            Llama para Agendar un Tour
          </a>
        </div>
      </section>
    </div>
  );
}

export default VenuesPage;
