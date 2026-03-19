import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Plus, Edit, Trash2, X, Calendar, MapPin, Users, Settings, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from '@/api/axios';
import dayjs from 'dayjs';

function AdminTournamentsPage() {
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTournament, setEditingTournament] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'mixed',
    level: 'recreational',
    format: '4v4',
    modality: 'standard',
    startDate: '',
    endDate: '',
    registrationDeadline: '',
    venue: '',
    address: '',
    maxTeams: 16,
    totalSets: 3,
    setsToWin: 2,
    pointsPerSet: 21,
    finalSetPoints: 15,
    pointDifference: 2,
    hasTimeLimit: false,
    timeLimitMinutes: 0,
    rules: '',
    // Fase de grupos
    hasGroups: false,
    numGroups: 2,
    teamsToAdvancePerGroup: 2,
    groupClassMethod: 'points',
    groupPoints_win2_0: 3,
    groupPoints_win2_1: 2,
    groupPoints_lose2_1: 1,
    groupPoints_lose2_0: 0,
    groupCoefType: 'sets',
  });

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      const response = await axios.get('/tournaments');
      setTournaments(response.data.data);
    } catch (error) {
      console.error('Error fetching tournaments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        level: formData.level,
        format: formData.format,
        modality: formData.modality,
        dates: {
          start: formData.startDate,
          end: formData.endDate,
          registrationDeadline: formData.registrationDeadline,
        },
        location: {
          venue: formData.venue,
          address: formData.address,
        },
        maxTeams: parseInt(formData.maxTeams),
        matchConfig: {
          totalSets: parseInt(formData.totalSets),
          setsToWin: parseInt(formData.setsToWin),
          pointsPerSet: parseInt(formData.pointsPerSet),
          finalSetPoints: parseInt(formData.finalSetPoints),
          pointDifference: parseInt(formData.pointDifference),
          hasTimeLimit: formData.hasTimeLimit,
          timeLimitMinutes: parseInt(formData.timeLimitMinutes) || 0,
        },
        rules: formData.rules,
        status: 'registration',
        hasGroups: formData.hasGroups,
        ...(formData.hasGroups && {
          groupConfig: {
            numGroups: parseInt(formData.numGroups),
            teamsToAdvancePerGroup: parseInt(formData.teamsToAdvancePerGroup),
            classificationMethod: formData.groupClassMethod,
            pointsConfig: {
              win2_0:  parseInt(formData.groupPoints_win2_0),
              win2_1:  parseInt(formData.groupPoints_win2_1),
              lose2_1: parseInt(formData.groupPoints_lose2_1),
              lose2_0: parseInt(formData.groupPoints_lose2_0),
            },
            coefficientType: formData.groupCoefType,
          }
        }),
      };

      if (editingTournament) {
        await axios.put(`/tournaments/${editingTournament._id}`, payload);
      } else {
        await axios.post('/tournaments', payload);
      }
      fetchTournaments();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving tournament:', error);
      alert('Error al guardar el torneo');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este torneo?')) return;

    try {
      await axios.delete(`/tournaments/${id}`);
      fetchTournaments();
    } catch (error) {
      console.error('Error deleting tournament:', error);
      alert('Error al eliminar el torneo');
    }
  };

  const handleEdit = (tournament) => {
    setEditingTournament(tournament);
    setFormData({
      name: tournament.name,
      description: tournament.description || '',
      category: tournament.category,
      level: tournament.level,
      format: tournament.format,
      modality: tournament.modality || 'standard',
      startDate: dayjs(tournament.dates.start).format('YYYY-MM-DDTHH:mm'),
      endDate: dayjs(tournament.dates.end).format('YYYY-MM-DDTHH:mm'),
      registrationDeadline: dayjs(tournament.dates.registrationDeadline).format('YYYY-MM-DDTHH:mm'),
      venue: tournament.location.venue,
      address: tournament.location.address || '',
      maxTeams: tournament.maxTeams || 16,
      totalSets: tournament.matchConfig?.totalSets || 3,
      setsToWin: tournament.matchConfig?.setsToWin || 2,
      pointsPerSet: tournament.matchConfig?.pointsPerSet || 21,
      finalSetPoints: tournament.matchConfig?.finalSetPoints || 15,
      pointDifference: tournament.matchConfig?.pointDifference || 2,
      hasTimeLimit: tournament.matchConfig?.hasTimeLimit || false,
      timeLimitMinutes: tournament.matchConfig?.timeLimitMinutes || 0,
      rules: tournament.rules || '',
      hasGroups: tournament.hasGroups || false,
      numGroups: tournament.groupConfig?.numGroups || 2,
      teamsToAdvancePerGroup: tournament.groupConfig?.teamsToAdvancePerGroup || 2,
      groupClassMethod: tournament.groupConfig?.classificationMethod || 'points',
      groupPoints_win2_0: tournament.groupConfig?.pointsConfig?.win2_0 ?? 3,
      groupPoints_win2_1: tournament.groupConfig?.pointsConfig?.win2_1 ?? 2,
      groupPoints_lose2_1: tournament.groupConfig?.pointsConfig?.lose2_1 ?? 1,
      groupPoints_lose2_0: tournament.groupConfig?.pointsConfig?.lose2_0 ?? 0,
      groupCoefType: tournament.groupConfig?.coefficientType || 'sets',
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTournament(null);
    setFormData({
      name: '',
      description: '',
      category: 'mixed',
      level: 'recreational',
      format: '4v4',
      modality: 'standard',
      startDate: '',
      endDate: '',
      registrationDeadline: '',
      venue: '',
      address: '',
      maxTeams: 16,
      totalSets: 3,
      setsToWin: 2,
      pointsPerSet: 21,
      finalSetPoints: 15,
      pointDifference: 2,
      hasTimeLimit: false,
      timeLimitMinutes: 0,
      rules: '',
      hasGroups: false,
      numGroups: 2,
      teamsToAdvancePerGroup: 2,
      groupClassMethod: 'points',
      groupPoints_win2_0: 3,
      groupPoints_win2_1: 2,
      groupPoints_lose2_1: 1,
      groupPoints_lose2_0: 0,
      groupCoefType: 'sets',
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const getStatusColor = (status) => {
    const colors = {
      'upcoming': 'bg-sky-100 text-sky-800',
      'registration': 'bg-green-100 text-green-800',
      'in-progress': 'bg-amber-100 text-amber-800',
      'completed': 'bg-slate-100 text-slate-700',
      'cancelled': 'bg-red-100 text-red-800',
    };
    return colors[status] || colors.upcoming;
  };

  const inProgressTournaments = tournaments.filter(t => t.status === 'in-progress');
  const upcomingTournaments = tournaments.filter(t => t.status === 'registration' || t.status === 'upcoming');
  const completedTournaments = tournaments.filter(t => t.status === 'completed');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="inline-block text-primary-600 text-xs font-bold uppercase tracking-widest bg-primary-50 px-3 py-1.5 mb-3">
            Administración
          </span>
          <h1 className="font-display font-black uppercase text-slate-900 text-3xl leading-none">Gestión de Torneos</h1>
          <p className="text-slate-500 mt-1">Visualiza y organiza todos los torneos de vóley playa</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 bg-primary-500 text-white font-display font-bold uppercase tracking-wide px-5 py-2.5 hover:bg-primary-600 active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          Crear Nuevo Torneo
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">En Juego</p>
              <p className="text-4xl font-display font-black text-green-400">{inProgressTournaments.length}</p>
              <p className="text-sm text-slate-400 mt-1">Torneos activos ahora</p>
            </div>
            <Trophy className="w-12 h-12 text-green-500 opacity-30" />
          </div>
        </div>

        <div className="bg-slate-900 p-6 border-l-4 border-primary-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Próximos</p>
              <p className="text-4xl font-display font-black text-primary-400">{upcomingTournaments.length}</p>
              <p className="text-sm text-slate-400 mt-1">Abiertos a inscripción</p>
            </div>
            <Trophy className="w-12 h-12 text-primary-500 opacity-30" />
          </div>
        </div>

        <div className="bg-slate-900 p-6 border-l-4 border-sky-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Finalizados</p>
              <p className="text-4xl font-display font-black text-sky-400">{completedTournaments.length}</p>
              <p className="text-sm text-slate-400 mt-1">En el último año</p>
            </div>
            <Trophy className="w-12 h-12 text-sky-500 opacity-30" />
          </div>
        </div>
      </div>

      {tournaments.length === 0 ? (
        <div className="bg-white border border-slate-100 shadow-sm text-center py-16">
          <Trophy className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-display font-black uppercase text-slate-900 mb-2">No hay torneos</h3>
          <p className="text-slate-500 mb-4">Crea tu primer torneo para comenzar</p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 bg-primary-500 text-white font-display font-bold uppercase tracking-wide px-5 py-2.5 hover:bg-primary-600 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            Crear Torneo
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {tournaments.map((tournament) => (
            <motion.div
              key={tournament._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-slate-100 shadow-sm p-6 border-l-4 border-primary-500"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-slate-900 p-6 flex items-center justify-center relative">
                  <Trophy className="w-12 h-12 text-primary-400" />
                  <div className={`absolute top-3 right-3 px-2 py-1 text-xs font-bold uppercase tracking-widest ${getStatusColor(tournament.status)}`}>
                    {tournament.status}
                  </div>
                </div>
                <div className="flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-2xl font-display font-black uppercase text-slate-900">
                        {tournament.name}
                      </h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(tournament)}
                          className="p-2 hover:bg-slate-100 transition-colors"
                        >
                          <Edit className="w-4 h-4 text-slate-500" />
                        </button>
                        <button
                          onClick={() => handleDelete(tournament._id)}
                          className="p-2 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </div>
                    {tournament.description && (
                      <p className="text-slate-500 text-sm mb-3">{tournament.description}</p>
                    )}
                    <div className="space-y-2 text-sm text-slate-500">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{tournament.location.venue}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{dayjs(tournament.dates.start).format('MMMM D, YYYY')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>{tournament.teams?.length || 0} / {tournament.maxTeams} equipos</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Settings className="w-4 h-4" />
                        <span>
                          {tournament.format} • {tournament.modality} •{' '}
                          Mejor de {tournament.matchConfig?.totalSets || 3} sets
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => navigate(`/admin/tournaments/${tournament._id}`)}
                      className="inline-flex items-center justify-center gap-2 bg-primary-500 text-white font-display font-bold uppercase tracking-wide px-5 py-2.5 hover:bg-primary-600 active:scale-95 transition-all cursor-pointer flex-1"
                    >
                      <Eye className="w-4 h-4" />
                      Gestionar Torneo
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
                <h2 className="text-2xl font-display font-black uppercase text-slate-900">
                  {editingTournament ? 'Editar Torneo' : 'Crear Nuevo Torneo'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label htmlFor="name" className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Nombre del Torneo *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border-2 border-slate-200 focus:border-primary-500 outline-none transition-colors text-slate-900 bg-white"
                      placeholder="Copa Verano 2024"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="description" className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Descripción</label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={2}
                      className="w-full px-4 py-3 border-2 border-slate-200 focus:border-primary-500 outline-none transition-colors text-slate-900 bg-white resize-none"
                      placeholder="Descripción del torneo..."
                    />
                  </div>

                  <div>
                    <label htmlFor="category" className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Categoría *</label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border-2 border-slate-200 focus:border-primary-500 outline-none transition-colors text-slate-900 bg-white"
                    >
                      <option value="masculine">Masculino</option>
                      <option value="feminine">Femenino</option>
                      <option value="mixed">Mixto</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="level" className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Nivel *</label>
                    <select
                      id="level"
                      name="level"
                      value={formData.level}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border-2 border-slate-200 focus:border-primary-500 outline-none transition-colors text-slate-900 bg-white"
                    >
                      <option value="recreational">Recreativo</option>
                      <option value="amateur">Amateur</option>
                      <option value="professional">Profesional</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="format" className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Formato *</label>
                    <select
                      id="format"
                      name="format"
                      value={formData.format}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border-2 border-slate-200 focus:border-primary-500 outline-none transition-colors text-slate-900 bg-white"
                    >
                      <option value="2v2">2v2 (Duplas)</option>
                      <option value="4v4">4v4</option>
                      <option value="6v6">6v6</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="modality" className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Modalidad *</label>
                    <select
                      id="modality"
                      name="modality"
                      value={formData.modality}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border-2 border-slate-200 focus:border-primary-500 outline-none transition-colors text-slate-900 bg-white"
                    >
                      <option value="standard">Standard (Eliminación)</option>
                      <option value="king-of-court">Rey de Cancha</option>
                      <option value="round-robin">Round Robin (Todos contra todos)</option>
                      <option value="single-elimination">Eliminación Simple</option>
                      <option value="double-elimination">Eliminación Doble</option>
                    </select>
                  </div>
                </div>

                {/* Fase de Grupos */}
                <div className="border-t border-slate-100 pt-6">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Fase de Grupos</p>
                  <div className="flex items-center gap-3 mb-4">
                    <input
                      type="checkbox"
                      id="hasGroups"
                      name="hasGroups"
                      checked={formData.hasGroups}
                      onChange={handleChange}
                      className="w-4 h-4 text-primary-500 rounded focus:ring-2 focus:ring-primary-200"
                    />
                    <label htmlFor="hasGroups" className="text-sm text-slate-700">
                      Incluir fase de grupos antes de las llaves
                    </label>
                  </div>

                  {formData.hasGroups && (
                    <div className="space-y-4 pl-4 border-l-2 border-primary-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Número de grupos</label>
                          <input
                            type="number"
                            name="numGroups"
                            value={formData.numGroups}
                            onChange={handleChange}
                            min="2"
                            max="8"
                            className="w-full px-4 py-3 border-2 border-slate-200 focus:border-primary-500 outline-none transition-colors text-slate-900 bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Equipos que clasifican por grupo</label>
                          <input
                            type="number"
                            name="teamsToAdvancePerGroup"
                            value={formData.teamsToAdvancePerGroup}
                            onChange={handleChange}
                            min="1"
                            max="8"
                            className="w-full px-4 py-3 border-2 border-slate-200 focus:border-primary-500 outline-none transition-colors text-slate-900 bg-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Método de clasificación</label>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="groupClassMethod"
                              value="points"
                              checked={formData.groupClassMethod === 'points'}
                              onChange={handleChange}
                              className="w-4 h-4 text-primary-500"
                            />
                            <span className="text-sm text-slate-700">Por Puntos</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="groupClassMethod"
                              value="coefficient"
                              checked={formData.groupClassMethod === 'coefficient'}
                              onChange={handleChange}
                              className="w-4 h-4 text-primary-500"
                            />
                            <span className="text-sm text-slate-700">Por Coeficiente</span>
                          </label>
                        </div>
                      </div>

                      {formData.groupClassMethod === 'points' && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Victoria 2-0 (pts)</label>
                            <input type="number" name="groupPoints_win2_0" value={formData.groupPoints_win2_0} onChange={handleChange} min="0" className="w-full px-4 py-3 border-2 border-slate-200 focus:border-primary-500 outline-none transition-colors text-slate-900 bg-white" />
                          </div>
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Victoria 2-1 (pts)</label>
                            <input type="number" name="groupPoints_win2_1" value={formData.groupPoints_win2_1} onChange={handleChange} min="0" className="w-full px-4 py-3 border-2 border-slate-200 focus:border-primary-500 outline-none transition-colors text-slate-900 bg-white" />
                          </div>
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Derrota 2-1 (pts)</label>
                            <input type="number" name="groupPoints_lose2_1" value={formData.groupPoints_lose2_1} onChange={handleChange} min="0" className="w-full px-4 py-3 border-2 border-slate-200 focus:border-primary-500 outline-none transition-colors text-slate-900 bg-white" />
                          </div>
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Derrota 0-2 (pts)</label>
                            <input type="number" name="groupPoints_lose2_0" value={formData.groupPoints_lose2_0} onChange={handleChange} min="0" className="w-full px-4 py-3 border-2 border-slate-200 focus:border-primary-500 outline-none transition-colors text-slate-900 bg-white" />
                          </div>
                        </div>
                      )}

                      {formData.groupClassMethod === 'coefficient' && (
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Tipo de coeficiente</label>
                          <select name="groupCoefType" value={formData.groupCoefType} onChange={handleChange} className="w-full px-4 py-3 border-2 border-slate-200 focus:border-primary-500 outline-none transition-colors text-slate-900 bg-white">
                            <option value="sets">Sets (SF/SA)</option>
                            <option value="points">Puntos (PF/PA)</option>
                          </select>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-100 pt-6">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Configuración de Partidos</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="totalSets" className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Total de Sets *</label>
                      <input
                        type="number"
                        id="totalSets"
                        name="totalSets"
                        value={formData.totalSets}
                        onChange={handleChange}
                        min="1"
                        max="5"
                        required
                        className="w-full px-4 py-3 border-2 border-slate-200 focus:border-primary-500 outline-none transition-colors text-slate-900 bg-white"
                      />
                    </div>

                    <div>
                      <label htmlFor="setsToWin" className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Sets para Ganar *</label>
                      <input
                        type="number"
                        id="setsToWin"
                        name="setsToWin"
                        value={formData.setsToWin}
                        onChange={handleChange}
                        min="1"
                        max="3"
                        required
                        className="w-full px-4 py-3 border-2 border-slate-200 focus:border-primary-500 outline-none transition-colors text-slate-900 bg-white"
                      />
                    </div>

                    <div>
                      <label htmlFor="pointsPerSet" className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Puntos por Set *</label>
                      <input
                        type="number"
                        id="pointsPerSet"
                        name="pointsPerSet"
                        value={formData.pointsPerSet}
                        onChange={handleChange}
                        min="11"
                        max="30"
                        required
                        className="w-full px-4 py-3 border-2 border-slate-200 focus:border-primary-500 outline-none transition-colors text-slate-900 bg-white"
                      />
                    </div>

                    <div>
                      <label htmlFor="finalSetPoints" className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Puntos Set Final *</label>
                      <input
                        type="number"
                        id="finalSetPoints"
                        name="finalSetPoints"
                        value={formData.finalSetPoints}
                        onChange={handleChange}
                        min="11"
                        max="21"
                        required
                        className="w-full px-4 py-3 border-2 border-slate-200 focus:border-primary-500 outline-none transition-colors text-slate-900 bg-white"
                      />
                    </div>

                    <div>
                      <label htmlFor="pointDifference" className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Diferencia de Puntos *</label>
                      <input
                        type="number"
                        id="pointDifference"
                        name="pointDifference"
                        value={formData.pointDifference}
                        onChange={handleChange}
                        min="1"
                        max="3"
                        required
                        className="w-full px-4 py-3 border-2 border-slate-200 focus:border-primary-500 outline-none transition-colors text-slate-900 bg-white"
                      />
                    </div>

                    <div>
                      <label htmlFor="timeLimitMinutes" className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Límite de Tiempo (min)</label>
                      <input
                        type="number"
                        id="timeLimitMinutes"
                        name="timeLimitMinutes"
                        value={formData.timeLimitMinutes}
                        onChange={handleChange}
                        min="0"
                        className="w-full px-4 py-3 border-2 border-slate-200 focus:border-primary-500 outline-none transition-colors text-slate-900 bg-white"
                        placeholder="0 = sin límite"
                      />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="hasTimeLimit"
                      name="hasTimeLimit"
                      checked={formData.hasTimeLimit}
                      onChange={handleChange}
                      className="w-4 h-4 text-primary-500 rounded focus:ring-2 focus:ring-primary-200"
                    />
                    <label htmlFor="hasTimeLimit" className="text-sm text-slate-700">
                      Activar límite de tiempo por partido
                    </label>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-6">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Fechas y Ubicación</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="startDate" className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Fecha Inicio *</label>
                      <input
                        type="datetime-local"
                        id="startDate"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border-2 border-slate-200 focus:border-primary-500 outline-none transition-colors text-slate-900 bg-white"
                      />
                    </div>

                    <div>
                      <label htmlFor="endDate" className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Fecha Fin *</label>
                      <input
                        type="datetime-local"
                        id="endDate"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border-2 border-slate-200 focus:border-primary-500 outline-none transition-colors text-slate-900 bg-white"
                      />
                    </div>

                    <div>
                      <label htmlFor="registrationDeadline" className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Límite Inscripción *</label>
                      <input
                        type="datetime-local"
                        id="registrationDeadline"
                        name="registrationDeadline"
                        value={formData.registrationDeadline}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border-2 border-slate-200 focus:border-primary-500 outline-none transition-colors text-slate-900 bg-white"
                      />
                    </div>

                    <div>
                      <label htmlFor="venue" className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Sede *</label>
                      <input
                        type="text"
                        id="venue"
                        name="venue"
                        value={formData.venue}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border-2 border-slate-200 focus:border-primary-500 outline-none transition-colors text-slate-900 bg-white"
                        placeholder="Playa Grande"
                      />
                    </div>

                    <div>
                      <label htmlFor="address" className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Dirección</label>
                      <input
                        type="text"
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-slate-200 focus:border-primary-500 outline-none transition-colors text-slate-900 bg-white"
                        placeholder="Cancha 1-4, Manizales"
                      />
                    </div>

                    <div>
                      <label htmlFor="maxTeams" className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Máximo Equipos *</label>
                      <input
                        type="number"
                        id="maxTeams"
                        name="maxTeams"
                        value={formData.maxTeams}
                        onChange={handleChange}
                        min="2"
                        max="64"
                        required
                        className="w-full px-4 py-3 border-2 border-slate-200 focus:border-primary-500 outline-none transition-colors text-slate-900 bg-white"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="rules" className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Reglas y Observaciones</label>
                  <textarea
                    id="rules"
                    name="rules"
                    value={formData.rules}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-slate-200 focus:border-primary-500 outline-none transition-colors text-slate-900 bg-white resize-none"
                    placeholder="Reglas específicas del torneo..."
                  />
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="inline-flex items-center justify-center gap-2 border-2 border-slate-200 text-slate-700 font-display font-bold uppercase tracking-wide px-5 py-2.5 hover:border-slate-400 transition-all cursor-pointer flex-1"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 bg-primary-500 text-white font-display font-bold uppercase tracking-wide px-5 py-2.5 hover:bg-primary-600 active:scale-95 transition-all cursor-pointer flex-1"
                  >
                    {editingTournament ? 'Actualizar Torneo' : 'Crear Torneo'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AdminTournamentsPage;
