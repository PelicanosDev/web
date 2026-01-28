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
  const [recordForm, setRecordForm] = useState({
    exercise: '',
    result: '',
    unit: 'cm',
    times: 1,
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchMemberDetails();
    fetchAvailableBadges();
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
      await axios.post(`/admin/members/${id}/records`, recordForm);
      alert('Récord agregado exitosamente');
      setShowRecordModal(false);
      setRecordForm({
        exercise: '',
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Member not found</p>
        <Link to="/admin/members" className="text-primary-500 hover:underline mt-4 inline-block">
          Back to Members
        </Link>
      </div>
    );
  }

  const latestRecord = member.physicalRecords?.[member.physicalRecords.length - 1];
  const firstRecord = member.physicalRecords?.[0];

  return (
    <div className="space-y-6">
      <Link to="/admin/members" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900">
        <ArrowLeft className="w-5 h-5" />
        Back to Members
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="card">
            <div className="text-center mb-6">
              <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-4 overflow-hidden">
                {member.userId?.profile?.avatar ? (
                  <img 
                    src={member.userId.profile.avatar} 
                    alt={`${member.userId.profile.firstName} ${member.userId.profile.lastName}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-bold text-primary-500">
                    {member.userId?.profile?.firstName?.[0]}{member.userId?.profile?.lastName?.[0]}
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-display font-bold text-gray-900">
                {member.userId?.profile?.firstName} {member.userId?.profile?.lastName}
              </h2>
              <p className="text-gray-600">{member.memberNumber}</p>
              <span className={`badge mt-2 ${
                member.membership?.status === 'active' ? 'badge-success' : 'badge-error'
              }`}>
                {member.membership?.status}
              </span>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-gray-600">
                <Mail className="w-5 h-5" />
                <span className="text-sm">{member.userId?.email}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <Phone className="w-5 h-5" />
                <span className="text-sm">{member.userId?.profile?.phone || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <Calendar className="w-5 h-5" />
                <span className="text-sm">
                  Joined {new Date(member.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3">Sport Profile</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Position:</span>
                  <span className="font-medium capitalize">{member.sportProfile?.position}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Experience:</span>
                  <span className="font-medium capitalize">{member.sportProfile?.experience}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Dominant Hand:</span>
                  <span className="font-medium capitalize">{member.sportProfile?.dominantHand}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-display font-bold text-gray-900">Gamification</h3>
              <button 
                onClick={() => setShowBadgeModal(true)}
                className="btn btn-primary btn-sm"
              >
                <Award className="w-4 h-4" />
                Assign Badge
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg p-4 text-white">
                <p className="text-sm opacity-90 mb-1">Level</p>
                <p className="text-3xl font-bold">{member.gamification?.level || 1}</p>
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 text-white">
                <p className="text-sm opacity-90 mb-1">Total XP</p>
                <p className="text-3xl font-bold">{member.gamification?.xp || 0}</p>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-4 text-white">
                <p className="text-sm opacity-90 mb-1">Badges</p>
                <p className="text-3xl font-bold">{member.gamification?.badges?.length || 0}</p>
              </div>
            </div>

            {member.gamification?.badges?.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Earned Badges</h4>
                <div className="flex flex-wrap gap-3">
                  {member.gamification.badges.map((badge, index) => {
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
                        onClick={() => {
                          setSelectedBadge(badgeData);
                          setShowBadgeInfoModal(true);
                        }}
                        className={`w-16 h-16 ${bgColor} rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform cursor-pointer`}
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

          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-display font-bold text-gray-900">Physical Records</h3>
              <button onClick={() => setShowRecordModal(true)} className="btn btn-primary btn-sm">
                <Plus className="w-4 h-4" />
                Agregar Récord
              </button>
            </div>

            {member.physicalRecords && member.physicalRecords.length > 0 ? (
              <div className="space-y-4">
                {member.physicalRecords.slice().reverse().map((record, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900">{record.exercise}</h4>
                        <p className="text-sm text-gray-500">
                          {new Date(record.date).toLocaleDateString('es-ES', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary-600">{record.result}</p>
                        <p className="text-sm text-gray-600">{record.unit}</p>
                      </div>
                    </div>
                    <div className="flex gap-4 text-sm text-gray-600">
                      <span>Repeticiones: {record.times}</span>
                      {record.notes && <span className="text-gray-500">• {record.notes}</span>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No hay récords físicos registrados</p>
            )}
          </div>

          <div className="card">
            <h3 className="text-xl font-display font-bold text-gray-900 mb-6">Attendance</h3>
            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="w-32 h-32 rounded-full border-8 border-green-500 flex items-center justify-center mb-4">
                  <span className="text-4xl font-bold text-gray-900">
                    {member.attendance?.length > 0 
                      ? Math.round((member.attendance.filter(a => a.present).length / member.attendance.length) * 100)
                      : 0}%
                  </span>
                </div>
                <p className="text-gray-600">Attendance Rate</p>
                <p className="text-sm text-gray-500 mt-1">
                  {member.attendance?.filter(a => a.present).length || 0} of {member.attendance?.length || 0} sessions
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
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowRecordModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-display font-bold text-gray-900">Agregar Récord Físico</h2>
                <button
                  onClick={() => setShowRecordModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddRecord} className="p-6 space-y-4">
                <div>
                  <label className="label">Ejercicio *</label>
                  <input
                    type="text"
                    value={recordForm.exercise}
                    onChange={(e) => setRecordForm({ ...recordForm, exercise: e.target.value })}
                    className="input"
                    placeholder="Ej: Salto vertical, Velocidad de saque, etc."
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Resultado *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={recordForm.result}
                      onChange={(e) => setRecordForm({ ...recordForm, result: e.target.value })}
                      className="input"
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Unidad de Medida *</label>
                    <select
                      value={recordForm.unit}
                      onChange={(e) => setRecordForm({ ...recordForm, unit: e.target.value })}
                      className="input"
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
                  <label className="label">Número de Repeticiones</label>
                  <input
                    type="number"
                    min="1"
                    value={recordForm.times}
                    onChange={(e) => setRecordForm({ ...recordForm, times: e.target.value })}
                    className="input"
                    placeholder="1"
                  />
                  <p className="text-xs text-gray-500 mt-1">¿Cuántas veces se realizó el ejercicio?</p>
                </div>

                <div>
                  <label className="label">Notas (opcional)</label>
                  <textarea
                    value={recordForm.notes}
                    onChange={(e) => setRecordForm({ ...recordForm, notes: e.target.value })}
                    className="input resize-none"
                    rows={3}
                    placeholder="Observaciones adicionales..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowRecordModal(false)}
                    className="btn btn-secondary flex-1"
                    disabled={submitting}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary flex-1"
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
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowBadgeModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b sticky top-0 bg-white z-10">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-display font-bold text-gray-900">
                    Asignar Insignia
                  </h2>
                  <button
                    onClick={() => setShowBadgeModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availableBadges.map((badge) => {
                    const isAssigned = member?.gamification?.badges?.some(
                      b => b.badgeId?._id === badge._id || b.badgeId === badge._id
                    );
                    
                    const rarityColors = {
                      common: 'bg-gray-100 text-gray-800 border-gray-300',
                      rare: 'bg-blue-100 text-blue-800 border-blue-300',
                      epic: 'bg-purple-100 text-purple-800 border-purple-300',
                      legendary: 'bg-yellow-100 text-yellow-800 border-yellow-300'
                    };

                    return (
                      <button
                        key={badge._id}
                        onClick={() => !isAssigned && handleAssignBadge(badge._id)}
                        disabled={isAssigned}
                        className={`text-left p-4 rounded-xl border-2 transition-all ${
                          isAssigned 
                            ? 'opacity-50 cursor-not-allowed bg-gray-50' 
                            : `${rarityColors[badge.rarity]} hover:shadow-lg hover:-translate-y-1 cursor-pointer`
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="text-4xl">{badge.icon}</div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold mb-1 flex items-center gap-2">
                              {badge.name}
                              {isAssigned && (
                                <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                                  Asignada
                                </span>
                              )}
                            </h3>
                            <p className="text-sm opacity-80 mb-2">{badge.description}</p>
                            <div className="flex items-center justify-between text-xs">
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
                    <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No hay insignias disponibles</p>
                    <p className="text-sm text-gray-400 mt-2">Crea insignias desde la página de Badges</p>
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
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowBadgeInfoModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl"
            >
              {/* Header con color según rareza */}
              <div className={`p-6 text-center ${
                selectedBadge.rarity === 'legendary' ? 'bg-gradient-to-br from-yellow-400 to-orange-500' :
                selectedBadge.rarity === 'epic' ? 'bg-gradient-to-br from-purple-500 to-pink-500' :
                selectedBadge.rarity === 'rare' ? 'bg-gradient-to-br from-blue-500 to-cyan-500' :
                'bg-gradient-to-br from-gray-400 to-gray-500'
              } text-white relative`}>
                <button
                  onClick={() => setShowBadgeInfoModal(false)}
                  className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="text-7xl mb-4">{selectedBadge.icon}</div>
                <h2 className="text-2xl font-display font-bold mb-2">{selectedBadge.name}</h2>
                <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold capitalize">
                  {selectedBadge.rarity}
                </span>
              </div>

              {/* Contenido */}
              <div className="p-6 space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Descripción</h3>
                  <p className="text-gray-700">{selectedBadge.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Categoría</p>
                    <p className="font-semibold text-gray-900 capitalize flex items-center gap-1">
                      {selectedBadge.category === 'attendance' && '📅'}
                      {selectedBadge.category === 'performance' && '⚡'}
                      {selectedBadge.category === 'achievement' && '🏆'}
                      {selectedBadge.category === 'special' && '⭐'}
                      {selectedBadge.category}
                    </p>
                  </div>
                  <div className="bg-primary-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Recompensa</p>
                    <p className="font-bold text-primary-600 text-lg">+{selectedBadge.xpReward} XP</p>
                  </div>
                </div>

                {selectedBadge.criteria?.description && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-xs text-blue-600 font-semibold mb-1">Criterio</p>
                    <p className="text-sm text-blue-900">{selectedBadge.criteria.description}</p>
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
