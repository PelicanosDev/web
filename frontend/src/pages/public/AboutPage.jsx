import { motion } from 'framer-motion';
import { Target, Eye, Compass, CheckCircle, Trophy, Calendar } from 'lucide-react';

const timeline = [
  {
    year: '2017',
    title: 'Los Comienzos',
    body: 'Primer evento nacional interclubes Arena Tour Colombia. Formalización del club deportivo.',
  },
  {
    year: '2018',
    title: 'Primeros Campeones',
    body: 'Primeros Campeones Nacionales de Voley Playa. El club empieza a dejar huella en el país.',
  },
  {
    year: '2019',
    title: 'Expansión Nacional',
    body: 'Posicionamiento del voley playa como modalidad en diferentes regiones de Colombia. Eventos deportivos.',
  },
  {
    year: '2020',
    title: 'Resiliencia',
    body: 'Pandemia. Entrenamientos personalizados, modalidades virtuales y adaptación sin escenarios.',
  },
  {
    year: '2022',
    title: 'Campeones Nacionales',
    body: 'Pelícanos se consolida como el único Club de Voley Playa de la región. Campeón Nacional de Clubes.',
  },
  {
    year: 'Hoy',
    title: 'Referentes del Deporte',
    body: 'Eventos empresariales, nacionales y creación de convenios comerciales. El voley playa crece.',
    highlight: true,
  },
];

const services = [
  'Eventos internos',
  'Formación y enseñanza del Voleibol',
  'Acondicionamiento físico en la arena',
  'Organización de eventos deportivos',
  'Técnica y táctica del Voley Playa',
  'Participación en eventos nacionales y locales',
  'Red de aliados empresariales',
  'Convenios institucionales',
  'Clases personalizadas',
];

const identity = [
  {
    icon: Compass,
    title: 'Horizonte',
    dark: false,
    body: 'Dar cumplimiento a las necesidades del mejoramiento y crecimiento del Voley Playa en la Región Cafetera, extendiendo el deporte a la comunidad del voleibol en general — el "Proyecto Deportivo Pelicanos Voleibol".',
  },
  {
    icon: Target,
    title: 'Misión',
    dark: true,
    body: 'Difundir con apoyo de herramientas tecnológicas el voley Playa en Manizales y la región cafetera, generando alternativas de estilo de vida para generaciones actuales y futuras, basadas en las directrices internacionales sobre la sana práctica del voleibol; creando semilleros para la formación y la integración deportiva.',
  },
  {
    icon: Eye,
    title: 'Visión',
    dark: false,
    body: 'Ser en 2026 uno de los 10 principales clubes de voleibol playa en Colombia, reconocido por sus estándares de calidad en la formación deportiva, la enseñanza de valores a través del deporte y sus reconocimientos en competiciones deportivas.',
  },
];

