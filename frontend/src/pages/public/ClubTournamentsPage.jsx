import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Trophy, ChevronRight, Clock, Award } from 'lucide-react';
import axios from '@/api/axios';

const TOURNAMENT_SERIES = [
  {
    id: 'arena_tour',
    name: 'Arena Tour Colombia',
    shortDesc: 'El circuito nacional de vóley playa más importante del país',
    description:
      'El Arena Tour Colombia es el principal circuito nacional de vóley playa que recorre las ciudades más importantes de Colombia. Reúne a los mejores equipos del país en competencias de alto nivel, con categorías open, mixto y sub-23. Pelícanos participa activamente en cada parada del tour, representando a Manizales con atletas de élite.',
    color: 'from-orange-500 to-red-600',
    icon: '🏐',
    highlights: ['Circuito nacional', 'Múltiples paradas', 'Categorías abiertas y sub-23', 'Puntos para ranking nacional'],
  },
  {
    id: 'copa_rookies',
    name: 'Copa Rookies',
    shortDesc: 'El torneo de inicio para nuevos talentos del vóley playa',
    description:
      'La Copa Rookies es el torneo de iniciación del vóley playa en Colombia, diseñado para jugadores con menos de 2 años de experiencia competitiva. Es la puerta de entrada perfecta para los nuevos miembros de Pelícanos que dan sus primeros pasos en la competición formal. El club apoya y patrocina la participación de sus jugadores novatos en esta copa.',
    color: 'from-green-500 to-teal-600',
    icon: '⭐',
    highlights: ['Para jugadores nuevos', 'Máximo 2 años de experiencia', 'Formato amistoso', 'Puerta al circuito oficial'],
  },
  {
    id: 'liga',
    name: 'Liga Departamental',
    shortDesc: 'La competición regional más constante del club',
    description:
      'La Liga Departamental de Vóley Playa de Caldas es el torneo de temporada donde Pelícanos ha construido su historia. Con formato de liga (todos contra todos), se juega de forma regular y permite seguir el progreso de cada dupla a lo largo del año. Es la columna vertebral del calendario competitivo del club.',
    color: 'from-blue-500 to-indigo-600',
    icon: '🏆',
    highlights: ['Formato todos contra todos', 'Temporada regular', 'Ranking departamental', 'Clasificatoria a nacionales'],
  },
  {
    id: 'rey_de_cancha',
    name: 'Rey de Cancha',
    shortDesc: 'El torneo rápido e intenso de vóley playa',
    description:
      'Rey de Cancha es el torneo más emocionante del calendario. Su formato de eliminación directa en un solo día genera un ambiente de tensión y espectáculo únicos. Pelícanos participa con sus mejores duplas en busca del título de "Reyes" de la cancha. Un evento que mezcla deporte, comunidad y diversión en su máxima expresión.',
    color: 'from-purple-500 to-pink-600',
    icon: '👑',
    highlights: ['Eliminación directa', 'Formato de un día', 'Alta intensidad', 'Premiación especial'],
  },
];

const STATUS_LABELS = {
  upcoming: { label: 'Próximo', cls: 'bg-primary-100 text-primary-700' },
  ongoing: { label: 'En curso', cls: 'bg-green-100 text-green-700' },
  completed: { label: 'Finalizado', cls: 'bg-slate-100 text-slate-600' },
};

const CATEGORY_LABELS = {
  arena_tour: 'Arena Tour',
  copa_rookies: 'Copa Rookies',
  liga: 'Liga',
  rey_de_cancha: 'Rey de Cancha',
  otro: 'Otro',
};

