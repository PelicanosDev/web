import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Filter, X, ClipboardList } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from '@/api/axios';

function MembersPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalMembers, setTotalMembers] = useState(0);
  const itemsPerPage = 15;
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [showBulkRecordsModal, setShowBulkRecordsModal] = useState(false);
  const [exercises, setExercises] = useState([]);
  const [allMembers, setAllMembers] = useState([]);
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [bulkRecordsData, setBulkRecordsData] = useState({});
  const [bulkStep, setBulkStep] = useState(1);
  const [bulkSubmitting, setBulkSubmitting] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, [statusFilter, currentPage, search]);

  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const params = { 
        page: currentPage, 
        limit: itemsPerPage 
      };
      if (statusFilter !== 'all') params.status = statusFilter;
      if (search.trim()) params.search = search.trim();
      
      const response = await axios.get('/admin/members', { params });
      setMembers(response.data.data);
      setTotalPages(response.data.pagination.pages);
      setTotalMembers(response.data.pagination.total);
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
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

  const fetchAllMembers = async () => {
    try {
      const response = await axios.get('/admin/members', { params: { limit: 1000 } });
      setAllMembers(response.data.data);
    } catch (error) {
      console.error('Error fetching all members:', error);
    }
  };

  const handleOpenBulkRecords = async () => {
    await fetchAllMembers();
    setShowBulkRecordsModal(true);
    setBulkStep(1);
    setSelectedExercises([]);
    setSelectedMembers([]);
    setBulkRecordsData({});
  };

  const handleExerciseToggle = (exerciseId) => {
    setSelectedExercises(prev => 
      prev.includes(exerciseId) 
        ? prev.filter(id => id !== exerciseId)
        : [...prev, exerciseId]
    );
  };

  const handleMemberToggle = (memberId) => {
    setSelectedMembers(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleBulkRecordChange = (memberId, exerciseId, value) => {
    setBulkRecordsData(prev => ({
      ...prev,
      [`${memberId}-${exerciseId}`]: value
    }));
  };

  const handleSubmitBulkRecords = async () => {
    setBulkSubmitting(true);
    try {
      const records = [];
      selectedMembers.forEach(memberId => {
        selectedExercises.forEach(exerciseId => {
          const value = bulkRecordsData[`${memberId}-${exerciseId}`];
          if (value && value.trim() !== '') {
            records.push({
              memberId,
              exerciseId,
              result: parseFloat(value),
              unit: exercises.find(ex => ex._id === exerciseId)?.defaultUnit || 'cm',
              times: 1,
              notes: ''
            });
          }
        });
      });

      if (records.length === 0) {
        alert('No hay datos para guardar');
        setBulkSubmitting(false);
        return;
      }

      const response = await axios.post('/admin/members/bulk-records', { records });
      alert(`${response.data.data.recordsCreated} récords creados exitosamente`);
      setShowBulkRecordsModal(false);
      setBulkStep(1);
      setSelectedExercises([]);
      setSelectedMembers([]);
      setBulkRecordsData({});
    } catch (error) {
      console.error('Error submitting bulk records:', error);
      alert('Error al guardar récords: ' + (error.response?.data?.message || error.message));
    } finally {
      setBulkSubmitting(false);
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900">Members</h1>
          <p className="text-gray-600">Manage club members and their profiles</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleOpenBulkRecords}
            className="btn btn-secondary"
          >
            <ClipboardList className="w-5 h-5" />
            Records Masivos
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary"
          >
            <Plus className="w-5 h-5" />
            Add Member
          </button>
        </div>
      </div>

      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o email..."
              value={search}
              onChange={handleSearchChange}
              className="input pl-10 w-full"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
            <button className="btn btn-secondary">
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Member</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Member #</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Position</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Level</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member._id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden">
                        {member.userId?.profile?.avatar ? (
                          <img 
                            src={member.userId.profile.avatar} 
                            alt={`${member.userId.profile.firstName} ${member.userId.profile.lastName}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="font-semibold text-primary-500">
                            {member.userId?.profile?.firstName?.[0]}{member.userId?.profile?.lastName?.[0]}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {member.userId?.profile?.firstName} {member.userId?.profile?.lastName}
                        </p>
                        <p className="text-sm text-gray-500">{member.userId?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-mono text-sm text-gray-700">{member.memberNumber}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-gray-700 capitalize">
                      {member.sportProfile?.position || 'N/A'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">⭐</span>
                      <span className="font-semibold text-gray-900">
                        {member.gamification?.level || 1}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`badge ${
                      member.membership?.status === 'active' ? 'badge-success' :
                      member.membership?.status === 'inactive' ? 'badge-error' :
                      'badge-warning'
                    }`}>
                      {member.membership?.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <Link
                      to={`/admin/members/${member._id}`}
                      className="text-primary-500 hover:underline text-sm font-medium"
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {members.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500">No se encontraron miembros</p>
          </div>
        )}

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-6 border-t">
            <div className="text-sm text-gray-600">
              Mostrando {members.length > 0 ? ((currentPage - 1) * itemsPerPage) + 1 : 0} - {Math.min(currentPage * itemsPerPage, totalMembers)} de {totalMembers} miembros
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <div className="flex gap-1">
                {[...Array(totalPages)].map((_, index) => {
                  const page = index + 1;
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                          currentPage === page
                            ? 'bg-primary-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  } else if (
                    page === currentPage - 2 ||
                    page === currentPage + 2
                  ) {
                    return <span key={page} className="px-2 text-gray-400">...</span>;
                  }
                  return null;
                })}
              </div>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Member Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => !submitting && setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b sticky top-0 bg-white">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-display font-bold text-gray-900">
                    Agregar Nuevo Miembro
                  </h2>
                  <button
                    onClick={() => !submitting && setShowAddModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                    disabled={submitting}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleAddMember} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Nombre *</label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="input"
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Apellido *</label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="input"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input"
                    required
                  />
                </div>

                <div>
                  <label className="label">Contraseña *</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="input"
                    required
                    minLength={8}
                    placeholder="Mínimo 8 caracteres"
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Nota:</strong> El deportista completará el resto de su información (teléfono, fecha de nacimiento, posición, etc.) desde su perfil después de iniciar sesión.
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
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
                    {submitting ? 'Creando...' : 'Crear Miembro'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Records Masivos */}
      <AnimatePresence>
        {showBulkRecordsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => !bulkSubmitting && setShowBulkRecordsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-display font-bold text-gray-900">
                    Agregar Records Masivos
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Paso {bulkStep} de 3: {
                      bulkStep === 1 ? 'Seleccionar Ejercicios' :
                      bulkStep === 2 ? 'Seleccionar Miembros' :
                      'Ingresar Resultados'
                    }
                  </p>
                </div>
                <button
                  onClick={() => !bulkSubmitting && setShowBulkRecordsModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  disabled={bulkSubmitting}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {bulkStep === 1 && (
                  <div className="space-y-4">
                    <p className="text-gray-700">Selecciona los ejercicios que deseas registrar:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {exercises.map(exercise => (
                        <label
                          key={exercise._id}
                          className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            selectedExercises.includes(exercise._id)
                              ? 'border-primary-500 bg-primary-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedExercises.includes(exercise._id)}
                            onChange={() => handleExerciseToggle(exercise._id)}
                            className="w-5 h-5 text-primary-500 rounded"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{exercise.name}</p>
                            <p className="text-xs text-gray-500 capitalize">{exercise.category} • {exercise.defaultUnit}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                    {exercises.length === 0 && (
                      <p className="text-center text-gray-500 py-8">No hay ejercicios disponibles</p>
                    )}
                  </div>
                )}

                {bulkStep === 2 && (
                  <div className="space-y-4">
                    <p className="text-gray-700">Selecciona los miembros para registrar:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {allMembers.map(member => (
                        <label
                          key={member._id}
                          className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            selectedMembers.includes(member._id)
                              ? 'border-primary-500 bg-primary-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedMembers.includes(member._id)}
                            onChange={() => handleMemberToggle(member._id)}
                            className="w-5 h-5 text-primary-500 rounded"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">
                              {member.userId?.profile?.firstName} {member.userId?.profile?.lastName}
                            </p>
                            <p className="text-xs text-gray-500">{member.memberNumber}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {bulkStep === 3 && (
                  <div className="space-y-4">
                    <p className="text-gray-700 mb-4">
                      Ingresa los resultados para cada miembro y ejercicio (deja vacío si no aplica):
                    </p>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-700 sticky left-0 bg-gray-50 z-10">
                              Miembro
                            </th>
                            {selectedExercises.map(exerciseId => {
                              const exercise = exercises.find(ex => ex._id === exerciseId);
                              return (
                                <th key={exerciseId} className="border border-gray-300 px-4 py-2 text-center font-semibold text-gray-700 min-w-[150px]">
                                  <div>{exercise?.name}</div>
                                  <div className="text-xs font-normal text-gray-500">({exercise?.defaultUnit})</div>
                                </th>
                              );
                            })}
                          </tr>
                        </thead>
                        <tbody>
                          {selectedMembers.map(memberId => {
                            const member = allMembers.find(m => m._id === memberId);
                            return (
                              <tr key={memberId} className="hover:bg-gray-50">
                                <td className="border border-gray-300 px-4 py-2 font-medium text-gray-900 sticky left-0 bg-white">
                                  {member?.userId?.profile?.firstName} {member?.userId?.profile?.lastName}
                                </td>
                                {selectedExercises.map(exerciseId => (
                                  <td key={exerciseId} className="border border-gray-300 px-2 py-2">
                                    <input
                                      type="number"
                                      step="0.01"
                                      value={bulkRecordsData[`${memberId}-${exerciseId}`] || ''}
                                      onChange={(e) => handleBulkRecordChange(memberId, exerciseId, e.target.value)}
                                      className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                                      placeholder="0.00"
                                    />
                                  </td>
                                ))}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-between">
                <button
                  onClick={() => {
                    if (bulkStep > 1) setBulkStep(bulkStep - 1);
                    else setShowBulkRecordsModal(false);
                  }}
                  className="btn btn-secondary"
                  disabled={bulkSubmitting}
                >
                  {bulkStep === 1 ? 'Cancelar' : 'Anterior'}
                </button>
                
                {bulkStep < 3 ? (
                  <button
                    onClick={() => {
                      if (bulkStep === 1 && selectedExercises.length === 0) {
                        alert('Selecciona al menos un ejercicio');
                        return;
                      }
                      if (bulkStep === 2 && selectedMembers.length === 0) {
                        alert('Selecciona al menos un miembro');
                        return;
                      }
                      setBulkStep(bulkStep + 1);
                    }}
                    className="btn btn-primary"
                  >
                    Siguiente
                  </button>
                ) : (
                  <button
                    onClick={handleSubmitBulkRecords}
                    className="btn btn-primary"
                    disabled={bulkSubmitting}
                  >
                    {bulkSubmitting ? 'Guardando...' : 'Guardar Records'}
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  async function handleAddMember(e) {
    e.preventDefault();
    setSubmitting(true);

    try {
      await axios.post('/admin/members', formData);
      alert('Miembro creado exitosamente');
      setShowAddModal(false);
      setFormData({
        email: '',
        password: '',
        firstName: '',
        lastName: ''
      });
      fetchMembers();
    } catch (error) {
      console.error('Error creating member:', error);
      alert('Error al crear el miembro: ' + (error.response?.data?.message || error.message));
    } finally {
      setSubmitting(false);
    }
  }
}

export default MembersPage;