function AboutPage() {
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
            El Club
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display font-black uppercase text-white leading-none text-5xl md:text-7xl"
          >
            Acerca de<br />
            <span className="text-primary-400">Pelícanos</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 text-xl mt-6 max-w-xl"
          >
            El primer club de Voley Playa de la Región Cafetera. Construyendo comunidad desde 2017.
          </motion.p>
        </div>
      </section>

      {/* ── PRIMER CLUB HIGHLIGHT ── */}
      <section className="bg-primary-500 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-16 text-white text-center">
            {[
              { icon: Trophy, value: '2017', label: 'Fundación del club' },
              { icon: Trophy, value: '1°', label: 'Club de Voley Playa en la Región' },
              { icon: Trophy, value: '2022', label: 'Campeón Nacional de Clubes' },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <div className="font-display font-black text-3xl leading-none">{value}</div>
                  <div className="text-white/80 text-sm font-semibold uppercase tracking-wide">{label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HISTORIA / TIMELINE ── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16">
            <span className="inline-block text-primary-600 text-xs font-bold uppercase tracking-widest bg-primary-50 px-3 py-1.5 mb-5">
              Historia
            </span>
            <h2
              className="font-display font-black uppercase text-slate-900 leading-none"
              style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}
            >
              Nuestra<br />
              <span className="text-primary-500">Trayectoria</span>
            </h2>
          </div>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-slate-200 md:-translate-x-px hidden sm:block" />

            <div className="space-y-8">
              {timeline.map((item, i) => (
                <motion.div
                  key={item.year}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className={`relative grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 ${
                    i % 2 === 0 ? '' : 'md:direction-rtl'
                  }`}
                >
                  {/* Year bubble - centered on line */}
                  <div className="hidden md:flex absolute left-1/2 top-4 -translate-x-1/2 z-10">
                    <div
                      className={`font-display font-black text-sm px-3 py-1 ${
                        item.highlight
                          ? 'bg-primary-500 text-white'
                          : 'bg-slate-900 text-white'
                      }`}
                    >
                      {item.year}
                    </div>
                  </div>

                  {/* Content card - alternates sides */}
                  <div className={`${i % 2 === 0 ? 'md:col-start-1 md:pr-12' : 'md:col-start-2 md:pl-12'}`}>
                    <div
                      className={`p-6 border-l-4 ${
                        item.highlight
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-slate-200 bg-slate-50'
                      }`}
                    >
                      <div
                        className={`font-display font-black text-xs uppercase tracking-widest mb-1 md:hidden ${
                          item.highlight ? 'text-primary-500' : 'text-slate-400'
                        }`}
                      >
                        {item.year}
                      </div>
                      <h3 className="font-display font-black uppercase text-slate-900 text-lg mb-2">
                        {item.title}
                      </h3>
                      <p className="text-slate-600 text-sm leading-relaxed">{item.body}</p>
                    </div>
                  </div>

                  {/* Empty col for alternating layout */}
                  <div className={`hidden md:block ${i % 2 === 0 ? 'md:col-start-2' : 'md:col-start-1 md:row-start-1'}`} />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── HORIZONTE / MISIÓN / VISIÓN ── */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block text-primary-600 text-xs font-bold uppercase tracking-widest bg-primary-50 px-3 py-1.5 mb-5">
              Identidad
            </span>
            <h2
              className="font-display font-black uppercase text-slate-900 leading-none"
              style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}
            >
              Horizonte, Misión<br />
              &amp; <span className="text-primary-500">Visión</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {identity.map(({ icon: Icon, title, dark, body }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`border-t-4 border-primary-500 p-8 shadow-sm hover:shadow-lg transition-shadow ${
                  dark ? 'bg-slate-900' : 'bg-white'
                }`}
              >
                <div className="w-12 h-12 bg-primary-500 flex items-center justify-center mb-5">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3
                  className={`font-display font-black uppercase text-2xl mb-4 ${
                    dark ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  {title}
                </h3>
                <p className={`leading-relaxed text-sm ${dark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {body}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICIOS ── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="inline-block text-primary-600 text-xs font-bold uppercase tracking-widest bg-primary-50 px-3 py-1.5 mb-6">
                Lo que ofrecemos
              </span>
              <h2
                className="font-display font-black uppercase text-slate-900 leading-none mb-8"
                style={{ fontSize: 'clamp(2rem, 5vw, 3rem)' }}
              >
                Nuestros<br />
                <span className="text-primary-500">Servicios</span>
              </h2>
              <p className="text-slate-600 text-lg leading-relaxed mb-8">
                Ofrecemos una experiencia completa en el voley playa, desde la formación técnica hasta la participación en eventos nacionales.
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {services.map((service) => (
                  <li key={service} className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-primary-500 flex-shrink-0 flex items-center justify-center mt-0.5">
                      <CheckCircle className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="text-slate-700 text-sm font-medium">{service}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Eventos highlight */}
            <div className="space-y-4">
              <div className="bg-slate-900 border-l-4 border-primary-500 p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Calendar className="w-5 h-5 text-primary-400" />
                  <span className="text-primary-400 text-xs font-bold uppercase tracking-widest">Eventos</span>
                </div>
                <h3 className="font-display font-black uppercase text-white text-xl mb-4">
                  Competencias que Organizamos
                </h3>
                <ul className="space-y-3">
                  {[
                    { name: 'Grand Prix Cafetero', detail: '80 deportistas · 2 veces al año' },
                    { name: 'Arena Tour Colombia', detail: 'Circuito nacional · 200 jugadores c/5 semanas' },
                    { name: 'Liga de Voley Playa', detail: 'Con transmisión durante temporada' },
                    { name: 'Circuito Manizalita', detail: '3 categorías · cada mes' },
                  ].map((e) => (
                    <li key={e.name} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary-500 flex-shrink-0 mt-2" />
                      <div>
                        <span className="text-white font-semibold text-sm">{e.name}</span>
                        <span className="text-slate-400 text-xs block">{e.detail}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-primary-50 border-l-4 border-primary-500 p-6">
                <p className="text-slate-700 text-sm leading-relaxed italic">
                  "La única manera de hacer un gran trabajo es amar lo que haces."
                </p>
                <p className="text-slate-500 text-xs mt-2 font-semibold uppercase tracking-wide">— Steve Jobs</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── COACH ── */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block text-primary-600 text-xs font-bold uppercase tracking-widest bg-primary-50 px-3 py-1.5 mb-5">
              Equipo
            </span>
            <h2
              className="font-display font-black uppercase text-slate-900 leading-none"
              style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}
            >
              Nuestro <span className="text-primary-500">Entrenador</span>
            </h2>
          </div>

          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-col md:flex-row gap-8 items-start border-l-4 border-primary-500 bg-white p-8 md:p-10 shadow-sm"
            >
              <div className="w-24 h-24 bg-primary-500 flex items-center justify-center flex-shrink-0">
                <span className="text-3xl font-display font-black text-white">DC</span>
              </div>
              <div>
                <h3 className="font-display font-black uppercase text-slate-900 text-2xl mb-1">
                  Daniel Castaño
                </h3>
                <p className="text-primary-500 font-bold uppercase text-xs tracking-widest mb-5">
                  Fundador &amp; Entrenador Principal
                </p>
                <p className="text-slate-600 leading-relaxed text-lg">
                  Con más de 10 años de experiencia en voley playa, Daniel fundó Pelícanos Vóley Club para difundir el deporte en la Región Cafetera. Su filosofía de entrenamiento se basa en las directrices internacionales del voleibol playa — excelencia técnica, fortaleza mental y creación de semilleros para las generaciones futuras.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default AboutPage;
