import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Users, 
  Trophy, 
  Calendar,
  MapPin,
  Play,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  RefreshCw
} from 'lucide-react';
import axios from '@/api/axios';

function AdminTournamentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tournament, setTournament] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [showMatchModal, setShowMatchModal] = useState(false);

  useEffect(() => {
    fetchTournamentData();
  }, [id]);

  const fetchTournamentData = async () => {
    try {
      const [tournamentRes, participantsRes, statsRes] = await Promise.all([
        axios.get(`/tournaments/${id}`),
        axios.get(`/tournaments/${id}/participants`),
        axios.get(`/tournaments/${id}/stats`)
      ]);

      setTournament(tournamentRes.data.data);
      setParticipants(participantsRes.data.data.participants);
      setStats(statsRes.data.data);
    } catch (error) {
      console.error('Error fetching tournament:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateBracket = async () => {
    if (!confirm('¿Generar las llaves del torneo? Esto no se puede deshacer.')) {
      return;
    }

    try {
      await axios.post(`/tournaments/${id}/generate-bracket`);
      alert('Llaves generadas exitosamente');
      fetchTournamentData();
    } catch (error) {
      console.error('Error generating bracket:', error);
      alert('Error al generar las llaves');
    }
  };

  const handleUpdateMatchResult = async (matchId, data) => {
    try {
      await axios.patch(`/tournaments/${id}/matches/${matchId}/result`, data);
      alert('Resultado actualizado exitosamente');
      setShowMatchModal(false);
      fetchTournamentData();
    } catch (error) {
      console.error('Error updating match:', error);
      alert('Error al actualizar el resultado');
    }
  };

  const handleStartMatch = async (matchId) => {
    try {
      await axios.patch(`/tournaments/${id}/matches/${matchId}/start`);
      fetchTournamentData();
    } catch (error) {
      console.error('Error starting match:', error);
      alert('Error al iniciar el partido');
    }
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
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Torneo no encontrado</h2>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/tournaments')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900">
              {tournament.name}
            </h1>
            <p className="text-gray-600">{tournament.description}</p>
          </div>
        </div>
        
        <div className="flex gap-3">
          {!tournament.bracket && participants.length >= 2 && (
            <button
              onClick={handleGenerateBracket}
              className="btn btn-primary"
            >
              <Trophy className="w-5 h-5" />
              Generar Llaves
            </button>
          )}
          <button
            onClick={() => navigate(`/admin/tournaments/${id}/edit`)}
            className="btn btn-secondary"
          >
            <Edit className="w-5 h-5" />
            Editar
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Equipos</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.totalParticipants || 0} / {tournament.maxTeams}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Trophy className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Partidos</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.totalMatches || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Play className="w-6 h-6 text-yellow-500" />
            </div>
            <div>
              <p className="text-sm text-gray-600">En Progreso</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.inProgressMatches || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Completados</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.completedMatches || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <div className="flex gap-8">
          {['overview', 'participants', 'bracket', 'matches'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-primary-500 text-primary-500'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab === 'overview' ? 'Resumen' :
               tab === 'participants' ? 'Participantes' :
               tab === 'bracket' ? 'Llaves' : 'Partidos'}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div>
        {activeTab === 'overview' && (
          <OverviewTab tournament={tournament} stats={stats} />
        )}
        
        {activeTab === 'participants' && (
          <ParticipantsTab participants={participants} />
        )}
        
        {activeTab === 'bracket' && (
          <BracketTab 
            tournament={tournament} 
            onGenerateBracket={handleGenerateBracket}
          />
        )}
        
        {activeTab === 'matches' && (
          <MatchesTab 
            tournament={tournament}
            onStartMatch={handleStartMatch}
            onEditMatch={(match) => {
              setSelectedMatch(match);
              setShowMatchModal(true);
            }}
          />
        )}
      </div>

      {/* Match Result Modal */}
      {showMatchModal && selectedMatch && (
        <MatchResultModal
          match={selectedMatch}
          tournament={tournament}
          onClose={() => {
            setShowMatchModal(false);
            setSelectedMatch(null);
          }}
          onSave={handleUpdateMatchResult}
        />
      )}
    </div>
  );
}

// Overview Tab Component
function OverviewTab({ tournament, stats }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="card">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Información del Torneo</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-600">Fecha de inicio</p>
              <p className="font-semibold">
                {new Date(tournament.dates.start).toLocaleDateString('es-ES')}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-600">Sede</p>
              <p className="font-semibold">{tournament.location.venue}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Trophy className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-600">Modalidad</p>
              <p className="font-semibold capitalize">{tournament.modality}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-600">Formato</p>
              <p className="font-semibold">{tournament.format}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Progreso del Torneo</h3>
        {stats && (
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Partidos Completados</span>
                <span className="font-semibold">
                  {stats.completedMatches} / {stats.totalMatches}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 rounded-full h-2 transition-all"
                  style={{
                    width: `${stats.totalMatches > 0 
                      ? (stats.completedMatches / stats.totalMatches) * 100 
                      : 0}%`
                  }}
                ></div>
              </div>
            </div>

            {stats.currentRound && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-600 font-semibold">Ronda Actual</p>
                <p className="text-lg font-bold text-blue-900">{stats.currentRound}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Participants Tab Component
function ParticipantsTab({ participants }) {
  return (
    <div className="card">
      <h3 className="text-xl font-bold text-gray-900 mb-6">
        Equipos Inscritos ({participants.length})
      </h3>
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
      </div>
    </div>
  );
}

// Bracket Tab Component
function BracketTab({ tournament, onGenerateBracket }) {
  if (!tournament.bracket || !tournament.matches || tournament.matches.length === 0) {
    return (
      <div className="card text-center py-12">
        <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Las llaves aún no se han generado
        </h3>
        <p className="text-gray-600 mb-6">
          Genera las llaves del torneo para comenzar los partidos
        </p>
        <button onClick={onGenerateBracket} className="btn btn-primary">
          <Trophy className="w-5 h-5" />
          Generar Llaves
        </button>
      </div>
    );
  }

  // Agrupar partidos por ronda
  const matchesByRound = tournament.matches.reduce((acc, match) => {
    if (!acc[match.round]) acc[match.round] = [];
    acc[match.round].push(match);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {Object.entries(matchesByRound).map(([round, matches]) => (
        <div key={round} className="card">
          <h3 className="text-xl font-bold text-gray-900 mb-4">{round}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matches.map((match) => (
              <div key={match._id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-gray-600">
                    Partido #{match.matchNumber}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    match.status === 'completed' ? 'bg-green-100 text-green-700' :
                    match.status === 'in-progress' ? 'bg-yellow-100 text-yellow-700' :
                    match.status === 'waiting' ? 'bg-gray-100 text-gray-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {match.status === 'completed' ? 'Finalizado' :
                     match.status === 'in-progress' ? 'En juego' :
                     match.status === 'waiting' ? 'Esperando' : 'Pendiente'}
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
  );
}

// Matches Tab Component
function MatchesTab({ tournament, onStartMatch, onEditMatch }) {
  if (!tournament.matches || tournament.matches.length === 0) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-600">No hay partidos disponibles</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tournament.matches.map((match) => (
        <div key={match._id} className="card">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="font-semibold text-gray-900">
                  {match.round} - Partido #{match.matchNumber}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  match.status === 'completed' ? 'bg-green-100 text-green-700' :
                  match.status === 'in-progress' ? 'bg-yellow-100 text-yellow-700' :
                  match.status === 'waiting' ? 'bg-gray-100 text-gray-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {match.status === 'completed' ? 'Finalizado' :
                   match.status === 'in-progress' ? 'En juego' :
                   match.status === 'waiting' ? 'Esperando' : 'Pendiente'}
                </span>
              </div>
              
              <div className="flex items-center gap-4">
                <span className="font-medium">{match.team1?.teamName || 'TBD'}</span>
                {match.team1?.score && match.team1.score.length > 0 && (
                  <span className="font-bold">{match.team1.score.join('-')}</span>
                )}
                <span className="text-gray-400">vs</span>
                {match.team2?.score && match.team2.score.length > 0 && (
                  <span className="font-bold">{match.team2.score.join('-')}</span>
                )}
                <span className="font-medium">{match.team2?.teamName || 'TBD'}</span>
              </div>
            </div>

            <div className="flex gap-2">
              {match.status === 'pending' && (
                <button
                  onClick={() => onStartMatch(match._id)}
                  className="btn btn-secondary btn-sm"
                >
                  <Play className="w-4 h-4" />
                  Iniciar
                </button>
              )}
              {(match.status === 'pending' || match.status === 'in-progress') && (
                <button
                  onClick={() => onEditMatch(match)}
                  className="btn btn-primary btn-sm"
                >
                  <Edit className="w-4 h-4" />
                  Actualizar Resultado
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Match Result Modal Component
function MatchResultModal({ match, tournament, onClose, onSave }) {
  const [team1Score, setTeam1Score] = useState(match.team1?.score || []);
  const [team2Score, setTeam2Score] = useState(match.team2?.score || []);
  const [winner, setWinner] = useState(match.winner || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(match._id, {
      team1Score,
      team2Score,
      winnerId: winner
    });
  };

  const addSet = () => {
    setTeam1Score([...team1Score, 0]);
    setTeam2Score([...team2Score, 0]);
  };

  const removeSet = (index) => {
    setTeam1Score(team1Score.filter((_, i) => i !== index));
    setTeam2Score(team2Score.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b">
          <h2 className="text-2xl font-display font-bold text-gray-900">
            Actualizar Resultado
          </h2>
          <p className="text-gray-600 mt-1">
            {match.round} - Partido #{match.matchNumber}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Sets</h3>
              <button
                type="button"
                onClick={addSet}
                className="btn btn-secondary btn-sm"
              >
                Agregar Set
              </button>
            </div>

            <div className="space-y-3">
              {team1Score.map((_, index) => (
                <div key={index} className="flex items-center gap-4">
                  <span className="text-sm font-semibold text-gray-600 w-16">
                    Set {index + 1}
                  </span>
                  <div className="flex-1 flex items-center gap-4">
                    <div className="flex-1">
                      <label className="text-sm text-gray-600 block mb-1">
                        {match.team1?.teamName}
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={team1Score[index]}
                        onChange={(e) => {
                          const newScores = [...team1Score];
                          newScores[index] = parseInt(e.target.value) || 0;
                          setTeam1Score(newScores);
                        }}
                        className="input"
                        required
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-sm text-gray-600 block mb-1">
                        {match.team2?.teamName}
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={team2Score[index]}
                        onChange={(e) => {
                          const newScores = [...team2Score];
                          newScores[index] = parseInt(e.target.value) || 0;
                          setTeam2Score(newScores);
                        }}
                        className="input"
                        required
                      />
                    </div>
                  </div>
                  {team1Score.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSet(index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Ganador *</label>
            <select
              value={winner}
              onChange={(e) => setWinner(e.target.value)}
              className="input"
              required
            >
              <option value="">Seleccionar ganador</option>
              <option value={match.team1?.participantId}>
                {match.team1?.teamName}
              </option>
              <option value={match.team2?.participantId}>
                {match.team2?.teamName}
              </option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary flex-1"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary flex-1"
            >
              Guardar Resultado
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default AdminTournamentDetailPage;
