import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, User, Trophy, Award, TrendingUp, Heart, MessageCircle,
  Calendar, Image as ImageIcon, Instagram, Activity, Target,
  Zap, Star, Shield, ChevronRight, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from '@/api/axios';
import logo from '@/assets/images/Logo.png';

const LEVEL_THRESHOLDS = [0, 500, 1200, 2500, 4500, 7500, 12000, 18000, 25000, 35000];

const rarityColors = {
  common:    { border: 'border-slate-300', bg: 'bg-slate-50',   text: 'text-slate-600',  label: 'Común' },
  uncommon:  { border: 'border-green-400', bg: 'bg-green-50',   text: 'text-green-700',  label: 'Poco común' },
  rare:      { border: 'border-blue-400',  bg: 'bg-blue-50',    text: 'text-blue-700',   label: 'Raro' },
  epic:      { border: 'border-purple-400',bg: 'bg-purple-50',  text: 'text-purple-700', label: 'Épico' },
  legendary: { border: 'border-amber-400', bg: 'bg-amber-50',   text: 'text-amber-700',  label: 'Legendario' },
};

function getLevelProgress(xp) {
  const level = LEVEL_THRESHOLDS.findIndex((t, i) =>
    xp >= t && (i === LEVEL_THRESHOLDS.length - 1 || xp < LEVEL_THRESHOLDS[i + 1])
  );
  const current = LEVEL_THRESHOLDS[level] ?? 0;
  const next = LEVEL_THRESHOLDS[level + 1];
  const pct = next ? Math.round(((xp - current) / (next - current)) * 100) : 100;
  return { level: level + 1, pct, next };
}

function StatBox({ label, value, sub, dark }) {
  return (
    <div className={`p-5 border-l-4 border-primary-500 ${dark ? 'bg-slate-900' : 'bg-white border border-slate-100 shadow-sm'}`}>
      <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>{label}</p>
      <p className={`font-display font-black text-3xl leading-none ${dark ? 'text-primary-400' : 'text-slate-900'}`}>{value}</p>
      {sub && <p className={`text-xs mt-1 ${dark ? 'text-slate-500' : 'text-slate-400'}`}>{sub}</p>}
    </div>
  );
}

