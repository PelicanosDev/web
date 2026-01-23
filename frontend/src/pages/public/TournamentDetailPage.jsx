import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Trophy, 
  Clock,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import axios from '@/api/axios';
import { useAuth } from '@/features/auth/context/AuthContext';

function TournamentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tournament, setTournament] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [bracket, setBracket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    fetchTournamentData();
  }, [id]);

  const fetchTournamentData = async () => {
    try {
      const [tournamentRes, participantsRes, bracketRes] = await Promise.all([
        axios.get(`/tournaments/${id}`),
        axios.get(`/tournaments/${id}/participants`),
        axios.get(`/tournaments/${id}/bracket`)
      ]);

      setTournament(tournamentRes.data.data);
      setParticipants(participantsRes.data.data.participants);
      setBracket(bracketRes.data.data);
    } catch (error) {
      console.error('Error fetching tournament:', error);
    } finally {
      setLoading(false);
    }
  };

  const isUserRegistered = () => {
    if (!user) return false;
    return participants.some(p => p.user?._id === user.id);
  };

  const canRegister = () => {
    return tournament?.status === 'registration' || tournament?.status === 'upcoming';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Torneo no encontrado</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-ocean-500 to-primary-500 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                tournament.status === 'registration' ? 'bg-green-500' :
                tournament.status === 'upcoming' ? 'bg-blue-500' :
                tournament.status === 'in-progress' ? 'bg-yellow-500' :
                'bg-gray-500'
              }`}>
                {tournament.status === 'registration' ? 'Inscripciones Abiertas' :
                 tournament.status === 'upcoming' ? 'Próximamente' :
                 tournament.status === 'in-progress' ? 'En Progreso' :
                 'Finalizado'}
              </span>
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                {tournament.category === 'masculine' ? 'Masculino' :
                 tournament.category === 'feminine' ? 'Femenino' : 'Mixto'}
              </span>
            </div>
            
            <h1 className="text-5xl font-display font-bold mb-4">{tournament.name}</h1>
            <p className="text-xl text-white/90 mb-6">{tournament.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5" />
                <div>
                  <p className="text-sm opacity-90">Fecha</p>
                  <p className="font-semibold">
                    {new Date(tournament.dates.start).toLocaleDateString('es-ES')}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5" />
                <div>
                  <p className="text-sm opacity-90">Sede</p>
                  <p className="font-semibold">{tournament.location.venue}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5" />
                <div>
                  <p className="text-sm opacity-90">Equipos</p>
                  <p className="font-semibold">{participants.length} / {tournament.maxTeams}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Trophy className="w-5 h-5" />
                <div>
                  <p className="text-sm opacity-90">Formato</p>
                  <p className="font-semibold">{tournament.format}</p>
                </div>
              </div>
            </div>

            {canRegister() && !isUserRegistered() && (
              <button
                onClick={() => user ? setShowRegistrationModal(true) : navigate('/login')}
                className="mt-6 btn btn-secondary"
              >
                Inscribirse Ahora
              </button>
            )}

            {isUserRegistered() && (
              <div className="mt-6 flex items-center gap-2 bg-green-500/20 px-4 py-2 rounded-lg inline-flex">
                <CheckCircle className="w-5 h-5" />
                <span>Ya estás inscrito en este torneo</span>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Tabs */}
      <section className="bg-white border-b sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-8">
            {['info', 'participants', 'bracket'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 font-medium border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-primary-500 text-primary-500'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab === 'info' ? 'Información' :
                 tab === 'participants' ? 'Participantes' : 'Llaves'}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          {activeTab === 'info' && (
            <TournamentInfo tournament={tournament} />
          )}
          
          {activeTab === 'participants' && (
            <ParticipantsList participants={participants} />
          )}
          
          {activeTab === 'bracket' && (
            <TournamentBracket bracket={bracket} tournament={tournament} />
          )}
        </div>
      </section>

      {/* Modal de Inscripción */}
      {showRegistrationModal && (
        <RegistrationModal
          tournament={tournament}
          onClose={() => setShowRegistrationModal(false)}
          onSuccess={() => {
            setShowRegistrationModal(false);
            fetchTournamentData();
          }}
        />
      )}
    </div>
  );
}

// Componente de Información del Torneo
function TournamentInfo({ tournament }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <div className="card">
          <h2 className="text-2xl font-display font-bold text-gray-900 mb-4">
            Detalles del Torneo
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Descripción</h3>
              <p className="text-gray-600">{tournament.description}</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Reglas</h3>
              <p className="text-gray-600">{tournament.rules}</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Configuración de Partidos</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Sets totales:</span>
                  <span className="ml-2 font-semibold">{tournament.matchConfig.totalSets}</span>
                </div>
                <div>
                  <span className="text-gray-600">Sets para ganar:</span>
                  <span className="ml-2 font-semibold">{tournament.matchConfig.setsToWin}</span>
                </div>
                <div>
                  <span className="text-gray-600">Puntos por set:</span>
                  <span className="ml-2 font-semibold">{tournament.matchConfig.pointsPerSet}</span>
                </div>
                <div>
                  <span className="text-gray-600">Set final:</span>
                  <span className="ml-2 font-semibold">{tournament.matchConfig.finalSetPoints}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {tournament.prizes && tournament.prizes.length > 0 && (
          <div className="card">
            <h2 className="text-2xl font-display font-bold text-gray-900 mb-4">
              Premios
            </h2>
            <div className="space-y-3">
              {tournament.prizes.map((prize, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Trophy className="w-5 h-5 text-primary-500" />
                    <span className="font-semibold">{prize.position}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{prize.description}</p>
                    {prize.value && (
                      <p className="text-sm text-gray-600">
                        ${prize.value.toLocaleString()} COP
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div className="card">
          <h3 className="font-display font-bold text-gray-900 mb-4">
            Información Importante
          </h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900">Fecha límite de inscripción</p>
                <p className="text-sm text-gray-600">
                  {new Date(tournament.dates.registrationDeadline).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>

            {tournament.registrationFee > 0 && (
              <div className="flex items-start gap-3">
                <DollarSign className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900">Costo de inscripción</p>
                  <p className="text-sm text-gray-600">
                    ${tournament.registrationFee.toLocaleString()} COP
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900">Ubicación</p>
                <p className="text-sm text-gray-600">{tournament.location.venue}</p>
                {tournament.location.address && (
                  <p className="text-sm text-gray-600">{tournament.location.address}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente de Lista de Participantes
function ParticipantsList({ participants }) {
  return (
    <div className="card">
      <h2 className="text-2xl font-display font-bold text-gray-900 mb-6">
        Equipos Inscritos ({participants.length})
      </h2>
      <div className="space-y-3">
        {participants.map((participant, index) => (
          <div key={participant._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-4">
              <span className="text-2xl font-bold text-gray-400">#{index + 1}</span>
              <div>
                <p className="font-semibold text-gray-900">{participant.teamName}</p>
                <p className="text-sm text-gray-600">
                  {participant.user?.profile?.firstName} {participant.user?.profile?.lastName}
                  {participant.partner?.name && ` & ${participant.partner.name}`}
                </p>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
              participant.status === 'confirmed' ? 'bg-green-100 text-green-700' :
              participant.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              {participant.status === 'confirmed' ? 'Confirmado' :
               participant.status === 'pending' ? 'Pendiente' : 'Rechazado'}
            </span>
          </div>
        ))}
        
        {participants.length === 0 && (
          <p className="text-center text-gray-500 py-8">
            Aún no hay equipos inscritos
          </p>
        )}
      </div>
    </div>
  );
}

// Componente de Bracket/Llaves
function TournamentBracket({ bracket, tournament }) {
  if (!bracket?.bracket) {
    return (
      <div className="card text-center py-12">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">
          Las llaves del torneo se generarán una vez que se cierre el periodo de inscripción
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="text-2xl font-display font-bold text-gray-900 mb-6">
        Llaves del Torneo
      </h2>
      
      {tournament.matches && tournament.matches.length > 0 ? (
        <div className="space-y-6">
          {Object.entries(
            tournament.matches.reduce((acc, match) => {
              if (!acc[match.round]) acc[match.round] = [];
              acc[match.round].push(match);
              return acc;
            }, {})
          ).map(([round, matches]) => (
            <div key={round}>
              <h3 className="font-semibold text-lg text-gray-900 mb-3">{round}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {matches.map((match) => (
                  <div key={match._id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-600">
                        Partido #{match.matchNumber}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        match.status === 'completed' ? 'bg-green-100 text-green-700' :
                        match.status === 'in-progress' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {match.status === 'completed' ? 'Finalizado' :
                         match.status === 'in-progress' ? 'En juego' : 'Pendiente'}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className={`flex items-center justify-between p-2 rounded ${
                        match.winner?.toString() === match.team1?.participantId?.toString()
                          ? 'bg-green-50 border border-green-200'
                          : 'bg-gray-50'
                      }`}>
                        <span className="font-medium">{match.team1?.teamName || 'TBD'}</span>
                        {match.team1?.score && match.team1.score.length > 0 && (
                          <span className="font-bold">{match.team1.score.join('-')}</span>
                        )}
                      </div>
                      
                      <div className={`flex items-center justify-between p-2 rounded ${
                        match.winner?.toString() === match.team2?.participantId?.toString()
                          ? 'bg-green-50 border border-green-200'
                          : 'bg-gray-50'
                      }`}>
                        <span className="font-medium">{match.team2?.teamName || 'TBD'}</span>
                        {match.team2?.score && match.team2.score.length > 0 && (
                          <span className="font-bold">{match.team2.score.join('-')}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 py-8">
          No hay partidos programados aún
        </p>
      )}
    </div>
  );
}

// Modal de Inscripción
function RegistrationModal({ tournament, onClose, onSuccess }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    teamName: '',
    partner: {
      name: '',
      email: '',
      phone: '',
      club: '',
      city: '',
      isMember: false
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axios.post(`/tournaments/${tournament._id}/register`, formData);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al inscribirse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b sticky top-0 bg-white">
          <h2 className="text-2xl font-display font-bold text-gray-900">
            Inscribirse al Torneo
          </h2>
          <p className="text-gray-600 mt-1">{tournament.name}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <div>
            <label className="label">Nombre del Equipo *</label>
            <input
              type="text"
              required
              className="input"
              value={formData.teamName}
              onChange={(e) => setFormData({ ...formData, teamName: e.target.value })}
              placeholder="Ej: Los Pelícanos"
            />
          </div>

          <div className="border-t pt-6">
            <h3 className="font-semibold text-gray-900 mb-4">Información del Compañero</h3>
            
            <div className="space-y-4">
              <div>
                <label className="label">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  className="input"
                  value={formData.partner.name}
                  onChange={(e) => setFormData({
                    ...formData,
                    partner: { ...formData.partner, name: e.target.value }
                  })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Email</label>
                  <input
                    type="email"
                    className="input"
                    value={formData.partner.email}
                    onChange={(e) => setFormData({
                      ...formData,
                      partner: { ...formData.partner, email: e.target.value }
                    })}
                  />
                </div>

                <div>
                  <label className="label">Teléfono</label>
                  <input
                    type="tel"
                    className="input"
                    value={formData.partner.phone}
                    onChange={(e) => setFormData({
                      ...formData,
                      partner: { ...formData.partner, phone: e.target.value }
                    })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Club</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.partner.club}
                    onChange={(e) => setFormData({
                      ...formData,
                      partner: { ...formData.partner, club: e.target.value }
                    })}
                    placeholder="Ej: Pelícanos Vóley Club"
                  />
                </div>

                <div>
                  <label className="label">Ciudad</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.partner.city}
                    onChange={(e) => setFormData({
                      ...formData,
                      partner: { ...formData.partner, city: e.target.value }
                    })}
                    placeholder="Ej: Manizales"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary flex-1"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary flex-1"
              disabled={loading}
            >
              {loading ? 'Inscribiendo...' : 'Confirmar Inscripción'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default TournamentDetailPage;
