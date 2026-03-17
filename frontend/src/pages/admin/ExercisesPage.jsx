import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from '@/api/axios';

function ExercisesPage() {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingExercise, setEditingExercise] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    defaultUnit: 'cm',
    category: 'fuerza'
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
    try {
      const response = await axios.get('/exercises');
      setExercises(response.data.data);
    } catch (error) {
      console.error('Error fetching exercises:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (exercise = null) => {
    if (exercise) {
      setEditingExercise(exercise);
      setFormData({
        name: exercise.name,
        description: exercise.description || '',
        defaultUnit: exercise.defaultUnit,
        category: exercise.category
      });
    } else {
      setEditingExercise(null);
      setFormData({
        name: '',
        description: '',
        defaultUnit: 'cm',
        category: 'fuerza'
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingExercise(null);
    setFormData({
      name: '',
      description: '',
      defaultUnit: 'cm',
      category: 'fuerza'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingExercise) {
        await axios.put(`/admin/exercises/${editingExercise._id}`, formData);
        alert('Ejercicio actualizado exitosamente');
      } else {
        await axios.post('/admin/exercises', formData);
        alert('Ejercicio creado exitosamente');
      }
      handleCloseModal();
      fetchExercises();
    } catch (error) {
      console.error('Error saving exercise:', error);
      alert('Error: ' + (error.response?.data?.message || error.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de desactivar este ejercicio?')) return;

    try {
      await axios.delete(`/admin/exercises/${id}`);
      alert('Ejercicio desactivado exitosamente');
      fetchExercises();
    } catch (error) {
      console.error('Error deleting exercise:', error);
      alert('Error al desactivar ejercicio: ' + (error.response?.data?.message || error.message));
    }
  };

  const categoryLabels = {
    fuerza: 'Fuerza',
    velocidad: 'Velocidad',
    resistencia: 'Resistencia',
    tecnica: 'Técnica',
    flexibilidad: 'Flexibilidad',
    potencia: 'Potencia'
  };

  const categoryColors = {
    fuerza: 'bg-red-100 text-red-800',
    velocidad: 'bg-blue-100 text-blue-800',
    resistencia: 'bg-green-100 text-green-800',
    tecnica: 'bg-purple-100 text-purple-800',
    flexibilidad: 'bg-yellow-100 text-yellow-800',
    potencia: 'bg-orange-100 text-orange-800'
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
          <h1 className="text-3xl font-display font-bold text-gray-900">Ejercicios</h1>
          <p className="text-gray-600">Gestiona el catálogo de ejercicios físicos</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="btn btn-primary"
        >
          <Plus className="w-5 h-5" />
          Crear Ejercicio
        </button>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Nombre</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Descripción</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Categoría</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Unidad</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {exercises.map((exercise) => (
                <tr key={exercise._id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <span className="font-medium text-gray-900">{exercise.name}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-600">{exercise.description || '-'}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`badge ${categoryColors[exercise.category]}`}>
                      {categoryLabels[exercise.category]}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-700">{exercise.defaultUnit}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenModal(exercise)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => handleDelete(exercise._id)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                        title="Desactivar"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {exercises.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No hay ejercicios registrados</p>
          </div>
        )}
      </div>

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
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-display font-bold text-gray-900">
                  {editingExercise ? 'Editar Ejercicio' : 'Crear Ejercicio'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="label">Nombre *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input"
                    placeholder="Ej: Salto vertical"
                    required
                  />
                </div>

                <div>
                  <label className="label">Descripción</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input resize-none"
                    rows={3}
                    placeholder="Descripción del ejercicio..."
                  />
                </div>

                <div>
                  <label className="label">Categoría *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="input"
                    required
                  >
                    <option value="fuerza">Fuerza</option>
                    <option value="velocidad">Velocidad</option>
                    <option value="resistencia">Resistencia</option>
                    <option value="tecnica">Técnica</option>
                    <option value="flexibilidad">Flexibilidad</option>
                    <option value="potencia">Potencia</option>
                  </select>
                </div>

                <div>
                  <label className="label">Unidad de Medida por Defecto *</label>
                  <select
                    value={formData.defaultUnit}
                    onChange={(e) => setFormData({ ...formData, defaultUnit: e.target.value })}
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

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
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
