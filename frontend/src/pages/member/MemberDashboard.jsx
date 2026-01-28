import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Award, Calendar, Users, Trophy } from 'lucide-react';
import axios from '@/api/axios';

function MemberDashboard() {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [progress, setProgress] = useState(null);
  const [events, setEvents] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMemberData();
  }, []);

  const fetchMemberData = async () => {
    try {
      const [profileRes, statsRes, progressRes, eventsRes, tournamentsRes] = await Promise.all([
        axios.get('/member/profile'),
        axios.get('/member/stats'),
        axios.get('/member/progress'),
        axios.get('/events').catch(() => ({ data: { data: [] } })),
        axios.get('/tournaments').catch(() => ({ data: { data: [] } }))
      ]);

      setProfile(profileRes.data.data);
      setStats(statsRes.data.data);
      setProgress(progressRes.data.data);
      setEvents(eventsRes.data.data || []);
      setTournaments(tournamentsRes.data.data || []);
    } catch (error) {
      console.error('Error fetching member data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
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
      {/* Sección de Nivel y Experiencia */}
      <div className="card-glass p-8 bg-gradient-to-br from-primary-500 to-ocean-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm opacity-90 font-semibold mb-2">🌟 TU PROGRESO</p>
              <h2 className="text-5xl font-display font-black mb-2">
                Nivel {currentLevel}
              </h2>
              <p className="text-lg opacity-90">{currentXP.toLocaleString()} XP Total</p>
            </div>
            <div className="text-center">
              <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-4 border-white/30">
                <Award className="w-12 h-12" />
              </div>
              <p className="text-xs mt-2 opacity-80">{stats?.badges?.length || 0} Insignias</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-semibold">Progreso al Nivel {currentLevel + 1}</span>
              <span className="font-bold">{Math.round(levelProgress)}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-4 overflow-hidden">
              <div 
                className="bg-white rounded-full h-4 transition-all duration-500 shadow-lg"
                style={{ width: `${levelProgress}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs opacity-90">
              <span>{xpInCurrentLevel.toLocaleString()} / {xpForNextLevel.toLocaleString()} XP</span>
              <span>Faltan {xpNeeded.toLocaleString()} XP</span>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-white/20">
            <p className="text-sm opacity-90 mb-3">✨ Gana XP completando logros y obteniendo insignias</p>
            <Link 
              to="/member/profile" 
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg transition-colors font-semibold"
            >
              Ver Mi Perfil →
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Insignias Recientes */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-display font-bold text-gray-900">Insignias Recientes</h3>
            <Link to="/member/profile" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              Ver todas
            </Link>
          </div>
          {stats?.badges && stats.badges.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {stats.badges.slice(0, 6).map((badge, index) => {
                const badgeData = badge.badgeId || badge;
                const rarityColors = {
                  common: 'bg-gray-100',
                  rare: 'bg-blue-100',
                  epic: 'bg-purple-100',
                  legendary: 'bg-yellow-100'
                };
                const bgColor = rarityColors[badgeData?.rarity] || 'bg-gray-100';
                
                return (
                  <div 
                    key={index}
                    className={`w-14 h-14 ${bgColor} rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform`}
                    title={badgeData?.name || 'Badge'}
                  >
                    <span className="text-2xl">{badgeData?.icon || '🏆'}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Award className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">Aún no tienes insignias</p>
              <p className="text-gray-400 text-xs mt-1">Completa logros para ganar XP</p>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          {progressEntries.length > 0 ? (
            progressEntries.slice(0, 2).map(([exercise, data]) => (
              <div key={exercise} className="card">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{exercise}</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {data.current} {data.unit}
                    </p>
                    {data.improvement !== 0 && (
                      <p className={`text-sm ${data.improvement > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {data.improvement > 0 ? '+' : ''}{data.improvement} {data.unit}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-2 card text-center py-8">
              <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">No hay récords físicos registrados</p>
            </div>
          )}

          <div className="card">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Attendance</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.attendanceRate || 0}%
                </p>
                <p className="text-sm text-gray-600">Great!</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Award className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Badges</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.totalBadges || 0}
                </p>
                <p className="text-sm text-gray-600">Earned</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-xl font-display font-bold text-gray-900 mb-6">Evolución de Rendimiento</h2>
          <p className="text-sm text-gray-600 mb-4">Inicio vs Ahora</p>
          
          {progressEntries.length > 0 ? (
            <div className="space-y-4">
              {progressEntries.map(([exercise, data]) => {
                const maxValue = Math.max(data.start, data.current);
                const startPercent = (data.start / maxValue) * 100;
                const currentPercent = (data.current / maxValue) * 100;
                
                return (
                  <div key={exercise}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{exercise}</span>
                      <span className={`font-semibold ${data.improvement >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {data.improvement >= 0 ? '+' : ''}{data.improvement} {data.unit}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div className="bg-gray-400 rounded-full h-2" style={{ width: `${startPercent}%` }}></div>
                      </div>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div className="bg-primary-500 rounded-full h-2" style={{ width: `${currentPercent}%` }}></div>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>INICIO: {data.start}{data.unit}</span>
                      <span>AHORA: {data.current}{data.unit}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">No hay datos de evolución disponibles</p>
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="text-xl font-display font-bold text-gray-900 mb-6">Próximos Eventos y Torneos</h2>
          
          <div className="space-y-3">
            {upcomingEvents.length > 0 && upcomingEvents.map((event) => (
              <div key={event._id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="font-semibold text-gray-900">{event.title}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(event.date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            {activeTournaments.length > 0 && activeTournaments.map((tournament) => (
              <div key={tournament._id} className="flex items-center justify-between p-3 bg-primary-50 rounded-lg border-l-4 border-primary-500">
                <div className="flex items-center gap-3">
                  <Trophy className="w-5 h-5 text-primary-500" />
                  <div>
                    <p className="font-semibold text-gray-900">{tournament.name}</p>
                    <p className="text-sm text-gray-600">{tournament.category}</p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-primary-600 uppercase">{tournament.status}</span>
              </div>
            ))}
            
            {upcomingEvents.length === 0 && activeTournaments.length === 0 && (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">No hay eventos próximos</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card bg-primary-50 border-2 border-primary-200">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0">
            <Award className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-display font-bold text-gray-900 mb-2">
              Next Milestone
            </h3>
            <p className="text-gray-700 mb-4">
              Attend 5 more practice sessions to unlock the "Dedicated" badge.
            </p>
            <div className="w-full bg-white rounded-full h-3 mb-2">
              <div className="bg-primary-500 rounded-full h-3" style={{ width: '60%' }}></div>
            </div>
            <p className="text-sm text-gray-600">3/5 Completed</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MemberDashboard;
