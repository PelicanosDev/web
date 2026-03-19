import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, Calendar, Award, TrendingUp, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from '@/api/axios';

function MemberDetailPage() {
  const { id } = useParams();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [showBadgeInfoModal, setShowBadgeInfoModal] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [availableBadges, setAvailableBadges] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [recordForm, setRecordForm] = useState({
    exerciseId: '',
    result: '',
    unit: 'cm',
    times: 1,
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchMemberDetails();
    fetchAvailableBadges();
    fetchExercises();
  }, [id]);

  const fetchMemberDetails = async () => {
    try {
      const response = await axios.get(`/admin/members/${id}`);
      setMember(response.data.data);
    } catch (error) {
      console.error('Error fetching member details:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableBadges = async () => {
    try {
      const response = await axios.get('/badges');
      setAvailableBadges(response.data.data);
    } catch (error) {
      console.error('Error fetching badges:', error);
    }
  };

  const fetchExercises = async () => {
    try {
      const response = await axios.get('/exercises');
      setExercises(response.data.data);
    } catch (error) {
      console.error('Error fetching exercises:', error);
    }
  };

  const handleAssignBadge = async (badgeId) => {
    try {
      await axios.post(`/admin/members/${id}/badges`, { badgeId });
      alert('Insignia asignada exitosamente');
      setShowBadgeModal(false);
      fetchMemberDetails();
    } catch (error) {
      console.error('Error assigning badge:', error);
      alert('Error al asignar insignia: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleAddRecord = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const selectedExercise = exercises.find(ex => ex._id === recordForm.exerciseId);
      const recordData = {
        exercise: selectedExercise.name,
        result: recordForm.result,
        unit: recordForm.unit,
        times: recordForm.times,
        notes: recordForm.notes
      };
      await axios.post(`/admin/members/${id}/records`, recordData);
      alert('Récord agregado exitosamente');
      setShowRecordModal(false);
      setRecordForm({
        exerciseId: '',
        result: '',
        unit: 'cm',
        times: 1,
        notes: ''
      });
      fetchMemberDetails();
    } catch (error) {
      console.error('Error adding record:', error);
      alert('Error al agregar récord: ' + (error.response?.data?.message || error.message));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!member) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Miembro no encontrado</p>
        <Link to="/admin/members" className="text-primary-500 hover:underline mt-4 inline-block">
          Volver a Miembros
        </Link>
      </div>
    );
  }

  const latestRecord = member.physicalRecords?.[member.physicalRecords.length - 1];
  const firstRecord = member.physicalRecords?.[0];

  return (
    <div className="space-y-6">
      <Link to="/admin/members" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold uppercase tracking-widest text-xs transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Volver a Miembros
      </Link>

      <div>
        <span className="inline-block text-primary-600 text-xs font-bold uppercase tracking-widest bg-primary-50 px-3 py-1.5 mb-3">
          Perfil de Miembro
        </span>
        <h1 className="font-display font-black uppercase text-slate-900 text-3xl leading-none">
          {member.userId?.profile?.firstName} {member.userId?.profile?.lastName}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white border border-slate-100 shadow-sm p-6">
            <div className="text-center mb-6">
              <div className="w-24 h-24 bg-primary-500 flex items-center justify-center mx-auto mb-4 overflow-hidden">
                {member.userId?.profile?.avatar ? (
                  <img
                    src={member.userId.profile.avatar}
                    alt={`${member.userId.profile.firstName} ${member.userId.profile.lastName}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-bold text-white">
                    {member.userId?.profile?.firstName?.[0]}{member.userId?.profile?.lastName?.[0]}
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-display font-black uppercase text-slate-900">
                {member.userId?.profile?.firstName} {member.userId?.profile?.lastName}
              </h2>
              <p className="text-slate-500">{member.memberNumber}</p>
              <span className={`inline-block mt-2 px-2 py-1 text-xs font-bold uppercase tracking-widest ${
                member.membership?.status === 'active'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {member.membership?.status}
              </span>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-slate-500">
                <Mail className="w-5 h-5" />
                <span className="text-sm">{member.userId?.email}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-500">
                <Phone className="w-5 h-5" />
                <span className="text-sm">{member.userId?.profile?.phone || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-500">
                <Calendar className="w-5 h-5" />
                <span className="text-sm">
                  Joined {new Date(member.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-200">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Perfil Deportivo</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Posición:</span>
                  <span className="font-medium capitalize text-slate-900">{member.sportProfile?.position}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Experiencia:</span>
                  <span className="font-medium capitalize text-slate-900">{member.sportProfile?.experience}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Mano dominante:</span>
                  <span className="font-medium capitalize text-slate-900">{member.sportProfile?.dominantHand}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-display font-black uppercase text-slate-900">Gamificación</h3>
              <button
                onClick={() => setShowBadgeModal(true)}
                className="inline-flex items-center gap-2 bg-primary-500 text-white font-display font-bold uppercase tracking-wide px-3 py-2 hover:bg-primary-600 transition-all cursor-pointer text-sm"
              >
                <Award className="w-4 h-4" />
                Asignar Insignia
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-slate-900 p-4 border-l-4 border-primary-500">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Nivel</p>
                <p className="text-3xl font-display font-black text-primary-400">{member.gamification?.level || 1}</p>
              </div>
              <div className="bg-white border border-slate-100 shadow-sm p-4 border-l-4 border-sky-400">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">XP Total</p>
                <p className="text-3xl font-display font-black text-sky-500">{member.gamification?.xp || 0}</p>
              </div>
              <div className="bg-white border border-slate-100 shadow-sm p-4 border-l-4 border-purple-400">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Insignias</p>
                <p className="text-3xl font-display font-black text-purple-500">{member.gamification?.badges?.length || 0}</p>
              </div>
            </div>

            {member.gamification?.badges?.length > 0 && (
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Insignias Ganadas</p>
                <div className="flex flex-wrap gap-3">
                  {member.gamification.badges.map((badge, index) => {
                    const badgeData = badge.badgeId || badge;
                    const rarityColors = {
                      common: 'bg-slate-50 border-2 border-slate-300',
                      rare: 'bg-sky-50 border-2 border-sky-300',
                      epic: 'bg-purple-50 border-2 border-purple-300',
                      legendary: 'bg-amber-50 border-2 border-amber-400'
                    };
                    const bgColor = rarityColors[badgeData?.rarity] || rarityColors.common;

                    return (
                      <div
                        key={index}
                        onClick={() => {
                          setSelectedBadge(badgeData);
                          setShowBadgeInfoModal(true);
                        }}
                        className={`w-16 h-16 ${bgColor} flex items-center justify-center hover:scale-110 transition-transform cursor-pointer`}
                        title={badgeData?.name || 'Badge'}
                      >
                        <span className="text-2xl">{badgeData?.icon || '🏆'}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="bg-white border border-slate-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-display font-black uppercase text-slate-900">Récords Físicos</h3>
              <button
                onClick={() => setShowRecordModal(true)}
                className="inline-flex items-center gap-2 bg-primary-500 text-white font-display font-bold uppercase tracking-wide px-3 py-2 hover:bg-primary-600 transition-all cursor-pointer text-sm"
              >
                <Plus className="w-4 h-4" />
                Agregar Récord
              </button>
            </div>

            {member.physicalRecords && member.physicalRecords.length > 0 ? (
              <div className="space-y-4">
                {member.physicalRecords.slice().reverse().map((record, index) => (
                  <div key={index} className="p-4 bg-slate-50 border border-slate-200">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-bold text-slate-900">{record.exercise}</h4>
                        <p className="text-sm text-slate-500">
                          {new Date(record.date).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-display font-black text-primary-600">{record.result}</p>
                        <p className="text-sm text-slate-500">{record.unit}</p>
                      </div>
                    </div>
                    <div className="flex gap-4 text-sm text-slate-500">
                      <span>Repeticiones: {record.times}</span>
                      {record.notes && <span className="text-slate-400">• {record.notes}</span>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-center py-8">No hay récords físicos registrados</p>
            )}
          </div>

          <div className="bg-white border border-slate-100 shadow-sm p-6">
            <h3 className="text-xl font-display font-black uppercase text-slate-900 mb-6">Asistencia</h3>
            <div className="flex items-center justify-center">
              <div className="bg-slate-900 p-8 border-l-4 border-primary-500 text-center">
                <p className="font-display font-black text-5xl text-primary-400">
                  {member.attendance?.length > 0
                    ? Math.round((member.attendance.filter(a => a.present).length / member.attendance.length) * 100)
                    : 0}%
                </p>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-2">Tasa de Asistencia</p>
                <p className="text-sm text-slate-500 mt-1">
                  {member.attendance?.filter(a => a.present).length || 0} de {member.attendance?.length || 0} sesiones
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para agregar récord */}
      <AnimatePresence>
        {showRecordModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={() => setShowRecordModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-display font-black uppercase text-slate-900">Agregar Récord Físico</h2>
                <button
                  onClick={() => setShowRecordModal(false)}
                  className="p-2 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddRecord} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Ejercicio *</label>
                  <select
                    value={recordForm.exerciseId}
                    onChange={(e) => {
                      const exercise = exercises.find(ex => ex._id === e.target.value);
                      setRecordForm({
                        ...recordForm,
                        exerciseId: e.target.value,
                        unit: exercise ? exercise.defaultUnit : 'cm'
                      });
                    }}
                    className="w-full px-4 py-3 border-2 border-slate-200 focus:border-primary-500 outline-none transition-colors text-slate-900 bg-white"
                    required
                  >
                    <option value="">Selecciona un ejercicio</option>
                    {exercises.map(exercise => (
                      <option key={exercise._id} value={exercise._id}>
                        {exercise.name} ({exercise.category})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Resultado *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={recordForm.result}
                      onChange={(e) => setRecordForm({ ...recordForm, result: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-slate-200 focus:border-primary-500 outline-none transition-colors text-slate-900 bg-white"
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Unidad de Medida *</label>
                    <select
                      value={recordForm.unit}
                      onChange={(e) => setRecordForm({ ...recordForm, unit: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-slate-200 focus:border-primary-500 outline-none transition-colors text-slate-900 bg-white"
                      required
                    >
                      <option value="cm">Centímetros (cm)</option>
                      <option value="metros">Metros (m)</option>
                      <option value="segundos">Segundos (s)</option>
                      <option value="minutos">Minutos (min)</option>
                      <option value="kg">Kilogramos (kg)</option>
                      <option value="repeticiones">Repeticiones</option>
                      <option value="km/h">Kilómetros por hora (km/h)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Número de Repeticiones</label>
                  <input
                    type="number"
                    min="1"
                    value={recordForm.times}
                    onChange={(e) => setRecordForm({ ...recordForm, times: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 focus:border-primary-500 outline-none transition-colors text-slate-900 bg-white"
                    placeholder="1"
                  />
                  <p className="text-xs text-slate-400 mt-1">¿Cuántas veces se realizó el ejercicio?</p>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Notas (opcional)</label>
                  <textarea
                    value={recordForm.notes}
                    onChange={(e) => setRecordForm({ ...recordForm, notes: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 focus:border-primary-500 outline-none transition-colors text-slate-900 bg-white resize-none"
                    rows={3}
                    placeholder="Observaciones adicionales..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowRecordModal(false)}
                    className="inline-flex items-center justify-center gap-2 border-2 border-slate-200 text-slate-700 font-display font-bold uppercase tracking-wide px-5 py-2.5 hover:border-slate-400 transition-all cursor-pointer flex-1"
                    disabled={submitting}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 bg-primary-500 text-white font-display font-bold uppercase tracking-wide px-5 py-2.5 hover:bg-primary-600 active:scale-95 transition-all cursor-pointer flex-1"
                    disabled={submitting}
                  >
                    {submitting ? 'Guardando...' : 'Guardar Récord'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Asignar Badge */}
      <AnimatePresence>
        {showBadgeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={() => setShowBadgeModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10">
                <h2 className="text-2xl font-display font-black uppercase text-slate-900">
                  Asignar Insignia
                </h2>
                <button
                  onClick={() => setShowBadgeModal(false)}
                  className="p-2 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availableBadges.map((badge) => {
                    const isAssigned = member?.gamification?.badges?.some(
                      b => b.badgeId?._id === badge._id || b.badgeId === badge._id
                    );

                    const rarityClasses = {
                      common: 'bg-slate-50 border-2 border-slate-300',
                      rare: 'bg-sky-50 border-2 border-sky-300',
                      epic: 'bg-purple-50 border-2 border-purple-300',
                      legendary: 'bg-amber-50 border-2 border-amber-400'
                    };

                    return (
                      <button
                        key={badge._id}
                        onClick={() => !isAssigned && handleAssignBadge(badge._id)}
                        disabled={isAssigned}
                        className={`text-left p-4 transition-all ${
                          isAssigned
                            ? 'opacity-50 cursor-not-allowed bg-slate-50 border-2 border-slate-200'
                            : `${rarityClasses[badge.rarity] || rarityClasses.common} hover:shadow-lg hover:-translate-y-1 cursor-pointer`
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="text-4xl">{badge.icon}</div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold mb-1 flex items-center gap-2 text-slate-900">
                              {badge.name}
                              {isAssigned && (
                                <span className="text-xs bg-green-500 text-white px-2 py-0.5 font-bold uppercase tracking-widest">
                                  Asignada
                                </span>
                              )}
                            </h3>
                            <p className="text-sm text-slate-500 mb-2">{badge.description}</p>
                            <div className="flex items-center justify-between text-xs text-slate-500">
                              <span className="capitalize">{badge.category}</span>
                              <span className="font-semibold">+{badge.xpReward} XP</span>
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {availableBadges.length === 0 && (
                  <div className="text-center py-12">
                    <Award className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">No hay insignias disponibles</p>
                    <p className="text-sm text-slate-400 mt-2">Crea insignias desde la página de Badges</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Información del Badge */}
      <AnimatePresence>
        {showBadgeInfoModal && selectedBadge && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={() => setShowBadgeInfoModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white shadow-2xl max-w-md w-full overflow-hidden"
            >
              {/* Header */}
              <div className="bg-slate-900 p-8 text-center border-b-4 border-primary-500 relative">
                <button
                  onClick={() => setShowBadgeInfoModal(false)}
                  className="absolute top-4 right-4 p-1 hover:bg-white/20 transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
                <p className="text-primary-400 font-display font-black text-6xl mb-4">{selectedBadge.icon}</p>
                <h2 className="font-display font-black uppercase text-white text-2xl">{selectedBadge.name}</h2>
                <span className="inline-block mt-2 px-2 py-1 text-xs font-bold uppercase tracking-widest bg-white/20 text-white capitalize">
                  {selectedBadge.rarity}
                </span>
              </div>

              {/* Contenido */}
              <div className="p-6 space-y-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Descripción</p>
                  <p className="text-slate-700">{selectedBadge.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 border border-slate-100 p-3">
                    <p className="text-xs text-slate-400 mb-1">Categoría</p>
                    <p className="font-bold text-slate-900 capitalize flex items-center gap-1">
                      {selectedBadge.category === 'attendance' && '📅'}
                      {selectedBadge.category === 'performance' && '⚡'}
                      {selectedBadge.category === 'achievement' && '🏆'}
                      {selectedBadge.category === 'special' && '⭐'}
                      {selectedBadge.category}
                    </p>
                  </div>
                  <div className="bg-primary-50 border border-primary-100 p-3">
                    <p className="text-xs text-slate-400 mb-1">Recompensa</p>
                    <p className="font-bold text-primary-600 text-lg">+{selectedBadge.xpReward} XP</p>
                  </div>
                </div>

                {selectedBadge.criteria?.description && (
                  <div className="bg-sky-50 border border-sky-200 p-3">
                    <p className="text-xs text-sky-600 font-semibold mb-1">Criterio</p>
                    <p className="text-sm text-sky-900">{selectedBadge.criteria.description}</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default MemberDetailPage;
