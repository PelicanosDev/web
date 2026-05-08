import { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from '@/api/axios';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
dayjs.locale('es');

const TYPE_LABELS = {
  training: 'Entrenamiento',
  tournament: 'Torneo',
  social: 'Social',
  workshop: 'Taller',
  other: 'Otro',
};

const TYPE_COLORS = {
  training: 'bg-sky-100 text-sky-800',
  tournament: 'bg-purple-100 text-purple-800',
  social: 'bg-green-100 text-green-800',
  workshop: 'bg-orange-100 text-orange-800',
  other: 'bg-slate-100 text-slate-800',
};

function MemberEventsPage() {
  const [events, setEvents] = useState([]);
  const [myMember, setMyMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState({});
  const [messages, setMessages] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [eventsRes, profileRes] = await Promise.all([
        axios.get('/events', { params: { limit: 100 } }),
        axios.get('/member/profile'),
      ]);
      setEvents(eventsRes.data.data || []);
      setMyMember(profileRes.data.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const isRegistered = (event) => {
    if (!myMember) return false;
    return event.participants?.some(
      (p) => p.memberId === myMember._id || p.memberId?._id === myMember._id
    );
  };

  const handleRegister = async (event) => {
    if (!myMember) return;
    setRegistering((prev) => ({ ...prev, [event._id]: true }));
    setMessages((prev) => ({ ...prev, [event._id]: null }));
    try {
      await axios.post(`/events/${event._id}/register`, { memberId: myMember._id });
      setMessages((prev) => ({ ...prev, [event._id]: { type: 'success', text: '¡Inscrito exitosamente!' } }));
      // Refresh events to update participant count
      const res = await axios.get('/events', { params: { limit: 100 } });
      setEvents(res.data.data || []);
    } catch (error) {
      setMessages((prev) => ({
        ...prev,
        [event._id]: {
          type: 'error',
          text: error.response?.data?.message || 'Error al inscribirse',
        },
      }));
    } finally {
      setRegistering((prev) => ({ ...prev, [event._id]: false }));
    }
  };

  const upcoming = events.filter((e) => {
    if (e.recurring?.enabled) return true;
    return new Date(e.date) >= new Date();
  });

  const past = events.filter((e) => {
    if (e.recurring?.enabled) return false;
    return new Date(e.date) < new Date();
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <span className="inline-block text-primary-600 text-xs font-bold uppercase tracking-widest bg-primary-50 px-3 py-1.5 mb-3">
          Panel de Miembro
        </span>
        <h1 className="font-display font-black uppercase text-slate-900 text-3xl leading-none">
          Eventos del Club
        </h1>
        <p className="text-slate-500 text-sm mt-1">Inscríbete en los próximos eventos y entrenamientos</p>
      </div>

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <div>
          <h2 className="font-display font-black uppercase text-slate-900 text-xl mb-4">Próximos Eventos</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {upcoming.map((event, index) => {
              const registered = isRegistered(event);
              const confirmedCount = event.participants?.filter((p) => p.status === 'confirmed').length || 0;
              const isFull = event.maxParticipants && confirmedCount >= event.maxParticipants;
              const msg = messages[event._id];

              return (
                <motion.div
                  key={event._id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white border border-slate-100 shadow-sm p-6 border-l-4 border-l-primary-500"
                >
                  <div className="flex items-start justify-between mb-3 gap-2">
                    <div className="flex flex-wrap gap-2">
                      <span className={`px-2 py-1 text-xs font-bold uppercase tracking-widest ${TYPE_COLORS[event.type] || TYPE_COLORS.other}`}>
                        {TYPE_LABELS[event.type] || event.type}
                      </span>
                      {event.recurring?.enabled && (
                        <span className="px-2 py-1 text-xs font-bold uppercase tracking-widest bg-sky-100 text-sky-700">
                          Recurrente
                        </span>
                      )}
                      {registered && (
                        <span className="px-2 py-1 text-xs font-bold uppercase tracking-widest bg-emerald-100 text-emerald-700 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Inscrito
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className="font-display font-black uppercase text-slate-900 text-lg leading-none mb-3">
                    {event.title}
                  </h3>
                  {event.description && (
                    <p className="text-slate-500 text-sm mb-3">{event.description}</p>
                  )}

                  <div className="space-y-1.5 text-sm text-slate-500 mb-4">
                    {event.recurring?.enabled ? (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-sky-400 flex-shrink-0" />
                        <span className="text-sky-600 font-semibold">
                          {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
                            .filter((_, i) => event.recurring.daysOfWeek?.includes(i))
                            .join(', ')}
                          {event.recurring.startTime ? ` · ${event.recurring.startTime}` : ''}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <span>{dayjs(event.date).format('D [de] MMMM, YYYY · h:mm A')}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <span>{event.location}</span>
                    </div>
                    {event.maxParticipants && (
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <span>
                          {confirmedCount} / {event.maxParticipants} participantes
                          {isFull && <span className="ml-2 text-red-500 font-bold">· Lleno</span>}
                        </span>
                      </div>
                    )}
                  </div>

                  {msg && (
                    <div className={`flex items-center gap-2 text-xs font-bold mb-3 ${msg.type === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>
                      {msg.type === 'success'
                        ? <CheckCircle className="w-4 h-4" />
                        : <AlertCircle className="w-4 h-4" />}
                      {msg.text}
                    </div>
                  )}

                  {!registered && (
                    <button
                      onClick={() => handleRegister(event)}
                      disabled={registering[event._id] || isFull}
                      className="inline-flex items-center gap-2 bg-primary-500 text-white font-display font-bold uppercase tracking-wide px-5 py-2.5 hover:bg-primary-600 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {registering[event._id] ? 'Inscribiendo...' : isFull ? 'Evento Lleno' : 'Inscribirme'}
                    </button>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Past */}
      {past.length > 0 && (
        <div>
          <h2 className="font-display font-black uppercase text-slate-900 text-xl mb-4 text-slate-500">
            Eventos Pasados
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {past.slice(0, 6).map((event) => (
              <div
                key={event._id}
                className="bg-white border border-slate-100 shadow-sm p-5 border-l-4 border-l-slate-300 opacity-60"
              >
                <span className={`px-2 py-1 text-xs font-bold uppercase tracking-widest ${TYPE_COLORS[event.type] || TYPE_COLORS.other}`}>
                  {TYPE_LABELS[event.type] || event.type}
                </span>
                <h3 className="font-display font-bold uppercase text-slate-700 text-base mt-2 mb-1">
                  {event.title}
                </h3>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Calendar className="w-4 h-4" />
                  <span>{dayjs(event.date).format('D [de] MMMM, YYYY')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {upcoming.length === 0 && (
        <div className="bg-white border border-slate-100 shadow-sm p-16 text-center">
          <Calendar className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <h3 className="font-display font-black uppercase text-slate-900 text-lg mb-2">Sin Eventos Próximos</h3>
          <p className="text-slate-400 text-sm uppercase tracking-wide">No hay eventos programados por el momento</p>
        </div>
      )}
    </div>
  );
}

export default MemberEventsPage;
