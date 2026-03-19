import { MapPin, Clock, Phone } from 'lucide-react';
import { motion } from 'framer-motion';

const venues = [
  {
    number: '01',
    name: 'Bosque Popular El Prado',
    address: 'Av. Alberto Mendoza — Parque Bicentenario Bosque Popular El Prado, Manizales',
    description:
      'Sede principal del club. Canchas de arena profesional ubicadas en el Bosque Popular El Prado, frente a las canchas de tenis. Un entorno natural único para entrenar, competir y disfrutar el voley playa.',
    hours: 'Lun, Mié y Vie — Horario según programación del club',
    phones: ['+57 311 305 7249', '+57 317 599 3837'],
    image: 'https://www.lapatria.com/sites/default/files/noticia/2023-02/a.aaaaaa.jpg',
    tags: ['Sede Principal', 'Canchas de Arena'],
  },
  {
    number: '02',
    name: 'Unidad Deportiva Palogrande',
    address: 'Unidad Deportiva Palogrande, Manizales',
    description:
      'Canchas de voley playa en la Unidad Deportiva Palogrande. Instalaciones para entrenamientos, partidos y torneos con amplio acceso y estacionamiento.',
    hours: 'Lun – Vie: 5:00 AM – 10:00 PM',
    phones: ['+57 311 305 7249'],
    image:
      'https://centrodeinformacion.manizales.gov.co/wp-content/uploads/2024/12/WhatsApp-Image-2024-12-24-at-11.52.05-AM-2048x1366.jpeg',
    tags: ['Escenario Alterno', 'Torneos'],
  },
];

function VenuesPage() {
  return (
    <div>
      {/* ── HEADER ── */}
      <section className="relative bg-slate-900 py-28 overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-500" />
        <div
          className="absolute -right-24 top-1/2 -translate-y-1/2 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl pointer-events-none"
          aria-hidden="true"
        />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.span
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-block bg-primary-500 text-white text-xs font-bold uppercase tracking-widest px-4 py-1.5 mb-6"
          >
            Instalaciones
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display font-black uppercase text-white leading-none text-5xl md:text-7xl"
          >
            Nuestras<br />
            <span className="text-primary-400">Sedes</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 text-xl mt-6 max-w-xl"
          >
            Escenarios de primera calidad en Manizales para entrenar, competir y disfrutar el voley playa.
          </motion.p>
        </div>
      </section>

      {/* ── VENUES ── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {venues.map((venue, index) => (
            <motion.div
              key={venue.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="grid grid-cols-1 lg:grid-cols-2 min-h-[440px] border border-slate-100 shadow-sm hover:shadow-xl transition-shadow overflow-hidden"
            >
              {/* Image */}
              <div
                className={`relative min-h-[260px] lg:min-h-0 ${
                  index % 2 === 1 ? 'lg:order-2' : ''
                }`}
              >
                <img
                  src={venue.image}
                  alt={venue.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-slate-900/30" />
                <span className="absolute top-4 left-4 bg-primary-500 text-white font-display font-black text-2xl px-4 py-2 leading-none">
                  {venue.number}
                </span>
                <div className="absolute top-4 right-4 flex flex-wrap gap-2 justify-end">
                  {venue.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-white/20 backdrop-blur-sm text-white text-xs font-bold uppercase tracking-wide px-2 py-1"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div
                className={`flex flex-col justify-center p-8 md:p-12 bg-white ${
                  index % 2 === 1 ? 'lg:order-1' : ''
                }`}
              >
                <h2
                  className="font-display font-black uppercase text-slate-900 leading-tight mb-4"
                  style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}
                >
                  {venue.name}
                </h2>
                <p className="text-slate-600 leading-relaxed mb-8">{venue.description}</p>

                <div className="space-y-5">
                  {/* Address */}
                  <div className="flex items-start gap-4">
                    <div className="w-9 h-9 bg-primary-50 flex-shrink-0 flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-primary-500" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-0.5">
                        Ubicación
                      </p>
                      <p className="text-slate-700 text-sm">{venue.address}</p>
                    </div>
                  </div>

                  {/* Hours */}
                  <div className="flex items-start gap-4">
                    <div className="w-9 h-9 bg-primary-50 flex-shrink-0 flex items-center justify-center">
                      <Clock className="w-4 h-4 text-primary-500" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-0.5">
                        Horario
                      </p>
                      <p className="text-slate-700 text-sm">{venue.hours}</p>
                    </div>
                  </div>

                  {/* Phones */}
                  <div className="flex items-start gap-4">
                    <div className="w-9 h-9 bg-primary-50 flex-shrink-0 flex items-center justify-center">
                      <Phone className="w-4 h-4 text-primary-500" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-0.5">
                        Contacto
                      </p>
                      <div className="flex flex-col gap-1">
                        {venue.phones.map((phone) => (
                          <a
                            key={phone}
                            href={`tel:${phone.replace(/\s/g, '')}`}
                            className="text-primary-500 font-semibold hover:text-primary-600 transition-colors text-sm"
                          >
                            {phone}
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-slate-900 py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2
              className="font-display font-black uppercase text-white leading-none mb-6"
              style={{ fontSize: 'clamp(2rem, 6vw, 4rem)' }}
            >
              Visítanos <span className="text-primary-400">Hoy</span>
            </h2>
            <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto">
              Ven a conocer nuestras canchas. Las visitas sin cita son bienvenidas — o llámanos para agendar una sesión de prueba.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="tel:+573113057249"
                className="inline-flex items-center justify-center gap-2 bg-primary-500 text-white font-display font-bold uppercase tracking-wide px-8 py-4 hover:bg-primary-400 active:scale-95 transition-all"
              >
                <Phone className="w-5 h-5" />
                +57 311 305 7249
              </a>
              <a
                href="tel:+573175993837"
                className="inline-flex items-center justify-center gap-2 border-2 border-slate-600 text-slate-400 font-display font-bold uppercase tracking-wide px-8 py-4 hover:border-primary-500 hover:text-primary-400 active:scale-95 transition-all"
              >
                <Phone className="w-5 h-5" />
                +57 317 599 3837
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

export default VenuesPage;
