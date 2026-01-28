import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Award, Search, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from '@/api/axios';

function AdminBadgesPage() {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBadge, setEditingBadge] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterRarity, setFilterRarity] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '🏆',
    category: 'achievement',
    rarity: 'common',
    xpReward: 100,
    criteria: {
      type: 'special',
      value: 0,
      description: ''
    }
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchBadges();
  }, [filterCategory, filterRarity]);

  const fetchBadges = async () => {
    try {
      const params = {};
      if (filterCategory) params.category = filterCategory;
      if (filterRarity) params.rarity = filterRarity;
      
      const response = await axios.get('/badges', { params });
      setBadges(response.data.data);
    } catch (error) {
      console.error('Error fetching badges:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingBadge) {
        await axios.put(`/badges/${editingBadge._id}`, formData);
      } else {
        await axios.post('/badges', formData);
      }
      
      fetchBadges();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving badge:', error);
      alert('Error al guardar la insignia: ' + (error.response?.data?.message || error.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (badge) => {
    setEditingBadge(badge);
    setFormData({
      name: badge.name,
      description: badge.description,
      icon: badge.icon,
      category: badge.category,
      rarity: badge.rarity,
      xpReward: badge.xpReward,
      criteria: badge.criteria
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar esta insignia?')) return;

    try {
      await axios.delete(`/badges/${id}`);
      fetchBadges();
    } catch (error) {
      console.error('Error deleting badge:', error);
      alert('Error al eliminar la insignia');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingBadge(null);
    setFormData({
      name: '',
      description: '',
      icon: '🏆',
      category: 'achievement',
      rarity: 'common',
      xpReward: 100,
      criteria: {
        type: 'special',
        value: 0,
        description: ''
      }
    });
  };

  const filteredBadges = badges.filter(badge =>
    badge.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    badge.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const rarityColors = {
    common: 'bg-gray-100 text-gray-800 border-gray-300',
    rare: 'bg-blue-100 text-blue-800 border-blue-300',
    epic: 'bg-purple-100 text-purple-800 border-purple-300',
    legendary: 'bg-yellow-100 text-yellow-800 border-yellow-300'
  };

  const categoryIcons = {
    attendance: '📅',
    performance: '⚡',
    achievement: '🏆',
    special: '⭐'
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
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900">Insignias</h1>
          <p className="text-gray-600 mt-1">Gestiona las insignias del club</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nueva Insignia
        </button>
      </div>

      <div className="card">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar insignias..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="input md:w-48"
          >
            <option value="">Todas las categorías</option>
            <option value="attendance">Asistencia</option>
            <option value="performance">Rendimiento</option>
            <option value="achievement">Logros</option>
            <option value="special">Especial</option>
          </select>
          <select
            value={filterRarity}
            onChange={(e) => setFilterRarity(e.target.value)}
            className="input md:w-48"
          >
            <option value="">Todas las rarezas</option>
            <option value="common">Común</option>
            <option value="rare">Rara</option>
            <option value="epic">Épica</option>
            <option value="legendary">Legendaria</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBadges.map((badge) => (
            <motion.div
              key={badge._id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`relative p-6 rounded-2xl border-2 ${rarityColors[badge.rarity]} hover:shadow-lg transition-all group`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="text-5xl">{badge.icon}</div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(badge)}
                    className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Edit2 className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    onClick={() => handleDelete(badge._id)}
                    className="p-2 bg-white rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
              
              <h3 className="font-bold text-lg mb-2">{badge.name}</h3>
              <p className="text-sm text-gray-600 mb-3">{badge.description}</p>
              
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1">
                  {categoryIcons[badge.category]} {badge.category}
                </span>
                <span className="font-semibold">+{badge.xpReward} XP</span>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredBadges.length === 0 && (
          <div className="text-center py-12">
            <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No se encontraron insignias</p>
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
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b sticky top-0 bg-white">
                <h2 className="text-2xl font-display font-bold text-gray-900">
                  {editingBadge ? 'Editar Insignia' : 'Nueva Insignia'}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Nombre *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="input"
                      required
                    />
                  </div>

                  <div>
                    <label className="label">Icono (Emoji) *</label>
                    <input
                      type="text"
                      value={formData.icon}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                      className="input text-3xl text-center"
                      required
                      maxLength={2}
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Descripción *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input"
                    rows={3}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="label">Categoría *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="input"
                      required
                    >
                      <option value="attendance">Asistencia</option>
                      <option value="performance">Rendimiento</option>
                      <option value="achievement">Logros</option>
                      <option value="special">Especial</option>
                    </select>
                  </div>

                  <div>
                    <label className="label">Rareza *</label>
                    <select
                      value={formData.rarity}
                      onChange={(e) => setFormData({ ...formData, rarity: e.target.value })}
                      className="input"
                      required
                    >
                      <option value="common">Común</option>
                      <option value="rare">Rara</option>
                      <option value="epic">Épica</option>
                      <option value="legendary">Legendaria</option>
                    </select>
                  </div>

                  <div>
                    <label className="label">Recompensa XP *</label>
                    <input
                      type="number"
                      value={formData.xpReward}
                      onChange={(e) => setFormData({ ...formData, xpReward: parseInt(e.target.value) })}
                      className="input"
                      required
                      min={0}
                    />
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Criterios (Opcional)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Tipo de Criterio</label>
                      <select
                        value={formData.criteria.type}
                        onChange={(e) => setFormData({
                          ...formData,
                          criteria: { ...formData.criteria, type: e.target.value }
                        })}
                        className="input"
                      >
                        <option value="special">Especial</option>
                        <option value="attendance_count">Conteo de Asistencia</option>
                        <option value="win_count">Conteo de Victorias</option>
                        <option value="tournament_wins">Victorias en Torneos</option>
                        <option value="level_reached">Nivel Alcanzado</option>
                        <option value="metric_improvement">Mejora de Métrica</option>
                      </select>
                    </div>

                    <div>
                      <label className="label">Valor</label>
                      <input
                        type="number"
                        value={formData.criteria.value}
                        onChange={(e) => setFormData({
                          ...formData,
                          criteria: { ...formData.criteria, value: parseInt(e.target.value) }
                        })}
                        className="input"
                        min={0}
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="label">Descripción del Criterio</label>
                    <input
                      type="text"
                      value={formData.criteria.description}
                      onChange={(e) => setFormData({
                        ...formData,
                        criteria: { ...formData.criteria, description: e.target.value }
                      })}
                      className="input"
                      placeholder="Ej: Asistir a 10 entrenamientos"
                    />
                  </div>
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
                    {submitting ? 'Guardando...' : editingBadge ? 'Actualizar' : 'Crear'}
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

export default AdminBadgesPage;