function ClubTournamentsPage() {
  const [upcomingTournaments, setUpcomingTournaments] = useState([]);
  const [pastTournaments, setPastTournaments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      const response = await axios.get('/club-tournaments');
      const all = response.data.data || [];
      setUpcomingTournaments(all.filter(t => t.status !== 'completed'));
      setPastTournaments(all.filter(t => t.status === 'completed'));
    } catch (error) {
      console.error('Error fetching tournaments:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero */}
      <section className="relative bg-slate-900 py-24 overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-500" />
        <div className="absolute -right-24 top-1/2 -translate-y-1/2 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.span
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-block bg-primary-500 text-white text-xs font-bold uppercase tracking-widest px-4 py-1.5 mb-6"
          >
            Competición
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display font-black uppercase text-white leading-none text-5xl md:text-6xl mb-5"
          >
            Torneos<br />
            <span className="text-primary-400">del Club</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 text-lg max-w-xl"
          >
            Conoce los torneos en los que Pelícanos Vóley Club participa y compite a nivel local, departamental y nacional.
          </motion.p>
        </div>
      </section>

      {/* Próximos Torneos */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <span className="inline-block bg-primary-500 text-white text-xs font-bold uppercase tracking-widest px-3 py-1.5 mb-3">Agenda</span>
            <h2 className="font-display font-black uppercase text-slate-900 text-3xl">Próximos Torneos</h2>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-10 h-10 border-4 border-slate-200 border-t-primary-500 rounded-full animate-spin" />
            </div>
          ) : upcomingTournaments.length === 0 ? (
            <div className="bg-white border border-slate-200 p-12 text-center">
              <Trophy className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No hay torneos próximos en este momento</p>
              <p className="text-slate-400 text-sm mt-1">Vuelve pronto para ver la próxima agenda</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {upcomingTournaments.map((t, i) => (
                <motion.div
                  key={t._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="bg-white border border-slate-100 shadow-sm overflow-hidden border-l-4 border-l-primary-500"
                >
                  {t.imageUrl && (
                    <img src={t.imageUrl} alt={t.name} className="w-full h-48 object-cover" />
                  )}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <span className={`px-2 py-1 text-xs font-bold uppercase tracking-widest ${STATUS_LABELS[t.status]?.cls || 'bg-slate-100 text-slate-600'}`}>
                          {STATUS_LABELS[t.status]?.label || t.status}
                        </span>
                        {t.category && t.category !== 'otro' && (
                          <span className="ml-2 px-2 py-1 text-xs font-bold uppercase tracking-widest bg-primary-50 text-primary-700">
                            {CATEGORY_LABELS[t.category]}
                          </span>
                        )}
                      </div>
                    </div>
                    <h3 className="font-display font-black uppercase text-slate-900 text-xl mb-2">{t.name}</h3>
                    {t.description && <p className="text-slate-500 text-sm mb-4">{t.description}</p>}
                    <div className="space-y-2">
                      {t.date && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Calendar className="w-4 h-4 text-primary-400" />
                          <span>{new Date(t.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                          {t.endDate && t.endDate !== t.date && (
                            <span>— {new Date(t.endDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}</span>
                          )}
                        </div>
                      )}
                      {t.location && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <MapPin className="w-4 h-4 text-primary-400" />
                          <span>{t.location}</span>
                        </div>
                      )}
                      {t.participants && t.participants.length > 0 && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Award className="w-4 h-4 text-primary-400" />
                          <span>Atletas: {t.participants.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Tournament Series */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <span className="inline-block bg-slate-900 text-white text-xs font-bold uppercase tracking-widest px-3 py-1.5 mb-3">Circuitos</span>
            <h2 className="font-display font-black uppercase text-slate-900 text-3xl">Circuitos en los que Participamos</h2>
            <p className="text-slate-500 mt-2 max-w-2xl">Conoce los torneos y circuitos donde Pelícanos Vóley Club compite y ha forjado su historia.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {TOURNAMENT_SERIES.map((series, i) => (
              <motion.div
                key={series.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-slate-50 border border-slate-200 overflow-hidden"
              >
                <div className={`bg-gradient-to-r ${series.color} p-6 text-white`}>
                  <span className="text-4xl mb-3 block">{series.icon}</span>
                  <h3 className="font-display font-black uppercase text-2xl leading-none">{series.name}</h3>
                  <p className="text-white/80 text-sm mt-2">{series.shortDesc}</p>
                </div>
                <div className="p-6">
                  <p className="text-slate-600 text-sm mb-4">{series.description}</p>
                  <ul className="space-y-2">
                    {series.highlights.map((h, j) => (
                      <li key={j} className="flex items-center gap-2 text-sm">
                        <ChevronRight className="w-4 h-4 text-primary-500 flex-shrink-0" />
                        <span className="text-slate-700 font-medium">{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Resultados Históricos */}
      {!loading && pastTournaments.length > 0 && (
        <section className="py-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-10">
              <span className="inline-block bg-slate-900 text-white text-xs font-bold uppercase tracking-widest px-3 py-1.5 mb-3">Historia</span>
              <h2 className="font-display font-black uppercase text-slate-900 text-3xl">Resultados Recientes</h2>
            </div>
            <div className="space-y-4">
              {pastTournaments.map((t) => (
                <div key={t._id} className="bg-white border border-slate-100 shadow-sm p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                  {t.imageUrl && (
                    <img src={t.imageUrl} alt={t.name} className="w-20 h-20 object-cover flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="px-2 py-0.5 text-xs font-bold uppercase tracking-widest bg-slate-100 text-slate-600">Finalizado</span>
                      {t.category && t.category !== 'otro' && (
                        <span className="px-2 py-0.5 text-xs font-bold uppercase tracking-widest bg-primary-50 text-primary-700">{CATEGORY_LABELS[t.category]}</span>
                      )}
                    </div>
                    <h3 className="font-display font-bold uppercase text-slate-900 text-lg">{t.name}</h3>
                    <div className="flex items-center gap-4 mt-1 flex-wrap">
                      {t.date && (
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(t.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      )}
                      {t.location && (
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {t.location}
                        </span>
                      )}
                    </div>
                  </div>
                  {(t.position || t.result) && (
                    <div className="flex-shrink-0 text-center">
                      {t.position && (
                        <p className="font-display font-black text-3xl text-primary-500">#{t.position}</p>
                      )}
                      {t.result && (
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-500">{t.result}</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default ClubTournamentsPage;
