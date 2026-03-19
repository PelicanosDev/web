import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Dumbbell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from '@/api/axios';

const categoryLabels = {
  fuerza: 'Fuerza',
  velocidad: 'Velocidad',
  resistencia: 'Resistencia',
  tecnica: 'Técnica',
  flexibilidad: 'Flexibilidad',
  potencia: 'Potencia',
};

const categoryColors = {
  fuerza: 'bg-red-100 text-red-800',
  velocidad: 'bg-sky-100 text-sky-800',
  resistencia: 'bg-green-100 text-green-800',
  tecnica: 'bg-purple-100 text-purple-800',
  flexibilidad: 'bg-amber-100 text-amber-800',
  potencia: 'bg-orange-100 text-orange-800',
};

const inputCls = 'w-full px-4 py-3 border-2 border-slate-200 focus:border-primary-500 outline-none transition-colors text-slate-900 bg-white';
const labelCls = 'block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2';

function ExercisesPage() {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingExercise, setEditingExercise] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', defaultUnit: 'cm', category: 'fuerza' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchExercises(); }, []);

  const fetchExercises = async () => {
    try {
      const response = await axios.get('/exercises');
      setExercises(response.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (exercise = null) => {
    if (exercise) {
      setEditingExercise(exercise);
      setFormData({ name: exercise.name, description: exercise.description || '', defaultUnit: exercise.defaultUnit, category: exercise.category });
    } else {
      setEditingExercise(null);
      setFormData({ name: '', description: '', defaultUnit: 'cm', category: 'fuerza' });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingExercise(null);
    setFormData({ name: '', description: '', defaultUnit: 'cm', category: 'fuerza' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingExercise) {
        await axios.put(`/admin/exercises/${editingExercise._id}`, formData);
      } else {
        await axios.post('/admin/exercises', formData);
      }
      handleCloseModal();
      fetchExercises();
    } catch (error) {
      console.error(error);
      alert('Error: ' + (error.response?.data?.message || error.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Desactivar este ejercicio?')) return;
    try {
      await axios.delete(`/admin/exercises/${id}`);
      fetchExercises();
    } catch (error) {
      alert('Error al desactivar: ' + (error.response?.data?.message || error.message));
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <span className="inline-block text-primary-600 text-xs font-bold uppercase tracking-widest bg-primary-50 px-3 py-1.5 mb-3">
            Catálogo
          </span>
          <h1 className="font-display font-black uppercase text-slate-900 text-3xl leading-none">
            Ejercicios
          </h1>
          <p className="text-slate-500 mt-1">Gestiona el catálogo de ejercicios físicos</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center gap-2 bg-primary-500 text-white font-display font-bold uppercase tracking-wide px-5 py-2.5 hover:bg-primary-600 active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          Crear Ejercicio
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-100 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px]">
            <thead>
              <tr className="border-b-2 border-slate-100 bg-slate-50">
                <th className="text-left py-3 px-5 text-xs font-bold uppercase tracking-widest text-slate-400">Nombre</th>
                <th className="text-left py-3 px-5 text-xs font-bold uppercase tracking-widest text-slate-400">Descripción</th>
                <th className="text-left py-3 px-5 text-xs font-bold uppercase tracking-widest text-slate-400">Categoría</th>
                <th className="text-left py-3 px-5 text-xs font-bold uppercase tracking-widest text-slate-400">Unidad</th>
                <th className="text-left py-3 px-5 text-xs font-bold uppercase tracking-widest text-slate-400">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {exercises.map((exercise) => (
                <tr key={exercise._id} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="py-3 px-5">
                    <span className="font-bold text-slate-900">{exercise.name}</span>
                  </td>
                  <td className="py-3 px-5">
                    <span className="text-sm text-slate-500">{exercise.description || '—'}</span>
                  </td>
                  <td className="py-3 px-5">
                    <span className={`px-2 py-1 text-xs font-bold uppercase tracking-widest ${categoryColors[exercise.category]}`}>
                      {categoryLabels[exercise.category]}
                    </span>
                  </td>
                  <td className="py-3 px-5">
                    <span className="text-sm font-mono text-slate-600">{exercise.defaultUnit}</span>
                  </td>
                  <td className="py-3 px-5">
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleOpenModal(exercise)}
                        className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(exercise._id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        title="Desactivar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {exercises.length === 0 && (
          <div className="text-center py-16">
            <Dumbbell className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Sin ejercicios registrados</p>
          </div>
        )}
      </div>

      {/* Modal */}
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
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-primary-500 mb-0.5">Ejercicios</p>
                  <h2 className="font-display font-black uppercase text-slate-900 text-xl leading-none">
                    {editingExercise ? 'Editar Ejercicio' : 'Crear Ejercicio'}
                  </h2>
                </div>
                <button onClick={handleCloseModal} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div>
                  <label className={labelCls}>Nombre *</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={inputCls} placeholder="Ej: Salto vertical" required />
                </div>
                <div>
                  <label className={labelCls}>Descripción</label>
                  <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className={`${inputCls} resize-none`} rows={3} placeholder="Descripción del ejercicio..." />
                </div>
                <div>
                  <label className={labelCls}>Categoría *</label>
                  <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className={inputCls} required>
                    <option value="fuerza">Fuerza</option>
                    <option value="velocidad">Velocidad</option>
                    <option value="resistencia">Resistencia</option>
                    <option value="tecnica">Técnica</option>
                    <option value="flexibilidad">Flexibilidad</option>
                    <option value="potencia">Potencia</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Unidad de Medida *</label>
                  <select value={formData.defaultUnit} onChange={(e) => setFormData({ ...formData, defaultUnit: e.target.value })} className={inputCls} required>
                    <option value="cm">Centímetros (cm)</option>
                    <option value="metros">Metros (m)</option>
                    <option value="segundos">Segundos (s)</option>
                    <option value="minutos">Minutos (min)</option>
                    <option value="kg">Kilogramos (kg)</option>
                    <option value="repeticiones">Repeticiones</option>
                    <option value="km/h">Kilómetros por hora (km/h)</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={handleCloseModal} disabled={submitting} className="flex-1 inline-flex items-center justify-center border-2 border-slate-200 text-slate-700 font-display font-bold uppercase tracking-wide px-5 py-2.5 hover:border-slate-400 transition-all cursor-pointer disabled:opacity-50">
                    Cancelar
                  </button>
                  <button type="submit" disabled={submitting} className="flex-1 inline-flex items-center justify-center bg-primary-500 text-white font-display font-bold uppercase tracking-wide px-5 py-2.5 hover:bg-primary-600 active:scale-95 transition-all cursor-pointer disabled:opacity-50">
                    {submitting ? 'Guardando...' : editingExercise ? 'Actualizar' : 'Crear'}
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

export default ExercisesPage;
