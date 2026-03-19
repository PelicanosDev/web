import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, X, ClipboardList, Trophy, ChevronLeft, ChevronRight } from 'lucide-react';
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

  const statusBadgeClass = (status) => {
    if (status === 'active') return 'bg-emerald-100 text-emerald-700';
    if (status === 'inactive') return 'bg-red-100 text-red-700';
    return 'bg-amber-100 text-amber-700';
  };

  const statusLabel = (status) => {
    if (status === 'active') return 'Activo';
    if (status === 'inactive') return 'Inactivo';
    if (status === 'suspended') return 'Suspendido';
    return status || 'N/A';
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
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="inline-block text-primary-600 text-xs font-bold uppercase tracking-widest bg-primary-50 px-3 py-1.5 mb-3">
            Club
          </span>
          <h1 className="font-display font-black uppercase text-slate-900 text-3xl leading-none">
            Miembros
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenBulkRecords}
            className="inline-flex items-center gap-2 border-2 border-slate-200 text-slate-700 font-display font-bold uppercase tracking-wide px-5 py-2.5 hover:border-slate-400 transition-all cursor-pointer"
          >
            <ClipboardList className="w-4 h-4" />
            Records Masivos
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 bg-primary-500 text-white font-display font-bold uppercase tracking-wide px-5 py-2.5 hover:bg-primary-600 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Agregar Miembro
          </button>
        </div>
      </div>

      {/* Filter bar + table card */}
      <div className="bg-white border border-slate-100 shadow-sm p-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o email..."
              value={search}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 focus:border-primary-500 outline-none transition-colors text-slate-900 bg-white"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-3 border-2 border-slate-200 focus:border-primary-500 outline-none transition-colors text-slate-900 bg-white sm:w-48"
          >
            <option value="all">Todos los estados</option>
            <option value="active">Activo</option>
            <option value="inactive">Inactivo</option>
            <option value="suspended">Suspendido</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-widest text-slate-400">Miembro</th>
                <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-widest text-slate-400">N° Socio</th>
                <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-widest text-slate-400">Posición</th>
                <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-widest text-slate-400">Nivel</th>
                <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-widest text-slate-400">Estado</th>
                <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-widest text-slate-400">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member._id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-primary-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {member.userId?.profile?.avatar ? (
                          <img
                            src={member.userId.profile.avatar}
                            alt={`${member.userId.profile.firstName} ${member.userId.profile.lastName}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-xs font-bold text-primary-500">
                            {member.userId?.profile?.firstName?.[0]}{member.userId?.profile?.lastName?.[0]}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">
                          {member.userId?.profile?.firstName} {member.userId?.profile?.lastName}
                        </p>
                        <p className="text-xs text-slate-400">{member.userId?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-mono text-sm text-slate-600">{member.memberNumber}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-slate-600 capitalize">
                      {member.sportProfile?.position || 'N/A'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      <Trophy className="w-4 h-4 text-primary-400" />
                      <span className="font-display font-black text-primary-500 text-sm">
                        {member.gamification?.level || 1}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 text-xs font-bold uppercase tracking-widest ${statusBadgeClass(member.membership?.status)}`}>
                      {statusLabel(member.membership?.status)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <Link
                      to={`/admin/members/${member._id}`}
                      className="text-xs font-bold uppercase tracking-widest text-primary-500 hover:text-primary-600 transition-colors"
                    >
                      Ver Detalles
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {members.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
              No se encontraron miembros
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-100">
            <div className="text-sm text-slate-500">
              Mostrando{' '}
              <span className="font-bold text-slate-700">
                {members.length > 0 ? ((currentPage - 1) * itemsPerPage) + 1 : 0}
              </span>
              {' '}–{' '}
              <span className="font-bold text-slate-700">
                {Math.min(currentPage * itemsPerPage, totalMembers)}
              </span>
              {' '}de{' '}
              <span className="font-bold text-slate-700">{totalMembers}</span> miembros
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
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
                      className={`w-9 h-9 text-sm font-bold transition-colors ${
                        currentPage === page
                          ? 'bg-primary-500 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {page}
                    </button>
                  );
                } else if (
                  page === currentPage - 2 ||
                  page === currentPage + 2
                ) {
                  return (
                    <span key={page} className="w-9 h-9 flex items-center justify-center text-slate-400 text-sm">
                      ...
                    </span>
                  );
                }
                return null;
              })}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
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
              initial={{ scale: 0.97, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.97, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                <div>
                  <span className="inline-block text-primary-600 text-xs font-bold uppercase tracking-widest bg-primary-50 px-2 py-1 mb-1">
                    Nuevo
                  </span>
                  <h2 className="font-display font-black uppercase text-slate-900 text-xl leading-none">
                    Agregar Miembro
                  </h2>
                </div>
                <button
                  onClick={() => !submitting && setShowAddModal(false)}
                  className="p-2 hover:bg-slate-100 transition-colors"
                  disabled={submitting}
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <form onSubmit={handleAddMember} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-slate-200 focus:border-primary-500 outline-none transition-colors text-slate-900 bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                      Apellido *
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-slate-200 focus:border-primary-500 outline-none transition-colors text-slate-900 bg-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 focus:border-primary-500 outline-none transition-colors text-slate-900 bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                    Contraseña *
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-200 focus:border-primary-500 outline-none transition-colors text-slate-900 bg-white"
                    required
                    minLength={8}
                    placeholder="Mínimo 8 caracteres"
                  />
                </div>

                <div className="bg-sky-50 border-l-4 border-sky-400 px-4 py-3">
                  <p className="text-sm text-sky-800">
                    <span className="font-bold">Nota:</span> El deportista completará el resto de su información (teléfono, fecha de nacimiento, posición, etc.) desde su perfil después de iniciar sesión.
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="inline-flex items-center justify-center gap-2 border-2 border-slate-200 text-slate-700 font-display font-bold uppercase tracking-wide px-5 py-2.5 hover:border-slate-400 transition-all cursor-pointer flex-1"
                    disabled={submitting}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 bg-primary-500 text-white font-display font-bold uppercase tracking-wide px-5 py-2.5 hover:bg-primary-600 active:scale-95 transition-all cursor-pointer flex-1 disabled:opacity-60 disabled:cursor-not-allowed"
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

      {/* Bulk Records Modal */}
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
              initial={{ scale: 0.97, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.97, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              {/* Modal header */}
              <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                <div>
                  <span className="inline-block text-primary-600 text-xs font-bold uppercase tracking-widest bg-primary-50 px-2 py-1 mb-1">
                    Records Masivos
                  </span>
                  <h2 className="font-display font-black uppercase text-slate-900 text-xl leading-none">
                    Agregar Records Masivos
                  </h2>
                </div>
                <div className="flex items-center gap-4">
                  {/* Step indicator */}
                  <div className="hidden sm:flex items-center gap-2">
                    {[1, 2, 3].map((step) => (
                      <div key={step} className="flex items-center gap-2">
                        <div
                          className={`w-7 h-7 flex items-center justify-center text-xs font-bold transition-colors ${
                            bulkStep === step
                              ? 'bg-primary-500 text-white'
                              : bulkStep > step
                              ? 'bg-slate-700 text-white'
                              : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          {step}
                        </div>
                        {step < 3 && (
                          <div className={`w-6 h-0.5 ${bulkStep > step ? 'bg-slate-700' : 'bg-slate-200'}`} />
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => !bulkSubmitting && setShowBulkRecordsModal(false)}
                    className="p-2 hover:bg-slate-100 transition-colors"
                    disabled={bulkSubmitting}
                  >
                    <X className="w-5 h-5 text-slate-500" />
                  </button>
                </div>
              </div>

              {/* Step label */}
              <div className="px-6 pt-4 pb-2 border-b border-slate-100">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  Paso {bulkStep} de 3 —{' '}
                  {bulkStep === 1 ? 'Seleccionar Ejercicios' :
                   bulkStep === 2 ? 'Seleccionar Miembros' :
                   'Ingresar Resultados'}
                </p>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {/* Step 1: Select exercises */}
                {bulkStep === 1 && (
                  <div className="space-y-4">
                    <p className="text-sm text-slate-600">Selecciona los ejercicios que deseas registrar:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {exercises.map(exercise => (
                        <label
                          key={exercise._id}
                          className={`flex items-center gap-3 p-4 border-2 cursor-pointer transition-all ${
                            selectedExercises.includes(exercise._id)
                              ? 'border-primary-500 bg-primary-50'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedExercises.includes(exercise._id)}
                            onChange={() => handleExerciseToggle(exercise._id)}
                            className="w-4 h-4 accent-primary-500"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-slate-900 text-sm truncate">{exercise.name}</p>
                            <p className="text-xs text-slate-400 capitalize">{exercise.category} · {exercise.defaultUnit}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                    {exercises.length === 0 && (
                      <div className="text-center py-10">
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                          No hay ejercicios disponibles
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 2: Select members */}
                {bulkStep === 2 && (
                  <div className="space-y-4">
                    <p className="text-sm text-slate-600">Selecciona los miembros para registrar:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {allMembers.map(member => (
                        <label
                          key={member._id}
                          className={`flex items-center gap-3 p-4 border-2 cursor-pointer transition-all ${
                            selectedMembers.includes(member._id)
                              ? 'border-primary-500 bg-primary-50'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedMembers.includes(member._id)}
                            onChange={() => handleMemberToggle(member._id)}
                            className="w-4 h-4 accent-primary-500"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-slate-900 text-sm">
                              {member.userId?.profile?.firstName} {member.userId?.profile?.lastName}
                            </p>
                            <p className="text-xs text-slate-400 font-mono">{member.memberNumber}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 3: Enter results */}
                {bulkStep === 3 && (
                  <div className="space-y-4">
                    <p className="text-sm text-slate-600">
                      Ingresa los resultados para cada miembro y ejercicio (deja vacío si no aplica):
                    </p>
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[500px] border-collapse">
                        <thead>
                          <tr className="bg-slate-50">
                            <th className="border border-slate-200 px-4 py-2 text-left text-xs font-bold uppercase tracking-widest text-slate-400 sticky left-0 bg-slate-50 z-10">
                              Miembro
                            </th>
                            {selectedExercises.map(exerciseId => {
                              const exercise = exercises.find(ex => ex._id === exerciseId);
                              return (
                                <th key={exerciseId} className="border border-slate-200 px-4 py-2 text-center text-xs font-bold uppercase tracking-widest text-slate-400 min-w-[150px]">
                                  <div>{exercise?.name}</div>
                                  <div className="text-slate-300 font-normal normal-case tracking-normal">({exercise?.defaultUnit})</div>
                                </th>
                              );
                            })}
                          </tr>
                        </thead>
                        <tbody>
                          {selectedMembers.map(memberId => {
                            const member = allMembers.find(m => m._id === memberId);
                            return (
                              <tr key={memberId} className="hover:bg-slate-50 transition-colors">
                                <td className="border border-slate-200 px-4 py-2 font-bold text-sm text-slate-900 sticky left-0 bg-white">
                                  {member?.userId?.profile?.firstName} {member?.userId?.profile?.lastName}
                                </td>
                                {selectedExercises.map(exerciseId => (
                                  <td key={exerciseId} className="border border-slate-200 px-2 py-2">
                                    <input
                                      type="number"
                                      step="0.01"
                                      value={bulkRecordsData[`${memberId}-${exerciseId}`] || ''}
                                      onChange={(e) => handleBulkRecordChange(memberId, exerciseId, e.target.value)}
                                      className="w-full px-2 py-1.5 border-2 border-slate-200 focus:border-primary-500 outline-none transition-colors text-slate-900 bg-white text-sm"
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

              {/* Modal footer */}
              <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 flex justify-between">
                <button
                  onClick={() => {
                    if (bulkStep > 1) setBulkStep(bulkStep - 1);
                    else setShowBulkRecordsModal(false);
                  }}
                  className="inline-flex items-center gap-2 border-2 border-slate-200 text-slate-700 font-display font-bold uppercase tracking-wide px-5 py-2.5 hover:border-slate-400 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
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
                    className="inline-flex items-center gap-2 bg-primary-500 text-white font-display font-bold uppercase tracking-wide px-5 py-2.5 hover:bg-primary-600 active:scale-95 transition-all cursor-pointer"
                  >
                    Siguiente
                  </button>
                ) : (
                  <button
                    onClick={handleSubmitBulkRecords}
                    className="inline-flex items-center gap-2 bg-primary-500 text-white font-display font-bold uppercase tracking-wide px-5 py-2.5 hover:bg-primary-600 active:scale-95 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
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
