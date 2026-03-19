import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Users, Trophy, Heart, ArrowRight, CheckCircle } from 'lucide-react';
import banner from '@/assets/images/Banner.jpeg';

const stats = [
  { value: '100+', label: 'Miembros Activos' },
  { value: '2', label: 'Sedes' },
  { value: '30+', label: 'Torneos / Año' },
  { value: '10', label: 'Años de Historia' },
];

const features = [
  {
    icon: Users,
    number: '01',
    title: 'Comunidad',
    description:
      'El primer club de Voley Playa de la Región Cafetera. Una familia de atletas que comparten pasión, valores y amistad dentro y fuera de la cancha.',
  },
  {
    icon: Heart,
    number: '02',
    title: 'Salud',
    description:
      'Trabaja la mayoría de músculos del cuerpo, mejora tu condición física, desarrolla capacidad articular y potencia tu toma de decisiones.',
  },
  {
    icon: Trophy,
    number: '03',
    title: 'Competencia',
    description:
      'Grand Prix Cafetero, Arena Tour Colombia, Liga de Voley Playa y Circuito Manizalita. Torneos reales para todos los niveles.',
  },
];

const courtFeatures = [
  { title: 'Bosque Popular El Prado', desc: 'Sede principal — Av. Alberto Mendoza, Manizales' },
  { title: 'Formación y Técnica', desc: 'Enseñanza del voleibol con directrices internacionales' },
  { title: 'Acondicionamiento en Arena', desc: 'Fitness específico para voley playa' },
];

function HomePage() {
  return (
    <div>
      {/* ── HERO ── */}
      <section className="relative flex items-center overflow-hidden min-h-[85vh]">
        <div className="absolute inset-0">
          <img
            src={banner}
            alt="Canchas de vóley playa Pelícanos Manizales"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/75 to-slate-900/60" />
        </div>

        {/* Left accent bar */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-500 hidden md:block" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 md:py-36">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            <span className="inline-block bg-primary-500 text-white text-xs font-bold uppercase tracking-widest px-4 py-1.5 mb-8">
              Manizales · Colombia
            </span>

            <h1
              className="font-display font-black uppercase text-white leading-none mb-8 relative"
              style={{ fontSize: 'clamp(2.8rem, 9vw, 8.5rem)', lineHeight: '0.93' }}
            >
              <span className="block">Vive el</span>
              <span className="block text-primary-400">Mejor</span>
              <span className="block">Vóley Playa</span>
            </h1>

            <p className="text-slate-200 text-lg md:text-xl max-w-lg leading-relaxed mb-10">
              Entrena, compite y conéctate con la comunidad de vóley playa más vibrante de Colombia.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 bg-primary-500 text-white font-display font-bold uppercase tracking-wide px-8 py-4 hover:bg-primary-600 active:scale-95 transition-all shadow-lg"
              >
                Únete Ahora
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center justify-center gap-2 border-2 border-white text-white font-display font-bold uppercase tracking-wide px-8 py-4 hover:bg-white hover:text-slate-900 transition-all"
              >
                Conoce el Club
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Diagonal bottom edge */}
        <div
          className="absolute bottom-0 left-0 right-0 h-16 bg-white pointer-events-none"
          style={{ clipPath: 'polygon(0 100%, 100% 0, 100% 100%)' }}
        />
      </section>

      {/* ── STATS ── */}
      <section className="bg-slate-900 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-y-2 md:divide-y-0 md:divide-x divide-slate-700/60">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="text-center py-10 px-4"
              >
                <div className="font-display font-black text-5xl md:text-6xl text-primary-400 leading-none mb-2">
                  {stat.value}
                </div>
                <div className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block text-primary-600 text-xs font-bold uppercase tracking-widest bg-primary-50 px-4 py-1.5 mb-5">
              ¿Por qué elegirnos?
            </span>
            <h2
              className="font-display font-black uppercase text-slate-900 leading-none"
              style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}
            >
              Más que un Club,<br />
              <span className="text-primary-500">un Estilo de Vida</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.12 }}
                  className="group relative border-l-4 border-transparent hover:border-primary-500 bg-slate-50 hover:bg-white p-8 transition-all duration-300 hover:shadow-xl overflow-hidden"
                >
                  {/* Background number */}
                  <span
                    className="absolute top-3 right-4 font-display font-black text-8xl text-slate-100 group-hover:text-primary-50 leading-none select-none transition-colors pointer-events-none"
                    aria-hidden="true"
                  >
                    {feature.number}
                  </span>

                  <div className="relative z-10">
                    <div className="w-12 h-12 bg-primary-500 flex items-center justify-center mb-6">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-display font-black uppercase text-slate-900 text-2xl mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 bg-primary-500 text-white font-display font-bold uppercase tracking-wide px-8 py-4 hover:bg-primary-600 active:scale-95 transition-all"
            >
              Únete Ahora <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── COURTS ── */}
      <section className="bg-slate-50 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[520px]">
            {/* Image */}
            <div className="relative min-h-[300px] lg:min-h-0">
              <img
                src="https://www.lapatria.com/sites/default/files/noticia/2023-02/a.aaaaaa.jpg"
                alt="Cancha de vóley playa Pelícanos"
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-slate-900/25" />
            </div>

            {/* Content */}
            <div className="flex flex-col justify-center px-8 md:px-12 lg:px-16 py-16 bg-slate-50">
              <span className="inline-block text-primary-600 text-xs font-bold uppercase tracking-widest bg-primary-50 px-3 py-1.5 self-start mb-6">
                Instalaciones
              </span>
              <h2
                className="font-display font-black uppercase text-slate-900 leading-none mb-6"
                style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}
              >
                Nuestras<br />
                <span className="text-primary-500">Canchas</span>
              </h2>
              <p className="text-slate-600 text-lg mb-8 leading-relaxed">
                Instalaciones profesionales en Manizales, con arena de calidad, iluminación nocturna y áreas sociales para disfrutar antes y después del juego.
              </p>

              <ul className="space-y-4 mb-10">
                {courtFeatures.map((item) => (
                  <li key={item.title} className="flex items-start gap-4">
                    <div className="w-6 h-6 bg-primary-500 flex-shrink-0 flex items-center justify-center mt-0.5">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{item.title}</p>
                      <p className="text-slate-500 text-sm">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>

              <Link
                to="/venues"
                className="self-start inline-flex items-center gap-2 border-2 border-slate-900 text-slate-900 font-display font-bold uppercase tracking-wide px-7 py-3.5 hover:bg-slate-900 hover:text-white transition-all"
              >
                Ver Todas las Sedes <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-primary-500 py-24 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-white/10 pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2
              className="font-display font-black uppercase text-white leading-none mb-6"
              style={{ fontSize: 'clamp(2.5rem, 8vw, 6rem)' }}
            >
              ¿Listo para<br />Jugar?
            </h2>
            <p className="text-white/85 text-xl mb-10 max-w-xl mx-auto leading-relaxed">
              Únete a cientos de jugadores que han encontrado su pasión en Pelícanos Vóley Club.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 bg-white text-primary-600 font-display font-black uppercase tracking-wide px-10 py-5 text-lg hover:bg-slate-900 hover:text-white transition-all active:scale-95"
            >
              Comienza Hoy <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
