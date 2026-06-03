import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Award, Calendar, Users, Trophy, MapPin, CheckCircle, AlertCircle, Music, Search, Plus, ExternalLink, Play, X } from 'lucide-react';
import axios from '@/api/axios';

function MemberDashboard() {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [progress, setProgress] = useState(null);
  const [events, setEvents] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [todayTrainingEvents, setTodayTrainingEvents] = useState([]);
  const [checkInStatus, setCheckInStatus] = useState({});

  // Spotify
  const [spotifyPlaylist, setSpotifyPlaylist] = useState(null);
  const [spotifyConnected, setSpotifyConnected] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [addingTrack, setAddingTrack] = useState(null);
  const [addedTracks, setAddedTracks] = useState(new Set());
  const [spotifyMsg, setSpotifyMsg] = useState(null);

  useEffect(() => {
    fetchMemberData();
    fetchSpotifyPlaylist();
  }, []);

  const fetchMemberData = async () => {
    try {
      const [profileRes, statsRes, progressRes, eventsRes, tournamentsRes, todayTrainingRes] = await Promise.all([
        axios.get('/member/profile'),
        axios.get('/member/stats'),
        axios.get('/member/progress'),
        axios.get('/events').catch(() => ({ data: { data: [] } })),
        axios.get('/tournaments').catch(() => ({ data: { data: [] } })),
        axios.get('/events/member/today-training').catch(() => ({ data: { data: [] } }))
      ]);

      setProfile(profileRes.data.data);
      setStats(statsRes.data.data);
      setProgress(progressRes.data.data);
      setEvents(eventsRes.data.data || []);
      setTournaments(tournamentsRes.data.data || []);
      setTodayTrainingEvents(todayTrainingRes.data.data || []);
    } catch (error) {
      console.error('Error fetching member data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSpotifyPlaylist = async () => {
    try {
      const res = await axios.get('/spotify/playlist');
      const data = res.data.data;
      if (data?.connected) {
        setSpotifyConnected(true);
        setSpotifyPlaylist(data);
        const uris = new Set((data.tracks || []).map(t => t.uri));
        setAddedTracks(uris);
      }
    } catch {
      // Spotify optional feature
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    setSearchResults([]);
    try {
      const res = await axios.get('/spotify/search', { params: { q: searchQuery } });
      setSearchResults(res.data.data || []);
    } catch (err) {
      setSpotifyMsg({ type: 'error', text: err.response?.data?.message || 'Error al buscar' });
    } finally {
      setSearching(false);
    }
  };

  const handleAddTrack = async (track) => {
    setAddingTrack(track.uri);
    setSpotifyMsg(null);
    try {
      await axios.post('/spotify/tracks', { uri: track.uri });
      setAddedTracks(prev => new Set([...prev, track.uri]));
      setSpotifyMsg({ type: 'success', text: `"${track.name}" agregada a la playlist` });
      setTimeout(() => setSpotifyMsg(null), 4000);
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al agregar';
      setSpotifyMsg({ type: msg.includes('ya está') ? 'info' : 'error', text: msg });
      setTimeout(() => setSpotifyMsg(null), 4000);
    } finally {
      setAddingTrack(null);
    }
  };

  const formatDuration = (ms) => {
    const m = Math.floor(ms / 60000);
    const s = Math.floor((ms % 60000) / 1000).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleCheckIn = (eventId) => {
    setCheckInStatus(prev => ({ ...prev, [eventId]: 'loading' }));
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          await axios.post(`/events/${eventId}/checkin`, {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setCheckInStatus(prev => ({ ...prev, [eventId]: 'success' }));
          // Keep in list to show success message; auto-dismiss after 6s
          setTimeout(() => {
            setTodayTrainingEvents(prev => prev.filter(e => e._id !== eventId));
          }, 6000);
        } catch (error) {
          setCheckInStatus(prev => ({
            ...prev,
            [eventId]: 'error:' + (error.response?.data?.message || 'Error al registrar asistencia')
          }));
        }
      },
      () => {
        setCheckInStatus(prev => ({ ...prev, [eventId]: 'error:No se pudo obtener tu ubicación' }));
      }
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  const currentXP = stats?.xp || 0;
  const currentLevel = stats?.level || 1;
  const xpForNextLevel = currentLevel * 500;
  const xpInCurrentLevel = currentXP % xpForNextLevel;
  const levelProgress = (xpInCurrentLevel / xpForNextLevel) * 100;
  const xpNeeded = xpForNextLevel - xpInCurrentLevel;

  const progressEntries = progress ? Object.entries(progress) : [];
  const upcomingEvents = events.filter(e => new Date(e.date) > new Date()).slice(0, 3);
  const activeTournaments = tournaments.filter(t => t.status === 'active' || t.status === 'upcoming').slice(0, 2);

  return (
    <div className="space-y-6">
      {/* Training Check-in Banner */}
      {todayTrainingEvents.length > 0 && todayTrainingEvents.map((event) => {
        const status = checkInStatus[event._id];
        const isError = status?.startsWith('error:');
        const isSuccess = status === 'success';
        return (
          <div
            key={event._id}
            className={`border-l-4 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-all ${
              isSuccess
                ? 'bg-emerald-900 border-emerald-400'
                : 'bg-sky-900 border-sky-400'
            }`}
          >
            <div className="flex items-center gap-3">
              {isSuccess
                ? <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                : <MapPin className="w-5 h-5 text-sky-400 flex-shrink-0" />}
              <div>
                <p className={`text-xs font-bold uppercase tracking-widest mb-0.5 ${isSuccess ? 'text-emerald-400' : 'text-sky-400'}`}>
                  {isSuccess ? '¡Asistencia Marcada!' : 'Entrenamiento Hoy'}
                </p>
                <p className="font-bold text-white">{event.title}</p>
                {isSuccess && (
                  <p className="text-sm text-emerald-300 mt-1">¡Disfruta tu entrenamiento! +50 XP ganados 🏐</p>
                )}
                {isError && (
                  <p className="text-xs text-red-300 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />{status.replace('error:', '')}
                  </p>
                )}
              </div>
            </div>
            {!isSuccess && (
              <button
                onClick={() => handleCheckIn(event._id)}
                disabled={status === 'loading'}
                className="inline-flex items-center gap-2 bg-sky-500 text-white font-display font-bold uppercase tracking-wide px-4 py-2 hover:bg-sky-600 active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              >
                {status === 'loading' ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Marcando...</>
                ) : (
                  <><CheckCircle className="w-4 h-4" />Marcar Asistencia</>
                )}
              </button>
            )}
          </div>
        );
      })}

      {/* Page Header */}
      <div>
        <span className="inline-block text-primary-600 text-xs font-bold uppercase tracking-widest bg-primary-50 px-3 py-1.5 mb-3">
          Panel de Miembro
        </span>
        <h1 className="font-display font-black uppercase text-slate-900 text-3xl leading-none">
          Mi Dashboard
        </h1>
      </div>

      {/* Hero XP / Nivel */}
      <div className="bg-slate-900 p-8 border-l-4 border-primary-500">
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Tu Progreso</p>
            <p className="font-display font-black text-6xl text-primary-400 leading-none mb-1">
              {currentLevel}
            </p>
            <p className="font-display font-bold uppercase text-slate-300 text-lg">
              Nivel {currentLevel}
            </p>
            <p className="text-slate-400 text-sm mt-1">{currentXP.toLocaleString()} XP Total</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 bg-slate-800 border-2 border-primary-500 flex items-center justify-center">
              <Award className="w-8 h-8 text-primary-400" />
            </div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
              {stats?.badges?.length || 0} Insignias
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-bold uppercase tracking-widest text-slate-300 text-xs">
              Progreso al Nivel {currentLevel + 1}
            </span>
            <span className="font-bold text-primary-400">{Math.round(levelProgress)}%</span>
          </div>
          <div className="w-full bg-slate-700 h-2">
            <div
              className="bg-primary-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${levelProgress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-500">
            <span>{xpInCurrentLevel.toLocaleString()} / {xpForNextLevel.toLocaleString()} XP</span>
            <span>Faltan {xpNeeded.toLocaleString()} XP</span>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-700">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
            Gana XP completando logros y obteniendo insignias
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/member/profile"
              className="inline-flex items-center gap-2 bg-primary-500 text-white font-display font-bold uppercase tracking-wide px-5 py-2.5 hover:bg-primary-600 active:scale-95 transition-all cursor-pointer"
            >
              Ver Mi Perfil
            </Link>
            {profile?._id && (
              <Link
                to={`/members/${profile._id}`}
                className="inline-flex items-center gap-2 border-2 border-primary-500 text-primary-400 font-display font-bold uppercase tracking-wide px-5 py-2.5 hover:bg-primary-500 hover:text-white active:scale-95 transition-all cursor-pointer"
              >
                Ver Perfil Público
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mini Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-100 shadow-sm p-5 border-l-4 border-primary-500">
          <div className="flex items-center gap-3 mb-1">
            <Users className="w-4 h-4 text-primary-500" />
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Asistencia</p>
          </div>
          <p className="font-display font-black text-3xl text-slate-900">{stats?.attendanceRate || 0}%</p>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-bold">Tasa General</p>
        </div>

        <div className="bg-white border border-slate-100 shadow-sm p-5 border-l-4 border-primary-500">
          <div className="flex items-center gap-3 mb-1">
            <Award className="w-4 h-4 text-primary-500" />
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Insignias</p>
          </div>
          <p className="font-display font-black text-3xl text-slate-900">{stats?.totalBadges || 0}</p>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-bold">Obtenidas</p>
        </div>

        {progressEntries.length > 0 ? (
          progressEntries.slice(0, 2).map(([exercise, data]) => (
            <div key={exercise} className="bg-white border border-slate-100 shadow-sm p-5 border-l-4 border-primary-500">
              <div className="flex items-center gap-3 mb-1">
                <TrendingUp className="w-4 h-4 text-primary-500" />
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">{exercise}</p>
              </div>
              <p className="font-display font-black text-3xl text-slate-900">
                {data.current} <span className="text-lg">{data.unit}</span>
              </p>
              {data.improvement !== 0 && (
                <p className={`text-xs font-bold uppercase tracking-widest mt-1 ${data.improvement > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {data.improvement > 0 ? '+' : ''}{data.improvement} {data.unit}
                </p>
              )}
            </div>
          ))
        ) : (
          <div className="col-span-2 bg-white border border-slate-100 shadow-sm p-5 flex items-center justify-center">
            <div className="text-center">
              <TrendingUp className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Sin récords físicos</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Insignias Recientes */}
        <div className="bg-white border border-slate-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-black uppercase text-slate-900 text-lg">Insignias Recientes</h3>
            <Link to="/member/profile" className="text-xs font-bold uppercase tracking-widest text-primary-600 hover:text-primary-700">
              Ver todas
            </Link>
          </div>
          {stats?.badges && stats.badges.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {stats.badges.slice(0, 6).map((badge, index) => {
                const badgeData = badge.badgeId || badge;
                const rarityColors = {
                  common: 'bg-slate-100',
                  rare: 'bg-blue-100',
                  epic: 'bg-purple-100',
                  legendary: 'bg-yellow-100'
                };
                const bgColor = rarityColors[badgeData?.rarity] || 'bg-slate-100';

                return (
                  <div
                    key={index}
                    className={`w-14 h-14 ${bgColor} flex items-center justify-center shadow-sm hover:scale-110 transition-transform`}
                    title={badgeData?.name || 'Insignia'}
                  >
                    <span className="text-2xl">{badgeData?.icon || '🏆'}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm font-medium">Aún no tienes insignias</p>
              <p className="text-slate-400 text-xs mt-1">Completa logros para ganar XP</p>
            </div>
          )}
        </div>

        {/* Próximo Hito */}
        <div className="bg-white border border-slate-100 shadow-sm p-6 border-l-4 border-primary-500">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-primary-500 flex items-center justify-center flex-shrink-0">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-display font-black uppercase text-slate-900 text-lg mb-2">
                Próximo Hito
              </h3>
              <p className="text-slate-600 text-sm mb-4">
                Asiste a 5 sesiones de entrenamiento más para desbloquear la insignia "Dedicado".
              </p>
              <div className="w-full bg-slate-200 h-2 mb-2">
                <div className="bg-primary-500 h-2 rounded-full" style={{ width: '60%' }} />
              </div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500">3 / 5 Completado</p>
            </div>
          </div>
        </div>
      </div>

      {/* Evolución de Rendimiento */}
      <div className="bg-white border border-slate-100 shadow-sm p-6">
        <h2 className="font-display font-black uppercase text-slate-900 text-xl mb-1">Evolución de Rendimiento</h2>
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">Inicio vs. Ahora</p>

        {progressEntries.length > 0 ? (
          <div className="space-y-5">
            {progressEntries.map(([exercise, data]) => {
              const maxValue = Math.max(data.start, data.current);
              const startPercent = (data.start / maxValue) * 100;
              const currentPercent = (data.current / maxValue) * 100;

              return (
                <div key={exercise}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-bold uppercase tracking-widest text-slate-600 text-xs">{exercise}</span>
                    <span className={`font-bold text-xs uppercase tracking-widest ${data.improvement >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {data.improvement >= 0 ? '+' : ''}{data.improvement} {data.unit}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-slate-200 h-2">
                      <div className="bg-slate-400 rounded-full h-2" style={{ width: `${startPercent}%` }} />
                    </div>
                    <div className="flex-1 bg-slate-200 h-2">
                      <div className="bg-primary-500 rounded-full h-2" style={{ width: `${currentPercent}%` }} />
                    </div>
                  </div>
                  <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-400 mt-1">
                    <span>Inicio: {data.start}{data.unit}</span>
                    <span>Ahora: {data.current}{data.unit}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <TrendingUp className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-500">No hay datos de evolución disponibles</p>
          </div>
        )}
      </div>

      {/* Próximos Eventos y Torneos */}
      <div className="bg-white border border-slate-100 shadow-sm p-6">
        <h2 className="font-display font-black uppercase text-slate-900 text-xl mb-6">Próximos Eventos y Torneos</h2>

        <div className="space-y-3">
          {upcomingEvents.length > 0 && upcomingEvents.map((event) => (
            <div key={event._id} className="flex items-center justify-between border-l-4 border-sky-500 bg-sky-50 p-3">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-sky-500" />
                <div>
                  <p className="font-bold text-slate-900 text-sm uppercase tracking-wide">{event.title}</p>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                    {new Date(event.date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {activeTournaments.length > 0 && activeTournaments.map((tournament) => (
            <div key={tournament._id} className="flex items-center justify-between border-l-4 border-primary-500 bg-primary-50 p-3">
              <div className="flex items-center gap-3">
                <Trophy className="w-5 h-5 text-primary-500" />
                <div>
                  <p className="font-bold text-slate-900 text-sm uppercase tracking-wide">{tournament.name}</p>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500">{tournament.category}</p>
                </div>
              </div>
              <span className="px-2 py-1 text-xs font-bold uppercase tracking-widest text-primary-600 bg-primary-100">
                {tournament.status}
              </span>
            </div>
          ))}

          {upcomingEvents.length === 0 && activeTournaments.length === 0 && (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500">No hay eventos próximos</p>
            </div>
          )}
        </div>
      </div>

      {/* Spotify Playlist */}
      {spotifyConnected && (
        <div className="bg-slate-900 border-l-4 border-green-500">
          {/* Header */}
          <div className="p-6 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 bg-green-500 flex items-center justify-center flex-shrink-0">
                <Music className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-green-400 mb-0.5">Playlist del Club</p>
                <h2 className="font-display font-black uppercase text-white text-xl leading-none">
                  {spotifyPlaylist?.playlistName || 'Pelícanos Vóley Club'}
                </h2>
                <p className="text-slate-400 text-xs mt-1">{spotifyPlaylist?.tracks?.length || 0} canciones · Agrega las tuyas</p>
              </div>
            </div>
            {spotifyPlaylist?.playlistUrl && (
              <a
                href={spotifyPlaylist.playlistUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border-2 border-green-500 text-green-400 font-bold uppercase tracking-wide px-4 py-2 text-xs hover:bg-green-500 hover:text-white transition-colors flex-shrink-0"
              >
                <ExternalLink className="w-3 h-3" />
                Abrir en Spotify
              </a>
            )}
          </div>

          {/* Search */}
          <div className="p-6 border-b border-slate-800">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Buscar y agregar canciones</p>
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Nombre de canción o artista..."
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-800 border border-slate-700 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-green-500"
                />
              </div>
              <button
                type="submit"
                disabled={searching || !searchQuery.trim()}
                className="inline-flex items-center gap-2 bg-green-500 text-white font-bold uppercase tracking-wide px-4 py-2.5 text-xs hover:bg-green-600 transition-colors cursor-pointer disabled:opacity-50"
              >
                {searching ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                Buscar
              </button>
            </form>

            {/* Feedback message */}
            {spotifyMsg && (
              <div className={`mt-3 px-3 py-2 text-xs font-bold uppercase tracking-widest flex items-center justify-between ${
                spotifyMsg.type === 'success' ? 'bg-green-900 text-green-300' :
                spotifyMsg.type === 'info' ? 'bg-sky-900 text-sky-300' :
                'bg-red-900 text-red-300'
              }`}>
                <span>{spotifyMsg.text}</span>
                <button onClick={() => setSpotifyMsg(null)} className="cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* Search Results */}
            {searchResults.length > 0 && (
              <ul className="mt-3 space-y-1 max-h-72 overflow-y-auto">
                {searchResults.map(track => {
                  const alreadyAdded = addedTracks.has(track.uri);
                  return (
                    <li
                      key={track.id}
                      className="flex items-center gap-3 p-2.5 bg-slate-800 hover:bg-slate-700 transition-colors"
                    >
                      {track.imageUrl ? (
                        <img src={track.imageUrl} alt={track.album} className="w-9 h-9 object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-9 h-9 bg-slate-600 flex items-center justify-center flex-shrink-0">
                          <Play className="w-3 h-3 text-slate-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-bold truncate">{track.name}</p>
                        <p className="text-slate-400 text-xs truncate">{track.artist} · {formatDuration(track.durationMs)}</p>
                      </div>
                      <button
                        onClick={() => handleAddTrack(track)}
                        disabled={alreadyAdded || addingTrack === track.uri}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition-colors cursor-pointer flex-shrink-0 ${
                          alreadyAdded
                            ? 'bg-slate-600 text-slate-400 cursor-default'
                            : 'bg-green-500 text-white hover:bg-green-600'
                        } disabled:opacity-60`}
                      >
                        {addingTrack === track.uri ? (
                          <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : alreadyAdded ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <Plus className="w-3 h-3" />
                        )}
                        {alreadyAdded ? 'En playlist' : 'Agregar'}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Current playlist tracks (first 8) */}
          {spotifyPlaylist?.tracks?.length > 0 && (
            <div className="p-6">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Canciones en la playlist</p>
              <ul className="space-y-1">
                {spotifyPlaylist.tracks.slice(0, 8).map((track, i) => (
                  <li key={track.uri} className="flex items-center gap-3 py-2">
                    <span className="w-4 text-right text-xs text-slate-600 font-bold flex-shrink-0">{i + 1}</span>
                    {track.imageUrl ? (
                      <img src={track.imageUrl} alt={track.album} className="w-8 h-8 object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-8 h-8 bg-slate-700 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-bold truncate">{track.name}</p>
                      <p className="text-slate-500 text-xs truncate">{track.artist}</p>
                    </div>
                    <span className="text-xs text-slate-600 flex-shrink-0">{formatDuration(track.durationMs)}</span>
                  </li>
                ))}
              </ul>
              {spotifyPlaylist.tracks.length > 8 && (
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-3 text-center">
                  +{spotifyPlaylist.tracks.length - 8} canciones más en Spotify
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default MemberDashboard;
