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
      'upcoming': 'bg-blue-100 text-blue-800',
      'registration': 'bg-green-100 text-green-800',
      'in-progress': 'bg-yellow-100 text-yellow-800',
      'completed': 'bg-gray-100 text-gray-800',
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900">Gestión de Torneos</h1>
          <p className="text-gray-600">Visualiza y organiza todos los torneos de vóley playa</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="btn btn-primary"
        >
          <Plus className="w-5 h-5" />
          Crear Nuevo Torneo
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 mb-1">EN JUEGO</p>
              <p className="text-4xl font-bold">{inProgressTournaments.length}</p>
              <p className="text-sm opacity-75 mt-1">Torneos activos ahora</p>
            </div>
            <Trophy className="w-12 h-12 opacity-20" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-primary-500 to-primary-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 mb-1">PRÓXIMOS</p>
              <p className="text-4xl font-bold">{upcomingTournaments.length}</p>
              <p className="text-sm opacity-75 mt-1">Abiertos a inscripción</p>
            </div>
            <Trophy className="w-12 h-12 opacity-20" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 mb-1">FINALIZADOS</p>
              <p className="text-4xl font-bold">{completedTournaments.length}</p>
              <p className="text-sm opacity-75 mt-1">En el último año</p>
            </div>
            <Trophy className="w-12 h-12 opacity-20" />
          </div>
        </div>
      </div>

      {tournaments.length === 0 ? (
        <div className="card text-center py-12">
          <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay torneos</h3>
          <p className="text-gray-600 mb-4">Crea tu primer torneo para comenzar</p>
          <button onClick={() => setShowModal(true)} className="btn btn-primary">
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
              className="card border-l-4 border-primary-500"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="relative h-48 rounded-lg overflow-hidden bg-gradient-to-br from-primary-400 to-ocean-500">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Trophy className="w-24 h-24 text-white opacity-30" />
                  </div>
                  <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold badge ${getStatusColor(tournament.status)}`}>
                    {tournament.status}
                  </div>
                </div>
                <div className="flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-2xl font-display font-bold text-gray-900">
                        {tournament.name}
                      </h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(tournament)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(tournament._id)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </div>
                    {tournament.description && (
                      <p className="text-gray-600 text-sm mb-3">{tournament.description}</p>
                    )}
                    <div className="space-y-2 text-sm text-gray-600">
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
                          {tournament.format} • {tournament.modality} • 
                          Mejor de {tournament.matchConfig?.totalSets || 3} sets
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button 
                      onClick={() => navigate(`/admin/tournaments/${tournament._id}`)}
                      className="btn btn-primary flex-1"
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
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <h2 className="text-2xl font-display font-bold text-gray-900">
                  {editingTournament ? 'Editar Torneo' : 'Crear Nuevo Torneo'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label htmlFor="name" className="label">Nombre del Torneo *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="input"
                      placeholder="Copa Verano 2024"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="description" className="label">Descripción</label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={2}
                      className="input resize-none"
                      placeholder="Descripción del torneo..."
                    />
                  </div>

                  <div>
                    <label htmlFor="category" className="label">Categoría *</label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                      className="input"
                    >
                      <option value="masculine">Masculino</option>
                      <option value="feminine">Femenino</option>
                      <option value="mixed">Mixto</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="level" className="label">Nivel *</label>
                    <select
                      id="level"
                      name="level"
                      value={formData.level}
                      onChange={handleChange}
                      required
                      className="input"
                    >
                      <option value="recreational">Recreativo</option>
                      <option value="amateur">Amateur</option>
                      <option value="professional">Profesional</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="format" className="label">Formato *</label>
                    <select
                      id="format"
                      name="format"
                      value={formData.format}
                      onChange={handleChange}
                      required
                      className="input"
                    >
                      <option value="2v2">2v2 (Duplas)</option>
                      <option value="4v4">4v4</option>
                      <option value="6v6">6v6</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="modality" className="label">Modalidad *</label>
                    <select
                      id="modality"
                      name="modality"
                      value={formData.modality}
                      onChange={handleChange}
                      required
                      className="input"
                    >
                      <option value="standard">Standard (Eliminación)</option>
                      <option value="king-of-court">Rey de Cancha</option>
                      <option value="round-robin">Round Robin (Todos contra todos)</option>
                      <option value="single-elimination">Eliminación Simple</option>
                      <option value="double-elimination">Eliminación Doble</option>
                    </select>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-display font-bold text-gray-900 mb-4">Configuración de Partidos</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="totalSets" className="label">Total de Sets *</label>
                      <input
                        type="number"
                        id="totalSets"
                        name="totalSets"
                        value={formData.totalSets}
                        onChange={handleChange}
                        min="1"
                        max="5"
                        required
                        className="input"
                      />
                    </div>

                    <div>
                      <label htmlFor="setsToWin" className="label">Sets para Ganar *</label>
                      <input
                        type="number"
                        id="setsToWin"
                        name="setsToWin"
                        value={formData.setsToWin}
                        onChange={handleChange}
                        min="1"
                        max="3"
                        required
                        className="input"
                      />
                    </div>

                    <div>
                      <label htmlFor="pointsPerSet" className="label">Puntos por Set *</label>
                      <input
                        type="number"
                        id="pointsPerSet"
                        name="pointsPerSet"
                        value={formData.pointsPerSet}
                        onChange={handleChange}
                        min="11"
                        max="30"
                        required
                        className="input"
                      />
                    </div>

                    <div>
                      <label htmlFor="finalSetPoints" className="label">Puntos Set Final *</label>
                      <input
                        type="number"
                        id="finalSetPoints"
                        name="finalSetPoints"
                        value={formData.finalSetPoints}
                        onChange={handleChange}
                        min="11"
                        max="21"
                        required
                        className="input"
                      />
                    </div>

                    <div>
                      <label htmlFor="pointDifference" className="label">Diferencia de Puntos *</label>
                      <input
                        type="number"
                        id="pointDifference"
                        name="pointDifference"
                        value={formData.pointDifference}
                        onChange={handleChange}
                        min="1"
                        max="3"
                        required
                        className="input"
                      />
                    </div>

                    <div>
                      <label htmlFor="timeLimitMinutes" className="label">Límite de Tiempo (min)</label>
                      <input
                        type="number"
                        id="timeLimitMinutes"
                        name="timeLimitMinutes"
                        value={formData.timeLimitMinutes}
                        onChange={handleChange}
                        min="0"
                        className="input"
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
                    <label htmlFor="hasTimeLimit" className="text-sm font-medium text-gray-700">
                      Activar límite de tiempo por partido
                    </label>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-display font-bold text-gray-900 mb-4">Fechas y Ubicación</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="startDate" className="label">Fecha Inicio *</label>
                      <input
                        type="datetime-local"
                        id="startDate"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleChange}
                        required
                        className="input"
                      />
                    </div>

                    <div>
                      <label htmlFor="endDate" className="label">Fecha Fin *</label>
                      <input
                        type="datetime-local"
                        id="endDate"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleChange}
                        required
                        className="input"
                      />
                    </div>

                    <div>
                      <label htmlFor="registrationDeadline" className="label">Límite Inscripción *</label>
                      <input
                        type="datetime-local"
                        id="registrationDeadline"
                        name="registrationDeadline"
                        value={formData.registrationDeadline}
                        onChange={handleChange}
                        required
                        className="input"
                      />
                    </div>

                    <div>
                      <label htmlFor="venue" className="label">Sede *</label>
                      <input
                        type="text"
                        id="venue"
                        name="venue"
                        value={formData.venue}
                        onChange={handleChange}
                        required
                        className="input"
                        placeholder="Playa Grande"
                      />
                    </div>

                    <div>
                      <label htmlFor="address" className="label">Dirección</label>
                      <input
                        type="text"
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className="input"
                        placeholder="Cancia 1-4, Manizales"
                      />
                    </div>

                    <div>
                      <label htmlFor="maxTeams" className="label">Máximo Equipos *</label>
                      <input
                        type="number"
                        id="maxTeams"
                        name="maxTeams"
                        value={formData.maxTeams}
                        onChange={handleChange}
                        min="2"
                        max="64"
                        required
                        className="input"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="rules" className="label">Reglas y Observaciones</label>
                  <textarea
                    id="rules"
                    name="rules"
                    value={formData.rules}
                    onChange={handleChange}
                    rows={3}
                    className="input resize-none"
                    placeholder="Reglas específicas del torneo..."
                  />
                </div>

                <div className="flex gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="btn btn-secondary flex-1"
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary flex-1">
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