function MemberPublicProfilePage() {
  const { id } = useParams();
  const [member, setMember] = useState(null);
  const [taggedPhotos, setTaggedPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingPhotos, setLoadingPhotos] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [activeTab, setActiveTab] = useState('perfil');

  useEffect(() => {
    fetchMemberProfile();
    fetchTaggedPhotos();
  }, [id]);

  const fetchMemberProfile = async () => {
    try {
      const response = await axios.get(`/members/${id}`);
      setMember(response.data.data);
    } catch (err) {
      console.error('Error fetching member profile:', err);
      setError('No se pudo cargar el perfil del miembro');
    } finally {
      setLoading(false);
    }
  };

  const fetchTaggedPhotos = async () => {
    try {
      const response = await axios.get(`/gallery/member/${id}/tagged`);
      setTaggedPhotos(response.data.data);
    } catch {
      // gallery may not have photos
    } finally {
      setLoadingPhotos(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-slate-300" />
          </div>
          <h2 className="font-display font-black uppercase text-slate-900 text-2xl mb-2">Perfil no encontrado</h2>
          <p className="text-slate-500 mb-6">{error || 'Este perfil no está disponible'}</p>
          <Link
            to="/gallery"
            className="inline-flex items-center gap-2 bg-primary-500 text-white font-display font-bold uppercase tracking-wide px-5 py-2.5 hover:bg-primary-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a la Galería
          </Link>
        </div>
      </div>
    );
  }

  const firstName = member.userId?.profile?.firstName || '';
  const lastName  = member.userId?.profile?.lastName  || '';
  const avatar    = member.userId?.profile?.avatar;
  const gender    = member.userId?.profile?.gender;
  const dob       = member.userId?.profile?.dateOfBirth;
  const age       = dob ? Math.floor((Date.now() - new Date(dob)) / (365.25 * 24 * 3600 * 1000)) : null;

  const sp       = member.sportProfile || {};
  const ai       = member.additionalInfo || {};
  const sm       = member.socialMedia || {};
  const stats    = member.stats || {};
  const gamif    = member.gamification || {};
  const badges   = gamif.badges || [];
  const achievements = gamif.achievements || [];
  const { level, pct, next } = getLevelProgress(gamif.xp || 0);

  const tabs = [
    { id: 'perfil',    label: 'Perfil' },
    { id: 'stats',     label: 'Estadísticas' },
    { id: 'insignias', label: `Insignias (${badges.length})` },
    { id: 'fotos',     label: `Fotos (${taggedPhotos.length})` },
  ];

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── HERO ── */}
      <section className="relative bg-slate-900 overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-500" />
        <div className="absolute -right-20 top-0 bottom-0 w-80 bg-primary-500/5 pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-10">
          <Link
            to="/gallery"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm font-bold uppercase tracking-widest transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Galería
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-6"
          >
            {/* Avatar */}
            <div className="flex-shrink-0">
              {avatar ? (
                <img
                  src={avatar}
                  alt={`${firstName} ${lastName}`}
                  className="w-28 h-28 object-cover border-4 border-primary-500"
                />
              ) : (
                <div className="w-28 h-28 bg-primary-500 flex items-center justify-center border-4 border-primary-400">
                  <span className="font-display font-black text-white text-4xl leading-none">
                    {firstName.charAt(0)}{lastName.charAt(0)}
                  </span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <span className="inline-block bg-primary-500 text-white text-xs font-bold uppercase tracking-widest px-3 py-1 mb-3">
                {member.memberNumber}
              </span>
              <h1 className="font-display font-black uppercase text-white text-4xl sm:text-5xl leading-none mb-2">
                {firstName} {lastName}
              </h1>
              <div className="flex flex-wrap items-center gap-3 mt-3">
                {sp.position && (
                  <span className="bg-white/10 text-white text-xs font-bold uppercase tracking-widest px-3 py-1.5">
                    {sp.position}
                  </span>
                )}
                {sp.experience && (
                  <span className="bg-white/10 text-white text-xs font-bold uppercase tracking-widest px-3 py-1.5">
                    {sp.experience}
                  </span>
                )}
                {age && (
                  <span className="text-slate-400 text-sm">{age} años</span>
                )}
                {sm.instagram && (
                  <a
                    href={`https://instagram.com/${sm.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-slate-400 hover:text-primary-400 transition-colors text-sm"
                  >
                    <Instagram className="w-4 h-4" />
                    {sm.instagram}
                  </a>
                )}
              </div>
            </div>

            {/* Level badge */}
            <div className="flex-shrink-0 text-center bg-primary-500/20 border border-primary-500/40 p-4 min-w-[100px]">
              <p className="text-xs font-bold uppercase tracking-widest text-primary-400 mb-1">Nivel</p>
              <p className="font-display font-black text-primary-400 text-5xl leading-none">{level}</p>
              <p className="text-xs text-slate-500 mt-1">{(gamif.xp || 0).toLocaleString()} XP</p>
            </div>
          </motion.div>

          {/* XP Progress bar */}
          <div className="mt-6">
            <div className="flex justify-between text-xs text-slate-500 mb-1.5">
              <span className="font-bold uppercase tracking-widest">Progreso nivel {level}</span>
              {next && <span>{pct}% — {next.toLocaleString()} XP para nivel {level + 1}</span>}
              {!next && <span className="text-primary-400 font-bold">Nivel máximo</span>}
            </div>
            <div className="h-1.5 bg-slate-700 w-full">
              <div className="h-full bg-primary-500 transition-all" style={{ width: `${pct}%` }} />
            </div>
          </div>
        </div>
      </section>

      {/* ── QUICK STATS ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-0">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-slate-200">
          <StatBox label="Asistencia" value={`${stats.attendanceRate ?? 0}%`} sub={`${stats.totalSessions ?? 0} sesiones`} dark />
          <StatBox label="Partidos" value={stats.totalMatches ?? 0} sub={`${stats.wins ?? 0}V / ${stats.losses ?? 0}D`} />
          <StatBox label="Insignias" value={badges.length} sub="obtenidas" dark />
          <StatBox label="Logros" value={achievements.length} sub="desbloqueados" />
        </div>
      </div>

      {/* ── TABS ── */}
      <div className="sticky top-0 z-20 bg-white border-b border-slate-200 shadow-sm mt-0">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-0 overflow-x-auto scrollbar-hide">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`px-5 py-3.5 font-display font-bold text-sm uppercase tracking-wide whitespace-nowrap transition-all cursor-pointer border-b-2 ${
                  activeTab === t.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* PERFIL TAB */}
        {activeTab === 'perfil' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Perfil Deportivo */}
            <div className="bg-white border border-slate-100 shadow-sm p-6">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Vóley</p>
              <h2 className="font-display font-black uppercase text-slate-900 text-xl mb-5">Perfil Deportivo</h2>
              <div className="space-y-4">
                {[
                  { label: 'Posición', value: sp.position || '—' },
                  { label: 'Nivel', value: sp.experience || '—' },
                  { label: 'Altura', value: sp.height ? `${sp.height} cm` : '—' },
                  { label: 'Peso', value: sp.weight ? `${sp.weight} kg` : '—' },
                  { label: 'Talla camiseta', value: sp.shirtSize || '—' },
                  { label: 'Talla zapatos', value: sp.shoeSize ? `${sp.shoeSize}` : '—' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-400">{label}</span>
                    <span className="font-bold text-slate-900 text-sm">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Horarios disponibles */}
            <div className="space-y-6">
              {sp.schedule?.length > 0 && (
                <div className="bg-white border border-slate-100 shadow-sm p-6">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Disponibilidad</p>
                  <h2 className="font-display font-black uppercase text-slate-900 text-xl mb-4">Horarios</h2>
                  <div className="flex flex-wrap gap-2">
                    {sp.schedule.map(s => (
                      <span key={s} className="px-3 py-1.5 bg-primary-50 text-primary-700 text-xs font-bold uppercase tracking-wide">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Info adicional */}
              {(ai.occupation || ai.studyLevel || gender) && (
                <div className="bg-white border border-slate-100 shadow-sm p-6">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Personal</p>
                  <h2 className="font-display font-black uppercase text-slate-900 text-xl mb-5">Información</h2>
                  <div className="space-y-4">
                    {[
                      { label: 'Género', value: gender === 'male' ? 'Masculino' : gender === 'female' ? 'Femenino' : gender || '—' },
                      { label: 'Ocupación', value: ai.occupation || '—' },
                      { label: 'Educación', value: ai.studyLevel || '—' },
                    ].filter(f => f.value !== '—').map(({ label, value }) => (
                      <div key={label} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-400">{label}</span>
                        <span className="font-bold text-slate-900 text-sm">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Logros recientes */}
              {achievements.length > 0 && (
                <div className="bg-slate-900 border-l-4 border-primary-500 p-6">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Historial</p>
                  <h2 className="font-display font-black uppercase text-white text-xl mb-4">Logros Recientes</h2>
                  <div className="space-y-3">
                    {achievements.slice(0, 4).map((a, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary-500/20 flex items-center justify-center flex-shrink-0">
                          <Star className="w-4 h-4 text-primary-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-white text-sm truncate">{a.title}</p>
                          <p className="text-xs text-slate-500">
                            {new Date(a.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* STATS TAB */}
        {activeTab === 'stats' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">

            {/* Match stats */}
            <div className="bg-white border border-slate-100 shadow-sm p-6">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Competencia</p>
              <h2 className="font-display font-black uppercase text-slate-900 text-xl mb-6">Partidos</h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-slate-50">
                  <p className="font-display font-black text-4xl text-slate-900">{stats.totalMatches ?? 0}</p>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-1">Total</p>
                </div>
                <div className="text-center p-4 bg-green-50 border-t-2 border-green-500">
                  <p className="font-display font-black text-4xl text-green-700">{stats.wins ?? 0}</p>
                  <p className="text-xs font-bold uppercase tracking-widest text-green-600 mt-1">Victorias</p>
                </div>
                <div className="text-center p-4 bg-red-50 border-t-2 border-red-400">
                  <p className="font-display font-black text-4xl text-red-700">{stats.losses ?? 0}</p>
                  <p className="text-xs font-bold uppercase tracking-widest text-red-500 mt-1">Derrotas</p>
                </div>
              </div>
              {stats.totalMatches > 0 && (
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span className="font-bold uppercase tracking-widest">Tasa de victorias</span>
                    <span>{Math.round((stats.wins / stats.totalMatches) * 100)}%</span>
                  </div>
                  <div className="h-2 bg-slate-100">
                    <div
                      className="h-full bg-green-500"
                      style={{ width: `${Math.round((stats.wins / stats.totalMatches) * 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Attendance */}
            <div className="bg-white border border-slate-100 shadow-sm p-6">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Entrenamiento</p>
              <h2 className="font-display font-black uppercase text-slate-900 text-xl mb-6">Asistencia</h2>
              <div className="flex items-end gap-6">
                <div>
                  <p className="font-display font-black text-6xl text-slate-900 leading-none">{stats.attendanceRate ?? 0}%</p>
                  <p className="text-slate-400 text-sm mt-1">{stats.totalSessions ?? 0} sesiones registradas</p>
                </div>
                <div className="flex-1">
                  <div className="h-4 bg-slate-100">
                    <div
                      className="h-full bg-primary-500 transition-all"
                      style={{ width: `${stats.attendanceRate ?? 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Physical records */}
            {stats.physicalRecords?.length > 0 && (
              <div className="bg-white border border-slate-100 shadow-sm p-6">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Físico</p>
                <h2 className="font-display font-black uppercase text-slate-900 text-xl mb-6">Registros de Rendimiento</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {stats.physicalRecords.map((r, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-slate-50 border-l-2 border-primary-500">
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{r.exercise}</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {new Date(r.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-display font-black text-2xl text-primary-500 leading-none">{r.result}</p>
                        <p className="text-xs text-slate-400">{r.unit}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* INSIGNIAS TAB */}
        {activeTab === 'insignias' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {badges.length === 0 ? (
              <div className="bg-white border border-slate-100 shadow-sm p-16 text-center">
                <Shield className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                <p className="font-display font-black uppercase text-slate-400 text-sm tracking-widest">Sin insignias aún</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {badges.map((b, i) => {
                  const rarity = b.badgeId?.rarity || 'common';
                  const rc = rarityColors[rarity] || rarityColors.common;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className={`bg-white border-2 ${rc.border} shadow-sm p-5`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 ${rc.bg} flex items-center justify-center flex-shrink-0 text-2xl`}>
                          {b.badgeId?.icon || '🏅'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <p className="font-bold text-slate-900 text-sm truncate">{b.badgeId?.name || 'Insignia'}</p>
                            <span className={`text-xs font-bold uppercase tracking-wide px-2 py-0.5 ${rc.bg} ${rc.text} flex-shrink-0`}>
                              {rc.label}
                            </span>
                          </div>
                          {b.badgeId?.description && (
                            <p className="text-xs text-slate-500 line-clamp-2">{b.badgeId.description}</p>
                          )}
                          <p className="text-xs text-slate-400 mt-2">
                            {new Date(b.earnedAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* FOTOS TAB */}
        {activeTab === 'fotos' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {loadingPhotos ? (
              <div className="flex items-center justify-center h-64">
                <div className="w-10 h-10 border-4 border-slate-200 border-t-primary-500 rounded-full animate-spin" />
              </div>
            ) : taggedPhotos.length === 0 ? (
              <div className="bg-white border border-slate-100 shadow-sm p-16 text-center">
                <ImageIcon className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                <p className="font-display font-black uppercase text-slate-400 text-sm tracking-widest">Sin publicaciones</p>
                <p className="text-slate-400 text-sm mt-1">Este miembro aún no ha sido etiquetado</p>
              </div>
            ) : (
              <div className="space-y-6">
                {taggedPhotos.map((image, index) => (
                  <motion.article
                    key={image._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.06 }}
                    className="bg-white shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="p-4 flex items-center gap-3 border-b border-slate-50">
                      <img src={logo} alt="Pelícanos" className="w-11 h-11 rounded-full object-cover border-2 border-primary-200 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-slate-900 text-sm">Pelícanos Volley Club</h3>
                        <div className="flex items-center gap-2 text-xs text-slate-400 flex-wrap">
                          <span>{new Date(image.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                          {image.eventId && (
                            <>
                              <span>·</span>
                              <Calendar className="w-3 h-3" />
                              <span className="text-primary-500 font-semibold truncate">{image.eventId.title}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {image.title && (
                      <div className="px-4 pt-3 pb-2">
                        <h4 className="font-display font-bold text-slate-900">{image.title}</h4>
                        {image.description && <p className="text-slate-500 text-sm mt-1">{image.description}</p>}
                      </div>
                    )}

                    <button
                      className="relative bg-black w-full block cursor-pointer"
                      onClick={() => setSelectedImage(image)}
                    >
                      <img
                        src={image.imageUrl}
                        alt={image.title || 'Foto'}
                        className="w-full max-h-[520px] object-contain mx-auto hover:opacity-95 transition-opacity"
                        loading="lazy"
                      />
                    </button>

                    {image.taggedMembers?.length > 0 && (
                      <div className="px-4 py-3 border-t border-slate-100">
                        <div className="flex items-center gap-2 flex-wrap text-sm">
                          <User className="w-4 h-4 text-slate-400 flex-shrink-0" />
                          <span className="text-slate-500">Con</span>
                          {image.taggedMembers.slice(0, 3).map((m, idx) => (
                            <Link key={m._id} to={`/members/${m._id}`} className="font-bold text-primary-500 hover:text-primary-600 hover:underline transition-colors">
                              {m.userId?.profile?.firstName} {m.userId?.profile?.lastName}
                              {idx < Math.min(2, image.taggedMembers.length - 1) && ','}
                            </Link>
                          ))}
                          {image.taggedMembers.length > 3 && <span className="text-slate-500">y {image.taggedMembers.length - 3} más</span>}
                        </div>
                      </div>
                    )}

                    <div className="px-4 py-3 border-t border-slate-100 flex items-center gap-6">
                      <div className="flex items-center gap-2 text-slate-500 text-sm">
                        <Heart className="w-5 h-5" />
                        <span>{image.likes?.length || 0} Me gusta</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-500 text-sm">
                        <MessageCircle className="w-5 h-5" />
                        <span>{image.comments?.length || 0} Comentarios</span>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* ── LIGHTBOX ── */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <button
              className="absolute top-4 right-4 w-11 h-11 bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
              onClick={() => setSelectedImage(null)}
            >
              <X className="w-6 h-6" />
            </button>
            <motion.img
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              src={selectedImage.imageUrl}
              alt={selectedImage.title || 'Foto'}
              className="max-w-full max-h-full object-contain"
              onClick={e => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default MemberPublicProfilePage;
