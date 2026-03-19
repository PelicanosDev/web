import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Calendar, MapPin, Users, CheckCircle } from 'lucide-react';
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
        <div className="w-10 h-10 border-4 border-slate-200 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <span className="inline-block text-primary-600 text-xs font-bold uppercase tracking-widest bg-primary-50 px-3 py-1.5 mb-3">
          Competencia
        </span>
        <h1 className="font-display font-black uppercase text-slate-900 text-3xl leading-none">
          Torneos
        </h1>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <div className="flex gap-8">
          <button
            onClick={() => setActiveTab('available')}
            className={`py-3 transition-colors ${
              activeTab === 'available'
                ? 'border-b-2 border-primary-500 text-primary-500 font-display font-bold uppercase tracking-wide'
                : 'border-b-2 border-transparent text-slate-500 hover:text-slate-900 font-display font-bold uppercase tracking-wide'
            }`}
          >
            Disponibles ({tournaments.length})
          </button>
          <button
            onClick={() => setActiveTab('my-tournaments')}
            className={`py-3 transition-colors ${
              activeTab === 'my-tournaments'
                ? 'border-b-2 border-primary-500 text-primary-500 font-display font-bold uppercase tracking-wide'
                : 'border-b-2 border-transparent text-slate-500 hover:text-slate-900 font-display font-bold uppercase tracking-wide'
            }`}
          >
            Mis Torneos ({myTournaments.length})
          </button>
        </div>
      </div>

      {/* Torneos Disponibles */}
      {activeTab === 'available' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tournaments.map((tournament) => (
            <TournamentCard key={tournament._id} tournament={tournament} />
          ))}

          {tournaments.length === 0 && (
            <div className="col-span-full text-center py-12">
              <Trophy className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 font-medium">No hay torneos disponibles en este momento</p>
            </div>
          )}
        </div>
      )}

      {/* Mis Torneos */}
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
            <div className="bg-white border border-slate-100 shadow-sm p-6 text-center py-12">
              <Trophy className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 mb-4 font-medium">No estás inscrito en ningún torneo</p>
              <button
                onClick={() => setActiveTab('available')}
                className="inline-flex items-center gap-2 bg-primary-500 text-white font-display font-bold uppercase tracking-wide px-5 py-2.5 hover:bg-primary-600 active:scale-95 transition-all cursor-pointer"
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
    <div className="bg-white border border-slate-100 shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <span className={`px-2 py-1 text-xs font-bold uppercase tracking-widest ${
          registrationOpen
            ? 'bg-green-100 text-green-700'
            : 'bg-slate-100 text-slate-600'
        }`}>
          {registrationOpen ? 'Inscripciones Abiertas' : 'Inscripciones Cerradas'}
        </span>
        <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs font-bold uppercase tracking-widest">
          {tournament.category === 'masculine' ? 'Masculino' :
           tournament.category === 'feminine' ? 'Femenino' : 'Mixto'}
        </span>
      </div>

      <h3 className="font-display font-black uppercase text-slate-900 text-xl mb-2">
        {tournament.name}
      </h3>
      <p className="text-slate-600 text-sm mb-4 line-clamp-2">
        {tournament.description}
      </p>

      <div className="space-y-2 mb-5">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span>{new Date(tournament.dates.start).toLocaleDateString('es-ES')}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <MapPin className="w-4 h-4 text-slate-400" />
          <span>{tournament.location.venue}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Users className="w-4 h-4 text-slate-400" />
          <span>{tournament.participants?.length || 0} / {tournament.maxTeams} equipos</span>
        </div>
      </div>

      <Link
        to={`/tournaments/${tournament._id}`}
        className="inline-flex items-center justify-center gap-2 w-full bg-primary-500 text-white font-display font-bold uppercase tracking-wide px-5 py-2.5 hover:bg-primary-600 active:scale-95 transition-all cursor-pointer"
      >
        Ver Detalles
      </Link>
    </div>
  );
}

function MyTournamentCard({ tournament, onCancel }) {
  const statusLabel = {
    upcoming: 'Próximamente',
    'in-progress': 'En Progreso',
    completed: 'Finalizado',
  };
  const statusStyle = {
    upcoming: 'bg-blue-100 text-blue-700',
    'in-progress': 'bg-yellow-100 text-yellow-700',
    completed: 'bg-green-100 text-green-700',
  };

  return (
    <div className="bg-white border border-slate-100 shadow-sm p-6 border-l-4 border-primary-500">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <Trophy className="w-6 h-6 text-primary-500" />
            <div>
              <h3 className="font-display font-black uppercase text-slate-900 text-xl">
                {tournament.name}
              </h3>
              <span className={`px-2 py-1 text-xs font-bold uppercase tracking-widest ${statusStyle[tournament.status] || 'bg-slate-100 text-slate-600'}`}>
                {statusLabel[tournament.status] || tournament.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>{new Date(tournament.dates.start).toLocaleDateString('es-ES')}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span>{tournament.location.venue}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="font-bold text-green-700">Inscrito</span>
            </div>
          </div>

          <div className="flex gap-3 flex-wrap">
            <Link
              to={`/tournaments/${tournament._id}`}
              className="inline-flex items-center gap-2 bg-primary-500 text-white font-display font-bold uppercase tracking-wide px-5 py-2.5 hover:bg-primary-600 active:scale-95 transition-all cursor-pointer"
            >
              Ver Detalles y Llaves
            </Link>

            {tournament.status === 'upcoming' && (
              <button
                onClick={() => onCancel(tournament._id)}
                className="inline-flex items-center gap-2 border-2 border-slate-200 text-slate-700 font-display font-bold uppercase tracking-wide px-5 py-2.5 hover:border-slate-400 transition-all cursor-pointer"
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
