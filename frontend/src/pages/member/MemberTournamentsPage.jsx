import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, Calendar, MapPin, Users, CheckCircle, Clock, XCircle } from 'lucide-react';
import axios from '@/api/axios';

function MemberTournamentsPage() {
  const [tournaments, setTournaments] = useState([]);
  const [myTournaments, setMyTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('available');

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      const [allTournamentsRes] = await Promise.all([
        axios.get('/tournaments')
      ]);

      const allTournaments = allTournamentsRes.data.data;
      
      // Filtrar torneos disponibles para inscripción
      const available = allTournaments.filter(t => 
        t.status === 'registration' || t.status === 'upcoming'
      );

      // Obtener torneos en los que estoy inscrito
      const myTournamentsData = [];
      for (const tournament of allTournaments) {
        try {
          const participantsRes = await axios.get(`/tournaments/${tournament._id}/participants`);
          const isRegistered = participantsRes.data.data.participants.some(
            p => p.user?._id === localStorage.getItem('userId')
          );
          if (isRegistered) {
            myTournamentsData.push(tournament);
          }
        } catch (error) {
          console.error('Error checking registration:', error);
        }
      }

      setTournaments(available);
      setMyTournaments(myTournamentsData);
    } catch (error) {
      console.error('Error fetching tournaments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRegistration = async (tournamentId) => {
    if (!confirm('¿Estás seguro de que quieres cancelar tu inscripción?')) {
      return;
    }

    try {
      await axios.delete(`/tournaments/${tournamentId}/register`);
      fetchTournaments();
    } catch (error) {
      console.error('Error cancelling registration:', error);
      alert('Error al cancelar la inscripción');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-display font-bold text-gray-900">Torneos</h1>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <div className="flex gap-8">
          <button
            onClick={() => setActiveTab('available')}
            className={`py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'available'
                ? 'border-primary-500 text-primary-500'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Disponibles ({tournaments.length})
          </button>
          <button
            onClick={() => setActiveTab('my-tournaments')}
            className={`py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'my-tournaments'
                ? 'border-primary-500 text-primary-500'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Mis Torneos ({myTournaments.length})
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'available' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tournaments.map((tournament) => (
            <TournamentCard key={tournament._id} tournament={tournament} />
          ))}
          
          {tournaments.length === 0 && (
            <div className="col-span-full text-center py-12">
              <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No hay torneos disponibles en este momento</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'my-tournaments' && (
        <div className="space-y-4">
          {myTournaments.map((tournament) => (
            <MyTournamentCard
              key={tournament._id}
              tournament={tournament}
              onCancel={handleCancelRegistration}
            />
          ))}
          
          {myTournaments.length === 0 && (
            <div className="card text-center py-12">
              <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No estás inscrito en ningún torneo</p>
              <button
                onClick={() => setActiveTab('available')}
                className="btn btn-primary"
              >
                Ver Torneos Disponibles
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TournamentCard({ tournament }) {
  const registrationOpen = new Date() < new Date(tournament.dates.registrationDeadline);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card hover:shadow-lg transition-shadow"
    >
      <div className="flex items-center justify-between mb-4">
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
          registrationOpen ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
        }`}>
          {registrationOpen ? 'Inscripciones Abiertas' : 'Inscripciones Cerradas'}
        </span>
        <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-semibold">
          {tournament.category === 'masculine' ? 'Masculino' :
           tournament.category === 'feminine' ? 'Femenino' : 'Mixto'}
        </span>
      </div>

      <h3 className="text-xl font-display font-bold text-gray-900 mb-2">
        {tournament.name}
      </h3>
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
        {tournament.description}
      </p>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>{new Date(tournament.dates.start).toLocaleDateString('es-ES')}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="w-4 h-4" />
          <span>{tournament.location.venue}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Users className="w-4 h-4" />
          <span>{tournament.participants?.length || 0} / {tournament.maxTeams} equipos</span>
        </div>
      </div>

      <Link
        to={`/tournaments/${tournament._id}`}
        className="btn btn-primary w-full"
      >
        Ver Detalles
      </Link>
    </motion.div>
  );
}

function MyTournamentCard({ tournament, onCancel }) {
  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <Trophy className="w-6 h-6 text-primary-500" />
            <div>
              <h3 className="text-xl font-display font-bold text-gray-900">
                {tournament.name}
              </h3>
              <span className={`text-sm px-2 py-1 rounded-full ${
                tournament.status === 'upcoming' ? 'bg-blue-100 text-blue-700' :
                tournament.status === 'in-progress' ? 'bg-yellow-100 text-yellow-700' :
                tournament.status === 'completed' ? 'bg-green-100 text-green-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {tournament.status === 'upcoming' ? 'Próximamente' :
                 tournament.status === 'in-progress' ? 'En Progreso' :
                 tournament.status === 'completed' ? 'Finalizado' : tournament.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>{new Date(tournament.dates.start).toLocaleDateString('es-ES')}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>{tournament.location.venue}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Inscrito</span>
            </div>
          </div>

          <div className="flex gap-3">
            <Link
              to={`/tournaments/${tournament._id}`}
              className="btn btn-primary"
            >
              Ver Detalles y Llaves
            </Link>
            
            {tournament.status === 'upcoming' && (
              <button
                onClick={() => onCancel(tournament._id)}
                className="btn btn-secondary"
              >
                Cancelar Inscripción
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MemberTournamentsPage;
